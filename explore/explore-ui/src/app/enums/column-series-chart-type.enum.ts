import {ChartType} from '@qbstr/highcharts-api';

export enum ColumnSeriesChartType {
    BAR = 'bar',
    LINE = 'line',
    MARKER = 'marker'
}

export namespace ColumnSeriesChartType {
    export function getHighchartChartType(chartColumnSeriesType: ColumnSeriesChartType): ChartType {
        switch (chartColumnSeriesType) {
            case ColumnSeriesChartType.BAR:
                return ChartType.COLUMN;
            case ColumnSeriesChartType.LINE:
                return ChartType.LINE;
            case ColumnSeriesChartType.MARKER:
                return ChartType.SCATTER;
            default:
                return ChartType.COLUMN;
        }
    }
}

export enum ColumnSeriesChartTypeDisplayValue {
    MARKER = 'Marker',
    BAR = 'Bar',
    LINE = 'Line'
}