export class CoreRiskConstants {
    static readonly RISK_SETTINGS = 'riskSettings';
    static readonly RISK_RATIO_SETTINGS = 'riskRatioSettings';

    static readonly NONE: string = 'None';
    static readonly OTHER: string = 'Other';

    static readonly SCENARIO_TYPE = {
        HISTORICAL: 'Historical Scenarios',
        MACROECONOMIC: 'Macroeconomic Scenarios',
        MARKET_DRIVEN: 'Market Driven Scenarios',
        USER_DEFINED: 'User Defined Scenarios'
    };

    static readonly CONFIG_TYPE = {
        RISK_SETTINGS: 'RISK_SETTINGS',
        RISK_COLUMN_SETTINGS: 'riskColumnSettings',
        RISK_FACTOR_BREAKDOWN: 'riskFactorBreakdown',
        BREAKDOWN: 'breakdownTree'
    };

    static readonly RISK_SETTING_TYPE = {
        ECONOMY: 'DEPENDS-ON-ECONOMY',
        EXPOSURE: 'DEPENDS-ON-EXPOSURE',
        HVAR: 'SHOW-HVAR-SETTINGS',
        HVAR_TRIMMED: 'SHOW-HVAR-SETTINGS-TRIMMED',
        MCVAR: 'SHOW-MCVAR-SETTINGS'
    };

    static readonly AVAILABLE_CHARTING_TYPES = [
        {value: 'column', label: 'Column'},
        {value: 'line', label: 'Dot'}
    ];

    static readonly RISK_SETTINGS_HIERARCHY_TYPE = {
        ORG_DEFAULT: 'Org Default',
        PORT_DEFAULT: 'Port Default',
        PORTFOLIO: 'Portfolio',
        WIDGET: 'Widget',
        COLUMN: 'Column'
    };

    static readonly RISK_SETTINGS_HIERARCHY_DISPLAY_NAME = {
        [this.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT]: 'Organization (Default)',
        [this.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT]: 'Portfolio (Default)',
        [this.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO]: 'Portfolio (User Selected)',
        [this.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET]: 'Widget (User Selected)',
        [this.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN]: 'Column (User Selected)'
    };

    static readonly RISK_SETTING_DEFAULTS = {
        DEFAULT_CONFIDENCE_LEVEL_IN_STD_DEVIATION: 1.0,
        DEFAULT_CONFIDENCE_LEVEL_IN_PERCENTAGE: 84.0,
        DEFAULT_HVAR_CONFIDENCE_LEVEL_PERCENTAGE: 95.0,
        DEFAULT_HVAR_CONFIDENCE_LEVEL_SD: 1.644854,
        CONFIDENCE_LEVEL_LOWER_LIMIT: 50.0,
        CONFIDENCE_LEVEL_UPPER_LIMIT: 100.0,
        AVAILABLE_PERIODS: ['6M', '1Y', '2Y', '3Y', '4Y', '5Y', '6Y', '7Y', '8Y', '9Y', '10Y', 'Other']
    };

    static readonly ECONOMY_SETTINGS_PROPERTIES = {
        RISK_HORIZON: 'riskHorizon',
        CONFIDENCE_LEVEL_SD: 'confidenceLevelSD',
        WEIGHTING_SCHEME: 'weightingScheme',
        DECAY_FACTOR: 'decayFactor',
        PERIOD: 'period',
        DATE_OBJECT: 'dateObject',
        OVERLAP: 'overlap'
    };

    static readonly LABEL = {
        RISK_MODEL: 'Risk Model',
        RISK_HORIZON: 'Risk Horizon',
        CONFIDENCE_LEVEL: 'Confidence Level',
        WEIGHTING_SCHEME: 'Weighting Scheme',
        PERIOD: 'Period',
        ECONOMY_DATE: 'Economy Date',
        OVERLAP: 'Overlap',
        HALF_LIFE: 'Half-Life',
        PERCENT: '%',
        SIGMA: 'σ'
    };

    static readonly HVAR_RISK_SETTINGS_PROPERTIES = {
        LINEAR: 'linear',
        CONFIDENCE_LEVEL_PERCENT: 'confidenceLevelPercentage',
        NUMBER_OF_DAYS: 'numberOfDays',
        RETURN_HORIZON: 'returnHorizonSelection',
        DAILY_OVERLAPPING_OBSERVATION: 'dailyOverlappingObservation',
        START_DATE: 'startDate',
        INCLUDE_TIME_RETURN: 'includeTimeReturn',
        FULL_REVALUATION: 'fullRevaluation',
        HISTORICAL_RETURN_DECAY: 'historicalReturnDecay',
        NUMBER_OF_OBSERVATIONS: 'numberOfObservations',
        SEC_SCALING: 'secScaling',
        ADVANCED_HVAR_RISK_SETTINGS: 'advancedHvarRiskSettings',
        FACTOR_SCALING: 'factorScaling',
        HOLDING_PERIED: 'holdingPeriod',
        CONFIDENCE_INTERVAL_SCALE: 'confidenceIntervalScaling',
        VERSION: 'version'
    };

