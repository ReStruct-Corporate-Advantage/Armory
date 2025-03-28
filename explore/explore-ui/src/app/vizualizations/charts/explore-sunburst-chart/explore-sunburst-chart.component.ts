import {Component, ViewEncapsulation} from '@angular/core';
import {QueryKeyEntry} from '@qbstr/data-cube';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {
    ChartMeasure,
    ChartType,
    ChartTypes,
    QbstrHighchartsOptions,
    SunburstChartConfig,
    SunburstChartOptions
} from '@qbstr/highcharts-api';
import {Options} from 'highcharts';
import {ExploreEnrichingChartDirective} from '../explore-enriching-chart.directive';
import {CommonConstants} from '@constants/common.constants';

/**
 * Explore Sunburst chart handle explore specific parts of the initialization.
 * Prepares cube for the underlying chart queries
 * Handles types specific chart configuration
 *
 * @example
 *  <app-explore-sunburst-chart
 *      *ngSwitchCase="WidgetConfigType.SUNBURST"
 *      [widgetPayload]="widgetPayload"
 *  ></app-explore-sunburst-chart>
 */
@Component({
    selector: 'app-explore-sunburst-chart',
    templateUrl: '../explore-chart.component.html',
    styleUrls: ['./explore-sunburst-chart.component.scss', '../explore-chart.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ExploreSunburstChartComponent extends ExploreEnrichingChartDirective<SunburstChartConfig<any>, any> {

    /**
     * Create chart options
     */
    createChartOptions(): Options {
        const context = this;

        const dataLabelFormatter = function (dataLabel) {

            const {style} = dataLabel;

            let name = this.point.name;

            // data label truncation
            if ((style.width / 8) < name.length) {
                name = name.substr(0, style.width / 8 - 3) + CommonConstants.TRUNCATION_KEY;
            }

            return `<div style="text-align: center">
                        <tspan style="font-weight: bold;">${name}</tspan>
                    </div>`;
        };

        const chartOptions = {
            ...super.createChartOptions(),
            series: [
                {
                    data: [],
                    allowDrillToNode: true,
                    cursor: 'pointer',
                    type: ChartType.SUNBURST as any,
                    dataLabels: {
                        filter: {
                            property: 'innerArcLength',
                            operator: '>',
                            value: 16
                        },
                        rotationMode: 'auto',
                        useHTML: true,
                        formatter: dataLabelFormatter
                    },
                    levels: [{
                        level: 1,
                        levelIsConstant: false,
                        dataLabels: {
                            filter: {
                                property: 'outerArcLength',
                                operator: '>',
                                value: 64
                            },
                            formatter: dataLabelFormatter
                        }
                    }, {
                        level: 1,
                        colorByPoint: true
                    },
                        {
                            level: 2,
                            colorVariation: {
                                key: 'brightness',
                                to: -0.5
                            }
                        }, {
                            level: 3,
                            colorVariation: {
                                key: 'brightness',
                                to: 0.5
                            }
                        }]
                }
            ]

        };
        chartOptions.plotOptions.series.tooltip.pointFormatter = function () {
            return context.tooltipPointFormatter(this);
        };
        chartOptions.colors = this.initializeColors(chartOptions);
        return chartOptions;
    }

    /**
     *  we are hard-coding the colors array in sunburst chart if colors are not defined so that
     *  while rendering the chart we can provide different shades of parent color for child
     */
    initializeColors(chartOptions): any {
        return chartOptions.colors ? chartOptions.colors : ['0x0998f6', '0xcb2cc0', '0x26d9ba', '0xff8900', '0x9952e0', '0xf8e71c', '0xfd4f03', '0x9fd926', '0x888f9a'];
    }

    /**
     * format the points on sunburst chart
     */
    tooltipPointFormatter(point): any {
        return `<b>${point.name}</b>: ${this.formatValue(point.value, this.firstCol.formatter)}<br/>`;
    }

    /**
     * Create chart config
     */
    createChartConfig(measures: ChartMeasure<any>[]): SunburstChartConfig<any> {
        return {
            topLevelName: undefined,
            groupBy: this.breakdownLevels.slice(1, this.breakdownLevels.length),
            measures,
            useAbsoluteValue: true,
            breadcrumbs: this.getBreadcrumbsOptions()
        };
    }

    createChartSpecificQbstrChartConfig(cube: SimpleCube<any>, chartConfig: SunburstChartConfig<any>, chartOptions: QbstrHighchartsOptions, defaultQueryKey: QueryKeyEntry[]): SunburstChartOptions<any> & Required<{ type: ChartTypes; }> {
        return {
            data: cube,
            type: ChartType.SUNBURST,
            chartConfig,
            chartOptions,
            defaultQueryKeyEntries: defaultQueryKey,
            autoResizeDelay: -1
        };
    }
}
