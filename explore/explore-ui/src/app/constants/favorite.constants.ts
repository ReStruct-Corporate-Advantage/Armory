import {CompositionConstants} from '@constants/composition.constants';

/**
 *  * Constants for Favorite related variables
 */
export class FavoriteConstants {
    static readonly ROOT_FOLDER = 'folder_ROOT';
    static readonly ADMIN_USER = '_ADMIN';
    static readonly SHARED_USER = '_SHARED';
    static readonly PORTFOLIO_SPECIFIC_USER = 'PORTFOLIO_SPECIFIC';
    static readonly GLOBAL_ACCOUNT = 'Aladdin';
    static readonly PERSONAL_ACCOUNT = 'Personal';
    static readonly ADMIN_ACCOUNT = 'Enterprise';
    static readonly FACTOR_CUSTOM_SECTOR_FOLDER = 'FACT_CUST_SEC_FOLDER';
    static readonly MAX_TITLE_LENGTH = 30;
    static readonly NORMALIZED_FLAG = 'normalizedWidgetFilter';

    // favorite
    static readonly FAVORITE = 'favorite';
    static readonly FOLDER = 'folder';
    static readonly EMPTY_FOLDER = 'empty_folder';

    // workspace
    static readonly WORKSPACE = 'WORKSPACE';
    static readonly WORKSPACE_PASCAL = 'Workspace';
    static readonly WORKSPACE_FOLDER = 'WORKSPACE_FOLDER';
    static readonly PORTFOLIO_FOLDER = 'PORTFOLIO_FOLDER';

    // report
    static readonly REPORT = 'REPORT';
    static readonly REPORT_PASCAL = 'Report';
    static readonly LAYOUT = 'LAYOUT';
    static readonly LAYOUT_FOLDER = 'LAYOUT_FOLDER';

    // column set
    static readonly COLUMN_SET = 'COLUMN_SET';
    static readonly COLUMN_SET_LOWER = 'column set';

    static readonly CHART_REPORT = 'CHART_REPORT';
    static readonly CHART_REPORT_FOLDER = 'CHART_REPORT_FOLDER';

    // column (custom calc)
    static readonly CUSTOM_CALC_LOWER = 'custom calculation';
    static readonly CUSTOM_CALC_PASCAL = 'Custom Calculation';
    static readonly CUSTOM_CALC_COLUMN_LOWER = 'custom calculation column';
    static readonly CUSTOM_CALC_COLUMN = 'COLUMN';
    static readonly CUSTOM_CALC_COLUMN_FOLDER = 'COLUMN_FOLDER';

    // filter
    static readonly FILTER_LOWER = 'filter';
    static readonly FILTER_CAMEL = 'Filter';
    static readonly CUSTOM_SECTOR = 'CUSTOM_SEC';
    static readonly CUSTOM_SECTOR_TITLE = 'CUSTOM SECTOR';
    static readonly CUSTOM_SECTOR_FOLDER = 'CUSTOM_SEC_FOLDER';

    static readonly MANDATE_MAP = 'MANDATE_MAP';
    static readonly SECT_CONSTR_BKD = 'LAYOUT';
    static readonly PERFORMANCE_BREAKDOWN = 'PERF_BKD';
    static readonly BREAKDOWN_PRESET = 'BREAKDOWN_PRESET';
    static readonly MULTI_REPORT = 'MULTI_REPORT';
    static readonly RISK_REPORT = 'RISK_REPORT';
    static readonly RETURN_REPORT = 'RETURN_REPORT';
    static readonly FACTOR_CUSTOM_SECTOR = 'FACT_CUSTOM_SEC';
    static readonly CUSTOM_FILTER = 'CUSTOM_SEC';
    static readonly LT_FILTER_RULES = 'LT_FILTER_RULES';
    static readonly LT_LOGIC_RULES = 'look-through logic rules';
    static readonly LT_RULES_FOLDER = 'LT_RULES_FOLDER';
    static readonly WIDGETS_REPORT = 'WIDGETS_REPORT';
    static readonly QUICK_SAVE = 'QUICK_SAVE';

    // Batch
    static readonly BATCH_REPORT = 'BATCH_REPORT';
    static readonly BATCH_REPORT_PASCAL = 'Batch Report';
    static readonly BATCH_REPORT_FOLDER = 'BATCH_REPORT_FOLDER';

    // What-if optimization
    static readonly OPTO_SETTINGS = 'OPTO_SETTINGS';
    static readonly OPTO_SETTINGS_PASCAL = 'Optimization Parameters';
    static readonly OPTO_SETTINGS_FOLDER = 'OPTO_SETTINGS_FOLDER';

    // What-if risk parity optimization
    static readonly RISK_PARITY_SETTINGS = 'RISK_PARITY_SETTINGS';
    static readonly RISK_PARITY_SETTINGS_PASCAL = 'Risk Parity Parameters';
    static readonly RISK_PARITY_SETTINGS_FOLDER = 'RISK_PARITY_SETTINGS_FOLDER';

    // Composition Rules
    static readonly COMPOSITION_SETTING = 'CompositionSetting';
    static readonly COMP_RULES = 'COMP_RULES';
    static readonly COMP_RULES_DISPLAY = 'Composition Rule';
    static readonly COMP_RULES_FOLDER = 'COMP_RULES_FOLDER';

    static readonly GLOBAL_ACCOUNT_FAVORITES = ['LAYOUT', 'BREAKDOWN', 'REPORT', 'FAC_BKD', 'COLUMN', 'OPTO_SETTINGS'];
    static readonly ADMIN_ACCOUNT_FAVORITES = ['WORKSPACE', 'LAYOUT', 'BREAKDOWN', 'PERF_BKD', 'FAC_BKD', 'REPORT', 'RETURN_REPORT', 'MULTI_REPORT', 'RISK_REPORT', 'CUSTOM_SEC', 'BATCH_REPORT', 'COLUMN', 'CHART_REPORT', 'LT_FILTER_RULES', ...CompositionConstants.WHAT_IF_FAVORITE_TYPES.keys()];

}
