import {BreakdownFavoriteConstants} from './breakdown-favorite.constants';

/**
 * Constants for breakdowns
 */
export class BreakdownConstants {

    static readonly BREAKDOWN_JSTREE_TYPE = {
        'STRING': 'String',
        'NUMERIC': 'Numeric',
        'DATE': 'Date',
        'TIME_SPAN': 'timeSpan',
        'CUSTOM': 'custom',
        'RATING': 'Rating'
    };

    static readonly BREAKDOWN_TREE_CONTEXT_MENU_LABELS = {
        'DELETE_NODE': 'Delete selected node',
        'DELETE_NODE_AND_CHILD': 'Delete selected node and child nodes',
        'COPY_NODE': 'Copy selected node',
        'COPY_NODE_AND_CHILD': 'Copy selected node and child nodes',
        'CUT': 'Cut',
        'PASTE': 'Paste'
    };

    static readonly BREAKDOWN_SECTOR_TYPE = {
        'MY_BREAKDOWNS': 'My Breakdowns',
        'TEAM_BREAKDOWNS': 'Team Breakdowns',
        'INDIVIDUAL_MEASURES': 'Individual Measures',
        'COMMON_HIERARCHIES': 'Common Hierarchies',
        'CUSTOM_SECTORS': 'Custom Sectors',
        'MY_CUSTOM_SECTORS': 'My Custom Sectors',
        'TEAM_CUSTOM_SECTORS': 'Team Custom Sectors',
        'SYSTEM_CUSTOM_SECTORS': 'System Custom Sectors'
    };

    static readonly BREAKDOWN_TYPE = {
        'PERFORMANCE': 'performance',
        'PERFORMANCE_BREAKDOWN': 'Performance Breakdown',
        'GP_BREAKDOWN_COLUMN': 'GP',
        'FACTOR_MAPPINGS': 'Factor Mappings',
        'EXPLORE_SECTORS': 'explore_sectors'
    };

    static readonly DECOMPOSITION_TYPE = new Map<string, string>([
        ['standAlone', 'With standalone terms'],
        ['contribution', 'With contribution terms'],
        ['standaloneAndCorrelation', 'With standalone and correlation effect terms']
    ]);

    static readonly DECOMPOSITION_MODE = new Map<string, string>([
        ['sectorAlloc', 'Sector Allocation/Security Allocation'],
        ['managerSelection', 'Manager Selection/Asset Allocation'],
        ['none', 'None']
    ]);

    static readonly BREAKDOWN_TYPES_MM = new Map<string, string>([
        [BreakdownFavoriteConstants.BREAKDOWN, 'Sector Breakdown'],
        [BreakdownFavoriteConstants.FACTOR_BREAKDOWN, 'Factor Breakdown'],
        [BreakdownFavoriteConstants.MM_XSR_BREAKDOWN, 'X Sigma-Rho Breakdown']
    ]);

    static readonly BREAKDOWN_OPTIONS = {
        'NONE': {value: 'none', label: 'No breakdown'},
        'SINGLE': {value: 'single', label: 'Quick grouping'},
        'MULTI': {value: 'multi', label: 'Configurable breakdown'}
    };

    static readonly MANDATE_DEFAULT_BREAKDOWN_TITLE: string = 'Default Breakdown';
    static readonly FACTOR_SPACE_USER_SPECIFIED_SCHEMA_TITLE: string = 'Pre-defined schema';
    static readonly EXPOSURE_AGGREGATION_TYPE = 'Exposure Aggregation Type';
}
