/**
 * This class holds constants common across different parts of app. Eventually the js prismConstants should be coming here.
 */
export class CommonConstants {
    static readonly CONFIG_TYPE = {
        EXPANDED_STATE: 'expandedState',
        BREAKDOWN_TREE: 'breakdownTree',
        TOP_BOTTOM_FILTER: 'topBottomFilter',
        MIN_VAL_FILTER: 'minValFilter',
        FILTER: 'filter',
        COLUMNS: 'columns',
        SORTED_COLUMNS: 'sortedColumns',
        RIGHT: 'right',
        LEFT: 'left'
    };
    static readonly DEFAULT_WORKSPACE = 'defaultWorkspace';
    static readonly NOTIFICATION_MESSAGE = {
        'BREAKDOWN_RESTRICTED_TO_SINGLE_LEVEL': 'We currently restrict breakdowns to a single level. We will ignore any multilevel breakdown for this request',
        'DOES_NOT_SUPPORT_POSITION_PORTFOLIOS': 'This widget does not support position based portfolio requests',
        'DOES_NOT_SUPPORT_PORT_GROUP_WITH_POSITION_PORTFOLIOS': 'This widget does not support port group with position based portfolio requests',
        'DOES_NOT_SUPPORT_PORT_GROUP_WITH_POSITION_PORTFOLIOS_WITH_OVERRIDE_DATES': 'This widget does not support port group request with override dates as it includes position based portfolios',
        'DOES_NOT_SUPPORT_POSITION_PORTFOLIOS_WITH_OVERRIDE_DATES': 'This widget does not support request with override dates as portfolio is position based portfolio'
    };

    static readonly WIDGET_LEVEL_PROP_LIST = ['chart', 'showGridLines', 'secondaryAxisColumn', 'topBottomFilter', 'overrideAxisTitle'];

    static readonly PORTFOLIO_LOADING_MESSAGE = 'Loading Data For Portfolio ';

    static readonly HIGHCHART_CHARTING_LIB = 'hc';

    static readonly AGGRID_CHARTING_LIB = 'agGrid';

    static readonly SEPARATOR = 'separator';

    static readonly WIDGET_RELOAD_MESSAGE = 'You have made changes to Portfolio inputs. Click \'Reload Now\' to refresh the report.';

    static readonly GROUP_RULE_CONDITION = {
        'OR': 'OR',
        'AND': 'AND',
    };

    static readonly BUTTON_TEXT = {
        'OK': 'OK',
        'CANCEL': 'Cancel',
        'APPLY': 'Apply',
        'CLOSE': 'Close',
        'APPLY_AND_CLOSE': 'Apply And Close',
        'SAVE': 'Save',
        'SAVE_AS': 'Save as',
        'CONTINUE': 'Continue',
        'DELETE': 'Delete',
        'REMOVE': 'Remove',
        'ADD': 'Add',
        'BROWSE': 'Browse',
        'LOAD': 'Load',
        'SUBMIT': 'Submit',
        'RESET': 'Reset',
        'COMPARE': 'Compare',
        'PASTE_WIDGET': 'Paste Widget ...',
        'COPY_WIDGET': 'Copy Widget',
        'DONE': 'Done',
        'COPY': 'Copy',
        'INFO': 'Info',
        'USE_ONCE': 'Use Once',
        'RESTORE_DEFAULT': 'Restore To Default',
        'COPY_URL': 'Copy URL',
        'REPORT_GROUP': 'Report Group',
        'CREATE_GROUP': 'Create Group',
        'ADD_PORTFOLIO': 'Add Portfolio',
        'UPDATE': 'Update'
    };

    static readonly JS_TREE_ELEMENT_ID = {
        'FAVORITE_TREE': 'favorite-jstree',
        'AVAILABLE_COLUMNS_TREE': 'available-col-jstree',
        'BREAKDOWN_TREE': 'breakdown-jstree',
        'AVAILABLE_BREAKDOWNS_TREE': 'available-breakdowns-jstree'
    };

    static readonly ADD_PORTFOLIO_HANDLERS = {
        'ALIAS_PORTFOLIO': 'aliasPortfolio',
    };

    static readonly HYBRID_CREDIT_ATTRIBUTION = 'Hybrid Credit Attribution';

    static readonly SINGLE_SELECTION_MODE = 'single';

    static readonly TODAY_OVERRIDE = 'todayOverride';

    static readonly SHOW_COLUMN_DEFINITION = 'Show Column Definition';

    static readonly RESPONSE_STATUS_FAILURE = 'FAILURE';

    static readonly ASSET_TYPE_LABEL = ['Fixed income', 'Equity', 'Multi asset'];

    static readonly ASSET_TYPE_LABEL_KEY = {'Fixed Income': 'FI_MANDATE', 'Equity': 'EQ_MANDATE', 'Multi Asset': 'BAL_MANDATE'};

    static readonly ASSET_TYPE_VAL_KEY = {
        'Fixed Income': ['FI Portfolio Summary', 'FI Comparison', 'FI Liquidity Risk', 'FI Risk Summary', 'LIBOR Exposure Summary'],
        'Equity': ['EQ Portfolio Summary', 'EQ Comparison', 'EQ Liquidity Risk', 'EQ Risk Summary'], 'Multi Asset': ['MA Portfolio Summary', 'MA Comparison', 'MA Liquidity Risk', 'MA Risk Summary']
    };

