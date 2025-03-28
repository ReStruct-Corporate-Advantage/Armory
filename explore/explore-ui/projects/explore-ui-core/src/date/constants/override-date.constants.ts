/**
 * Class for constants related to override dates
 */
export class OverrideDateConstants {
    static readonly NONE_COMPARE_TO_CURRENT = 'NONE';
    static readonly COMPARE_TO_CURRENT = 'COMPARE_TO_CURRENT';
    static readonly PERCENTAGE_COMPARE_TO_CURRENT = 'PERCENTAGE_COMPARE_TO_CURRENT';
    static readonly COMPARE_TO_CURRENT_ATTRIBUTION = 'COMPARE_TO_CURRENT_ATTRIBUTION';
    static readonly PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION = 'PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION';
    static readonly MIN_MULTI_DATE_OBSERVATIONS = 2;
    static readonly OVERRIDE_DATE_OPTIONS = {
        'NONE': 'None',
        'SPECIFIC': 'Multi period',
        'MULTI': 'Time series'
    };

    static readonly VARY_BOTH = 'BOTH';
    static readonly ECONOMY = 'ECONOMY';

    static readonly DATE_VARY_TYPES = {
        'POSITION': ['EXPOSURE', 'Position date'],
        'ANALYTIC': ['ANALYTIC', 'Analytic date'],
        'BOTH': ['BOTH', 'Position and analytic date']
    };
    static readonly FBA_DATE_VARY_TYPES = {
        'EXPOSURE': ['EXPOSURE', 'Exposures'],
        'ECONOMY': ['ECONOMY', 'Economy'],
        'BOTH': ['BOTH', 'Economy & Exposures']
    };

    static readonly OVERRIDE_DATE_NONE = 'NONE';
    static readonly OVERRIDE_DATE_SPECIFIC = 'SPECIFIC';
    static readonly OVERRIDE_DATE_MULTI = 'MULTI';
    static readonly OVERRIDE_DATE_DEFINITIONS = {
        'CURRENT': 'CURRENT',
        'PRIOR_DAY': 'PRIOR_DAY',
        'MONTH_END': 'MONTH_END',
        'QUARTER_END': 'QUARTER_END',
        'YEAR_END': 'YEAR_END',
        'CUSTOM': 'CUSTOM'
    };
    static readonly CUSTOM_DATE_LABEL = 'Custom date';
    static readonly RISK_CATEGORIES = {
        'DEPENDS_ON_EXPOSURE': 'DEPENDS_ON_EXPOSURE',
        'DEPENDS_ON_ECONOMY': 'DEPENDS_ON_ECONOMY'
    };
    static readonly MAX_OVERRIDES_EXCEEDED_WARNING_MESSAGE: string = 'The input value has exceeded the maximum number of observations, so the value has been reverted to the upper limit.';

    static readonly DATE_SHORTCUTS = [
        {key: 'T', value: 'today'},
        {key: 'T-1', value: 'yesterday'},
        {key: 'T-N', value: 'N days in the past'},
        {key: 'T-1M', value: '1 month from today'},
        {key: 'T-NM', value: 'N months from today'},
        {key: 'T-1ME', value: 'the last month-end date'},
        {key: 'T-NME', value: 'the N last month-end date'},
        {key: 'T-1Q', value: '1 quarter from today'},
        {key: 'T-NQ', value: 'N quarters from today'},
        {key: 'T-1QE', value: 'last quarter end date'},
        {key: 'T-NQE', value: 'N last quarter end date'},
        {key: 'T-1Y', value: '1 year from today'},
        {key: 'T-NY', value: 'N years from today'},
        {key: 'T-1YE', value: 'last year end date'}
    ];

    static readonly SELECTED_FREQUENCY_LABEL = {
        'DAILY': 'days',
        'WEEKLY': 'weeks',
        'MONTH_END': 'months',
        'QUARTER_END': 'quarters',
        'YEAR_END': 'years'
    };
}
