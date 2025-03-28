import {ModellingType} from '../enums/modelling-type.enum';
import {
    ConstraintOptionValueKey
} from '@optimization-settings/constraints-settings/enums/constraint-option-value-key.enum';

/**
 * This class will hold all the constants related to Composition and Holding changes.
 *
 *          *** IMPORTANT ***
 * These values for these constants are kept in sync with the values for these models in the backend.
 * Please verify CompositionChange, PortfolioSecurityHoldingChange, CompositionConstants and PortfolioCompositionChange when
 * you make changes to this file.
 */

export class CompositionConstants {
    static readonly LINE_ITEM = 'lineItem';
    static readonly NEW_WEIGHT = 'newWeight';
    static readonly RULE_UNIT = 'ruleUnit';
    static readonly NEW_MARKET_VALUE = 'newMV';
    static readonly NEW_NOTIONAL_MARKET_VALUE = 'newNotional';
    static readonly NEW_QUANTITY = 'newQuantity';
    static readonly NEW_PAR_VALUE = 'newParValue';
    static readonly NEW_CURRENT_FACE = 'newCurrentFace';
    static readonly NEW_DELTA_ADJ_NMV = 'newDeltaAdjustedNMV';
    static readonly CHANGE_IN_WEIGHT = 'changeInWeight';
    static readonly CHANGE_IN_MV = 'changeInMarketValue';
    static readonly CHANGE_IN_NOTIONAL = 'changeInNotional';
    static readonly CHANGE_IN_QUANTITY = 'changeInQuantity';
    static readonly CHANGE_IN_PARVALUE = 'changeInParValue';
    static readonly CHANGE_IN_CURRENT_FACE = 'changeInCurrentFace';
    static readonly CHANGE_IN_DELTA_ADJ_NMV = 'changeInDeltaAdjNMV';
    static readonly CHILD_PORTFOLIO_NAME = 'childPortfolioName';
    static readonly ANALYTICS_ID = 'analyticsId';
    static readonly SECURITY_DESCRIPTION = 'secDesc';
    static readonly CHANGE_TYPE_KEY = 'changeType';
    static readonly PORTFOLIO_NAME = 'portfolioName';
    static readonly IS_NAV_NEUTRAL = 'isNavNeutral';
    static readonly SECTOR_RULES_INFO_STRING = 'sectorRulesInfo';
    static readonly REQUIRES_BENCH_DATA = 'requiresBenchData';
    static readonly TRADE_SIZE = 'tradeSize';
    static readonly CHANGE_IN_WEIGHT_RELATIVE_TO_MAIN_PORT = 'changeInWeightRelToMainPort';
    static readonly THROUGH_TIME_ANALYSIS_CATEGORY = 'Through-time Analysis';
    static readonly POINT_IN_TIME_ANALYSIS_CATEGORY = 'Point-in-time Analysis';
    static readonly TRADES_TABLE = 'Trades Table';
    static readonly BREAKDOWN_TREE_STRING = 'breakdownTree';
    static readonly SECTOR_PATH = 'sectorPath';
    static readonly CASH_CURRENCY = 'cashCurrency';
    static readonly OTHER_CONSTRAINTS = 'Other Constraints';

    static readonly PCT_MARKET_VALUE = 'Market Value %';

    static readonly HOLDING_CHANGE_TYPES = {
        SECURITY: 'Security',
        NEW_SECURITY: 'NewSecurity',
        PORTFOLIO: 'Portfolio',
        NEW_PORTFOLIO: 'NewPortfolio',
        PORT_SECURITIES: 'PortfolioSecurities',
        PORTFOLIO_NAV_SECURITY: 'PortfolioNAVSecurity'
    };

    // For backward compatiblity
    static readonly PORT_WITH_RULES = {
        TYPE: 'WHATIF_RULES',
        LABEL: 'Portfolio with Rules/Filter',
        PLACEHOLDER: 'Select a Portfolio with Rules',
        DEFAULT_MAX: 1,
        ROOT_FOLDER_NAME: 'RULE BASED WHAT IF PORTFOLIOS'
    };

