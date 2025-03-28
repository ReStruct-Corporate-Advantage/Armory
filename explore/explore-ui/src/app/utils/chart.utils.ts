import {Widget} from '@models/widget/widget.model';
import {decidesChartingLib} from '@interfaces/decides-charting-lib.interface';
import {
    CalendarDateUtils,
    ChartWidgetInputConfigType,
    CoreWidgetConfigStore,
    CoreWidgetConstants,
    DateFormatConstants,
    WidgetConfigType,
    WidgetDisplayInputConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {max, range} from 'lodash';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {ChartMeasure, ChartType} from '@qbstr/highcharts-api';
import {CommonConstants} from '@constants/common.constants';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';
import {SortedColumns} from '@models/widget/inputs/sorted-columns/sorted-columns';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {ComboChartColumnSettings} from '@models/widget/inputs/chart-settings/combo-chart-column-settings.model';
import {BarChartSettings} from '@models/widget/inputs/chart-settings/bar-chart-settings.model';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';
import {BarCustomVizConfig} from '@interfaces/custom-viz-config.interface';

export class ChartUtils {

    /**
     * Set the zIndex for series in a combo chart to ensure that Markers and Lines always appear in front of Bars.
     */
    public static setZIndexForComboChart(series: any[]): void {
        const uniqueChartTypes = new Set(series.map(serie => serie.type));
        if (uniqueChartTypes.size < 2) {
            return;
        }
        series.forEach(serie => {
            if (serie.type === ChartType.SCATTER) {
                serie.zIndex = 9;
            } else if (serie.type === ChartType.LINE) {
                serie.zIndex = 5;
            } else {
                serie.zIndex = 1;
            }
        });
    }

    /**
     * Checks if the passed in widget is a chart or not
     * Takes into consideration widgets that can switch between tabular/chart view and returns based on the current view
     */
    static isChartWidget(widget: Widget): boolean {
        let isChartWidget = false;
        widget.getCombinedInputs().forEach((widgetInput: WidgetInput) => {
            if (decidesChartingLib(widgetInput)) {
                isChartWidget = widgetInput.getChartingLib() === CoreWidgetConstants.CHARTING_LIB.HIGHCHART;
            }
        });

        return CoreWidgetConfigStore.getChartConfigForType(widget.configType).chartingLib === CoreWidgetConstants.CHARTING_LIB.HIGHCHART || isChartWidget;
    }

    /**
     * Formatting the x-axis date labels of returns chart and time Series chart
     */
    static xAxisDateLabelFormatter(value: string, dateFormat: string): any {
        // If the date format is 'Aladdin date format' then we need not format the date as it is the default format we get from server.
        if (dateFormat && dateFormat !== DateFormatConstants.ALADDIN_DATE_FORMAT_NAME) {
            value = CalendarDateUtils.getDateInFormat(value, CalendarDateUtils.getDateFormat(dateFormat));
        }
        return value;
    }

    /**
     * Return true if passed in configType is of factor graphing bar spritelet widget
     */
    static isFactorGraphingBarSpritelet(configType: string): boolean {
        return (configType === WidgetConfigType.FACTOR_GRAPHING_BAR_CHART || configType === WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART);
    }

    /**
     * Return true if passed in configType is of PGS graphing spritelet widget
     */
    static isPGSGraphingSpritelet(configType: string): boolean {
        return configType === WidgetConfigType.PGS_BAR || configType === WidgetConfigType.PGS_TS;
    }


    /**
     * Return true if the config type is of PGS spritelet widget
     * @param configType - configType of the widget
     */
    static isPGSSpritletWidget(configType: string): boolean {
        return this.isPGSGraphingSpritelet(configType) || configType === WidgetConfigType.PNL_TS || configType === WidgetConfigType.MCVAR_PNL_TS || configType === WidgetConfigType.DIVERSIFICATION_TS;
    }

    /**
     * Return true if passed in configType is of factor graphing pie spritelet widget
     */
    static isFactorGraphingPieSpritelet(configType: string): boolean {
        return configType === WidgetConfigType.FACTOR_GRAPHING_PIE_CHART;
    }

    /**
     * Return true if passed in configType is of factor graphing spritelet widget
     */
    static isFactorGraphingSpritelet(configType: string): boolean {
        return (ChartUtils.isFactorGraphingBarSpritelet(configType) || configType === WidgetConfigType.FACTOR_GRAPHING_PIE_CHART);
    }

    /**
     * return column measure axis code. 1 for secondary axis, undefined for primary
     */
    static getColumnMeasureAxisCode(comboChartColumns: ComboChartColumn[], chartMeasure: ChartMeasure<any>): number {
        // we need to check if the column is on secondary axis, we also want to consider split columns that's why we have used column spliter '|'
        return comboChartColumns?.find(column => column.colKey === chartMeasure.name.split(CommonConstants.COLUMN_KEY_SPLITTER)[0])?.secondaryAxis ? 1 : undefined;
    }

    /**
     * Applies combo chart settings to chart measure
     */
    static applyComboChartSettingsOrDefault(comboChartColumn: ComboChartColumn, chartMeasure: ChartMeasure<any>, widgetType: WidgetConfigType): void {
        chartMeasure.axis = comboChartColumn?.secondaryAxis ? 1 : undefined;
        // use selected comboChartColumn chartType, otherwise default
        const chartType: ColumnSeriesChartType = comboChartColumn?.chartType || ComboChartColumn.getDefaultColumnChartType(widgetType);
        chartMeasure.chartType = ColumnSeriesChartType.getHighchartChartType(chartType);
    }

    static getComboChartMeasureFromChartMeasure(chartMeasure: ChartMeasure<any>, comboChartColumns: ComboChartColumn[]): ComboChartColumn {
        return comboChartColumns?.find(column => column.colKey === chartMeasure.name.split(CommonConstants.COLUMN_KEY_SPLITTER)[0]);
    }

    /**
     * Returns Tick positions in data-domain.
     */
    static dateTimeTickPositioner(): number[] {
        const { len, dataMax, dataMin, tickPixelInterval = 100, tickInterval, minTickInterval }: any = this;
        const dataRange = dataMax - dataMin;
        const pixelRange = len;
        // Work out data-domain equivalent to tickPixelInterval
        const dataInterval = (tickPixelInterval / pixelRange) * dataRange;
        // range from dataMin to dataMax (inclusive, hence +1) in specified step size, with dataInterval as a minimum
        const ticks = range(dataMin, dataMax + 1, max([dataInterval, minTickInterval, tickInterval]))
            .map(f => Math.round(f));
        return ticks;
    }

    /**
     * Returns common customVizConfig settings for bar chart and its children
     * @param widget
     */
    static getBarChartCustomVizConfigSettings(widget: Widget): BarCustomVizConfig {
        const sortedColsInput = widget.dataStore.metaData.inputs.get(WidgetDisplayInputConfigType.SORTED_COLUMNS) as SortedColumns;
        const stackedBreakdowns: Breakdown = widget.dataStore.metaData.inputs.get(WidgetInputType.STACKED_BREAKDOWN_TREE) as Breakdown;
        const comboChartColSettings = widget.displayInputs.get(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS) as ComboChartColumnSettings;

        let sortOrder, sortBy;
        if (sortedColsInput && (Array.isArray(sortedColsInput.sortedColumns) && sortedColsInput.sortedColumns.length > 0)) {
            if (sortedColsInput.sortedColumns[0].sort === 'ASC') {
                sortOrder = 'ASC';
            } else if (sortedColsInput.sortedColumns[0].sort === 'DESC') {
                sortOrder = 'DESC';
            }
            sortBy = sortedColsInput.sortedColumns[0].colId;
        }

        const chartSettings = widget.displayInputs.get(WidgetDisplayInputConfigType.CHART) as BarChartSettings;

        return {
            showGridLines: (widget.displayInputs.get(WidgetDisplayInputConfigType.SHOW_GRID_LINES) as GridLines)?.showGridLines,
            chartOrientation: chartSettings?.chartType === ChartType.BAR ? ChartType.BAR : ChartType.COLUMN,
            isStacked: stackedBreakdowns?.children.length > 0,
            showTotal: !!chartSettings?.includeTotalValues,
            showBaseline: !!chartSettings?.showBaseline,
            sortOrder,
            sortBy,
            comboChartColumns: comboChartColSettings?.columns
        };
    }
}
