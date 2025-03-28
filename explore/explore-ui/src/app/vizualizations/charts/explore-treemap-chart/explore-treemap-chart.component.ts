import { Component, ViewEncapsulation } from '@angular/core';
import {CommonConstants} from '@constants/common.constants';
import { TreemapCustomVizConfig } from '@interfaces/custom-viz-config.interface';
import { VizualizationColumnConfig } from '@interfaces/request.interface';
import { TimeSpanDataFormatter } from '@models/data-formatters/time-span-data.formatter';
import { AbsoluteValueSetting } from '@models/widget/inputs/chart-settings/absolute-value-setting.model';
import { GroupByKey, QueryKeyEntry } from '@qbstr/data-cube';
import { SimpleCube } from '@qbstr/data-cube-reactive';
import { ChartMeasure, ChartType, ChartTypes, HeatmapChartConfig, QbstrHighchartsOptions, TreemapChartConfig, TreemapChartOptions } from '@qbstr/highcharts-api';
import { ROOT_LEVEL } from '@utils/qbstr';
import { WidgetUtils } from '@utils/widget.utils';
import {Options} from 'highcharts';
import { ExploreEnrichingChartDirective } from '../explore-enriching-chart.directive';
import {ColorScaleMidpointOption} from '@enums/color-scale-midpoint-option';
import {ColorScaleFormatOption} from '@enums/color-scale-format-option';
import { ColorScaleGradientOption } from '@enums/color-scale-gradient-option.enum';
import { updateChart } from '../explore-chart-color.utils';
/**
 * Explore Treemap chart handle explore specific parts of the initialization.
 * Prepares cube for the underlying chart queries
 * Handles types specific chart configuration
 *
 * @example
 *  <app-explore-treemap-chart
 *      *ngSwitchCase='WidgetConfigType.TREEMAP'
 *      [widgetPayload]='widgetPayload'
 *  ></app-explore-treemap-chart>
 */
@Component({
    selector: 'app-explore-treemap-chart',
    templateUrl: '../explore-chart.component.html',
    styleUrls: ['./explore-treemap-chart.component.scss', '../explore-chart.component.scss'],
    encapsulation: ViewEncapsulation.None // required for highcharts style overrides
})
export class ExploreTreemapChartComponent extends ExploreEnrichingChartDirective<TreemapChartConfig<any>, TreemapCustomVizConfig> {
    private colorMeasureCol: VizualizationColumnConfig;

    private minColorValue: number;
    private maxColorValue: number;