    static readonly WHATIF_RULES = {
        TYPE: 'WHATIF_RULES',
        LABEL: 'Portfolio with Rules/Filter',
        PLACEHOLDER: 'Select a Portfolio with Rules',
        DEFAULT_MAX: 1,
        ROOT_FOLDER_NAME: 'RULE BASED WHAT IF PORTFOLIOS'
    };

    // For backward compatiblity
    static readonly PORT_WITH_POSITIONS = {
        TYPE: 'WHATIF_POS',
        LABEL: 'Position Based Portfolio',
        PLACEHOLDER: 'Select a Portfolio',
        DEFAULT_MAX: 1,
        ROOT_FOLDER_NAME: 'POSITION BASED PORTFOLIOS'
    };

    static readonly WHATIF_POS = {
        TYPE: 'WHATIF_POS',
        LABEL: 'Position Based Portfolio',
        PLACEHOLDER: 'Select a Portfolio',
        DEFAULT_MAX: 1,
        ROOT_FOLDER_NAME: 'POSITION BASED PORTFOLIOS'
    };

    static readonly ADHOC_PORT = 'ADHOC_PORT';
    static readonly ADHOC_PORT_CONFIG_TYPE = 'adhocPortfolio';
    static readonly ADHOC_PORT_GROUP_CONFIG_TYPE = 'adhocPortGroup';
    static readonly ADHOC_PORT_GROUP = 'ADHOC_PG';

    static readonly RULE_TYPE = 'ruleType';

    static readonly RULE_TYPES = {
        'SECURITY': 'Security',
        'NAV_SECURITY': 'NAVSecurity',
        'PORTFOLIO_NAV_SECURITY': 'PortfolioNAVSecurity',
        'PORTFOLIO': 'Portfolio',
        'PORTFOLIO_CASH': 'PortfolioCash',
        'ACTIVE_SECTOR': 'ActiveSector',
        'ACTIVE_SECURITY': 'ActiveSecurity',
        'SECTOR': 'Sector',
        'BREAKDOWN_TREE': 'BreakdownTree',
        'ACTIVE_BREAKDOWN': 'ActiveBreakdown',
        'PRORATE_CASH': 'ProRateCash'
    };

    static readonly MARKET_VALUE_BEFORE = 'market_val_before';
    static readonly MARKET_VALUE_AFTER = 'market_val_after';
    static readonly MARKET_VALUE_CHANGE = 'market_val_change';
    static readonly PCT_MARKET_VALUE_BEFORE = 'pct_mv_before';
    static readonly PCT_MARKET_VALUE_AFTER = 'pct_mv_after';
    static readonly PCT_MARKET_VALUE_CHANGE = 'pct_mv_change';
    static readonly PCT_NOTIONAL_MARKET_VALUE_BEFORE = 'pct_notional_val_before';
    static readonly PCT_NOTIONAL_MARKET_VALUE_AFTER = 'pct_notional_val_after';
    static readonly PCT_NOTIONAL_MARKET_VALUE_CHANGE = 'pct_notional_val_change';
    static readonly PCT_NOTIONAL_MARKET_VALUE = 'pct_notional_val';
    static readonly PCT_ACTIVE_NOTIONAL_MARKET_VALUE_BEFORE = 'pct_notional_val_active_before';
    static readonly PCT_ACTIVE_NOTIONAL_MARKET_VALUE_AFTER = 'pct_notional_val_active_after';
    static readonly NAV_GROUP = 'nav_group';
    static readonly NAV_GROUP_BEFORE = 'nav_group_before';
    static readonly NAV_GROUP_AFTER = 'nav_group_after';
    static readonly PCT_NAV_GROUP = 'pct_nav_group';
    static readonly PCT_NAV_GROUP_BEFORE = 'pct_nav_group_before';
    static readonly PCT_NAV_GROUP_AFTER = 'pct_nav_group_after';
    static readonly PORTFOLIO_NAME_KEY = 'portfolio_name';
    static readonly ACTIVE_COLUMN = '_active';
    static readonly PCT_NAV_CONTRIBUTION = 'NAV Contribution %';
    static readonly NOTIONAL_MV_AFTER = 'notional_mv_after';
    static readonly NOTIONAL_MV_CHANGE = 'notional_mv_change';

