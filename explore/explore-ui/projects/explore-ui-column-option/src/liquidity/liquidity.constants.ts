/**
 * Constants for liquidity
 */
export class LiquidityConstants {
    static readonly HORIZON_OPTIONS = 'HORIZON_OPTIONS';
    static readonly LIQUIDATION_SETTINGS = 'LIQUIDATION_SETTINGS';
    static readonly MODIFIED_LIQUIDATION_STRATEGIES_ONLY = 'MODIFIED_LIQUIDATION_STRATEGIES_ONLY';
    static readonly ENABLE_SENDING_ONLY_RATS = 'ENABLE_SENDING_ONLY_RATS';
    static readonly HORIZON = 'HORIZON';
    static readonly PARTICIPATION_RATE = 'PARTICIPATION_RATE';
    static readonly ADV_PARTICIPATION_RATE = 'ADV_PARTICIPATION_RATE';
    static readonly REDEMPTION_SETTINGS = 'REDEMPTION_SETTINGS';
    static readonly STRESS_ANALYSIS_FLAG = 'STRESS_ANALYSIS_FLAG';
    static readonly FIXED_COST_SHOCK = 'FIXED_COST_SHOCK';
    static readonly MARKET_IMPACT_SHOCK = 'MARKET_IMPACT_SHOCK';
    static readonly MARKET_DEPTH_SHOCK = 'MARKET_DEPTH_SHOCK';
    static readonly ENABLE_TRANSACTION_COST_FLAG = 'ENABLE_TRANSACTION_COST_FLAG';
    static readonly DISABLE_SETTLEMENT_PERIOD = 'DISABLE_SETTLEMENT_PERIOD';
    static readonly PARTIAL_LIQUIDATION = 'PARTIAL_LIQUIDATION';
    static readonly SEC_VARY = 'SEC_VARY';
    static readonly UNIT_CONTRIBUTION = 'UNIT_CONTRIBUTION';
    static readonly UNIT_STANDALONE = 'UNIT_STANDALONE';
    static readonly DAYS_TO_UNWIND = 'DAYS_TO_UNWIND';
    static readonly TIME_HORIZONS = 'TIME_HORIZONS';
    static readonly HAS_FUND_SETTINGS = 'HAS_FUND_SETTINGS';
    static readonly INCLUDE_ADDITIONAL_COLLATERAL = 'INCLUDE_ADDITIONAL_COLLATERAL';
    static readonly LIQUIDATION_UNIT = 'LIQUIDATION_UNIT';
    static readonly HOLIDAY_LOOKUP = 'HOLIDAY_LOOKUP';
    static readonly DISABLE_STRESS_TESTING_SETTINGS = 'DISABLE_STRESS_TESTING_SETTINGS';
    static readonly AGGREGATION = 'AGGREGATION';
    static readonly ADDITIONAL_AGGREGATION = 'ADDITIONAL_AGGREGATION';
    static readonly DISABLE_BUCKET_OPTIONS = 'DISABLE_BUCKET_OPTIONS';
    static readonly NAV_MULTIPLIER = 'NAV_MULTIPLIER';
    static readonly INCLUDE_TRANSACTION_COST = 'INCLUDE_TRANSACTION_COST';
    static readonly INCLUDE_EQUITY_HEDGE_FUND_CASH = 'INCLUDE_EQUITY_HEDGE_FUND_CASH';
    static readonly CAPACITY_APPROACH = 'CAPACITY_APPROACH';
    static readonly TCOST_STRESS_FLAG = 'TCOST_STRESS_FLAG';
    static readonly IS_JITA_COLUMN = 'IS_JITA_COLUMN';
    static readonly HAS_JITA_TIER_INFOS = 'HAS_JITA_TIER_INFOS';
    static readonly SHOW_PERCENT_NAV_LIQUIDATED = 'SHOW_PERCENT_NAV_LIQUIDATED';
    static readonly SHOW_WATERFALL_STRATEGIES_ONLY = 'SHOW_WATERFALL_STRATEGIES_ONLY';
    static readonly SHOW_ILLIQUID_PARAMETERS = 'SHOW_ILLIQUID_PARAMETERS';

    static readonly MODEL_SELECTION_SETTINGS = 'MODEL_SELECTION_SETTINGS';
    static readonly DEFAULT_MODEL_SELECTION = 'Default';

    static readonly DEFAULT_ASSET_STRESS_SCENARIO = 'Select a scenario…';
    static readonly DEFAULT_STRESS_MULTIPLIER_TYPE = 'Select a multiplier type…';
    static readonly FIXED_COST_MULTIPLIER = 'fixedCostMultiplier';
    static readonly MARKET_IMPACT_MULTIPLIER = 'marketImpactMultiplier';
    static readonly MARKET_DEPTH_MULTIPLIER = 'marketDepthMultiplier';
    static readonly PRECANNED_STRESS_SCENARIO_SETTINGS = 'PRECANNED_STRESS_SCENARIO_SETTINGS';

