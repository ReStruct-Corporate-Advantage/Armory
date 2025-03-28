import { Component, ViewEncapsulation } from '@angular/core';
import { HeatMapCustomVizConfig } from '@interfaces/custom-viz-config.interface';
import { AggregationKey, createQK, GroupByKey, QueryKeyEntry, SortingKey, SortType } from '@qbstr/data-cube';
import { SimpleCube } from '@qbstr/data-cube-reactive';
import {
    ChartMeasure,
    ChartToggles,
    ChartType,
    HeatmapChartConfig,
    HeatmapChartOptions,
    QbstrHighchartsOptions,
    QbstrPoint
} from '@qbstr/highcharts-api';
import {FixedOrderSortingKey} from '@qbstr/highcharts-core';
import { ROOT_LEVEL } from '@utils/qbstr';
import { Options} from 'highcharts';
import {flatten, isNil, merge} from 'lodash';
import { combineLatest, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ExploreEnrichingChartDirective } from '../explore-enriching-chart.directive';
import { updateChart } from '../explore-chart-color.utils';
import {ColumnConstants, WidgetDisplayInputConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {ChartSettings} from '@models/widget/inputs/chart-settings/chart-settings.model';
import {ColorScaleMidpointOption} from '@enums/color-scale-midpoint-option';
import {ColorScaleFormatOption} from '@enums/color-scale-format-option';
import { ColorScaleGradientOption } from '@enums/color-scale-gradient-option.enum';

/**
 * Explore Heatmap chart handles explore specific parts of the initialization.
 * Prepares cube
 * Handles types specific chart configuration
 */
@Component({
    selector: 'app-explore-heatmap-chart',
    templateUrl: '../explore-chart.component.html',
    styleUrls: ['./explore-heatmap-chart.component.scss', '../explore-chart.component.scss'],
    encapsulation: ViewEncapsulation.None // XXX: required for highcharts style overrides!
})
export class ExploreHeatmapChartComponent extends ExploreEnrichingChartDirective<HeatmapChartConfig<any>, HeatMapCustomVizConfig> {

    public chartType: ChartType = ChartType.HEATMAP;

    createChartSpecificQbstrChartConfig(cube: SimpleCube<any>, chartConfig: HeatmapChartConfig<any>, chartOptions: QbstrHighchartsOptions, defaultQueryKey: QueryKeyEntry[]): HeatmapChartOptions<any> {
        return {
            data: cube,
            type: ChartType.HEATMAP,
            chartConfig,
            chartOptions,
            defaultQueryKeyEntries: !chartConfig.xAxis && !chartConfig.yAxis ? [new GroupByKey(ROOT_LEVEL)] : defaultQueryKey,
            autoResizeDelay: -1,
            updateSeriesBeforeChartingFn: ({data, chart}) => {
                if (chart) {
                    if ((chart.series && chart.series.length > 0 && chart.series[0]) || (this.customVizConfig.colorScaleColors)) {
                        // after setData, colorAxis[0].min and colorAxis[0].max is available from high chart
                        // propagate value to colorValue for gradient support, erase colorIndex
                        const newData: any[] = data[0]?.data?.map(point => ({ ...point, colorValue: point.colorValue, colorIndex: undefined }));
                        // upda chart with selected chart setting
                        updateChart(newData, chart, this.getColorScaleOptions());
                        if (chart.series.length > 0) {
                            chart.series[0]?.setData(newData);
                        } else {
                            chart.addSeries(data as any);
                        }
                     }  else {
                               chart.addSeries(data as any);
                    }
                }
                return data;
            }
        };
    }

    protected createChartOptions(): Options {
        const context = this;
        const formatter: any = function (dataLabel) {
            const qbstr = (dataLabel as QbstrPoint)?.qbstr;
            const val = !this.point
                ? this.value
                : qbstr?.negative && this.point.value > 0
                    ? this.point.value * (-1)
                    : this.point.value;
            const formattedVal = context.formatValue(val, context.firstCol.formatter);
            return this.point
                ? formattedVal : Number(String(formattedVal)
                    .replace(/,/g, '')
                    .replace(/%/g, ''));
        };

        const colorAxisFormatter: any = function (dataLabel) {
            const qbstr = (dataLabel as QbstrPoint)?.qbstr;
            const val = !this.point
                ? this.value
                : qbstr?.negative && this.point.value > 0
                    ? this.point.value * (-1)
                    : this.point.value;
                const formattedVal = context.formatValue(val, context.firstCol.formatter, false);
                return this.point
                    ? formattedVal : Number(String(formattedVal)
                        .replace(/,/g, '')
                        .replace(/%/g, ''));
        };
        const tooltipPointFormatter: any = function (dataLabel) {
            const qbstr = (dataLabel as QbstrPoint)?.qbstr;
            return `<b>${context.firstCol.columnTitle}</b>: ${context.formatValue(qbstr?.negative && this.value > 0 ? this.value * (-1) : this.value, context.firstCol.formatter)}<br/>`;
        };

        const [showLegend, showLabel] = this.getShowLegendAndLabel();
        const chartOptions = merge({},
            super.createChartOptions(),
            {
                title: {
                    text: showLabel ? this.colsMap[this.chartConfig.measures[0].name].columnTitle : null,
                    align: 'left'
                },
                subtitle: {
                    text: showLegend ? this.colsMap[this.chartConfig.measures[0].name].columnTitle : null,
                    verticalAlign: 'bottom'
                },
                yAxis: [{
                    title: { text: (this.widget.getCombinedInputs().get(WidgetInputType.COLUMN_BREAKDOWN_TREE) as Breakdown)?.getDisplayTitle()},
                    gridZIndex: 2 // make sure grid lines are drawn on top of data points
                }],
                xAxis: {
                    title: { text: (this.widget.getCombinedInputs().get(WidgetInputType.BREAKDOWN_TREE) as Breakdown)?.getDisplayTitle()},
                    gridZIndex: 2 // make sure grid lines are drawn on top of data points
                },
                plotOptions: {
                    heatmap: {
                        marker: {enabled: true}
                    },
                    series: {
                        dataLabels: {
                            shadow: false,
                            className: 'datalabel',
                            style: {
                                textOutline: 'none',
                                fontWeight: 'normal'
                            },
                            formatter
                        },
                        tooltip: {
                            headerFormat: '',
                            pointFormatter: tooltipPointFormatter
                        }
                    }
                },
                colorAxis: {
                    labels: {
                        formatter: colorAxisFormatter
                    }
                }
            });

        // update the formatter under chartType object as well
        this.updateFormatterUnderChartType(chartOptions, formatter);

        return chartOptions;
    }

    /**
     * Update the formatter under chartType object
     */
    updateFormatterUnderChartType(chartOptions: Options, formatter: any): void {
        if (!chartOptions.plotOptions[ChartType.HEATMAP]) {
            chartOptions.plotOptions[ChartType.HEATMAP] = {dataLabels: {formatter}};
        } else if (!chartOptions.plotOptions[ChartType.HEATMAP].dataLabels) {
            chartOptions.plotOptions[ChartType.HEATMAP].dataLabels = {formatter};
        } else {
            chartOptions.plotOptions[ChartType.HEATMAP].dataLabels['formatter'] = formatter;
        }
    }

    createSortColumn = (field: string, sort: string, order?: any[]) => {
        switch (sort) {
            case ColumnConstants.SORTING_ORDER.ASC_SORT_ORDER.VALUE: {
                return new SortingKey(field, SortType.ASC);
            }
            case ColumnConstants.SORTING_ORDER.DESC_SORT_ORDER.VALUE: {
                return new SortingKey(field, SortType.DESC);
            }
            case ColumnConstants.SORTING_ORDER.BREAKDOWN_SORT_ORDER.VALUE: {
                return new FixedOrderSortingKey(field, {});
            }
            default:
                return undefined;
        }
    };

    createChartConfig(measures: ChartMeasure<any>[]): HeatmapChartConfig<any> {
        const axisConfig = {
            xAxis: this.customVizConfig.isXAxis ? this.breakdownLevels[1] : undefined,
            yAxis: this.customVizConfig.isXAxis && this.customVizConfig.isYAxis
                ? this.breakdownLevels[2]
                : this.customVizConfig.isYAxis
                    ? this.breakdownLevels[1]
                    : undefined
        };

        const sortedColumnsX = this.customVizConfig.sortedColumnsX?.map(({ colId, sort }) =>
            this.createSortColumn(colId || axisConfig.xAxis, sort, undefined)
        );

        const sortedColumnsY = this.customVizConfig.sortedColumnsY?.map(({ colId, sort }) =>
            this.createSortColumn(colId || axisConfig.yAxis, sort, undefined)
        );

        return {
            ...axisConfig,
            xAxisSort: sortedColumnsX?.[0],
            yAxisSort: sortedColumnsY?.[0],
            measures
        };
    }

    /**
     * Store the chart state changes in display inputs
     * We do-not need to add markForCheck here, as it would cause the chart to keep rendering in a never ending loop
     */
    public storeChangedChartState = ($event: ChartToggles) => {
        const widgetInput = this.widget.displayInputs.get(WidgetDisplayInputConfigType.CHART_SETTINGS);
        if (widgetInput instanceof ChartSettings && $event.hasOwnProperty(this.LEGEND)) {
            widgetInput.legendShow = $event.legend;
            if (!isNil(this.chart)) {
                this.chart.setSubtitle({
                    text: widgetInput.legendShow ? this.colsMap[this.chartConfig.measures[0].name].columnTitle : null,
                    verticalAlign: 'bottom'
                });
            }
        }
        if (widgetInput instanceof ChartSettings && $event.hasOwnProperty(this.LABEL)) {
            widgetInput.labelShow = $event.label;
            if (!isNil(this.chart)) {
                this.chart.setTitle({
                    text: widgetInput.labelShow ? this.colsMap[this.chartConfig.measures[0].name].columnTitle : null,
                    align: 'left'
                });
            }
        }
    };

    /**
     * The data that is needed for a chart is equivalent to a multi groupBy statement.
     * e.g.
     * breakdown -> sector_1, sector_2, sector_3 / measure -> pct_mv_1
     *
     *
     */
    enrichCube(cube: SimpleCube<any>, chartConfig: HeatmapChartConfig<any>, defaultQueryKeyEntries: QueryKeyEntry[]) {
        if (chartConfig.xAxis && chartConfig.yAxis) {
            const measures: ChartMeasure<any>[] = chartConfig.measures;
            const measureKeys = measures.map(measure => new AggregationKey(measure.name, measure.aggMethod));

            const groupKeys = [new GroupByKey(chartConfig.yAxis), new GroupByKey(chartConfig.xAxis)];

            const cksForSet = cube.keys().filter(ck => ck.groupKeys().find(gk => gk.isEqual(groupKeys[0])));
            const keysToJoin: Observable<any>[] = cksForSet.map(ck => cube.getSimilarIfPresent(ck));
            combineLatest(keysToJoin).pipe(takeUntil(this.ngUnsubscribe)).subscribe(dataSets => {
                const heatmapLeavesCK = createQK([...defaultQueryKeyEntries, ...groupKeys, measureKeys[0]]);
                cube.set(heatmapLeavesCK, flatten(dataSets));
            });
        }
    }

    private getColorScaleOptions(): {colorRangeSelection: ColorScaleGradientOption, colorMidPointSelection: ColorScaleMidpointOption , colorFormatSelection: ColorScaleFormatOption} {
        return {
            colorRangeSelection: this.customVizConfig.colorScaleColors,
            colorMidPointSelection: this.customVizConfig.colorScaleMidpoint,
            colorFormatSelection: this.customVizConfig.colorScaleFormat
        };
    }
}
