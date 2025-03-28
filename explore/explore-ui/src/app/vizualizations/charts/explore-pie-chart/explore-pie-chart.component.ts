import {Component} from '@angular/core';
import {ChartMeasure, ChartType, PieChartConfig, PieChartOptions, QbstrPoint} from '@qbstr/highcharts-api';
import {ExploreChartComponent} from '../explore-chart.component';
import {PieCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {merge} from 'lodash';
import {GroupByKey, QueryKeyEntry} from '@qbstr/data-cube';
import {ROOT_LEVEL} from '@utils/qbstr';
import {QbstrHighchartsOptions} from '@qbstr/highcharts-api';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {ChartUtils} from '@utils/chart.utils';

/**
 * Explore Pie chart handles explore specific parts of the initialization.
 * Handles types specific chart configuration
 */
@Component({
    selector: 'app-explore-pie-chart',
    templateUrl: '../explore-chart.component.html',
    styleUrls: ['../explore-chart.component.scss']
})
export class ExplorePieChartComponent extends ExploreChartComponent<PieChartConfig<any>, PieCustomVizConfig> {

    createChartConfig(measures: ChartMeasure<any>[]): PieChartConfig<any> {
        const selectedLevel = this.defaultQueryKey.length;
        const groupBys = this.breakdownLevels.slice(selectedLevel, this.breakdownLevels.length);
        if (groupBys.length === 0) {
            this.defaultQueryKey = [new GroupByKey(ROOT_LEVEL)];
        }

        return {
            groupBy: groupBys,
            drillDown: this.breakdownLevels.slice(selectedLevel + 1, this.breakdownLevels.length),
            measures,
            useAbsoluteValue: true,
            flattenedRow: ChartUtils.isFactorGraphingPieSpritelet(this.widget.configType) && this.breakdownLevels.length > 0 ? this.breakdownLevels[this.breakdownLevels.length - 1] : undefined,
            breadcrumbs: this.getBreadcrumbsOptions()
        };
    }

    createChartSpecificQbstrChartConfig(cube: SimpleCube<any>, chartConfig: PieChartConfig<any>, chartOptions: QbstrHighchartsOptions, defaultQueryKey: QueryKeyEntry[]): PieChartOptions<any> {
        return {
            data: cube,
            type: ChartType.PIE,
            chartConfig,
            chartOptions,
            defaultQueryKeyEntries: defaultQueryKey,
            autoResizeDelay: -1
        };
    }

    createChartOptions(): Highcharts.Options {
        const context = this;

        return merge({},
            super.createChartOptions(),
            {
                chart: {
                    events: {
                        drilldown: event => {
                            context.toggleShowExploreDefaultBreadcrumbsState(event);
                        },
                        drillup: event => {
                            context.toggleShowExploreDefaultBreadcrumbsState(event);
                        },
                    }
                },
                plotOptions: {
                    series: {
                        tooltip: {
                            headerFormat: '',
                            pointFormatter() {
                                return context.tooltipPointFormatter(this);
                            }
                        },
                        dataLabels: {
                            formatter() {
                                return context.labelFormatter(this);
                            }
                        }
                    }
                }
            });
    }

    tooltipPointFormatter(point): any {
        let tooltipTxt;
        const pointValue = this.getPointValue(point);
        if (point.series.name === point.name) {
            tooltipTxt = `<b>${point.series.name}</b>: ${pointValue}<br/>`;
        } else if (point.series.name === this.firstCol.columnTitle) {
            tooltipTxt = `<b>${point.series.name}</b><br><b>&nbsp;${point.name}</b>: ${pointValue}<br/>`;
        } else {
            tooltipTxt = `<b>${this.firstCol.columnTitle}</b><br><b>&nbsp;${point.series.name}</b><br><b>&nbsp;${point.name}</b>: ${pointValue}<br/>`;
        }
        return tooltipTxt;
    }

    /**
     * format the datalabels for pie
     */
    labelFormatter(point): any {
        return this.getPointValue(point.point);
    }

    /**
     * return the formatted value of point
     */
    private getPointValue(point: any) {
        const qbstr = (point as QbstrPoint)?.qbstr;
        const pointY = qbstr?.negative && point.y > 0 ? point.y * (-1) : point.y;
        return this.formatValue(pointY, this.firstCol.formatter);
    }

    protected isDefaultBreadcrumbsSupported(): boolean {
        return true;
    }
}
