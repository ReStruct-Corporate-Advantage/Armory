/**
 * Constants for Columns
 */
export class ColumnConstants {
    static readonly DATE = 'date';
    static readonly GROUPS = 'groups';
    static readonly SECURITY_DESCRIPTION = 'security_description';
    static readonly SECURITY_DESCRIPTION_HIDDEN = 'security_description_hidden';
    static readonly PNL_SEC_DESC = 'pnl_sec_desc';
    static readonly PNL_SEC_DESC_HIDDEN = 'pnl_sec_desc_hidden';
    static readonly PNL_CUSIP = 'pnl_cusip';
    static readonly PNL_CUSIP_HIDDEN = 'pnl_cusip_hidden';
    static readonly PNL_ID = 'pnl_id';
    static readonly CUSIP = 'cusip';
    static readonly CUSIP_HIDDEN = 'cusip_hidden';
    static readonly FULL_NAME = 'fullName';
    static readonly PORTFOLIO_TOTAL_RETURN = 'total_ret';
    static readonly PORTFOLIO_TOTAL_RETURN_CUMULATIVE = 'total_ret_cumulative';
    static readonly BENCH_TOTAL_RETURN = 'bench_total_ret';
    static readonly BENCH_TOTAL_RETURN_CUMULATIVE = 'bench_total_ret_cumulative';
    static readonly ACTIVE_TOTAL_RETURN = 'active_total_ret';
    static readonly ACTIVE_TOTAL_RETURN_CUMULATIVE = 'active_total_ret_cumulative';
    static readonly CUMULATIVE_OPTION = 'CUMULATIVE';
    static readonly CUMULATIVE_RETURN = 'CumRet';
    static readonly BENCH_CUMULATIVE_RETURN = 'BenchCumRet';
    static readonly ACTIVE_CUMULATIVE_RETURN = 'ActCumRet';
    static readonly PCT_NAV_GROUP = 'pct_nav_group';
    static readonly PCT_NOTIONAL_MARKET_VAL = 'pct_notional_val';
    static readonly SPLIT_COLUMN_KEYS = 'splitColumnKeys';
    static readonly POSSIBLE_COLUMN_GROUPS = 'possibleColumnGroups';
    static readonly COLUMN_HEADER_DETAILS = 'columnHeaderDetails';
    static readonly PORTFOLIO_NAME = 'portfolio_name';
    static readonly PORTFOLIO_FULL_NAME = 'port_full_name';
    static readonly PORTFOLIO_GROUP = 'portfolio_group';
    static readonly PORTFOLIO = 'portfolio';
    static readonly PORTFOLIO_HIDDEN = 'portfolio_hidden';
    static readonly GRSECTOR = 'grsector';
    static readonly CUSIP_0 = 'cusip_0';
    static readonly TICKER = 'ticker';
    static readonly FBA_TITLE = 'rfv_ftitle';
    static readonly FBA_TITLE_LONG = 'rfv_ftitle_long';
    static readonly FBA_BLOCK_PATH = 'rfv_block_path';
    static readonly MANAGER_SELECTION = 'mngr_select';
    static readonly MANAGER_TRACKING = 'te_ms';
    static readonly SORTED_COLUMNS = 'sortedColumns';
    static readonly AGGRID_AUTO_COLUMN = 'ag-Grid-AutoColumn';
    static readonly SEDOL = 'sedol';
    static readonly ISIN = 'isin';
    static readonly SEC_GROUP = 'sec_group';
    static readonly SEC_TYPE = 'sec_type';
    static readonly SEC_DESC = 'sec_desc';
    static readonly SEC_DESC2 = 'sec_desc2';
    static readonly AUX_DATE_COLUMN = 'auxDateColumn';
    static readonly CUR_FACE = 'cur_face';
    static readonly COLUMN_TAG_STR = 'columnTag';
    static readonly ACTIVE_SHARES = 'active_shares';
    static readonly PCT_NMV_DEL_ADJ = 'pct_nmv_del_adj';
    static readonly PERCENTILES = 'percentiles';
    static readonly ACRM_SUPPORTED_APACS_ASSET_TYPE = 'acrm_ex_supp_apacs';

    static readonly PINS = {
        LEFT: 'left',
        RIGHT: 'right',
        NO_PIN: 'no-pin'
    };

    static readonly CUSIP_IDENTIFIER_COLUMN = {
        columnKey: 'cusip',
        columnTag: 'cusip',
        positionColumnType: 'ALL',
        title: 'CUSIP',
        identifierColumn: true,
        visible: false
    };

