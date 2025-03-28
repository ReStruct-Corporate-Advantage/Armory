/**
 * Constants for Performance
 */
export class PerformanceConstants {
    static readonly CUSTOM = 'CUSTOM';
    static readonly AS_REPORTED = 'AS-REPORTED';
    static readonly CUSTOM_PIVOT_POINT = 'customPivotPoint';
    static readonly ATTRIBUTION_SETTINGS = 'ATTRIBUTION-SETTINGS';
    static readonly EXCESS_SETTINGS = 'EXCESS-SETTINGS';
    static readonly AS_REPORTED_LABEL = 'As Reported';
    static readonly TITLE = 'title';
    static readonly CUSTOM_ATTRIBUTION_METHODOLOGY = 'CUSTOM';
    static readonly ATTRIBUTION_METHOD = 'cannedAttributionMethodology';
    static readonly PERFORMANCE_SETTINGS = 'performanceSettings';
    static readonly SECTOR_WEIGHTING = 'sectorWeighting';
    static readonly ATTRIBUTION_CALCULATOR_METHOD = 'attributionCalculatorMethod';
    static readonly SECTOR_LEVEL = 'sectorLevel';
    static readonly FACTORS = 'factors';
    static readonly ASSET_TYPE = 'assetType';
    static readonly EXPOSURE_MODE = 'exposureMode';
    static readonly IS_TOP_DOWN_WITHOUT_LOOKTHROUGH = 'isTopDownWithoutLookThrough';
    static readonly IS_BOTTOMS_UP_WITH_LOOKTHROUGH = 'isBottomsUpWithLookthrough';
    static readonly MULTI_MANAGER_ATTRIBUTION = 'multiManagerAttribution';
    static readonly MULTI_MANAGER_ATTRIBUTION_LABEL = 'Multi-Manager';
    static readonly ACTIVE_BET = 'active_bet';
    static readonly OAS_CHG = 'OAS_CHG';
    static readonly OAS_CHG_SPREAD_DURATION = 'OAS_CHG_SPREAD_DURATION';
    static readonly OAS_CHG_MARKET_VALUE = 'OAS_CHG_MARKET_VALUE';
    static readonly OAS_CHG_DXS = 'OAS_CHG_DXS';
    static readonly OAS_CHG_SPREAD_DURATION_BENCH_TOTAL = 'OAS_CHG_SPREAD_DURATION_BENCH_TOTAL';
    static readonly OAS_CHG_DXS_BENCH_TOTAL = 'OAS_CHG_DXS_BENCH_TOTAL';
    static readonly OAS_CHG_MARKET_VALUE_BENCH_TOTAL = 'OAS_CHG_MARKET_VALUE_BENCH_TOTAL';
    static readonly FIXED_INCOME_DXS = 'FIXED_INCOME_DXS';
    static readonly FIXED_INCOME_SPREAD_DURATION = 'FIXED_INCOME_SPREAD_DURATION';
    static readonly FIXED_INCOME_MARKET_VALUE = 'FIXED_INCOME_MARKET_VALUE';
    static readonly SHOW_TIME_SERIES = 'Time series chart';
    static readonly TIME_SERIES_LABEL = 'Time Series for ';
    static readonly SHOW_DETAIL = 'Details';
    static readonly BENCH_TOTAL = 'BENCH_TOTAL';
    static readonly DETAILS_LABEL = 'Details for ';
    static readonly SHOW_PERFORMANCE_DETAILS = 'Open Performance Details';
    static readonly PERFORMANCE_DETAILS_LABEL = 'Performance Details for ';
    static readonly ENHANCED_BRINSON_CANNED_METHOD = 'EB_MULTI_ASSET_xFXMTE';
    static readonly ENHANCED_BRINSON_CANNED_METHOD_OLD = 'EB_MULTI_ASSET_xFXM';
    static readonly ENHANCED_BRINSON_REPORT = 'PRISM_ENHANCED_BRINSON';
    static readonly MANAGER_SELECTION = 'MANAGER_SELECTION';
    static readonly MANAGER_SELECTION_COL_TAG = 'mngr_select';
    static readonly MANAGER_SELECTION_TITLE = 'Manager Selection';
    static readonly MANAGER_SELECTION_LABEL = 'Open Manager Selection';
    static readonly MANAGER_SELECTION_REPORT = 'PRISM_ENHANCED_B_MANAGER_SELECTION';
    static readonly FX_ATTRIBUTION_COL_TAG = 'active_fx_spot_carry';
    static readonly FX_ATTRIBUTION_REPORT = 'PRISM_ENHANCED_B_FX_ATTRIBUTION';
    static readonly FX_ATTRIBUTION_TITLE = 'FX Attribution';
    static readonly FX_ATTRIBUTION_LABEL = 'Open FX Attribution';
    static readonly PERFORMANCE_DETAILS_REPORT = 'prism_spritelet';
    static readonly BENCHMARK_TOTAL = 'BENCHMARK_TOTAL_LEVEL';
    static readonly DXS = 'DXS';
    static readonly RELATIVE_SCALED_CALCULATION_METHOD = 'RELATIVE_SCALED';
    static readonly HOLDING_BASED_RETURN = 'Holding Based Return';
    static readonly TRANSACTION_BASED_RETURN = 'Transaction Based Return';
    static readonly IS_NET_RETURN = 'IS-NET-RETURN';