    static readonly FILTER_TARGET_TYPES = [
        { value: 'BOTH', display: 'Both' },
        { value: 'PORTFOLIO', display : 'Portfolio'},
        { value: 'BENCHMARK', display : 'Benchmark'}
    ];

    static readonly DEFAULT_FILTER_TARGET = 'BOTH';

    static readonly PORTFOLIO = 'Portfolio';
    static readonly PORTFOLIOS = 'Portfolios';
    static readonly WIDGETS = 'Widgets';
    static readonly BENCHMARK = 'Benchmark';
    static readonly ACTIVE = 'Active';
    static readonly PORTFOLIO_CUMULATIVE = 'Portfolio cumulative';
    static readonly BENCHMARK_CUMULATIVE = 'Benchmark cumulative';
    static readonly ACTIVE_CUMULATIVE = 'Active cumulative';

    static readonly SINGLE_SPACE = ' ';

    static readonly ESCAPED_SPACE_CHAR = '\\ ';

    static EMPTY_STRING = '';

    static LINE_SEPARATOR = '\r\n';

    static readonly UNDERSCORE = '_';

    static readonly COLON = ':';

    static readonly SLASH = '/';

    static readonly COMMA_SEPARATOR = ',';

    static readonly COMMA_WITH_SPACE = CommonConstants.COMMA_SEPARATOR + CommonConstants.SINGLE_SPACE;

    static readonly DASH = '-';

    static readonly DOT = '.';

    static readonly DRAG_DROP_PARAMS = {
        PORTFOLIO_ID: 'portfolio_id',
        REPORT_GROUP_ID: 'report_group_id',
        PORTFOLIO_INDEX_IN_WORKPAD: 'portfolio_index',
        DRAGGED_REPORT_GROUP_ID: 'dragged_report_group_id',
        DRAGGED_WORKPAD_INDEX: 'dragged_workpad_index',
        DRAGGED_PORTFOLIO_INDEX_IN_WORKPAD: 'dragged_portfolio_index_in_workpad',
        WORKPAD_INDEX: 'workpad_index',
        WHAT_IF_PORTFOLIO_PARENT: 'what_if_portfolio_parent',
        IS_WHAT_IF_PORTFOLIO: 'is_what_if_portfolio',
        IS_CUSTOM_PORTFOLIO: 'is_custom_portfolio',
        LOOK_THROUGH_RULE_TABLE_ROW_ID: 'look_through_rule_table_row_id'
    };

    static readonly COLUMN_DEFINITION_SPRITELET = {
        ACTION_KEY: 'COLUMN_DEFINITION_SPRITELET',
        ACTION_LABEL: 'Show Column Definition',
        CALLBACK_METHOD_NAME: 'setShowColumnDefinitionForColumn'
    };

    static readonly COMPOSITION = 'Composition';
    static readonly COLUMN_TAG = 'columnTag';

    static readonly DROP_POSITION = {
        TOP: 'top',
        MIDDLE: 'middle',
        BOTTOM: 'bottom'
    };

    static readonly COLUMN_KEY_SPLITTER = '|';

    static readonly SECURITY = 'Security';
    static readonly COMPARE = 'Compare';
    static readonly BEFORE_SENTENCE = 'Before';
    static readonly AFTER_SENTENCE = 'After';
    static readonly BEFORE_SMALL = 'before';
    static readonly AFTER_SMALL = 'after';

    static readonly INVALID_INPUT = 'Invalid input';
    static readonly LESS_THAN = '<';

    // user defined field under context (gridOptions) to pass initial scaling info to ag-grid event handlers
    static readonly INITIAL_SCALING_INFO = 'scaledAt';

    // purpose - to restrict factor pie from picking point colors other than at first level
    static readonly RESTRICT_INDICATOR = '--restrict';

    static readonly TRUNCATION_KEY = '...';

    static readonly BASIS_POINT = 'Basis Point (bp)';
    static readonly PERCENT = 'Percent (%)';

    static readonly BFRE = 'BFRE';

    static readonly STORM = 'STORM';

    static readonly CUSTOM_LIST = 'Custom List';

    static readonly PORT_REPORT_GRP_INFO = 'Grouping reports will create a group consisting of multiple portfolios that share the same reports. Each portfolio will bring its associated reports into the group.';

    // Parametric port search
    static readonly WHAT_IF_PORTFOLIO: string = 'What-if Portfolio';

    static readonly PRODUCTION_PORTFOLIO: string = 'Production Portfolio';

    static readonly LOADING_WHAT_IF: string = 'Loading What-if';

    static readonly SECURITY_INDEX: number = 0;
    static readonly PORT_INDEX: number = 1;

    static readonly ARROW_OPERATOR = '->';

    static readonly MULTI_PORTFOLIO_ANALYSIS_TEXT = `
    Multi-Portfolio Analysis compares your selected portfolios side-by-side in a given report, <br>
    providing you the ability to understand your analytics across multiple portfolios in one view. <br>
    `;
    static readonly MULTI_PORTFOLIO_ANALYSIS_TEXT_WARNING = `Multi-Portfolio Analysis requires at least 2 portfolios to be in the group.`;
    static readonly BASE_PORTFOLIO_TEXT = `The base portfolio sets the reference point from which all other selected<br>
              portfolios in Multi-Portfolio Analysis mode will be compared against.<br>
              For example, if the MV of your base portfolio is 100, and another portfolio,<br>
              Portfolio 1, has a MV of 150, Portfolio 1's MV column in Multi-Portfolio<br>
              Analysis mode will display -50.`;
}
