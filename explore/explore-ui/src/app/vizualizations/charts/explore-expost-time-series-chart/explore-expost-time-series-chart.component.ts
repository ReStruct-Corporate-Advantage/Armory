import {Component} from '@angular/core';
import {ColumnConstants, ExpostSettings} from '@blk/explore-ui-core';
import {ExPostTimeSeriesCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {QueryKeyEntry} from '@qbstr/data-cube';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {
    ChartMeasure,
    ChartType,
    EnrichingChartConfigType,
    LineChartConfig,
    LineChartOptions,
    QbstrHighchartsOptions,
    QbstrPoint
} from '@qbstr/highcharts-api';
import {cloneDeep, merge} from 'lodash';
import {ExploreEnrichingChartDirective} from '../explore-enriching-chart.directive';
import {YAxisOptions} from 'highcharts';
import {NumericDataFormatter} from '@blk/explore-ui-column-option';

/**
 * Explore expost time series chart handles explore specific parts of the initialization.
 * Handles types specific chart configuration
 */
@Component({
    selector: 'app-explore-expost-time-series-chart',
    templateUrl: '../explore-chart.component.html',
})
export class ExploreExpostTimeSeriesChartComponent extends ExploreEnrichingChartDirective<LineChartConfig<any>, ExPostTimeSeriesCustomVizConfig> {


    /**
     * create the chartConfig for expost time series chart
     */
    createChartConfig(measures: ChartMeasure<any>[]): LineChartConfig<any> {
        const dateMeasure = this.cols.find((col => col.columnKey === ColumnConstants.DATE));
        const measuresToUse = cloneDeep(measures);
        const groupBys = dateMeasure ? [ColumnConstants.DATE] : this.breakdownLevels.slice(1, this.breakdownLevels.length);
        return {
            groupBy: groupBys,
            measures : this.enrichMeasureTitle(measuresToUse).map(measure => ({
                ...measure,
                axis: this.customVizConfig.secondaryYAxis === measure.name ? 1 : undefined
            }))
        };
    }

    createChartSpecificQbstrChartConfig(cube: SimpleCube<any>, chartConfig: LineChartConfig<any>, chartOptions: QbstrHighchartsOptions, defaultQueryKey: QueryKeyEntry[]): LineChartOptions<any> {
        return {
            data: cube,
            type: ChartType.LINE,
            chartConfig,
            chartOptions,
            defaultQueryKeyEntries: defaultQueryKey,
            autoResizeDelay: -1
        };
    }

    /**
     * enrich cube for expost time series chart
     */
    protected enrichCube(cube: SimpleCube<any>, chartConfig: EnrichingChartConfigType<any>, defaultQueryKeyEntries: QueryKeyEntry[]): void {
        this.enrichDataForFactorDataAndExpostTimeSeries(cube, chartConfig, defaultQueryKeyEntries);
    }

    /**
     * create the ChartOptions for expost time series chart
     */
    createChartOptions(chartConfig: LineChartConfig<any>): Highcharts.Options {
        const context = this;
        const chartOptions = merge({},
            super.createChartOptions(),
            {
                plotOptions: {
                    line: {
                        marker: {
                            enabled: null // set to null to enable threshold-based marker visibility
                        },
                    },
                    series: {
                        dataLabels: {
                            enabled: false
                        },
                        tooltip: {
                            headerFormat: '',
                            pointFormatter() {
                                return context.tooltipPointFormatter(this);
                            }
                        }
                    }
                },
                xAxis: this.getXAxisData(this),
                yAxis: this.createYAxisOptionsList(chartConfig),
                legend: {
                    labelFormatter() {
                        return context.seriesLableFormatter(this);
                    }
                }
            });
        return chartOptions;
    }

    protected createYAxisOptionsList(chartConfig: LineChartConfig<any>): YAxisOptions[] {
        const secondaryAxis = chartConfig.measures.find(measure => measure.axis === 1);
        const measureTitle = this.enrichMeasureTitle(chartConfig.measures)[0].title;
        // defaultPrimaryAxisTitle is the measureTitle IF only one measure is available, and the measure is not set to the secondaryAxis.
        const defaultPrimaryAxisTitle = chartConfig.measures.length === 1 && secondaryAxis?.title !== measureTitle ? measureTitle : '';
        let defaultSecondaryAxisTitle;
        const secondMeasure = secondaryAxis && this.colsMap[secondaryAxis.name];
        if (secondMeasure) {
            defaultSecondaryAxisTitle = secondMeasure.columnTitle + this.appendScalingToSecondaryAxisLabel(secondMeasure.formatter instanceof NumericDataFormatter ? secondMeasure.formatter.getScalingOptionString() : null);
        }
        return super.createYAxisOptionsList(chartConfig, defaultPrimaryAxisTitle, defaultSecondaryAxisTitle);
    }

    /**
     * Appends the scaling to the secondary axis label
     */
    private appendScalingToSecondaryAxisLabel(scaling: string): string {
        // Adds a new line and then the scaling factor (if applicable)
        return scaling ? '<br/> ' + scaling : '';
    }

    /**
     * format the points on time series chart
     */
    tooltipPointFormatter(point): any {
        const qbstr = (point as QbstrPoint)?.qbstr;
        const column = this.colsMap[qbstr?.measureName];
        const formattedValue = this.formatValue(point.y, column.formatter);
        return `
                <div style="z-index:999; background-color: var(--input-box__background-color--disabled); padding: 8px;">
                    <tspan style="font-weight: bold">Date:</tspan> ${point.category}
                    <br/><tspan style="font-weight: bold">${this.getColumnTitle(column)}:</tspan> ${formattedValue}
                <div>`;
    }

    /**
     * format the legends on time series chart
     */
    seriesLableFormatter(series): string {
        let column = null;
        Object.values(this.colsMap).forEach((value: VizualizationColumnConfig) => {
            if (value.columnTitle === series.name) {
                column = value;
            }
        });
        return this.getColumnTitle(column);
    }

    /**
     * returns the column title based on sampling and statistic period
     */
    getColumnTitle(column: VizualizationColumnConfig): string {
        // Get widget level samplingPeriod and statisticPeriod from customVizConfig
        let samplingPeriod = this.customVizConfig.samplingPeriod;
        let statisticPeriod = this.customVizConfig.statisticPeriod;
        // check if column level expost settings are overridden
        if (column[ExpostSettings.EXPOST_SETTINGS] && column[ExpostSettings.EXPOST_SETTINGS][ExpostSettings.EXPOST_SETTINGS]) {
            // Get the column level expost Settings
            const expostSettings = column[ExpostSettings.EXPOST_SETTINGS][ExpostSettings.EXPOST_SETTINGS] as ExpostSettings;
            if (expostSettings.samplingPeriod) {
                samplingPeriod = expostSettings.samplingPeriod.timePeriodName;
            }
            if (expostSettings.statisticPeriods.length > 0) {
                statisticPeriod = expostSettings.statisticPeriods[0].timePeriodName;
            }
        }
        if (samplingPeriod && statisticPeriod) {
            return column.originalColumnTitle + '(' + samplingPeriod + ',' + statisticPeriod + ')';
        } else {
            return column.columnTitle;
        }
    }

    /**
     * Override default behavior, labels are not shown for expost time series chart
     */
    protected showLabelInputToChartLib(): boolean {
        return false;
    }

}
