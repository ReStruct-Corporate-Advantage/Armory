import {FavoriteDisplayEnum} from '../enums/favorite-display.enum';

export class CoreFavoriteConstants {
    static readonly GLOBAL_USER = '_GLOBAL';
    static readonly ADMIN = '_ADMIN';

    static readonly ENTERPRISE = 'Enterprise';
    static readonly PERSONAL = 'Personal';

    // workspace
    static readonly WORKSPACE = 'WORKSPACE';

    // report
    static readonly REPORT = 'REPORT';

    // column set
    static readonly COLUMN_SET_LOWER = 'column set';

    // column (custom calc)
    static readonly CUSTOM_CALC_LOWER = 'custom calculation';
    static readonly CUSTOM_CALC_PASCAL = 'Custom Calculation';
    static readonly CUSTOM_CALC_COLUMN_LOWER = 'custom calculation column';
    static readonly PGS_CUSTOM_CALC_COLUMN_LOWER = 'custom calculation (summary mode) column';
    static readonly CUSTOM_CALC_COLUMN = 'COLUMN';
    static readonly PGS_CUSTOM_CALC_COLUMN = 'PGS_CUSTOM_CALC_COLUMN';
    static readonly OPTO_CUSTOM_CALC_COLUMN = 'OPTO_CUSTOM_CALC';
    static readonly CUSTOM_CALC_COLUMN_FOLDER = 'COLUMN_FOLDER';
    static readonly PGS_CUSTOM_CALC_COLUMN_FOLDER = 'PGS_CUSTOM_CALC_FOLDER';
    static readonly CUSTOM_CALC_COL_TAG = 'custom_calc';

    static readonly SEARCH = 'Search';
    static readonly LOAD = 'Load';
    static readonly SAVE = 'Save';

    static readonly TITLE = 'Title';
    static readonly ENTERPRISE_TREE = 'Enterprise tree';
    static readonly SET = 'set';

    static readonly _FOLDER = '_FOLDER';

    static readonly TO_PLURAL = 's';

    // loading and saving of favorites in UI
    static readonly FAVORITE_DISPLAY_TITLE: {[key: string]: string} = {
        WORKSPACE: 'Workspace',
        REPORT: 'Report',
        COLUMN_SET: 'Set',
        COLUMN_SET_SAVE: 'Column Set',
        CUSTOM_CALC: 'Calculation',
        CUSTOM_CALC_SAVE: 'Custom Calc',
        PGS_CUSTOM_CALC_SAVE: 'Custom Calc (Summary Mode)',
        BREAKDOWN: 'Breakdown',
        FILTER: 'Filter',
        LOOK_THROUGH_RULE: 'Rule',
        BATCH_REPORT: 'Batch Report',
        OPTO_PARAMS: 'Parameters',
        CUSTOM_SECTOR: 'Custom Sector'
    };
    static readonly FAVORITE_ACTIONS: {[key: string]: string} = {
        LOAD: 'Load',
        NEW: 'New',
        SAVE: 'Save',
        EDIT_COPY: 'Edit Copy',
        EDIT_ORIGINAL: 'Edit Original'
    };

    // Used in the saving redesign - Save Report Changes and Save Workspace Changes modal
    static readonly FAVORITE_DISPLAY_NAMES: {[key in FavoriteDisplayEnum]: string} = {
        [FavoriteDisplayEnum.ADHOC_PORT_GROUP]: 'From scratch portfolio group',
        [FavoriteDisplayEnum.ADHOC_PORT]: 'From scratch portfolio',
        [FavoriteDisplayEnum.BATCH_REPORT]: 'Batch report',
        [FavoriteDisplayEnum.BREAKDOWN]: 'Breakdown',
        [FavoriteDisplayEnum.COLUMN_SET]: 'Column set',
        [FavoriteDisplayEnum.COMP_RULE]: 'Composition rule',
        [FavoriteDisplayEnum.COMPOSITION_SETTING]: 'Composition setting',
        [FavoriteDisplayEnum.CUSTOM_CALC]: 'Custom calculation',
        [FavoriteDisplayEnum.CUSTOM_SECTOR]: 'Custom sector',
        [FavoriteDisplayEnum.FILTER]: 'Filter',
        [FavoriteDisplayEnum.LOOK_THROUGH_SETTING]: 'Look-through setting',
        [FavoriteDisplayEnum.LOOK_THROUGH_RULE]: 'Look-through rules',
        [FavoriteDisplayEnum.OPTIMIZATION_SETTINGS]: 'Optimization parameters',
        [FavoriteDisplayEnum.PORTFOLIO]: 'Portfolio',
        [FavoriteDisplayEnum.PORT_WITH_POSITIONS]: 'Position based portfolio',
        [FavoriteDisplayEnum.REPORT]: 'Report',
        [FavoriteDisplayEnum.RISK_PARITY_SETTINGS]: 'Risk parity parameters',
        [FavoriteDisplayEnum.RULE_BASED_PORT]: 'Rule based what-if portfolio',
        [FavoriteDisplayEnum.SCHEDULED_BATCH]: 'Scheduled batch config',
        [FavoriteDisplayEnum.WHAT_IF_PORTFOLIO]: 'What-if portfolio',
        [FavoriteDisplayEnum.WORKSPACE]: 'Workspace',
    };

    static readonly RANGE_LISTS = [
        {label: 'All', value: 'All'},
        {label: 'Top 10', value: '10'},
        {label: 'Top 25', value: '25'},
        {label: 'Top 50', value: '50'},
        {label: 'Top 100', value: '100'}
    ];

    static readonly FAVORITE_STATUS = {
        UNDER_REVIEW: 'under_review',
        DECOMMISSIONED: 'decommissioned',
        MATURE: 'mature'
    } as const;

    static readonly FAVORITE_STATUS_DISPLAY_SLOTS = {
        DECOMMISSIONED : 'col1-2-',
        UNDER_REVIEW: 'col1-1-'
    };
}

export type FavoriteStatus = typeof CoreFavoriteConstants.FAVORITE_STATUS[keyof typeof CoreFavoriteConstants.FAVORITE_STATUS];