    /**
     * Create chart options
     */
    createChartOptions(): Options {
        this.colorMeasureCol = this.requestConfig.columns[1];

        const context = this;

        const dataLabelFormatter = function (dataLabel) {
            // defer in dataLabels is a property to defer displaying the data labels until the initial series animation has finished.
            // Or in other word, it's not used with animation false  (by default it is false with no animation).
            // https://api.highcharts.com/highcharts/plotOptions.series.dataLabels.defer
            // HACK: Use `defer` property (boolean) to show/hide value label.
            //       The flag is modified during the label toggle event on qbstr for the treemap.
            const {style, defer} = dataLabel;
            // XXX: Highcharts Treemap dataLabel visibility bug workaround
            const chartDataLabelsEnabled = this.series?.chart?.options?.plotOptions?.treemap?.dataLabels?.enabled;
            if (!chartDataLabelsEnabled) {
                return '';
            }

            let name = this.point.name;
            let value = context.formatValue(this.point.value, context.firstCol.formatter);
            if ((style.width / 6) < this.point.name.length) {
                // truncate displayLabel if the width is too small to fit the label
                // this is a workaround to display the data label
                // https://github.com/highcharts/highcharts/issues/8160
                name = this.point.name.substr(0, style.width / 6 - 3) + CommonConstants.TRUNCATION_KEY;
            }
            if ((style.width / 6) < value.length) {
                value = value.substr(0, style.width / 6 - 3) + CommonConstants.TRUNCATION_KEY;
            }

            if (style.width < 18) {
                name = '';
                value = '';
            }

            // text color of the data labels on Purple-Red50 should be white
            // it's bit unclear because we don't know where to start showing text to white because we use color gradient and Purple-Red50 is only at the min
            // unless max < |min| or max ~= |min|, we do not show Purple-Red50 in the gradient
            if ((context.maxColorValue < Math.abs(context.minColorValue)) || context.maxColorValue - Math.abs(context.minColorValue) < 0.1) {
                if (this.point.colorValue < context.minColorValue * 0.95) {
                    return `
                            <div style="color: var(--focus-highlight_background-color); text-align: center">
                                <tspan style="font-weight: bold;">${name}</tspan><br/>
                                <tspan style="font-weight: 200;">${defer ? '' : value}</tspan>
                            </div>`;
                }
            }

            return `<div style="text-align: center">
                        <tspan style="font-weight: bold;">${name}</tspan><br/>
                        <tspan style="font-weight: 200;">${defer ? '' : value}</tspan>
                    </div>`;
        };

        const toolTipFormatter = function () {
            if (!this.point) {
                return;
            }
            const sizeMeasure = context.chartConfig.measures[0];
            const colorMeasure = context.chartConfig.colorMeasure;
            const sizeColumn = context.colsMap[sizeMeasure.name];
            const colorColumn = context.colsMap[colorMeasure.name];
            const sizeTooltip = sizeColumn['customAggregation'] ? context.responseConfig.columnHeaderDetails.columnKeyToDisplayNameMap[sizeColumn.columnKey] : sizeMeasure.title;
            const colTooltip = colorColumn['customAggregation'] ? context.responseConfig.columnHeaderDetails.columnKeyToDisplayNameMap[colorColumn.columnKey] : colorMeasure.title;

            const formattedSizeMeasureValue = context.formatValue(this.point.value, context.firstCol.formatter);
            const formattedColorMeasureValued = context.formatValue(this.point['colorValue'], context.colorMeasureCol.formatter);

            return `
                <div style="z-index:999; background-color: var(--input-box__background-color--disabled); padding: 8px;">
                    <tspan style="font-weight: bold">${this.point.name}</tspan><br/>
                    <tspan style="font-weight: bold">&nbsp;${sizeTooltip}:</tspan>  ${formattedSizeMeasureValue}<br/>
                    <tspan style="font-weight: bold">&nbsp;${colTooltip}:</tspan>  ${formattedColorMeasureValued}
                </div>`;
        };

        return {
            ...super.createChartOptions(),
            title: {
                text: this.colorMeasureCol?.columnTitle,
                verticalAlign: 'bottom'
            },
            series: [
                {
                    turboThreshold: 0,
                    data: [],
                    name: 'Top',
                    layoutAlgorithm: 'squarified',
                    allowDrillToNode: true,
                    cursor: 'pointer',
                    type: ChartType.TREEMAP as any,
                    colorByPoint: true,
                    borderWidth: 1,
                    levelIsConstant: true,
                    levels: [{
                        level: 1,
                        dataLabels: {
                            enabled: true,
                            formatter: dataLabelFormatter
                        }
                    }],
                } as any
            ],
            plotOptions: {
                series: {
                    dataLabels: {
                        className: 'datalabelTreemap',
                        formatter: dataLabelFormatter
                    }
                }
            },
            colorAxis: {
                // the color gradient from design team (for light theme) are:
                // Purple-Red50(#CB2CC0), Purple-Red30(#EF6CE5), Purple-Red20(#F49BED), Pruple-Red10(#F9C6F5), Blue10(#CDEAFE), Blue20(#9BD5FC), Blue30(#69C0FA), Blue50(#0998F6)
                // by default the gradient are set from Blue10(#CDEAFE) to Blue50(#0998F6) for positive data (colorValues)
                // if we deal with negative value data, then the stops for the gradient are updated and re-rendered

                // css variable doesn't work properly here when it's added to stops
                // e.g> [0, 'var(--focus-highlight_background-color)'] does not work with gradient
                stops: [
                    [0, '#CDEAFE'],
                    [1, '#0998F6']
                ],
                labels: {
                    formatter() {
                        // label formatter is getting called first, so saving minColorValue and maxColorValue to calculate for data label color
                        context.minColorValue = this.axis.min;
                        context.maxColorValue = this.axis.max;
                        if (context.colorMeasureCol.formatter instanceof TimeSpanDataFormatter) {
                            return context.colorMeasureCol.formatter.applyPostfix(this.value);
                        } else {
                            return context.colorMeasureCol.formatter.formatInShort(WidgetUtils.getInputValueToFormat(this.value, context.colorMeasureCol.formatter), 0);
                        }
                    },
                    overflow: 'allow'
                }
            },
            tooltip: {
                useHTML: true,
                padding: 0,
                formatter: toolTipFormatter
            }
        } as Options;
    }