    static readonly MCVAR_RISK_SETTINGS_PROPERTIES = {
        DISTRIBUTION_TYPE: 'distributionType',
        DEGREES_OF_FREEDOM: 'degreesOfFreedom',
        SAMPLES: 'samples',
        SEED: 'seed',
        PRICING_TYPE: 'pricingType',
        INCLUDE_TIME_RETURN: 'includeTimeReturn',
        IDIOSYNC_CORR: 'idiosyncraticCorrelation',
        USE_IMPORTANCE_SAMPLING: 'useImportanceSampling'
    };

    static readonly ADVANCED_HVAR_RISK_SETTINGS_PROPS = {
        HOLDING_PERIOD: 'holdingPeriod',
        CONFIDENCE_INTERVAL_SCALING: 'confidenceIntervalScaling'
    };

    static readonly HVAR_RISK_HORIZONS = [
        {label: 'Same as the return horizon', value: undefined},
        {label: 'One Day', value: 1},
        {label: 'Two Days', value : 2},
        {label: 'One Week', value : 5},
        {label: 'Ten Days', value : 10},
        {label: 'One Month', value : 20},
        {label: 'One Year', value : 252},
        {label: 'Other', value : -1}
    ];

    static readonly RISK_RATIO_SETTINGS_PROPERTIES = {
        DENOMINATOR: 'denominator'
    };

    static readonly EXPOSURE_SETTINGS_PROPERTIES = {
        RISK_MODEL: 'riskModel'
    };

    static readonly ADVANCED_SETTINGS_PROPERTIES = {
        EXCLUDE_BLOCK: 'excludeBlock',
        MARKET: 'market',
        FILTER_SCALING: 'filterScaling',
        EXPOSURE_LOOKBACK: 'exposureLookback',
        RISK_MATRIX: 'riskMatrix',
        ASSET_CLASS_COVARIANCE: 'assetClassCovariance',
        DXS_BLOCK: 'dxsBlock',
        SCALE_DXS_EXPOSURES: 'scaleDxsExposures',
        ASSUME_ZERO_AVERAGE_RETURN: 'assumeZeroAverageReturn'
    };

    static readonly YEAR_REPRESENTATION = {
        DAYS_IN_YEAR: 252,
        MONTHS_IN_YEAR: 12,
        WEEKS_IN_YEAR: 52
    };

    static readonly HALF_LIFE_LABEL = {
        DAYS: 'days',
        WEEKS: 'weeks',
        MONTHS: 'months'
    };

    static readonly PERIOD = {
        SIX_MONTH: '6M',
        OTHER: 'Other'
    };

    static readonly RISK_MODEL_TYPE = {
        DEFAULT: 'DEFAULT',
        ORG: 'Organization Default',
        GP: 'GP Default'
    };

    static readonly HVAR_RETURN_HORIZON = [
        {label: 'Days', value: 'days'},
        {label: '1 Rolling Week', value: '1week'},
        {label: '1 Rolling Month', value: '1month'}
    ];

    static readonly HVAR_HISTORICAL_RETURN_DECAY = [
        {label: 'Constant weighting', value: 'ConstantWeighting'},
        {label: 'Half life', value: 'HalfLife'}
    ];

    static readonly RISK_RATIO_DENOMINATORS = [
        {label: 'Benchmark', value: 'BENCH'},
        {label: 'Portfolio Ex-Derivatives', value: 'EX_DERIV'}
    ];

    static readonly ASSET_CLASS_COVARIANCE_TYPE_OPTIONS = [
        {label: 'Use pre-specified equity covariances with fixed income-equity covariances set to 0 and fixed income covariances calculated from the defined settings', value: 'N'},
        {label: 'Use pre-specified equity covariances with fixed income-equity covariances calculated and fixed income covariances calculated from the defined settings', value: 'M'},
        {label: 'All covariances are calculated', value: 'Y'},
    ];

    static readonly FACTOR_SCALING_OPTIONS = [
        {label: 'EVT and volatility scaling off', value: 'NONE'},
        {label: 'Portfolio level EVT and factor level volatility scaling', value: 'PORTFOLIO_EVT_AND_FACTORLEVEL_VOL_SCALE'},
        {label: 'EVT off and factor level volatility scaling', value: 'FACTORLEVEL_VOL_SCALE'},
        {label: 'Factor level EVT and factor level volatility scaling', value: 'FACTORLEVEL_EVT_AND_VOL_SCALE'},
        {label: 'Portfolio level EVT and volatility scaling off', value: 'PORTFOLIO_EVT'},
        {label: 'Factor level EVT and volatility scaling off', value: 'FACTORLEVEL_EVT'}
    ];

    static readonly MCVAR_DISTRIBUTION_TYPES = [
        {label: 'Gaussian', value: 'GAUSSIAN'},
        {label: 'T', value: 'T'}
    ];

    static readonly MCVAR_PRICING_TYPES = [
        {label: 'Full revaluation', value: 'FULL_REVALUATION'},
        {label: 'Delta-gamma', value: 'DELTA_GAMMA'}
    ];

    static readonly MCVAR_IDIO_CALCS = [
        {label: 'Correlated with fallback to uncorrelated', value: 'FALLBACK_FULL_TO_UNCORRELATED'},
        {label: 'Uncorrelated', value: 'UNCORRELATED'},
        {label: 'Correlated', value: 'CORRELATED'}
    ];

    static readonly FACTOR_COMPARISON_MATRIX_RISK_SETTINGS = 'factorComparisonMatrixRiskSettings';
    static readonly DEFAULT_RISK_SETTINGS = 'defaultRiskSettings';
}