    static readonly PNL_CUSIP_IDENTIFIER_COLUMN = {
        columnKey: 'pnl_cusip',
        columnTag: 'pnl_cusip',
        positionColumnType: 'ALL',
        title: 'CUSIP',
        identifierColumn: true,
        visible: false
    };

    static readonly RISK_FACTOR_TAG_IDENTIFIER_COLUMN = {
        columnKey: 'rfv_factor_tag',
        columnTag: 'rfv_factor_tag',
        positionColumnType: 'ALL',
        title: 'Factor Tag',
        identifierColumn: true,
        visible: false
    };

    static readonly PORTFOLIO_NAME_IDENTIFIER_COLUMN = {
        columnKey: 'portfolio_name',
        columnTag: 'portfolio_name',
        positionColumnType: 'ALL',
        title: 'Portfolio Name',
        identifierColumn: true,
        visible: false
    };

    static readonly SORTING_ORDER = {
        ASC_SORT_ORDER: {
            LABEL: 'Ascending',
            VALUE: 'ASC'
        },
        DESC_SORT_ORDER: {
            LABEL: 'Descending',
            VALUE: 'DESC'
        },
        BREAKDOWN_SORT_ORDER: {
            LABEL: 'Breakdown',
            VALUE: 'BREAKDOWN'
        }
    };

    static readonly MANDATE_MAP_ATTRIBUTES = {
        MANDATE: 'Mandate',
        ATTRIBUTION_SETTING: 'Attribution Setting',
        BREAKDOWN: 'Sector Breakdown',
        PERF_BKD: 'Performance Breakdown',
        FAC_BKD: 'Factor Breakdown',
        WIDGETS_REPORT: 'Curated Report',
        COLUMN_SET: 'Risk Exposure Column Set'
    };

    static readonly COLUMN_HANDLERS = {
        COLUMN: 'columns',
        CONSTRAINTS: 'constraints',
        CUSTOM_CALCULATION: 'customCalculation',
        CUSTOM_PERFORMANCE: 'customPerfSettings'
    };

    static readonly LIQUIDITY_SETTINGS = {
        HORIZON: 'HORIZON',
        PARTICIPATION_RATE: 'PARTICIPATION_RATE',
        ADV_PARTICIPATION_RATE: 'ADV_PARTICIPATION_RATE',
        FIXED_COST_SHOCK: 'FIXED_COST_SHOCK',
        MARKET_IMPACT_SHOCK: 'MARKET_IMPACT_SHOCK',
        MARKET_DEPTH_SHOCK: 'MARKET_DEPTH_SHOCK',
        PARTIAL_LIQUIDATION: 'PARTIAL_LIQUIDATION',
        SEC_VARY: 'SEC_VARY',
        UNIT_STANDALONE: 'UNIT_STANDALONE',
        UNIT_CONTRIBUTION: 'UNIT_CONTRIBUTION',
        DAYS_TO_UNWIND: 'DAYS_TO_UNWIND',
        STRESS_ANALYSIS_FLAG: 'STRESS_ANALYSIS_FLAG',
        LIQUIDATION_SETTINGS: 'LIQUIDATION_SETTINGS',
        LIQUIDATION_UNIT: 'LIQUIDATION_UNIT',
        AGGREGATION: 'AGGREGATION',
        ADDITIONAL_AGGREGATION: 'ADDITIONAL_AGGREGATION',
        REDEMPTION_SETTINGS: 'REDEMPTION_SETTINGS',
        INCLUDE_TRANSACTION_COST: 'INCLUDE_TRANSACTION_COST',
        INCLUDE_EQUITY_HEDGE_FUND_CASH: 'INCLUDE_EQUITY_HEDGE_FUND_CASH',
        NAV_MULTIPLIER: 'NAV_MULTIPLIER',
        TIME_HORIZONS: 'TIME_HORIZONS',
        HORIZON_OPTIONS: 'HORIZON_OPTIONS',
        MODIFIED_LIQUIDATION_STRATEGIES_ONLY: 'MODIFIED_LIQUIDATION_STRATEGIES_ONLY',
        CAPACITY_APPROACH: 'CAPACITY_APPROACH',
        INCLUDE_ADDITIONAL_COLLATERAL: 'INCLUDE_ADDITIONAL_COLLATERAL',
        HAS_FUND_SETTINGS: 'HAS_FUND_SETTINGS',
        HOLIDAY_LOOKUP: 'HOLIDAY_LOOKUP',
        DISABLE_BUCKET_OPTIONS: 'DISABLE_BUCKET_OPTIONS',
        DISABLE_STRESS_TESTING_SETTINGS: 'DISABLE_STRESS_TESTING_SETTINGS',
        ENABLE_TRANSACTION_COST_FLAG: 'ENABLE_TRANSACTION_COST_FLAG',
        ENABLE_SENDING_ONLY_RATS: 'ENABLE_SENDING_ONLY_RATS'
    };

