import {WidgetConfigType} from './widget-config-type.enum';

/**
 * Enum for Widget types
 */
export enum WidgetType {
    RISK_EXPOSURE = 'agGrid',
    PRA = 'praAgGrid',
    RETURNS = 'returnGrid',
    RETURNS_SPRITELET = 'returnsSpritelet',
    PGS = 'pgsGrid',
    PGS_BAR = 'pgsBar',
    PGS_TS = 'pgsTs',
    PIE = 'pie',
    BAR = 'bar',
    HEATMAP = 'heatmap',
    TREEMAP = 'treemap',
    SCATTER = 'scatter',
    TIME_SERIES = 'ts',
    SLOPE_GRAPH = 'slopeGraph',
    RETURN_ANALYSIS = 'returnGrid',
    RETURN_ANALYSIS_CHART = 'returnChart',
    PIVOT = 'pivot',
    EXPOST_STATS = 'expostStats',
    EXPOST_RETURNS = 'expostReturns',
    EXPOST_TIME_SERIES = 'expostTimeSeries',
    FACTOR_GRAPHING_BAR_CHART = 'praBar',
    FACTOR_GRAPHING_STACK_BAR_CHART = 'praStackBar',
    FACTOR_GRAPHING_PIE_CHART = 'praPie',
    FACTOR_SECURITY_CONTRIBUTION = 'praSecurityContributionGrid',
    SCORE_GAUGE = 'scoreGauge',
    CLARITY = 'clarity',
    COMMITMENT_RISK_LEGACY = 'commitmentRisk',
    COMMITMENT_RISK_CHART_LEGACY = 'commitmentRiskChart',
    COMMITMENT_RISK = 'commitmentRisk2',
    COMMITMENT_RISK_CHART = 'commitmentRiskChart2',
    COMMITMENT_RISK_EXCLUDED_FUNDS = 'commitmentRiskExcludedFunds',
    FACTOR_TIME_SERIES_CHART = 'praTimeSeries',
    CASSINI_MARGIN_ANALYTICS = 'cassiniMarginAnalytics',
    LOOK_THROUGH_SUMMARY = 'lookThroughSummaryGrid',
    FACTOR_DATA = 'praFactorData',
    PNL_TS = 'pnlTsWidget',
    MCVAR_PNL_TS = 'mcvarPnlTsWidget',
    DECARBONIZATION_WIDGET = 'decarbonizationWidget',
    DIVERSIFICATION_TS = 'diversificationTsWidget'
}

/**
 * Mappings between widgets' widget types and their widget config types
 */
