export class CoreColumnConstants {
    static readonly COLUMN_PREFIX = {
        PORTFOLIO: 'Portfolio ',
        BENCHMARK: 'Benchmark ',
        ACTIVE: 'Active '
    };

    static readonly USE_TYPES = {
        PORT: 'PORT',
        BENCH: 'BENCH',
        ACTIVE: 'ACTIVE'
    };

    static readonly USE_TYPES_FULL_NAME = {
        PORT: 'Portfolio',
        BENCH: 'Benchmark',
        ACTIVE: 'Active'
    };

    static readonly RAS_COL_GROUPS = {
        HVAR: 'Portfolio Risk,Historical VaR',
        MCVAR: 'Portfolio Risk,Monte Carlo VaR',
        IRR: 'Performance,Money Weighted Analytics'
    };

    static readonly CREDIT_VAR_GROUP = 'Credit VaR';

    static readonly COL_DEF_BEAN = 'ColumnDefinitionBean';
    static readonly ISHARE_DEF_BEAN = 'IShareDefinitionBean';
}