    static readonly COLUMN_TAG = {
        VAR_BLOCK_PORT_CONTRIBUTION: 'var_blk_port_contr',
        VAR_BLOCK_BENCH_CONTRIBUTION: 'var_blk_bench_contr',
        VAR_BLOCK_ACTIVE_CONTRIBUTION: 'var_blk_active_contr',
        PCT_NOTIONAL_MARKET_VAL: 'pct_notional_val',
        PCT_MARKET_VAL: 'pct_mv',
        PCT_NAV_GROUP: 'pct_nav_group',
        NAV_GROUP: 'nav_group',
        NOTIONAL_MARKET_VAL: 'notional_mv',
        MARKET_VAL: 'market_val',
        QUANTITY: 'quantity',
        SEC_DESC: 'sec_desc',
        CUSIP: 'cusip'
    };

    static readonly COLUMN_DATA_TYPE = {
        STRING: 'STRING',
        DOUBLE: 'DOUBLE',
        INT: 'INT',
        DATE: 'DATE',
        TIME_SPAN: 'TIME_SPAN',
        RATING: 'RATING'
    };

    static readonly BREAKDOWN_JSTREE_TYPE = {
        STRING: 'String',
        NUMERIC: 'Numeric',
        DATE: 'Date',
        TIME_SPAN: 'timeSpan',
        CUSTOM: 'custom',
        RATING: 'Rating'
    };

    static readonly MANDATORY_LIGHT_LOOKTHROUGH_COLUMNS = ['pct_notional_val', 'pct_mv', 'notional_mv', 'market_val', 'portfolio_name'];

    static readonly CUSIP_IDENTIFIER_COLUMNS = [ColumnConstants.CUSIP, ColumnConstants.PNL_CUSIP];
    static readonly SECURITY_DESCRIPTION_COLUMNS = [ColumnConstants.SECURITY_DESCRIPTION, ColumnConstants.PNL_SEC_DESC];
    static readonly SECURITY_ATTRIBUTES_COLUMN_TYPE = 'Security Attributes';
    static readonly SECURITY_COLUMN_TYPE = 'Security';
    static readonly PERF_COLUMN_TYPE = 'PERFORMANCE';
    static readonly LIQ_COLUMN_TYPE = 'LIQUIDITY';
    static readonly RISK_COLUMN_TYPE = 'RISK';
    static readonly AUTO_GRP_COLUMN = 'ag-Grid-AutoColumn';
    static readonly SORT_MODEL_KEY = 'sort';
    static readonly SECTOR_ORDER_KEY = 'sectorOrder';
    static readonly SORT_COLUMN_STR = 'sortColumn';
    static readonly STYLE_COLUMN = 'Style Analysis';

    // col def bean names constants
    static readonly GP_BREAKDOWN_COL_DEF_BEAN = 'GPBreakdownColumnDefinitionBean';
    static readonly PRAADA_BREAKDOWN_COL_DEF_BEAN = 'PraadaBreakdownColumnDefinitionBean';

    static readonly AUX_TEXT_COLUMN = 'auxTextColumn';
    static readonly AUX_NUMBER_COLUMN = 'auxNumberColumn';
    // Look-Through columns tag definitions
    static readonly PORT_NAME_COL_TAG = 'port_full_name';
    static readonly SEC_GROUP_COL_TAG = 'sec_group';
    static readonly SEC_TYPE_COL_TAG = 'sec_type';
    static readonly SEC_DESC_COL_TAG = 'sec_desc';
    static readonly ISSUER_NAME_COL_TAG = 'issuer_name';
    static readonly ADL_INFO_COL_TAG = 'sec_desc2';
    static readonly TYPE_COL_TAG = 'underl_sec_type';

    // Look-Through Filters Default
    static readonly PORTFOLIO_NAME_COL_NAME_DEFAULT = 'Portfolio Name';

    static readonly ACTION_COL = 'actionCol';
    static readonly FACTOR_MODEL = 'FACTOR_MODEL';
    static readonly FX_FACTOR_TYPE = 'FX_';
    static readonly FACTOR_NAME = 'Factor Name';

    static readonly FOR_TOP_DOWN = 'forTopdown';

    static readonly CUSTOM_FACTOR_TITLE = 'Custom Factor';
    static readonly CUSTOM_FACTOR_TAG = 'custom_factor_tag';

}
