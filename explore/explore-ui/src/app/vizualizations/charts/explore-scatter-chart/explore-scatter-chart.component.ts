import {Component} from '@angular/core';
import {CommonConstants} from '@constants/common.constants';
import {ScatterCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {GroupByKey, QueryKeyEntry} from '@qbstr/data-cube';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {
    BubbleChartConfig,
    BubbleChartOptions,
    ChartMeasure,
    ChartType,
    QbstrHighchartsOptions
} from '@qbstr/highcharts-api';
import {ROOT_LEVEL} from '@utils/qbstr';
import {merge} from 'lodash';
import {ExploreEnrichingChartDirective} from '../explore-enriching-chart.directive';

/**
 * Explore Scatter Chart handles explore specific parts of the initialization.
 * Prepares cube
 * Handles types specific chart configuration
 */
@Component({
    selector: 'app-explore-scatter-chart',
    templateUrl: '../explore-chart.component.html',
    styleUrls: ['../explore-chart.component.scss']
})
export class ExploreScatterChartComponent extends ExploreEnrichingChartDirective<BubbleChartConfig<any>, ScatterCustomVizConfig> {

    private yMeasureCol: VizualizationColumnConfig;
    private sizeMeasureCol: VizualizationColumnConfig;

    /**
     * create config for scatter graph
     */
    createChartConfig(measures: ChartMeasure<any>[]): BubbleChartConfig<any> {
        this.yMeasureCol = this.requestConfig.columns[1];
        this.sizeMeasureCol = this.requestConfig.columns[2];

        const levelToStart = (this.customVizConfig.groupByFirstLevel && this.breakdownLevels.length > 2) ? 2 : 1;
        const noBreakdownComparisonMode = this.customVizConfig.isComparisonMode && this.breakdownLevels.length === 1;
        if (this.breakdownLevels.length <= 1) {
            this.defaultQueryKey = [new GroupByKey(ROOT_LEVEL)];
        }
        const measuresToUse = this.responseConfig.splitColumnKeys && !noBreakdownComparisonMode ? this.getMeasures(measures) : measures;
        return {
            groupByFirstLevel: this.customVizConfig.groupByFirstLevel,
            groupBy: this.breakdownLevels[levelToStart] ? [this.breakdownLevels[levelToStart]] : [],
            drillDown: this.breakdownLevels.slice(levelToStart + 1, this.breakdownLevels.length),
            measures: measuresToUse,
            breadcrumbs: this.getBreadcrumbsOptions(this.sizeMeasureCol?.columnTitle || '')
        };
    }

    protected setBreadcrumbsMeasures(): void {
        this.breadcrumbsMeasures = [this.sizeMeasureCol];
    }

    createChartSpecificQbstrChartConfig(cube: SimpleCube<any>, chartConfig: BubbleChartConfig<any>, chartOptions: QbstrHighchartsOptions, defaultQueryKey: QueryKeyEntry[]): BubbleChartOptions<any> {
        return {
            data: cube,
            type: ChartType.BUBBLE,
            chartConfig,
            chartOptions,
            defaultQueryKeyEntries: defaultQueryKey,
            autoResizeDelay: -1
        };
    }

    /**
     * filter the measures to be used for scatter plot
     */
    private getMeasures(measures: ChartMeasure<any>[]): ChartMeasure<any>[] {
        return this.requestConfig.columns.map(col => measures.filter(measure => !(measure.name.indexOf(col.columnKey) < 0))[0]);
    }

    /**
     * create the ChartOptions for scatter chart
     */
    createChartOptions(): Highcharts.Options {
        const context = this;

        const chartOptions = merge({},
            super.createChartOptions(),
            {
                xAxis: {
                    gridLineWidth: this.customVizConfig.showGridLines ? 1 : 0,
                    title: {
                        text: this.firstCol.columnTitle
                    },
                    labels: {
                        formatter() {
                            return context.formatValue(this.value, context.firstCol.formatter);
                        }
                    },
                    startOnTick: true,
                    endOnTick: true,
                    showLastLabel: true
                },
                yAxis: {
                    title: {
                        text: this.yMeasureCol.columnTitle
                    },
                    labels: {
                        formatter() {
                            return context.formatValue(this.value, context.yMeasureCol.formatter);
                        }
                    },
                    startOnTick: true,
                    endOnTick: true,
                    showLastLabel: true
                },
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
                    bubble: {
                        sizeBy: 'width',
                        // NOTE: not specifying limits below means these are obtained from the dataset
                        // minSize: '0%',
                        // maxSize: '100%',
                        sizeByAbsoluteValue: true
                    } as any,
                    series: {
                        dataLabels: {
                            format: '{point.name}',
                            color: '{point.color}',
                            style: {'fontWeight': 'normal', 'textShadow': 'false'}
                        },
                        pointStart: 0,
                        marker: {
                            enabled: true,
                            radius: 6,
                            states: {
                                hover: {
                                    enabled: true,
                                    lineColor: 'rgb(100,100,100)'
                                }
                            }
                        },
                        animation: false,
                        tooltip: {
                            pointFormatter() {
                                return context.tooltipPointFormatter(this);
                            },
                            headerFormat: ''
                        }
                    }
                }
            });
        if (!this.sizeMeasureCol) {
            chartOptions.plotOptions.bubble = {
                minSize: 12,
                maxSize: 12
            };
        }

        return chartOptions;
    }

    /**
     * format the points on scatter chart
     */
    tooltipPointFormatter(point): any {
        const [xName, yName, ...zName] = this.getMeasureNames(this.chartConfig.measures[0], this.chartConfig.measures[1], this.chartConfig.measures[2]);
        const formattedXMeasureValue = this.formatValue(point.x, this.firstCol.formatter);
        const formattedYMeasureValue = this.formatValue(point.y, this.yMeasureCol.formatter);
        const formattedSizeMeasureValue = this.sizeMeasureCol ? this.formatValue(point.z, this.sizeMeasureCol.formatter) : undefined;

        let tooltip = `
                        <b>${point.name}</b><br/>
                        <b>${xName}:</b> ${formattedXMeasureValue}<br/>
                        <b>${yName}:</b> ${formattedYMeasureValue}<br/>
                    `;
        if (this.sizeMeasureCol && zName[0]) {
            tooltip = tooltip.concat(`<b>${zName[0]}:</b> ${formattedSizeMeasureValue}<br/>`);
        }
        return tooltip;
    }

    /**
     * get measure names for tooltip
     */
    getMeasureNames = (xMeasure, yMeasure, sizeMeasure) => {
        const measureNames = [
            this.colsMap[xMeasure.name].splitColumnHeaderName && !this.customVizConfig.isComparisonMode ? xMeasure.name.split(CommonConstants.COLUMN_KEY_SPLITTER)[1] + ' ' + xMeasure.title : xMeasure.title,
            this.colsMap[yMeasure.name].splitColumnHeaderName && !this.customVizConfig.isComparisonMode ? yMeasure.name.split(CommonConstants.COLUMN_KEY_SPLITTER)[1] + ' ' + yMeasure.title : yMeasure.title
        ];
        if (sizeMeasure) {
            measureNames.push(this.colsMap[sizeMeasure.name].splitColumnHeaderName && !this.customVizConfig.isComparisonMode ? sizeMeasure.name.split(CommonConstants.COLUMN_KEY_SPLITTER)[1] + ' ' + sizeMeasure.title : sizeMeasure.title);
        }
        return measureNames;
    };

    enrichCube(cube: SimpleCube<any>, chartConfig: BubbleChartConfig<any>, defaultQueryKeyEntries: QueryKeyEntry[]) {
        if (this.customVizConfig.isComparisonMode && this.breakdownLevels.length === 1) {
            super.enrichSplitColumnKeys(cube, chartConfig, defaultQueryKeyEntries, true);
        }
        if (this.customVizConfig.groupByFirstLevel) {
            super.enrichLevels(cube, defaultQueryKeyEntries, [], chartConfig.groupBy);
        }
    }

    protected isDefaultBreadcrumbsSupported(): boolean {
        return true;
    }
}
