/**
 * Constants for data request
 */
export class DataRequestConstants {
    static readonly DATA_REQUEST_URL = {
        BASE: 'getPrismData',
        DECISION_BENCH: 'getDecisionBenchData',
        SINGLE_PORT_BEFORE_AFTER: 'getBeforeAfterData',
        MULTI_PORT_COMPARE: 'getMultiPortCompareData',
        TIMESERIES_BASE: 'getPrismTimeSeriesData',
        RETURNS_DATA : 'getReturnsData',
        RETURNS_BEFORE_AFTER_DATA : 'getReturnsBeforeAfterData',
        RETURNS_TIMESERIES_DATA : 'getReturnTimeSeriesData',
        EXPOST_STATS_DATA : 'getExpostStatsData',
        EXPOST_RETURNS_DATA : 'getExpostReturnsData',
        EXPOST_TIME_SERIES_DATA : 'getExpostTimeSeriesData',
        FACTOR_DATA : 'getFactorData',
        PNL_TS_DATA: 'pnlTsData',
        RETURNS_MULTI_PORT_COMPARE: 'getReturnMultiPortCompareData',
        RISK_DATA : 'getRiskFactorData',
        PROXY_DATA : 'getProxyData',
        RISK_BEFORE_AFTER_DATA : 'getRiskFactorBeforeAfterData',
        RISK_MULTI_PORT_COMPARE: 'getRiskFactorMultiPortCompareData',
        SECURITY_CONTRIBUTION_DATA: 'getFactorSecContribData',
        CANCEL_USER_REQUEST: 'cancelUserRequest',
        COMMITMENT_RISK_REQUEST: 'getCashFlowModeling',
        COMMITMENT_RISK_EXCLUDED_FUNDS: 'getCommitmentRiskExcludedFunds',
        CASSINI_MARGIN_ANALYTICS_REQUEST: 'getMarginAnalyticsData',
        LOOK_THROUGH_SUMMARY_REQUEST: 'getLookThroughSummaryData',
        SCHEDULED_BATCH_REQUEST: 'getFavoriteBatchSpreadSheets',
        FACTOR_TREE_DATA: 'getFactorTree',
        DIVERSIFICATION_SCORE_TIME_SERIES_DATA: 'diversificationScoreData'
    };

    static readonly DATA_FORMAT = {
        COMPACT_JSON: 'COMPACT_JSON',
        NO_DATA: 'NO_DATA',
        CLARITY: 'CLARITY_FORMAT_DATA'
    };

    static readonly CONTEXT_MENU_ACTIONS = {
        DELETE: 'delete',
        CANCEL: 'cancel',
        DOWNLOAD: 'download',
        DUPLICATE: 'duplicate'
    };

    static readonly DUPLICATE_REQUEST = 'DUPLICATE_REQUEST';
    static readonly CANCELLED_RESPONSE = 'CANCELLED_RESPONSE';

    static readonly SUCCESS_RESPONSE = 'SUCCESS';
}