export const WidgetTypeToWidgetConfigTypeMap = new Map<WidgetType, WidgetConfigType>([
    [WidgetType.RISK_EXPOSURE, WidgetConfigType.RISK_EXPOSURE],
    [WidgetType.PRA, WidgetConfigType.PRA],
    [WidgetType.RETURNS, WidgetConfigType.RETURNS],
    [WidgetType.PGS, WidgetConfigType.PGS],
    [WidgetType.PIE, WidgetConfigType.PIE],
    [WidgetType.BAR, WidgetConfigType.BAR],
    [WidgetType.HEATMAP, WidgetConfigType.HEATMAP],
    [WidgetType.TREEMAP, WidgetConfigType.TREEMAP],
    [WidgetType.SCATTER, WidgetConfigType.SCATTER],
    [WidgetType.TIME_SERIES, WidgetConfigType.TIME_SERIES],
    [WidgetType.SLOPE_GRAPH, WidgetConfigType.SLOPE_GRAPH],
    [WidgetType.RETURN_ANALYSIS, WidgetConfigType.RETURNS],
    [WidgetType.RETURN_ANALYSIS_CHART, WidgetConfigType.RETURN_ANALYSIS_CHART],
    [WidgetType.PIVOT, WidgetConfigType.PIVOT],
    [WidgetType.EXPOST_STATS, WidgetConfigType.EXPOST_STATS],
    [WidgetType.EXPOST_RETURNS, WidgetConfigType.EXPOST_RETURNS],
    [WidgetType.EXPOST_TIME_SERIES, WidgetConfigType.EXPOST_TIME_SERIES],
    [WidgetType.FACTOR_GRAPHING_BAR_CHART, WidgetConfigType.FACTOR_GRAPHING_BAR_CHART],
    [WidgetType.FACTOR_GRAPHING_STACK_BAR_CHART, WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART],
    [WidgetType.FACTOR_GRAPHING_PIE_CHART, WidgetConfigType.FACTOR_GRAPHING_PIE_CHART],
    [WidgetType.FACTOR_SECURITY_CONTRIBUTION, WidgetConfigType.FACTOR_SECURITY_CONTRIBUTION],
    [WidgetType.CLARITY, WidgetConfigType.CLARITY],
    [WidgetType.COMMITMENT_RISK_LEGACY, WidgetConfigType.COMMITMENT_RISK_LEGACY],
    [WidgetType.COMMITMENT_RISK_CHART_LEGACY, WidgetConfigType.COMMITMENT_RISK_CHART_LEGACY],
    [WidgetType.COMMITMENT_RISK, WidgetConfigType.COMMITMENT_RISK],
    [WidgetType.COMMITMENT_RISK_CHART, WidgetConfigType.COMMITMENT_RISK_CHART],
    [WidgetType.FACTOR_TIME_SERIES_CHART, WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES],
    [WidgetType.CASSINI_MARGIN_ANALYTICS, WidgetConfigType.CASSINI_MARGIN_ANALYTICS],
    [WidgetType.LOOK_THROUGH_SUMMARY, WidgetConfigType.LOOK_THROUGH_SUMMARY],
    [WidgetType.FACTOR_DATA, WidgetConfigType.FACTOR_DATA],
    [WidgetType.PNL_TS, WidgetConfigType.PNL_TS],
    [WidgetType.PGS_BAR, WidgetConfigType.PGS_BAR],
    [WidgetType.PGS_TS, WidgetConfigType.PGS_TS],
    [WidgetType.MCVAR_PNL_TS, WidgetConfigType.MCVAR_PNL_TS],
    [WidgetType.DIVERSIFICATION_TS, WidgetConfigType.DIVERSIFICATION_TS],
    [WidgetType.DECARBONIZATION_WIDGET, WidgetConfigType.DECARBONIZATION_WIDGET]
]);

/**
 * Mappings between spritelets' widget config types and their widget types
 */
export const SpriteletWidgetConfigTypeToWidgetTypeMap = new Map<WidgetConfigType, WidgetType>([
    [WidgetConfigType.RETURNS_DRILLDOWN_TIME_SERIES, WidgetType.RETURNS_SPRITELET],
    [WidgetConfigType.RETURNS_DRILLDOWN_PERF_DETAIL, WidgetType.RETURNS_SPRITELET],
    [WidgetConfigType.RETURNS_TIME_SERIES, WidgetType.RETURNS_SPRITELET],
    [WidgetConfigType.RETURNS_PERF_DETAIL, WidgetType.RETURNS_SPRITELET],
    [WidgetConfigType.RETURNS_FX_ATTRIBUTION, WidgetType.RETURNS_SPRITELET],
    [WidgetConfigType.RETURNS_MANAGER_SELECTION, WidgetType.RETURNS_SPRITELET],
    [WidgetConfigType.COMMITMENT_RISK_EXCLUDED_FUNDS, WidgetType.COMMITMENT_RISK_EXCLUDED_FUNDS]
]);

/**
 *
 * @param widgetConfigType a widget config type for which to get the widget type
 * @return widget type for the given widget config type, or undefined if could not find the matching widget type
 */
export function getWidgetType(widgetConfigType: WidgetConfigType): WidgetType {
    // Try to find in the spritelets' mappings
    let widgetType = SpriteletWidgetConfigTypeToWidgetTypeMap.get(widgetConfigType);

    if (!widgetType) {
        // Try to find in the main widgets' "widgetType/widgetConfigType" mappings
        for (const entry of Array.from(WidgetTypeToWidgetConfigTypeMap.entries())) {
            if (entry[1] === widgetConfigType) {
                widgetType = entry[0];
                break;
            }
        }
    }

    return widgetType;
}
