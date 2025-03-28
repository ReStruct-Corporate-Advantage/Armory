import {Component, ViewEncapsulation} from '@angular/core';
import {ReturnsChartCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {AggregationKey, createQK, GroupByKey, QueryKeyEntry} from '@qbstr/data-cube';
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
import {ChartUtils} from '@utils/chart.utils';
import {SUB_TOTAL_AGG} from '@utils/qbstr';
import {default as Highcharts, Point, XAxisOptions, YAxisOptions} from 'highcharts';
import {flatten, merge} from 'lodash';
import {combineLatest, Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ExploreEnrichingChartDirective} from '../explore-enriching-chart.directive';
import {CoreCommonConstants} from '@blk/explore-ui-core';
import {DateUtils} from '@utils/date.utils';
import {TimePeriodInterval} from '@models/widget/inputs/chart-settings/time-period-interval-settings.model';

/**
 * Component class for return analysis chart
 */
@Component({
    selector: 'app-explore-returns-chart',
    templateUrl: '../explore-chart.component.html',
    styleUrls: ['./explore-returns-chart.component.scss', '../explore-chart.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ExploreReturnsChartComponent extends ExploreEnrichingChartDirective<LineChartConfig<any>, ReturnsChartCustomVizConfig> {

    /**
     * Override
     */
    protected initChartMeasures(cols: VizualizationColumnConfig[]): void {
        this.chartMeasures = cols.filter(col => col.isSubtotalable).map(col => {
            const isCumulative = col['cumulativeReturnColumnOption'] && col['cumulativeReturnColumnOption'].isCumulative;
            const measure: ChartMeasure<any> =  {
                name: col.columnKey,
                title:  col.columnTitle,
                aggMethod: SUB_TOTAL_AGG
            };
            if (!isCumulative) {
               measure.cssStyleClass =  'noncumulative';
            }
            return measure;
        });
    }

    protected enrichCube(cube: SimpleCube<any>, chartConfig: EnrichingChartConfigType<any>, defaultQueryKeyEntries: QueryKeyEntry[]) {
        // if we have only date specified (level-1) so we don't need to enrich
        if (chartConfig.groupBy.length > 1) {
            const {groupBy: [level1, level2], measures} = chartConfig;

            const measureKeys = measures.map(measure => new AggregationKey(measure.name, measure.aggMethod));
            const groupKeys = [new GroupByKey(level1), new GroupByKey(level2)];

            const cksForSet = cube.keys().filter(ck => ck.groupKeys().find(gk => gk.isEqual(groupKeys[1])));
            const keysToJoin: Observable<any>[] = cksForSet.map(ck => cube.getSimilarIfPresent(ck));

            combineLatest(keysToJoin).pipe(takeUntil(this.ngUnsubscribe)).subscribe(dataSets => {
                const chartCk = createQK([...defaultQueryKeyEntries, ...groupKeys, ...measureKeys]);
                cube.set(chartCk, flatten(dataSets));
            });
        }
    }

    createChartConfig(measures: ChartMeasure<any>[]): LineChartConfig<any> {
        return {
            groupBy: this.breakdownLevels.slice(1, this.breakdownLevels.length),
            ignoreUndefinedMeasure: true,
            measures
        };
    }

    createChartSpecificQbstrChartConfig(cube: SimpleCube<any>, chartConfig: LineChartConfig<any>, chartOptions: QbstrHighchartsOptions, defaultQueryKey: QueryKeyEntry[]): LineChartOptions<any> {
        const type = ChartType.LINE;

        if (this.customVizConfig.showBaseline) {
            chartOptions = this.applyBaseline(type, chartOptions);
        }
        // By default, turboThreshold is set to 1000.
        // This is for highcharts to support 33+ months data on returns chart.
        chartOptions.plotOptions.series.turboThreshold = 2000;

        return {
            data: cube,
            type,
            chartConfig,
            chartOptions,
            defaultQueryKeyEntries: defaultQueryKey,
            autoResizeDelay: -1
        };
    }

    /**
     * create the ChartOptions for time series chart
     */
    createChartOptions(chartConfig): Highcharts.Options {
        const context = this;
        const options = merge({},
            super.createChartOptions(),
            {
                plotOptions: {
                    line: {
                        marker: {
                            enabled: context.customVizConfig.showDataMarker
                        }
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
                    gridLineWidth: 1
                },
                yAxis: this.createYAxisOptionsList(chartConfig)
            });

        this.setXAxisLabelConfig(options.xAxis);

        return options;
    }

    /**
     * Set X axis label config based on chosen timePeriodInterval
     */
    private setXAxisLabelConfig(xAxis: XAxisOptions): void {
        const context = this;
        xAxis.labels = {
            formatter() {
                return context.getXAxisDataLabel(this.value as string, context.customVizConfig);
            }
        };

        // If the timePeriodInterval is not set to Daily, we need to iterate through all series data points and update the labels.
        if (this.customVizConfig.timePeriodInterval !== TimePeriodInterval.DAILY) {
            xAxis.labels.step = 1;
            xAxis.labels.rotation = -45;
        }
    }

    /**
     * Get X axis label based on chosen timePeriodInterval
     */
    private getXAxisDataLabel(date: string, customVizConfig: ReturnsChartCustomVizConfig): string {
        if (
            (customVizConfig.timePeriodInterval === TimePeriodInterval.WEEKLY && !DateUtils.isFirstDateOfWeek(date)) ||
            (customVizConfig.timePeriodInterval === TimePeriodInterval.MONTHLY && !DateUtils.isFirstDateOfMonth(date)) ||
            (customVizConfig.timePeriodInterval === TimePeriodInterval.QUARTERLY && !DateUtils.isFirstDateOfQuarter(date)) ||
            (customVizConfig.timePeriodInterval === TimePeriodInterval.YEARLY && !DateUtils.isFirstDateOfYear(date))
        ) {
            // Null out labels.
            return;
        }
        return ChartUtils.xAxisDateLabelFormatter(date, customVizConfig.dateFormat);
    }

    protected createYAxisOptionsList(chartConfig: LineChartConfig<any>): YAxisOptions[] {
        return super.createYAxisOptionsList(chartConfig, CoreCommonConstants.BASIS_POINT);
    }

    /**
     * Override default behavior, labels are not shown for time series chart
     */
    protected showLabelInputToChartLib(): boolean {
        return false;
    }

    /**
     * format the points on return analysis time series chart
     */
    tooltipPointFormatter(point: Point): any {
        const qbstr = (point as QbstrPoint)?.qbstr;
        const column = this.colsMap[qbstr?.measureName];
        const formattedValue = this.formatValue(point.y, column.formatter);
        return `
                <div style='z-index:999; background-color: var(--input-box__background-color--disabled); padding: 8px;'>
                    <tspan style='font-weight: bold'>Date:</tspan> ${point.category}
                    <br/><tspan style='font-weight: bold'>${point.series.name}:</tspan> ${formattedValue}
                <div>`;
    }
}
