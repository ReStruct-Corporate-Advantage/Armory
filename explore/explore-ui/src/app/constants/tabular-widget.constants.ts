/**
 * Constants for Tabular Widgets
 */
export class TabularWidgetConstants {
    static readonly EXPAND_ALL_AT_THIS_LEVEL = 'Expand All At This Level';
    static readonly COLLAPSE_ALL_AT_THIS_LEVEL = 'Collapse All At This Level';
    static readonly COLLAPSE_ALL = 'Collapse All';
    static readonly EXPAND_ALL_UNDER_THIS_LEVEL = 'Expand All Under This Level';
    static readonly COLLAPSE_ALL_UNDER_THIS_LEVEL = 'Collapse All Under This Level';
    static readonly SELECTED_NODE = 'selectedNode';
    static readonly EXPAND_ALL = 'Expand All';
    static readonly EXPAND = 'Expand';
    static readonly COLLAPSE = 'Collapse';
    static readonly NO_HIDDEN_COLUMN = 'NO Hidden Column';
    static readonly ATTRIBUTES_TO_COLLECT = ['workspace', 'report', 'portfolio', 'date', 'benchmark', 'currency'];

    // Aladdin View Sub menu Items
    static readonly ALADDIN_VIEW = {
        LAUNCH_ALADDIN_VIEW: 'AladdinView',
        POSITIONS_VIEW_RELATED_FUNDS: 'Positions View - Related Funds',
        POSITION_VIEW_ALL_PORT: 'Positions View - All Portfolios',
        TRADE_VIEW_YESTERDAY_TRADE: 'Trade View - Yesterday\'s Trade',
        TRADE_VIEW_ALL_IN_FUND: 'Trade View - All Trades in Fund',

        TOOL_NAME_TRADES: 'trades',
        TOOL_NAME_POSITION: 'positions',

        YESTERDAY_TRADE_QUERY: '&trade_date=T-1B&end_trade_date=T',
        FUND_TRADE_QUERY: '&sort_by=trade_date&sort_types=D&end_trade_date=T',
        POSITION_QUERY: '&pos_date=T',

        CUSIP_TRADES: '&cusip='
    };

    static readonly PORT_GROUP_NAME = '&port_group=';
    static readonly LAUNCH_ANSER = 'AnSer';
    static readonly LAUNCH_SEC_MASTER = 'SecurityMaster';
    static readonly OPEN_PRICE_CHART = 'Open Price Chart';
    static readonly LAUNCH_ALADDIN_RESEARCH = 'AladdinResearch';
    static readonly LAUNCH_CLARITY_AI = 'Clarity AI ESG Summary';
    static readonly LAUNCH_ALADDIN_CLIMATE = 'Aladdin Climate';

    static readonly PRICE_CHART_SPRITELET = {
        ACTION_KEY: 'PRICE_CHART_SPRITELET',
        ACTION_LABEL: 'Price chart',
        CALLBACK_METHOD_NAME: 'setShowPriceChart'
    };

    static PGS_BAR_CHART_SPRITELET = {
        ACTION_KEY: 'PGS_BAR_CHART_SPRITELET',
        ACTION_LABEL: 'PGS chart'
    };

    static PGS_LEAF_BAR_CHART_SPRITELET = {
        ACTION_KEY: 'PGS_LEAF_BAR_CHART_SPRITELET',
        ACTION_LABEL: 'PGS chart'
    };

    static PGS_TS_CHART_SPRITELET = {
        ACTION_KEY: 'PGS_TS_CHART_SPRITELET',
        ACTION_LABEL: 'PGS TS chart'
    };

    static PGS_TS_LEAF_CHART_SPRITELET = {
        ACTION_KEY: 'PGS_TS_LEAF_CHART_SPRITELET',
        ACTION_LABEL: 'PGS TS chart'
    };

    static readonly SHORTCUTS = {
        D_SHORTCUT: 'd',
        S_SHORTCUT: 's'
    };

    static readonly COLUMN_SORT_NULL_VAL_REPLACEMENT = -99;

    static readonly SCALING_APPENDERS = {
        BPS: ' (bp)',
        MM: ' (mm)',
        MMM: ' (mmm)',
        M: ' (m)'
    };

    static readonly AG_GRID_BLOCK_SIZE: number = 100;
}