    static readonly COMPOSITION_EDITABLE_COLUMNS = [
        'pct_notional_val', 'pct_notional_val_active',
        'notional_mv', 'notional_mv_active', 'cur_face',
        'pct_nav_group', 'nav_group'
    ];

    static readonly COMPOSITION_CALLBACKS = {
        TRADE_ACTION: 'tradeAction',
        VALIDATE_VALUE_CHANGE: 'validateValueChange',
        CELL_STYLING: 'cellStyling',
        DEFAULT_DATA_REQUEST_PARAMS: 'defaultDataRequestParams',
        FORMAT_DATA: 'formatData'
    };

    static readonly IMPORT_FIELD_IMAGE_PATH = {
        CUSIP_ONLY: './assets/images/cusip-only.png',
        CUSIP_PERCENT: './assets/images/cusip-percent.png',
        TICKER_PERCENT: './assets/images/ticker-percent.png'
    };

    static readonly WIDGET_RELOAD_MESSAGE = {
        ON_COMPOSITION_CHANGE: 'You have made a portfolio composition change. Please click \'Reload\' to refresh the widgets',
        ON_COMPOSITION_FILTER_CHANGE: 'You have applied a filter to portfolio composition. Please click \'Reload\' to refresh the widgets'
    };

    // Add from Universe
    static readonly ModelCash = {
        PRORATA: 'ProRata',
        KEEP_AS_CASH: 'KeepAsCash',
        COMMITED_CASH_TICKER: '_CCASH'
    };

    static readonly WebStat = {
        NUMBER_OF_SECURITIES: 'numberOfSecurities',
        TYPE: 'Type',
        AMOUNT: 'Amount',
        CURRENCY: 'Currency',
        MODEL_CASH: 'Model Cash',
        APPLY: 'Add From Universe Apply',
        ADD_ITEM: 'Add From Universe Add',
        BULK_LOAD_PASTE: 'Securities Bulk Load Paste',
        BULK_LOAD_FILE: 'Securities Bulk Load File'
    };

    static readonly RuleType = {
        SECURITY: 'Security',
        NAV_SECURITY: 'NAVSecurity',
        PORTFOLIO: 'Portfolio',
        PORTFOLIO_CASH: 'PortfolioCash',
        ACTIVE_SECTOR: 'ActiveSector',
        ACTIVE_SECURITY: 'ActiveSecurity',
        SECTOR: 'Sector',
        BREAKDOWN_TREE: 'BreakdownTree',
        ACTIVE_BREAKDOWN: 'ActiveBreakdown',
        PORTFOLIO_SECURITIES: 'PortfolioSecurities'
    };

    static readonly TRADE_TYPE = {
        BUY: 'Buy',
        SELL: 'Sell',
        None: ''
    };

    static readonly TRADE_TABLE_DATA_TYPE = {
        STRING: 'STRING',
        DOUBLE: 'DOUBLE',
    };

    static readonly CASH_OFFSET = 'CASH OFFSET';

    static readonly MODELLING_TYPE_DESCRIPTION: Record<ModellingType, string> = {
        [ModellingType.SECTOR]: 'Apply sector level modeling changes and view for exposure, risk, time series, and performance analysis for a customizable period of time',
        [ModellingType.POSITION]: 'Apply security, sector, cash, and optimization modeling changes and view for exposure and risk analysis as of the portfolio analysis date',
        [ModellingType.PORTFOLIO]: 'Apply portfolio level changes and view for exposure, risk, time series, and performance analysis for a customizable period of time',
        [ModellingType.EXPOSURE]: 'Apply changes to the risk factor exposures of a portfolio. Reporting will be primarily conducted through the factor based analysis widget with no time series capabilities.',
    };