    static readonly PORTFOLIO_SIDE_ASSETS: string = 'portfolioAssets';
    static readonly PORTFOLIO_SIDE_LIABILITIES: string = 'portfolioLiabilities';
    static readonly PORTFOLIO_SIDE_OPTIONS: { value: string, title: string }[] = [
        {value: LiquidityConstants.PORTFOLIO_SIDE_ASSETS, title: 'Portfolio assets'},
        {value: LiquidityConstants.PORTFOLIO_SIDE_LIABILITIES, title: 'Portfolio liabilities'}
    ];

    static readonly CONTRIBUTION_UNIT_OPTIONS: { value: string, title: string }[] = [
        {value: 'scaleAsFractionOfPortNAV', title: 'Port NAV'},
        {value: 'scaleAsFractionOfAmtLiq', title: 'Amount liquidated'}
    ];

    static readonly STANDALONE_UNIT_OPTIONS: { value: string, title: string }[] = [
        {value: 'scaleAsFractionOfNotionalValue', title: 'Notional value'},
        {value: 'scaleAsFractionOfMarketValue', title: 'Market value'}
    ];

    static readonly LIQUIDATION_STRATEGY_PRO_RATA: string = 'proRata';
    static readonly LIQUIDATION_STRATEGY_ASCENDING_COST: string = 'ascendingCost';
    static readonly LIQUIDATION_STRATEGY_MIN_MARKET_IMPACT: string = 'minMarketImpact';
    static readonly LIQUIDATION_STRATEGY_OPTIONS: { value: string, title: string }[] = [
        {value: LiquidityConstants.LIQUIDATION_STRATEGY_PRO_RATA, title: 'Pro rata'},
        {value: LiquidityConstants.LIQUIDATION_STRATEGY_ASCENDING_COST, title: 'Ascending cost (Longs only)'},
        {value: LiquidityConstants.LIQUIDATION_STRATEGY_MIN_MARKET_IMPACT, title: 'Minimum market impact'}
    ];

    static readonly ESMA_NON_MODIFIED_LIQUIDATION_STRATEGY_WATERFALL: string = 'waterfall';
    static readonly ESMA_NON_MODIFIED_LIQUIDATION_STRATEGY_PRO_RATA: string = 'proRata';
    static readonly ESMA_NON_MODIFIED_LIQUIDATION_STRATEGY_OPTIONS: { value: string, title: string }[] = [
        {value: LiquidityConstants.ESMA_NON_MODIFIED_LIQUIDATION_STRATEGY_WATERFALL, title: 'Waterfall'},
        {value: LiquidityConstants.ESMA_NON_MODIFIED_LIQUIDATION_STRATEGY_PRO_RATA, title: 'Pro rata'}
    ];

    static readonly ESMA_MODIFIED_LIQUIDATION_STRATEGY_WATERFALL: string = 'modifiedWaterfall';
    static readonly ESMA_MODIFIED_LIQUIDATION_STRATEGY_PRO_RATA: string = 'modifiedProRata';
    static readonly ESMA_MODIFIED_LIQUIDATION_STRATEGY_OPTIONS: { value: string, title: string }[] = [
        {value: LiquidityConstants.ESMA_MODIFIED_LIQUIDATION_STRATEGY_WATERFALL, title: 'Modified waterfall'},
        {value: LiquidityConstants.ESMA_MODIFIED_LIQUIDATION_STRATEGY_PRO_RATA, title: 'Modified pro rata'}
    ];

    static WATERFALL_LIQUIDATION_STRATEGY_OPTIONS:  { value: string, title: string }[] = [
        {value: LiquidityConstants.ESMA_NON_MODIFIED_LIQUIDATION_STRATEGY_WATERFALL, title: 'Waterfall'},
        {value: LiquidityConstants.ESMA_MODIFIED_LIQUIDATION_STRATEGY_WATERFALL, title: 'Modified waterfall'}
    ];

    static readonly LIQUIDATION_CONSTRAINT_PERCENT_NAV: string = 'percentNAV';
    static readonly LIQUIDATION_CONSTRAINT_MAX_TCOST: string = 'maxTCost';
    static readonly LIQUIDATION_CONSTRAINT_MAX_MARKET_IMPACT: string = 'maxMarketImpact';
    static readonly LIQUIDATION_CONSTRAINT_MAX_RATIO: string = 'maxRatio';
    static readonly LIQUIDATION_CONSTRAINT_OPTIONS: { value: string, title: string }[] = [
        {value: LiquidityConstants.LIQUIDATION_CONSTRAINT_PERCENT_NAV, title: 'Percent of NAV liquidated (%)'},
        {value: LiquidityConstants.LIQUIDATION_CONSTRAINT_MAX_TCOST, title: 'Maximum transaction cost (bps)'},
        {value: LiquidityConstants.LIQUIDATION_CONSTRAINT_MAX_MARKET_IMPACT, title: 'Maximum market impact (bps)'},
        {value: LiquidityConstants.LIQUIDATION_CONSTRAINT_MAX_RATIO, title: 'Maximum Ratio of Market Impact to Fixed Cost'}
    ];