    static readonly AVAILABLE_ASSET_TYPES = [
        {label: 'Fixed income', value: 'FI_MANDATE'},
        {label: 'Equity', value: 'EQ_MANDATE'},
        {label: 'Multi asset', value: 'BAL_MANDATE'}
    ];

    static readonly CANNED_METHOD = {
        EQUITY_TD_xFX: 'EQUITY_TD_xFX',
        INDEX_EQUITY: 'INDEX_EQUITY',
        EB_MULTI_ASSET_xFXMTE: 'EB_MULTI_ASSET_xFXMTE',
        MULTI_ASSET: 'MULTI_ASSET',
        CUSTOM: 'CUSTOM',
        DEFAULT: 'Default',
    };

    static readonly CALCULATION_METHOD = {
        HYBRID: 'HYBRID',
        BHB: 'BHB',
        RELATIVE: 'RELATIVE',
        RELATIVEI: 'RELATIVEI',
        RELATIVE_SCALED: 'RELATIVE_SCALED',
        MA_RELATIVE: 'MA_RELATIVE',
        TOP_DOWN_NORM: 'TOP_DOWN_NORM',
        INDEX_EQUITY: 'INDEX_EQUITY',
        CUSTOM: 'CUSTOM'
    };

    static readonly CALCULATION_METHODS_WITH_MARKET_VALUE_WEIGHTING = [
        PerformanceConstants.CALCULATION_METHOD.BHB,
        PerformanceConstants.CALCULATION_METHOD.RELATIVE,
        PerformanceConstants.CALCULATION_METHOD.RELATIVEI,
        PerformanceConstants.CALCULATION_METHOD.TOP_DOWN_NORM,
        PerformanceConstants.CALCULATION_METHOD.MA_RELATIVE
    ];

    static readonly CALCULATION_LEVEL = {
        IMMEDIATE_PARENT_LEVEL: 'IMMEDIATE_PARENT_LEVEL',
        BENCHMARK_TOTAL_LEVEL: 'BENCHMARK_TOTAL_LEVEL',
        FIRST_LEVEL: 'FIRST_LEVEL'
    };

    static readonly RELATIVE_CREDIT_ATTRIBUTION_CANNED_METHODS = [
        PerformanceConstants.OAS_CHG_DXS,
        PerformanceConstants.OAS_CHG_SPREAD_DURATION,
        PerformanceConstants.OAS_CHG_MARKET_VALUE,
        PerformanceConstants.OAS_CHG_DXS_BENCH_TOTAL,
        PerformanceConstants.OAS_CHG_SPREAD_DURATION_BENCH_TOTAL,
        PerformanceConstants.OAS_CHG_MARKET_VALUE_BENCH_TOTAL
    ];

    static readonly WEIGHT_TYPE = {
        MARKET_VALUE: 'MARKET_VALUE',
        SPREAD_DURATION: 'SPREAD_DURATION',
        DXS: 'DXS',
        COMPARISON: 'COMPARISON'
    };

    static readonly COMBINED_CANNED_METHODS = {
        HYBRID_SETTING: {
            FIXED_INCOME_DXS: 'FIXED_INCOME_DXS',
            FIXED_INCOME_SPREAD_DURATION: 'FIXED_INCOME_SPREAD_DURATION',
            FIXED_INCOME_MARKET_VALUE: 'FIXED_INCOME_MARKET_VALUE',
        },
        RELATIVE_SETTING: {
            OAS_CHG_DXS: 'OAS_CHG_DXS',
            OAS_CHG_SPREAD_DURATION: 'OAS_CHG_SPREAD_DURATION',
            OAS_CHG_MARKET_VALUE: 'OAS_CHG_MARKET_VALUE',
        }
    };

    static readonly SPRITELET_EVENTS = {
        RETURN_TIME_SERIES: 'RETURN_TIME_SERIES',
        RETURN_PERF_DETAILS: 'RETURN_PERF_DETAILS',
        RETURN_DRILLDOWN_TIME_SERIES: 'RETURN_DRILLDOWN_TIME_SERIES',
        RETURN_DRILLDOWN_PERF_DETAILS: 'RETURN_DRILLDOWN_PERF_DETAILS',
        RETURN_MANAGER_SELECTION: 'RETURN_MANAGER_SELECTION',
        RETURN_FX_ATTRIBUTION: 'RETURN_FX_ATTRIBUTION'
    };

    static readonly LOOK_THROUGH_SETTINGS = {
        TOP_DOWN_WITHOUT_LOOK_THROUGH: 'topDownWithoutLookthrough',
        BOTTOMS_UP_WITH_LOOK_THROUGH: 'bottomsUpWithLookthrough'
    };
}