    static readonly MODELLING_TYPE_DESCRIPTION_CUSTOM_PORT: Record<ModellingType, string> = {
        [ModellingType.SECTOR]: undefined,
        [ModellingType.POSITION]: 'Create a custom portfolio and view for exposure and risk analysis as of the portfolio analysis date',
        [ModellingType.PORTFOLIO]: 'Create a custom portfolio group and view for exposure, risk, time series, and performance analysis for a customizable portfolio of time',
        [ModellingType.EXPOSURE]: 'Create a custom portfolio comprised of risk factors. This custom portfolio will only be available for use in the Factor Based Analysis widget for the date assigned to the portfolio.',
    };

    static readonly MODELLING_MAIN_TYPE_LABEL: Record<ModellingType, string> = {
        [ModellingType.SECTOR]: 'Sector Allocation',
        [ModellingType.POSITION]: 'Security Selection and Sector Allocation',
        [ModellingType.PORTFOLIO]: 'Portfolio/Index Allocation',
        [ModellingType.EXPOSURE]: 'Exposure Based'
    };

    static readonly MODELLING_MAIN_TYPE_LABEL_CUSTOM_PORT: Record<ModellingType, string> = {
        [ModellingType.SECTOR]: undefined,
        [ModellingType.POSITION]: 'Security Selection',
        [ModellingType.PORTFOLIO]: 'Portfolio/Index Allocation',
        [ModellingType.EXPOSURE]: 'Exposure Based'
    };

    static readonly MODELLING_TABLE_TYPE_LABEL: Record<ModellingType, string> = {
        [ModellingType.SECTOR]: 'Sector Modeling',
        [ModellingType.POSITION]: 'Position Modeling',
        [ModellingType.PORTFOLIO]: 'Portfolio Modeling',
        [ModellingType.EXPOSURE]: 'Exposure Modelling',
    };

    static readonly RISK_PARITY_OBJECTIVES: Map<string, string> = new Map<string, string>([
        ['MINIMIZE_RISK', 'Budget All Risk'],
        ['MINIMIZE_IDIO_RISK', 'Budget Idiosyncratic Risk'],
        ['MINIMIZE_SYSTEMATIC_RISK', 'Budget Systematic Risk']
    ]);

    // constant related to composition setting
    static readonly BENCH_ACTIVE_ARRAY: Array<string> = ['BENCH', 'ACTIVE'];
    static readonly FACTOR_ATTRIBUTES = 'FACTOR_ATTRIBUTES';
    static readonly GR_SECTOR = 'GR_SECTOR';
    static readonly LIQUIDITY_ARRAY: Array<string> = ['Liquidity'];

    static readonly DISABLED_PRO_RATA_CASH: string = 'Investing cash pro-rata is disabled \nif there are pre-existing trades.';

    // constant related to additional trade details
    static readonly TCOST_OF_TRADES = 'tcostOfTrades';
    static readonly SPREAD_TCOST_OF_TRADES = 'spreadTcostOfTrades';
    static readonly MARKET_IMPACT_TCOST_OF_TRADES = 'marketImpactTcostOfTrades';
    static readonly TURNOVER = 'turnover';

    static readonly OBJECTIVE_SUMMARY_KEYS = {
        'Minimize Risk': 'expectedVolatility',
        'Minimize Idiosyncratic Risk': 'expectedSpecificVolatility',
        'Minimize Systematic Risk': 'expectedFactorVolatility',
        'Maximize Returns - Stress Scenario': 'expectedReturn',
        'Maximize Alpha Score': 'expectedReturn',
        'Minimize T-cost': 'tcostOfTrades'
    };

    static readonly FAV_ID_DELIMITER = '-#-';
    static readonly OPENING_SMALL_BRACKET = '(';
    static readonly CLOSING_SMALL_BRACKET = ')';

    static readonly PORT_SECURITIES_CONSTRAINTS = {
        LINE_BREAK: 'Portfolio Securities',
        LINE_BREAK_1: 'Portfolio Securities 1',
        LINE_BREAK_2: 'Portfolio Securities 2',
        CASH_OFFSET: 'Cash Offset'
    };

    static readonly EFF_FRONT_NUMBER_REGEX = /-?(\.\d+|(\d+(\.\d+)?))/;

