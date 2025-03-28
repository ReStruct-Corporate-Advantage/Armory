export class ColumnOptionConstants {
    static readonly deserializeLegacyColumnOptionAttributes = 'deserializeLegacyColumnOptionAttributes';
    static readonly getModifiedColumnTitle = 'getModifiedColumnTitle';
    static readonly AGGREGATION = 'aggregation';
    static readonly CUSTOM_AGGREGATION = 'customAggregation';
    static readonly SUBTOTAL_TYPE = 'subtotalType';
    static readonly AGGREGATION_TYPE = 'aggregationType';
    static readonly MIN_AGG_VALUE = 'minAggValue';
    static readonly MAX_AGG_VALUE = 'maxAggValue';

    static readonly COLUMN_OPTIONS_ORDERING = {
        OPTIONS_ORDER: ['Column measure', 'Display options', 'Conditional formatting', 'Column-level breakdown', 'Aggregation', 'Date override', 'Formula Settings', 'Scope'],
        OPTIONS_GROUPING: ['customColumnTitle']
    };

    static readonly PORTFOLIO = 'Portfolio';
    static readonly PERFORMANCE = 'Performance';

    static readonly AVAILABLE_TREE_GROUP_ORDER = [
        'Position',
        'Security',
        'Fund Attributes',
        'Risk',
        'Portfolio Risk',
        'Liquidity Risk',
        'Performance',
        'Alternatives',
        'Muni',
        'Mortgage',
        'Custom',
        'Company Fundamentals',
        'ESG',
        'Climate',
        'Risk Based Capital',
        'Custom Investment Data',
        'Research',
        'GP Breakdown',
        'Loan',
        'Factor-based',
        'Risk Factor',
        'Convertibles',
        'Style Analysis',
        'Portfolio Attributes',
        'Core Assignment Attributes',
        'Other Attributes',
        'Portfolio',
        'Credit VaR',
        'Coverage',
        'Custom Calculation',
        'Metrics'
    ];

    static readonly BASIS_POINT = 'Basis Point (bp)';
    static readonly PERCENT = 'Percent (%)';

    static readonly BG_COLOR_MAP = 'bgColorMap';
    static readonly FG_COLOR_MAP = 'fgColorMap';
    static readonly COLUMN = 'column';
    static readonly RECENT_COLUMNS = 'My recently added columns';
    static readonly PGS_COLUMNS = 'pgsColumns';
    static readonly RETURN_COLUMNS = 'returnColumns';
    static readonly PRA_COLUMNS = 'praColumns';
    static readonly COMMON_COLUMNS = 'commonColumns';
    static readonly UNDERSCORE = '_';
    static readonly COMMA = ',';

    static readonly TEN_YEAR = 'TEN_YEAR';
}