    static readonly JITA_MODIFIED_LIQUIDATION_STRATEGY_WATERFALL: string = 'modifiedWaterfall';
    static readonly JITA_LIQUIDATION_CONSTRAINT_OPTIONS: { value: string, title: string }[] = [
        {value: LiquidityConstants.LIQUIDATION_CONSTRAINT_PERCENT_NAV, title: 'Percent of NAV liquidated (%)'}
    ];
    static readonly JITA_MODIFIED_LIQUIDATION_STRATEGY_OPTIONS: { value: string, title: string }[] = [
        {value: LiquidityConstants.JITA_MODIFIED_LIQUIDATION_STRATEGY_WATERFALL, title: 'Modified waterfall'}
    ];

    static readonly LIQUIDATION_BUCKET_EQUAL_DOLLAR: string = 'equalDollar';
    static readonly LIQUIDATION_BUCKET_LAST_DOLLAR: string = 'lastDollar';
    static readonly LIQUIDATION_BUCKET_OPTIONS: { value: string, title: string }[] = [
        {value: LiquidityConstants.LIQUIDATION_BUCKET_EQUAL_DOLLAR, title: 'Equal dollar'},
        {value: LiquidityConstants.LIQUIDATION_BUCKET_LAST_DOLLAR, title: 'Last dollar'}
    ];

    static readonly SEC_LIQUIDITY_RATS: string = 'rats';
    static readonly SEC_LIQUIDITY_SCENARIO: string = 'scenario';
    static readonly SEC_LIQUIDITY_PERCENT_NAV: string = 'percentNAV';
    static readonly SEC_LIQUIDITY_OPTIONS: { value: string, title: string }[] = [
        {value: LiquidityConstants.SEC_LIQUIDITY_RATS, title: 'Default reasonably anticipated trading size (RATS)'},
        {value: LiquidityConstants.SEC_LIQUIDITY_SCENARIO, title: 'Default alternate scenario'},
        {value: LiquidityConstants.SEC_LIQUIDITY_PERCENT_NAV, title: 'Custom scenario'}
    ];

    static readonly LIABILITY_TYPE_REDEMPTION_SCENARIOS: string = 'redemptionScenarios';
    static readonly LIABILITY_TYPE_INVESTOR_DATA: string = 'investorData';
    static readonly LIABILITY_TYPE_UCITS_GATING: string  = 'ucitsGating';
    static readonly LIABILITY_TYPE_OPTIONS: { value: string, title: string }[] = [
        {value: LiquidityConstants.LIABILITY_TYPE_REDEMPTION_SCENARIOS, title: 'Redemptions scenarios'},
        {value: LiquidityConstants.LIABILITY_TYPE_INVESTOR_DATA, title: 'Investor data'},
        {value: LiquidityConstants.LIABILITY_TYPE_UCITS_GATING, title: 'UCITS gating'}
    ];

    static readonly AGGREGATION_NET: string = 'net';
    static readonly AGGREGATION_GROSS: string = 'gross';
    static readonly AGGREGATION_LONG_ONLY: string = 'longOnly';
    static readonly AGGREGATION_NET_SLASH_GROSS: string = 'netPositionGrossTotal';
    static readonly AGGREGATION_OPTIONS: { value: string, title: string }[] = [
        {value: LiquidityConstants.AGGREGATION_NET, title: 'Net'},
        {value: LiquidityConstants.AGGREGATION_GROSS, title: 'Gross'}
    ];

    static readonly ADDITIONAL_AGGREGATION_OPTIONS: { value: string, title: string }[] = [
        {value: LiquidityConstants.AGGREGATION_LONG_ONLY, title: 'Long Only'},
        {value: LiquidityConstants.AGGREGATION_NET_SLASH_GROSS, title: 'Net / Gross'}
    ];

    static readonly MAX_ILLIQUID_TYPE_ABS: string = 'ABS';
    static readonly MAX_ILLIQUID_TYPE_REL: string = 'REL';
    static readonly MAX_ILLIQUID_TYPE_OPTIONS: { value: string, title: string }[] = [
        {value: LiquidityConstants.MAX_ILLIQUID_TYPE_ABS, title: 'Absolute'},
        {value: LiquidityConstants.MAX_ILLIQUID_TYPE_REL, title: 'Relative'}
    ];

    static readonly CAPACITY_APPROACH_CONCURRENT_WEIGHTED: string = 'concurrentWeighted';
    static readonly CAPACITY_APPROACH_LIQUID_FIRST: string = 'liquidFirst';
    static readonly CAPACITY_APPROACH_OPTIONS: { value: string, title: string }[] = [
        {value: LiquidityConstants.CAPACITY_APPROACH_CONCURRENT_WEIGHTED, title: 'Concurrent weighted'},
        {value: LiquidityConstants.CAPACITY_APPROACH_LIQUID_FIRST, title: 'Liquid first'}
    ];
}