    /**
     * Create chart config
     */
    createChartConfig(measures: ChartMeasure<any>[]): TreemapChartConfig<any> {
        const absoluteValueSettings = this.widget.displayInputs.get('showAbsoluteValue') as AbsoluteValueSetting;
        if (this.breakdownLevels.slice(1, this.breakdownLevels.length).length === 0) {
            this.defaultQueryKey = [new GroupByKey(ROOT_LEVEL)];
        }
        const [chartMeasure, colorMeasure] = measures;

        return {
            topLevelName: this.breakdownLevels.slice(1, this.breakdownLevels.length).length === 0 ? chartMeasure.title || chartMeasure.name : undefined,
            groupBy: this.breakdownLevels.slice(1, this.breakdownLevels.length),
            measures: this.customVizConfig.isComparisonMode && this.breakdownLevels.length === 1 ? measures : [chartMeasure],
            colorMeasure,
            useAbsoluteValue: absoluteValueSettings.useAbsoluteValue,
            breadcrumbs: this.getBreadcrumbsOptions()
        };
    }

    createChartSpecificQbstrChartConfig(cube: SimpleCube<any>, chartConfig: TreemapChartConfig<any>, chartOptions: QbstrHighchartsOptions, defaultQueryKey: QueryKeyEntry[]): TreemapChartOptions<any> & Required<{ type: ChartTypes; }> {
        return {
            data: cube,
            type: ChartType.TREEMAP,
            chartConfig,
            chartOptions,
            defaultQueryKeyEntries: defaultQueryKey,
            autoResizeDelay: -1,
            updateSeriesBeforeChartingFn: ({data, chart}) => {
                if (chart) {
                    if ((chart.series && chart.series.length > 0 && chart.series[0]) || (this.customVizConfig.colorScaleColors)) {

                        data = data?.map(point => ({ ...point, colorValue: point.colorValue, colorIndex: undefined }));
                        // update with selected chart setting
                        updateChart(data, chart, this.getColorScaleOptions());
                        chart.series[0]?.setData(data);
                    }  else {
                        chart.addSeries(data as any);
                    }
                }

                // HACK:
                // Hicharts, for some reason - which requires an in-depth analysis of highcharts source code, fails to correctly assign the appropriate colors to the boxes at the chart's initialization.
                // The problem disappears when the chart is resized, so manually triggering an update during initialization to resolve the issue.
                chart.series[0].update({} as any);

                return data;
            }
        };
    }

    enrichCube(cube: SimpleCube<any>, chartConfig: HeatmapChartConfig<any>, defaultQueryKeyEntries: QueryKeyEntry[]) {
        if (chartConfig.groupBy.length > 0) {
            super.enrichCube(cube, chartConfig, defaultQueryKeyEntries);
        }

        if (this.customVizConfig.isComparisonMode && chartConfig.groupBy.length === 0) {
            super.enrichSplitColumnKeys(cube, chartConfig, defaultQueryKeyEntries, true);
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
