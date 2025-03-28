import {ExploreSelectOption} from '@blk/explore-ui-core';

export class SectorConstants {

    static DEFAULT_CUSTOM_SECTOR_TITLE = 'Custom Sector';
    static readonly NONE = 'None';
    static readonly PNL_CUSIP = 'pnl_cusip';
    static readonly PNL_STRATEGY_ID = 'pnl_strategy_id';
    static readonly ALL = 'ALL';

    static ConfigType = {
        COLUMN_SECTOR: 'String_sector',
        COLUMN_SECTOR_RULE: 'CustomSectorRule',
        DATE_COLUMN_SECTOR: 'Date_sector',
        NUMERIC_COLUMN_SECTOR: 'Numeric_sector',
        TIME_SPAN_COLUMN_SECTOR: 'timeSpan_sector',
        LINKED_FAVORITE_SECTOR: 'LinkedFavoriteSector',
        GROUP_RULE: 'CustomSectorRuleGroup',
        CUSTOM_SECTOR: 'CustomSector',
        CUSTOM_SECTOR_RULE: 'CustomSectorCustomSector',
        BREAKDOWN: 'breakdown',
        QUANTILE_INFO: 'QUANTILE_INFO',
        SCHEMA_SECTOR: 'schema_sector'
    };

    static CUSTOM_RULE_BUILDER_HEADERS = {
        CUSTOM_FILTER_RULE: 'Custom Filter Rule Logic',
        SECTOR_RULE: 'Sector Rule Logic',
        LOOK_THROUGH_RULE: 'Look-through Rule Logic'
    };

    static CUSTOM_RULE_BUILDER_OPERATORS = {
        EQUALS: new ExploreSelectOption('Equals', '='),
        NOT_EQUAL: new ExploreSelectOption('Does Not Equal', '!='),
        GREATER_THAN: new ExploreSelectOption('Greater Than', '>'),
        LESS_THAN: new ExploreSelectOption('Less Than', '<'),
        GREATER_THAN_OR_EQUAL: new ExploreSelectOption('Greater Than or Equal To', '>='),
        LESS_THAN_OR_EQUAL: new ExploreSelectOption('Less Than or Equal To', '<='),
        STARTS_WITH: new ExploreSelectOption('Starts With', '^'),
        CONTAINS: new ExploreSelectOption('Contains', '~'),
        DOES_NOT_CONTAIN: new ExploreSelectOption('Does Not Contain', '!~')
    };

    static COMPARISON_TYPE_NEGATIONS_MAP = new Map([
        ['Equals', 'Does Not Equal'],
        ['Does Not Equal', 'Equals'],
        ['Greater Than', 'Less Than'],
        ['Less Than', 'Greater Than'],
        ['Greater Than or Equal To', 'Less Than or Equal To'],
        ['Less Than or Equal To', 'Greater Than or Equal To'],
        ['Starts With', 'Does Not Start With'],
        ['Does Not Start With', 'Starts With'],
        ['Contains', 'Does Not Contain'],
        ['Does Not Contain', 'Contains']
    ]);

    static TIME_SPAN_UNITS = {
        D: new ExploreSelectOption('Day(s)', 'D', false),
        M: new ExploreSelectOption('Month(s)', 'M', false),
        Y: new ExploreSelectOption('Year(s)', 'Y', false)
    };

    static readonly SECTOR_DATA_TYPE = {
        STRING: 'string',
        NUMERIC: 'numeric',
        DATE: 'date',
        TIME_SPAN: 'timeSpan',
        CUSTOM: 'custom',
        BREAKDOWN: 'breakdown',
        SCHEMA: 'schema'
    };

    static readonly GROUP_RULE_CONDITION = {
        'OR': 'OR',
        'AND': 'AND'
    };

    static readonly NUMERIC_COLUMN_SECTOR_MODES = {
        BREAKPOINT_MODE: 'Breakpoints',
        BUCKET_MODE: 'Increments',
        QUANTILE_MODE: 'Quantiles'
    };

    static readonly QUANTILE_SORT = {
        ASCENDING: 'ASC',
        DESCENDING: 'DESC'
    };
    // Period type for "Create quantile from" options
    static readonly PERIOD_TYPE = {
        START_LABEL: 'Start of period value',
        END_LABEL: 'End of period value',
        START: 'Start',
        END: 'End'
    };

    // "Base quantile on" options
    static readonly QUANTILE_BASED_ON = {
        NUMBER_OF_SECURITIES: 'NumberOfSecurities',
        PORTFOLIO : 'Portfolio',
        BENCHMARK : 'Benchmark'
    };

    static readonly DATE_COLUMN_SECTOR_GROUP_BY = {
        YEAR: 'Year',
        DATE: 'Date'
    };

    static readonly CUSTOM_SECTOR_RULE_TEXT = {
        FUND_ASSIGNMENT_EQUALS: 'Fund Assignment Equals ',
        PORTFOLIO_ASSIGNMENT_EQUALS: 'Portfolio Assignment Equals ',
        INDEX_ASSIGNMENT_EQUALS: 'Index Assignment Equals '
    };

    static readonly SECTOR_RULES_INFO = {
        SUB_SECTOR: 'subSector',
        SECTOR_VALUE: 'sectorValue',
        SECTOR_TYPE: 'sectorType',
        NORMAL_SECTOR: 'NormalSector',
        CUSTOM_SECTOR: 'CustomSector'
    };
}
