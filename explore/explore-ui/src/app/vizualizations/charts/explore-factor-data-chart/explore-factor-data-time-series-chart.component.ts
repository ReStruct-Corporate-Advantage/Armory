import {Component} from '@angular/core';
import {ColumnConstants} from '@blk/explore-ui-core';
import {
    FactorDataCustomVizConfig
} from '@interfaces/custom-viz-config.interface';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {QueryKeyEntry} from '@qbstr/data-cube';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {
    BarChartConfig, BarChartOptions,
    ChartMeasure,
    ChartType,
    EnrichingChartConfigType,
    LineChartConfig,
    LineChartOptions,
    QbstrHighchartsOptions,
    QbstrPoint
} from '@qbstr/highcharts-api';
import {merge} from 'lodash';
import {ExploreEnrichingChartDirective} from '../explore-enriching-chart.directive';
import {ChartUtils} from '@utils/chart.utils';


@Component({
    selector: 'app-explore-factor-data-time-series-chart',
    templateUrl: '../explore-chart.component.html',
})
export class ExploreFactorDataTimeSeriesChartComponent extends ExploreEnrichingChartDirective<LineChartConfig<any>, FactorDataCustomVizConfig> {

    readonly COMPARE_MODE_PERCENT = 'percent';
    private valueUnit: string;

    createChartConfig(measures: ChartMeasure<any>[]): BarChartConfig<any> {
        this.setValueUnit();
        const dateMeasure = this.cols.find((col => col.columnKey === ColumnConstants.DATE));
        const groupBys = dateMeasure ? [ColumnConstants.DATE] : this.breakdownLevels.slice(1, this.breakdownLevels.length);
        return {
            groupBy: groupBys,
            measures,
            drillDown: undefined,
            stacked: undefined
        };
    }

    createChartSpecificQbstrChartConfig(cube: SimpleCube<any>, chartConfig: LineChartConfig<any> | BarChartConfig<any>, chartOptions: QbstrHighchartsOptions, defaultQueryKey: QueryKeyEntry[]): LineChartOptions<any> | BarChartOptions<any> {
        const type = this.customVizConfig.chartType === ChartType.LINE ? ChartType.LINE : ChartType.COLUMN;
        return {
            data: cube,
            type,
            chartConfig,
            chartOptions,
            defaultQueryKeyEntries: defaultQueryKey,
            autoResizeDelay: -1
        };
    }


    protected enrichCube(cube: SimpleCube<any>, chartConfig: EnrichingChartConfigType<any>, defaultQueryKeyEntries: QueryKeyEntry[]): void {
        this.enrichDataForFactorDataAndExpostTimeSeries(cube, chartConfig, defaultQueryKeyEntries);
    }

    createChartOptions(_chartConfig: LineChartConfig<any>): Highcharts.Options {
        const context = this;
        return merge({},
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
                xAxis: {
                    labels: {
                        formatter() {
                            return ChartUtils.xAxisDateLabelFormatter(this.value, context.customVizConfig.dateFormat);
                        }
                    }
                },
                yAxis: {
                    labels: {
                        formatter() {
                            return context.formatYAxisValue(this) + context.valueUnit;
                        }
                    }
                },
                legend: {
                    labelFormatter() {
                        return context.seriesLabelFormatter(this);
                    }
                }
            });
    }

    /**
     * format the points on time series chart
     */
    tooltipPointFormatter(point): string {
        const qbstr = (point as QbstrPoint)?.qbstr;
        const column = this.colsMap[qbstr?.measureName];
        const formattedValue = this.formatValue(point.y, column.formatter);
        const category = this.customVizConfig.chartType === ChartType.LINE ? point.category : point.name;
        return `
                <div style='z-index:999; background-color: var(--input-box__background-color--disabled); padding: 8px;'>
                    <span style='font-weight: bold'>Date: ${category}</span><br/>
                    <span style='font-weight: bold'>${this.getColumnTitle(column)}:</span> ${formattedValue}${this.valueUnit}
                <div>`;
    }

    /**
     * format the legends on time series chart
     */
    seriesLabelFormatter(series): string {
        let column = null;
        Object.values(this.colsMap).forEach((value: VizualizationColumnConfig) => {
            if (value.columnTitle === series.name) {
                column = value;
            }
        });
        return this.getColumnTitle(column);
    }

    getColumnTitle(column: VizualizationColumnConfig): string {
        return column.columnTitle;
    }

    protected showLabelInputToChartLib(): boolean {
        return false;
    }

    private setValueUnit(): void {
        this.valueUnit = this.customVizConfig.compareModeToggle && this.customVizConfig.compareMode === this.COMPARE_MODE_PERCENT ? '%' : '';
    }

}
