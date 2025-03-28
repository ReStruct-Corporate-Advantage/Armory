
/**
 * Enum for Widget ConfigType
 */
export enum WidgetConfigType {
    // CHART WIDGET
    BAR = 'bar',
    HEATMAP = 'heatmap',
    PIE = 'pie',
    FACTOR_GRAPHING_BAR_CHART = 'praBar',
    FACTOR_GRAPHING_STACK_BAR_CHART = 'praStackBar',
    FACTOR_GRAPHING_PIE_CHART = 'praPie',
    FACTOR_GRAPHING_TIME_SERIES = 'praTimeSeries',
    PGS_BAR = 'pgsBar',
    PGS_TS = 'pgsTs',
    DECARBONIZATION_WIDGET = 'decarbonizationWidget',

    FACTOR_DATA = 'praFactorData',

    RETURN_ANALYSIS_CHART = 'returnChartWidget',
    SCATTER = 'scatter',
    SLOPE_GRAPH = 'slopeGraph',
    TIME_SERIES = 'ts',
    TREEMAP = 'treemap',

    CMBS_MAP = 'cmbsMap',

    // TABLE WIDGET
    RISK_EXPOSURE = 'riskExposure',
    PRA = 'praWidget',
    PGS = 'pgsWidget',
    PIVOT = 'pivotWidget',
    FACTOR_SECURITY_CONTRIBUTION = 'praSecurityContribution',

    PNL_TS = 'pnlTsWidget',
    MCVAR_PNL_TS = 'mcvarPnlTsWidget',
    DIVERSIFICATION_TS = 'diversificationTsWidget',

    // RETURNS WIDGET
    RETURNS = 'returnsWidget',
    RETURNS_PERF_DETAIL = 'returnsPerformanceDetails',
    RETURNS_TIME_SERIES = 'returnsTimeSeries',
    RETURNS_DRILLDOWN_PERF_DETAIL = 'returnsDrillDownPerformanceDetails',
    RETURNS_DRILLDOWN_TIME_SERIES = 'returnsDrillDownTimeSeries',
    RETURNS_FX_ATTRIBUTION = 'returnsFxAttribution',
    RETURNS_MANAGER_SELECTION = 'returnsManagerSelection',

    // EXPOST WIDGET
    EXPOST_RETURNS = 'expostReturnsWidget',
    EXPOST_STATS = 'expostStatsWidget',
    EXPOST_TIME_SERIES = 'expostTimeSeriesWidget',

    // Commitment risk widget
    COMMITMENT_RISK_LEGACY = 'commitmentRiskWidget',
    COMMITMENT_RISK_CHART_LEGACY = 'commitmentRiskChartWidget',
    COMMITMENT_RISK = 'commitmentRiskWidget2',
    COMMITMENT_RISK_CHART = 'commitmentRiskChartWidget2',
    COMMITMENT_RISK_EXCLUDED_FUNDS = 'commitmentRiskExcludedFundsWidget',

    // Cassini Widget
    CASSINI_MARGIN_ANALYTICS = 'cassiniMarginAnalyticsWidget',

    // Look-through Widget
    LOOK_THROUGH_SUMMARY = 'lookThroughSummaryWidget',

    // CLARITY
    CLARITY = 'clarity'
}
