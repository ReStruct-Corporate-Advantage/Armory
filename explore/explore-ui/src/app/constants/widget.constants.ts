/**
 * Constants for widget configuration.
 */
export class WidgetConstants {
    static readonly OPEN_CHART = 'Open Chart';

    static readonly GRIDSTER_CONSTANTS = {
        MIN_COLS: 24,
        MAX_COLS: 24,
        MIN_ROWS: 1,
        MAX_ROWS: 100,
        MIN_ITEM_COLS: 4,
        MAX_ITEM_COLS: 24,
        MIN_ITEM_ROWS: 2,
        MAX_ITEM_ROWS: 24,
        DEFAULT_ITEM_COLS: 8,
        DEFAULT_ITEM_ROWS: 6,
        // At 460 size screen, the report-presenter is of size 167, so apply grid layout
        MOBILE_BREAKPOINT: 165
    };

    static RISK_EXPOSURE_SPRITELET = {
        ACTION_NAME: 'Risk and exposure',
        ACTION_KEY: 'OPEN_RISK_EXPOSURE'
    };

    static DOWNLOAD_CASHFLOW_SPRITELET = {
        ACTION_NAME: 'Download Cashflows for Money Weighted Analytics',
        ACTION_KEY: 'OPEN_RISK_EXPOSURE',
        ACTION_TYPE: 'Cashflow'
    };
    static MCVAR_SIMULATION_PNLS = {
        ACTION_NAME: 'MCVaR Simulation P&Ls',
        ACTION_KEY: 'OPEN_MCVAR_SIMULATION_PNL'
    };

    static HVAR_PNLS_TS = {
        ACTION_NAME: 'HVaR time series of P&Ls',
        ACTION_KEY: 'OPEN_HVAR_TS_PNL'
    };

    static DIVERSIFICATION_SCORE_TIMESERIES = {
        ACTION_NAME: 'Diversification Score Time Series',
        ACTION_KEY: 'OPEN_DS_TS_TBL'
    };

    static ACTIVE_SHARES_SPRITELET = {
        ACTION_NAME: 'Active shares issuer decomposition',
        ACTION_KEY: 'OPEN_ACTIVE_SHARES'
    };

    static COMMITMENT_RISK_SPRITELET = {
        ACTION_NAME: 'Commitment risk',
        ACTION_KEY: 'OPEN_COMMITMENT_RISK'
    };

    static TABULAR_VIEW_SPRITELET = {
        ACTION_KEY: 'OPEN_TABULAR_VIEW'
    };

    static readonly RETURNS_CHART_COLUMN_MEASURE = {
        DISPLAY_NAME: 'Returns',
        TAG: 'returns'
    };

    static readonly FACTOR_SECURITY_CONTRIBUTION = {
        ACTION_NAME: 'Security contributors',
        ACTION_KEY: 'OPEN_SECURITY_CONTRIBUTION'
    };

    static readonly DATE_GROUP_BY_LEVEL = 'level-1';
    static readonly WIDGET_NAME_TITLE = 'Title';

    static readonly RISK_MATRIX = { ACTION_NAME: 'Open risk matrix', ACTION_KEY: 'Risk Matrix'};

    static readonly FACTOR_DATA_OPTIONS = [
        { ACTION_NAME: 'Open factor level time series', ACTION_KEY: 'FACTOR_LEVELS'},
        { ACTION_NAME: 'Open factor return time series', ACTION_KEY: 'FACTOR_RETURNS'},
        { ACTION_NAME: 'Open factor volatility time series', ACTION_KEY: 'VOLATILITIES'}
    ];
}
