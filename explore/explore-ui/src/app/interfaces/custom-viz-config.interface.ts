import {VizualizationColumnConfig } from '@interfaces/request.interface';
import {SortedColumn} from '@models/widget/inputs/sorted-columns/sorted-column';
import {QueryKeyEntry} from '@qbstr/data-cube';
import {ChartMarkerSymbol, ChartType} from '@qbstr/highcharts-api';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';
import {ColorScaleFormatOption} from '@enums/color-scale-format-option';
import {ColorScaleMidpointOption} from '@enums/color-scale-midpoint-option';
import {ColorScaleGradientOption} from '@enums/color-scale-gradient-option.enum';
import {FactorDataHighlightSettings} from '@models/widget/inputs/factor-data-settings/factor-data-highlight-settings.model';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {TimePeriodInterval} from '@models/widget/inputs/chart-settings/time-period-interval-settings.model';

export interface HasColumnsOverride {
    columns?: VizualizationColumnConfig[];
}

export interface HasQueryKeysOverride {
    queryKeys?: QueryKeyEntry[];
}

export interface HasLeafLevels {
    leafLevels?: string[];
}

export interface HasHeader {
    header?: string;
}

export interface HasGridLines {
    showGridLines?: boolean;
}

export type YAxisOverridable = PrimaryYAxisOverridable & SecondaryYAxisOverridable;

export interface PrimaryYAxisOverridable {
    hidePrimaryYAxisTitle?: boolean;
    primaryYAxisOverride?: string;
    primaryYUpperBound?: number;
    primaryYLowerBound?: number;
    primaryYInterval?: number;
}

export interface ComboChartConfigurable {
    comboChartColumns?: ComboChartColumn[];
}

export interface SecondaryYAxisOverridable {
    hideSecondaryYAxisTitle?: boolean;
    secondaryYAxisOverride?: string;
    secondaryYUpperBound?: number;
    secondaryYLowerBound?: number;
    secondaryYInterval?: number;
}

export type DefaultCustomVizConfig =
    HasHeader
    & HasColumnsOverride
    & HasQueryKeysOverride
    & HasLeafLevels
    & HasGridLines;

export interface SecondaryYAxis {
    secondaryYAxis?: string;
}

export type PieCustomVizConfig = DefaultCustomVizConfig;

export interface TimeSeriesCustomVizConfig extends DefaultCustomVizConfig, YAxisOverridable, ComboChartConfigurable {
    showTotal?: boolean;
    showBaseline?: boolean;
    dateFormat?: string;
    seriesNameFieldOverride?: string;   // field used to override the series names in a chart
    showDataMarker?: boolean;
    groupBys?: string[]; // field to override group bys
    breadcrumbsMeasures?: {columnTitle: string}[]; // custom breadcrumbs measures
}

export interface ExPostTimeSeriesCustomVizConfig extends DefaultCustomVizConfig, YAxisOverridable, SecondaryYAxis {
    samplingPeriod?: string;
    statisticPeriod?: string;
    dateFormat?: string;
}

export interface FactorDataCustomVizConfig extends DefaultCustomVizConfig {
    isTimeSeriesMode?: boolean;
    factorTimeSeriesSelectedOption?: FactorTimeSeriesSelectedOption;
    chartType: ChartType.LINE | ChartType.COLUMN;
    dateFormat?: string;
    compareModeToggle?: boolean;
    compareMode?: string;
    comparisonDate?: string;
    isTriangularMatrix?: boolean;
    showChangeInUpperTriangle?: boolean;
    factorDataHighlightSettings?: FactorDataHighlightSettings;
    colKeys?: string[];
}

export interface ReturnsChartCustomVizConfig extends DefaultCustomVizConfig, YAxisOverridable {
    dateFormat?: string;
    showBaseline?: boolean;
    showDataMarker?: boolean;
    timePeriodInterval?: TimePeriodInterval;
}

export interface HeatMapCustomVizConfig extends DefaultCustomVizConfig {
    isXAxis: boolean;
    isYAxis: boolean;
    sortedColumnsX: SortedColumn[];
    sortedColumnsY: SortedColumn[];
    colorScaleFormat: ColorScaleFormatOption;
    colorScaleMidpoint: ColorScaleMidpointOption;
    colorScaleColors: ColorScaleGradientOption;
}

export interface BarCustomVizConfig extends DefaultCustomVizConfig, YAxisOverridable, ComboChartConfigurable {
    chartOrientation: ChartType.COLUMN | ChartType.BAR;
    isStacked: boolean;
    stackByImmediateChild?: boolean;
    showTotal: boolean;
    showBaseline?: boolean;
    showSelected?: boolean;
    sortOrder?: 'ASC' | 'DESC';
    sortBy?: string;
    topBottomFilterParams?: {top?: number, bottom?: number, columnKey: string};
}

export interface FactorBarCustomVizConfig extends DefaultCustomVizConfig, YAxisOverridable, ComboChartConfigurable {
    chartOrientation: ChartType.COLUMN | ChartType.BAR;
    selectedChartType?: ChartType.COLUMN | ChartType.LINE;
    isStacked: boolean;
    stackByImmediateChild?: boolean;
    showTotal: boolean;
    showBaseline?: boolean;
    showSelected?: boolean;
    selectedAsMeasureSeries?: boolean;
    sortOrder?: 'ASC' | 'DESC';
    sortBy?: string;
    groupBys?: string[];
    breadcrumbsMeasures?: {columnTitle: string}[]; // custom breadcrumbs measures
    topBottomFilterParams?: {top?: number, bottom?: number, columnKey: string};
    selectedChartMarkerSymbol?: ChartMarkerSymbol;
}

export interface ScatterCustomVizConfig extends DefaultCustomVizConfig {
    groupByFirstLevel?: boolean;
    isComparisonMode?: boolean;
}

export interface TreemapCustomVizConfig extends DefaultCustomVizConfig {
    isComparisonMode?: boolean;
    colorScaleFormat: ColorScaleFormatOption;
    colorScaleMidpoint: ColorScaleMidpointOption;
    colorScaleColors: ColorScaleGradientOption;
}

export interface PivotTableCustomViz {
    rowBreakdown: string;
    columnBreakdown: string;
    cellBreakdown?: string;
    portBenchActiveEnabled?: boolean;
}
