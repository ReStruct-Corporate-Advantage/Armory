import {Component, ViewEncapsulation} from '@angular/core';
import {ChartWidgetInputConfigType, WidgetConfigType} from '@blk/explore-ui-core';
import {BarCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {createQK, FilterIncludeKey, GroupByKey, QueryKeyEntry} from '@qbstr/data-cube';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {BarChartConfig, BarChartOptions, DataProcessingAPI, QbstrHighchartsOptions} from '@qbstr/highcharts-api';
import {Options} from 'highcharts';
import {dropRight, first, isNil, last} from 'lodash';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {CustomColorPositiveNegative} from '@models/widget/inputs/chart-settings/custom-color-positive-negative';
import {ExploreBaseBarChartDirective} from '../explore-base-bar-chart.directive';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';
import {ChartUtils} from '@utils/chart.utils';

/**
 * Explore Bar chart handles explore specific parts of the initialization.
 * Prepares cube
 * Handles types specific chart configuration
 */
@Component({
    selector: 'app-explore-bar-chart',
    templateUrl: '../explore-chart.component.html',
    styleUrls: ['./explore-bar-chart.component.scss', '../explore-chart.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ExploreBarChartComponent extends ExploreBaseBarChartDirective<BarCustomVizConfig> {

    /**
     * Creates a qbstr chart config of either BAR or COLUMN.
     * LINE measures are also in this config and controlled by the chart type on the individual measures.
     */
    createChartSpecificQbstrChartConfig(cube: SimpleCube<any>, chartConfig: BarChartConfig<any>, chartOptions: QbstrHighchartsOptions, defaultQueryKey: QueryKeyEntry[]): BarChartOptions<any> {
        return {
            ...super.createChartSpecificQbstrChartConfig(cube, chartConfig, chartOptions, defaultQueryKey),
            updateSeriesBeforeChartingFn: this.updateSeriesBeforeCharting,
            updateSeriesBeforeDrilldownChartingFn: this.updateSeriesBeforeCharting
        };
    }

    updateSeriesBeforeCharting = <DATATYPE>(api: DataProcessingAPI<DATATYPE, BarChartConfig<DATATYPE>>): any[] => {
        ChartUtils.setZIndexForComboChart(api.data);
        this.showHideYAxisTitle(api);
        const customColors = this.widget.displayInputs.get(ChartWidgetInputConfigType.CUSTOM_COLOR_POSITIVE_NEGATIVE) as CustomColorPositiveNegative;
        if (customColors?.isEnabled && !this.customVizConfig.isStacked) {
            api.data.forEach(measureData => {
                measureData.data?.forEach(dataPoint => {
                    if (dataPoint) {
                        if (dataPoint.qbstr.negative) {
                            dataPoint.color = customColors.negativeColor;
                        } else {
                            dataPoint.color = customColors.positiveColor;
                        }
                    }
                    return dataPoint;
                });
            });
        }
        return api.data;
    };

    private showHideYAxisTitle = <DATATYPE>(api: DataProcessingAPI<DATATYPE, BarChartConfig<DATATYPE>>): void => {
        // Update the chart to show/hide y-axis title, check if the drill down is at datapoint level
        // and y-axis has both primary and secondary axis.
        // api.data => returns data related to the selected datapoint (y-axis primary data - if drilldown is at y-axis primary or y-axis secondary data - if drilldown is at y-axis secondary)
        if (this.chartConfig.drillDown?.length > 0 && this.chartConfig.measures.length > api.data.length) {
            api.data.forEach((chartData) => {
                const measure = this.chartConfig.measures.find((point) => point.title === chartData.name);
                // Check if y-axis title is set to primary or secondary and update the chart accordingly.
                // axis === 0 => Y-Axis Primary
                // axis === 1 => Y-Axis Secondary
                if (measure.axis === 0 || measure.axis === undefined) {
                    api.chart.yAxis[1].update({title: {text: ''}});
                }
                if (measure.axis === 1) {
                    api.chart.yAxis[0].update({title: {text: ''}});
                }
            });
        }
    }

    /**
     * Overriding the method here and not passing chartConfig to super makes sure that bar chart doesn't derive its config based on first measure
     * For example the Y axis title should be Values and not the title of the first measure
     */
    protected createChartOptions(chartConfig: BarChartConfig<any>): Options {
        const chartOptions = super.createChartOptions(chartConfig);

        const customColors = this.widget.displayInputs.get(ChartWidgetInputConfigType.CUSTOM_COLOR_POSITIVE_NEGATIVE) as CustomColorPositiveNegative;
        if (customColors?.isEnabled && !this.customVizConfig.isStacked) {
            chartOptions.legend.useHTML = true;
            chartOptions.legend.symbolWidth = 0;
            chartOptions.legend.symbolHeight = 0;
            chartOptions.legend.squareSymbol = false;
            chartOptions.legend.labelFormatter = this.createLegendLabelFormatterPositiveNegative(customColors);
        }

        // assign total formatter if applicable
        this.assignTotalFormatter(chartOptions, WidgetConfigType.BAR);

        return chartOptions;
    }

    createLegendLabelFormatterPositiveNegative(customColors: CustomColorPositiveNegative) {
        const context = this;
        return function () {
            return '<span style="height:12px;width:12px;' +
                'display:inline-block;border-radius:50%;' +
                'background:linear-gradient(to right,' + customColors.positiveColor + ' 0%,' +
                customColors.positiveColor + ' 50%,' + customColors.negativeColor + ' 50%,' +
                customColors.negativeColor + ' 100%)"></span> ' +
                '<text style="font-weight: bold">' + context.getLegendName(this) + '</text>';
        };
    }

    private getLegendName(legendItem: any) {
        if (this.isBatchExport) {
            return this.truncateNameForBatchExport(legendItem);
        } else {
            return legendItem.name;
        }
    }

    protected getCubeSelectedEnrichDataSet(cube: SimpleCube<any>, chartConfig: BarChartConfig<any>, defaultQueryKeyEntries: QueryKeyEntry[], measureKeys: QueryKeyEntry[]): Observable<any[]> {
        const groupByQueryKey = last(defaultQueryKeyEntries);

        const defaultQueryKey = dropRight(defaultQueryKeyEntries);
        const groupByKey = new GroupByKey(groupByQueryKey.field);

        return cube.getSimilarIfPresent(createQK([...defaultQueryKey, ...measureKeys, groupByKey])).pipe(
            filter(data => !isNil(data)),
            map((data: any[]) => data.filter(dataItem => dataItem[groupByQueryKey.field] === first((groupByQueryKey as FilterIncludeKey<string>).includes))),
            map((data: any[]) => data.map(dataItem => ({
                ...dataItem,
                forMeasureSeriesOnly: true,
                [chartConfig.stacked]: dataItem[groupByQueryKey.field]
            })))
        );
    }

    /**
     * Add custom CSS classes for positive/negative line measures and line styling
     */
    protected getChartMeasureCssStyleClass(comboChartColumn: ComboChartColumn): string {
        // get all applicable CSS classes, filtering out any undefined values
        const cssClasses = [
            this.getPositiveNegativeCssStyleClass(comboChartColumn),
            this.getComboChartLineStyleCss(comboChartColumn)
        ].filter(css => !isNil(css));

        // if there are any CSS classes, join them into a single string
        if (cssClasses.length > 0) {
            return cssClasses.join(' ');
        }
        return undefined;
    }

    /**
     * Returns the CSS class for a line measure with custom colors
     */
    private getPositiveNegativeCssStyleClass(comboChartColumn: ComboChartColumn): string {
        const isLineChart = comboChartColumn?.chartType === ColumnSeriesChartType.LINE;
        const isPositiveNegative = (this.widget.displayInputs.get(ChartWidgetInputConfigType.CUSTOM_COLOR_POSITIVE_NEGATIVE) as CustomColorPositiveNegative)?.isEnabled;

        if (isLineChart && isPositiveNegative) {
            return 'positive-negative-line-measure';
        } else if (isLineChart) {
            return 'bar-chart-line-measure';
        }
        return undefined;
    }
}