    static readonly EFF_FRONT_COLON_REGEX = new RegExp(
        '^'
        + CompositionConstants.EFF_FRONT_NUMBER_REGEX.source
        + ':'
        + CompositionConstants.EFF_FRONT_NUMBER_REGEX.source
        + '$'
    );

    static readonly EFF_FRONT_COMMA_REGEX = new RegExp(
        '^'
        + CompositionConstants.EFF_FRONT_NUMBER_REGEX.source
        + '(,('
        + CompositionConstants.EFF_FRONT_NUMBER_REGEX.source
        + '))+(?<!,)'
        + '$'
    );

    static readonly NUMBERS_SET_REGEX = 'd{3}';

    static readonly COMMA_SEPARATED_REGEX = new RegExp(
        '(\\d)'
        + '(?=(\\'
        + CompositionConstants.NUMBERS_SET_REGEX
        + ')+(?!\\d)'
        + ')'
    ) ;

    static readonly EFF_FRONT_ENABLED_FIELDS = [
        ConstraintOptionValueKey.LOWER_BOUND,
        ConstraintOptionValueKey.UPPER_BOUND,
        ConstraintOptionValueKey.VALUE
    ];

    static readonly PCT_MODELING_COLS = [
        CompositionConstants.PCT_MARKET_VALUE_AFTER,
        CompositionConstants.PCT_MARKET_VALUE_CHANGE,
        CompositionConstants.PCT_NOTIONAL_MARKET_VALUE_AFTER,
        CompositionConstants.PCT_NOTIONAL_MARKET_VALUE_CHANGE
    ];

    static readonly NON_PCT_MODELING_COLS = [
        CompositionConstants.NOTIONAL_MV_AFTER,
        CompositionConstants.NOTIONAL_MV_CHANGE,
        CompositionConstants.MARKET_VALUE_AFTER,
        CompositionConstants.MARKET_VALUE_CHANGE
    ];

    static readonly ANALYTICS_NOT_FOUND_FOR_SECURITIES = {
      LINE_1: 'Analytics not found for one or more securities. Please note a security must be held in a production portfolio'
               +' or index and run successfully through the overnight risk process on the given analysis date in order for it'
               +' to be added in what-if modeling. Adding this security to a portfolio or model portfolio today will allow'
               +' for its use in what-if modeling for future analysis dates. ',
      LINE_2:  'Since clicking \'Apply\' will have successfully added all valid securities with analytics, securities without '
               +'analytics or with asset validation errors can be removed from the view in bulk by selecting the \'Clear List\' button.'
    };

    static readonly ASSET_VALIDATION_ERROR = 'Security cannot be loaded because it does not exist in the user\'s client environment.';

    static readonly WHAT_IF_FAVORITE_TYPES: Map<string, string> = new Map([
        [CompositionConstants.WHATIF_RULES.TYPE, ' (Rules)'],
        [CompositionConstants.WHATIF_POS.TYPE, ' (Positions)'],
        [CompositionConstants.ADHOC_PORT, ' (From scratch)'],
        [CompositionConstants.ADHOC_PORT_GROUP, ' (From scratch port group)'],
        [CompositionConstants.ADHOC_PORT_CONFIG_TYPE, ' (From scratch)']
    ]);

    static readonly WHAT_IF_TYPES_ALIAS_MAP: Map<string, string[]> = new Map([
        ['THROUGH_TIME', [CompositionConstants.WHATIF_RULES.TYPE]],
        ['POINT_IN_TIME', [CompositionConstants.WHATIF_POS.TYPE]],
        ['FROM_SCRATCH_PORT', [CompositionConstants.ADHOC_PORT, CompositionConstants.ADHOC_PORT_CONFIG_TYPE]]
    ]);

    static readonly TYPES_TO_FETCH_DATE_FIELD: string[] = [CompositionConstants.WHATIF_POS.TYPE, CompositionConstants.ADHOC_PORT, CompositionConstants.ADHOC_PORT_CONFIG_TYPE];

    static readonly MAX_NUMBER_OF_PORTS_TO_UPLOAD = 30;
}
