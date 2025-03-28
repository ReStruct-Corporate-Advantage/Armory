import {AbstractConfig, WidgetConfigType} from '@blk/explore-ui-core';
import {isObject} from 'lodash';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';
import {LineChartStyle} from '@enums/line-chart-style.enum';

export class ComboChartColumn extends AbstractConfig {

    colKey: string;

    colTitle?: string;

    colScale?: string;

    chartType: ColumnSeriesChartType;

    // Line style when chartType is line
    lineStyle?: LineChartStyle;

    secondaryAxis: boolean;

    /**
     * Constructor with parameters
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Determines what the default chart type should be for a given widget
     * @param widgetType  The widget type
     */
    static getDefaultColumnChartType(widgetType: WidgetConfigType): ColumnSeriesChartType {
        const isDefaultBarType = widgetType === WidgetConfigType.BAR || widgetType === WidgetConfigType.FACTOR_GRAPHING_BAR_CHART || widgetType === WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART || widgetType === WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES || widgetType === WidgetConfigType.PGS_BAR;
        return isDefaultBarType ? ColumnSeriesChartType.BAR : ColumnSeriesChartType.LINE;
    }

    equals(otherColumn: ComboChartColumn): boolean {
        if (!(otherColumn instanceof ComboChartColumn)) {
            return false;
        }

        return this.colKey === otherColumn.colKey &&
            this.chartType === otherColumn.chartType &&
            this.lineStyle === otherColumn.lineStyle &&
            this.secondaryAxis === otherColumn.secondaryAxis;
    }

    serialize(): any {
        const data: any = {
            colKey: this.colKey,
            chartType: this.chartType,
            secondaryAxis: this.secondaryAxis
        };

        if (this.chartType === ColumnSeriesChartType.LINE && this.lineStyle) {
            data.lineStyle = this.lineStyle;
        }
        return data;
    }

    /**
     * Deserialization of sector rule info
     */
    deserialize(data: any): void {
        if (data) {
            this.colKey = data.colKey;
            this.chartType = data.chartType;
            this.secondaryAxis = data.secondaryAxis;
            this.lineStyle = data.lineStyle;
        }
    }
}
