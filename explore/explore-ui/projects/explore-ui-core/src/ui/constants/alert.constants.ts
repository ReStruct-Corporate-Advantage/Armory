/**
 * Constants for Alert
 */
export class AlertConstants {
    static readonly FAILURE = 'FAILURE';

    static readonly TYPE = {
        ALERT: 'alert',
        ALERT_WITH_OPTIONS: 'alert-with-options',
        PROMPT: 'prompt'
    };

    static readonly BTN = {
        OK: 'Ok',
        YES: 'Yes',
        NO: 'No',
        DELETE: 'Delete',
        CANCEL: 'Cancel',
        REMOVE: 'Remove',
        USE_ONCE: 'Use once',
        DONE: 'Done',
        SAVE_CHANGES: 'Save changes',
        APPLY: 'Apply',
        CONTINUE: 'Continue',
        CONFIRM: 'Confirm',
        LOSE_CHANGES: 'Lose Changes',
        BATCH: {
            CONFIRM_CANCEL: 'Yes, I want to cancel',
            RESUME: 'No, I want to keep running'
        },
        ADD: 'Add',
        LAUNCH_JOB_SCHEDULER: 'Launch Job Scheduler',
        CLOSE: 'Close'
    };

    static readonly HEADER = {
        PORTFOLIO_INFO_MISSING: 'Portfolio Information Missing',
        WRONG_DATE: 'Wrong Date',
        INVALID: 'Invalid',
        INVALID_REQUEST: 'Invalid Request',
        INVALID_ENTRY: 'Invalid Entry',
        INVALID_BREAKDOWN: 'Invalid Breakdown',
        INVALID_BENCHMARK: 'Invalid Benchmark',
        INVALID_WHATIF_PORT: 'Invalid What If Portfolio',
        BROKEN_WORKSPACE_FORMAT: 'Broken Workspace Format',
        EXPORT_REPORT_IN_PROGRESS: 'Export Report in Progress',
        PORT_INFO_MISSING: 'Portfolio Information Missing',
        ERROR_OCCURRED: 'Error Occurred',
        BATCH_REPORT_LOAD_ERROR: 'Batch Report Load Error',
        CONFIRM: 'Please confirm',
        REMOVE_BATCH_CONFIGURATION: 'Remove Batch Row Configuration',
        CANCEL_BATCH_EXPORTING: 'Cancel Batch Exporting',
        DELETE_BATCH_SCHEDULE: 'Delete Batch Schedule',
        REMOVE_WIDGET: 'Remove Widget',
        DELETE_ITEM: 'Delete Item',
        DELETE_PORTFOLIO: 'Delete Portfolio',
        DELETE_REPORT_GROUP: 'Delete Report Group',
        REMOVE_MAPPING: 'Remove Mapping for Mandate',
        FAVORITE_CHANGED: 'Favorite has been changed',
        DELETE_FAVORITE: 'Delete Favorite',
        REMOVE_REPORT: 'Remove Report',
        CLOSE_REPORT: 'Close Report',
        CONFIRM_COMPOSITION_CHANGE: 'Composition Change Present, Please confirm',
        COLUMNS_CHANGED: 'Columns Have Changed',
        // partial in header
        COMPLETE_WITH_FAILURES: ' Completed with Failures',
        DELETE: 'Delete',
        CHANGE_MODELING_COLUMN: 'Change Modeling Column',
        GENERATE_WHAT_IF_AND_TRADES: 'Generate What-if and Trades',
        DELETE_WORKSPACE: 'Delete Workspace',
        DELETE_CURRENT_WORKSPACE: 'Delete Current Workspace',
        DELETE_FAV_TITLE: 'Delete ',
        DELETE_FAV_CURR_TITLE: 'Delete Current ',
        CUSTOM_CHART_TYPE: 'Custom Chart Type',
        ADD_SCENARIOS: 'Add Scenarios',
        ADD_SCENARIO: 'Add Scenario',
        DELETE_SCENARIO: 'Delete Scenario',
        CONFIRM_TYPE_CHANGE: 'Confirm Type Change',
        CHANGES_NOT_SAVED: 'Changes will not be saved',
        DEPRECATED_SECTOR_CONSTRAINTS: 'Sector and portfolio constraints',
        ENTERPRISE_FAVORITE_TITLE_SAME: 'Enterprise Favorite with Same Title',
        SUCCESSFUL_JOB_CREATION: 'Job Creation Successful',
        EDIT_JOB_SUCCESSFUL: 'Job Edit Successful',
    };

    static readonly NOTIFICATION_STYLE = {
        SUCCESS: 'success',
        WARNING: 'warning',
        ERROR: 'error',
        MESSAGE: 'message'
    };

    static readonly BODY = {
        // WRONG_DATE
        FROM_DATE_ERROR: 'From date cannot be greater than to date',
        END_DATE_ERROR: 'End date cannot be less than from date',
        NO_VALID_RANGE: 'At least 1 of the Performance column is outside the valid range',

        // INVALID
        DUPLICATE_LABELS: 'Duplicate labels not allowed.',

        // INVALID_REQUEST
        SECTOR_REPORT_WITH_FILTER: 'Sector Report can not work with Composition/Portfolio Filter',

        // INVALID_BREAKDOWN
        INVALID_BREAKDOWN: 'One or more of your breakdown settings are not valid.',

        // INVALID_BENCHMARK
        INVALID_BENCHMARK: 'Unable to find what-if benchmark for date specified. Please change the portfolio date to BENCH_PORT_DATE or use a different benchmark.',
        INVALID_BENCHMARK_TICKER: 'The benchmark selected contains the same base portfolio. Please use a different benchmark.',

        INVALID_WHATIF_PORT: 'Unable to add what-if portfolio for date specified. Please change the portfolio date to WHATIF_PORT_DATE or add a different what-if portfolio.',
        INVALID_WHATIF_RULE_PORT: 'Please add what-if portfolio with security or sector level changes.',
        INVALID_WHATIF_PORT_DUPLICATE_NAME: 'A what-if portfolio with the same name is already added. Please choose another or rename this one.',

        // INVALID_ENTRY
        INVALID_COLUMN: 'Please select a valid column.',
        INVALID_OPERATION: 'Please enter a valid value for operation.',
        INVALID_VALUE: 'Please enter a valid value.',
        INVALID_SELECT: 'Please select a value from the list.',
        NO_ROWS_SELECTED: 'Please select at least one row in table',

        WORKSPACE_LOAD_ERROR: 'We are unable to load this workspace at this moment. Please wait for a few minutes and try again. If you are still encountering this message, please reach out to Aladdin Help for further guidance.',

        WORKSPACE_NOT_EXIST: 'We are not able to load this saved workspace because it may have been deleted. Please load a different workspace or enter in a portfolio ticker to proceed.',

        // BROKEN_WORKSPACE_FORMAT
        BROKEN_WORKSPACE_FORMAT: 'Your workspace uses an older format which can no longer be loaded or is corrupted. Please delete it and create a new one.',

        // EXPORT_REPORT_IN_PROGRESS
        EXPORT_REPORT_IN_PROGRESS: 'Only one report export is allowed at a time.',

        // PORT_INFO_MISSING
        PORT_INFO_MISSING: 'Error loading portfolio information, please enter a valid portfolio in the ticker field.',

        // ERROR_OCCURRED
        NO_CHART: 'No chart for a charts widget!',
        COULD_NOT_EXPORT_CHART: 'Could not export chart, try selecting a different report then reload the original report.',

        // BATCH_REPORT_LOAD_ERROR
        NO_VALID_BATCH_ROWS_LOADED: 'No valid batch rows were loaded as part of the favorite.',
        ERROR_LOADING_BATCH_REPORT: 'There was an error with loading the batch report.',

        // CONFIRM
        CUSTOM_SECTOR_SWITCH_TABS_WARNING: 'Are you sure you want to switch between tabs? All the previous selections will be lost.',
        UNSAVING_BATCH: 'Are you sure you want to start a new batch? All unsaved batches will be lost.',
        UNSAVING_WORKSPACE: 'You will lose any changes to your existing workspace if you have not saved it.  Do you want to continue?',
        OVERRIDE_FAVORITE: 'Favorite with same name already exists. Are you sure you want to override?',
        A_FAVORITE: 'A favorite ',
        FAVORITE_OVERRIDDEN: ' exists with the same name. If you wish to continue, the existing favorite will be overridden.',

        // REMOVE_BATCH_CONFIGURATION
        DELETE_BATCH_ROW: 'Are you sure you want to remove this Batch Row from the Batch Report?  This action cannot be undone.',

        // REMOVE_BATCH_SCHEDULE
        DELETE_BATCH_SCHEDULE: 'Are you sure you want to delete this Batch Schedule?  This action cannot be undone.',

        // REMOVE_WIDGET
        REMOVE_WIDGET: 'Are you sure you want to remove this widget?  This action cannot be undone.',

        // REMOVE_REPORT
        REMOVE_REPORT: 'Are you sure you want to remove this report?  This action cannot be undone.',

        // CLOSE_REPORT
        CLOSE_REPORT: 'Are you sure you want to close this report?  This action cannot be undone.',

        // REMOVE_PORTFOLIO
        REMOVE_PORTFOLIO: 'Are you sure you want to remove this portfolio ?',
        REMOVE_PORTFOLIO_2: '  Removing the portfolio will remove all the underlying what-if portfolios as well.',

        // DELETE_ITEM
        SECURITY_CONSTRAINTS_ASSOCIATED: 'There are security constraints associated with this item.  Deleting this item will remove the associated constraints as well. Are you sure you want to proceed?',

        // REMOVE_MAPPING
        REMOVE_MAPPING: 'Are you sure you want to remove this mapping for mandate?  This action cannot be undone.',

        // DELETE_FAVORITE
        DELETE_FAVORITE: 'Are you sure you want to delete this favorite?  This action cannot be undone.',

        // DELETE_PORTFOLIO
        DELETE_PORTFOLIO: 'Are you sure you want to delete this portfolio?  This action cannot be undone.',
        DELETE_PORTFOLIO_2: 'Deleting the portfolio will delete all the reports within it.',

        // DELETE_REPORT_GROUP
        DELETE_REPORT_GROUP: 'Deleting the report group will delete all the portfolios and reports within it.',

        // FAVORITE_CHANGED
        FAVORITE_CHANGED: 'The breakdown being edited is one of your saved breakdowns. If you want to update this saved breakdown please press ‘Cancel’ and use the ‘Save Breakdown’ button. If you want to persist these changes for just this widget, select ‘Use Once’.',

        // COLUMNS_CHANGED
        COLUMNS_CHANGED: 'Attribution Settings have been updated, there are changes in the columns, Do you want to add those relevant columns?',
        // CANCEL_BATCH_EXPORTING
        CANCEL_BATCH_EXPORTING: 'You have batch reports currently in progress. Are you sure you want to cancel the remaining reports?',

        // CONFIRM_COMPOSITION_CHANGE
        CONFIRM_COMPOSITION_CHANGE: 'Continue and remove the existing composition change or cancel the filter addition',

        // COMPLETE_WITH_FAILURES
        FAILED_TO_DOWNLOAD: 'Warning: Some files failed to download!',

        FAVORITE_WITH_SAME_NAME: 'A favorite exists with the same name. If you wish to continue, the existing favorite will be overridden.',

        CHANGE_MODELING_COLUMN: 'Securities added will not be saved. Do you want to continue?',
        CHANGE_MODELING_COLUMN_PORTFOLIO: 'Portfolios added will not be saved. Do you want to continue?',
        REGENERATE_WHAT_IF_AND_TRADES: 'Do you want to re-generate trades for existing portfolios?',
        NO_PORT_SELECTED_WHAT_IF_AND_TRADES: 'No portfolio selected to generate trades.',
        FAV_DEL_CONFIRM_PREFIX: 'If you wish to delete ',
        FAV_DEL_CONFIRM_SUFFIX: ', please click Confirm.',
        CURR_WORKSPACE_DEL_CONFIRM_SUFFIX: ' is the workspace you are currently viewing. If you wish to delete this workspace and be redirected to the home page, please click Confirm.',
        CURR_REPORT_DEL_CONFIRM_SUFFIX: ' is the report you are currently viewing. If you wish to delete this report, please click Confirm.',
        CUSTOM_CHART_TYPE: 'Custom chart types cannot be applied to a stacked breakdown. The chart type will default to the original setting. Go back and adjust stacked breakdown in order to select a custom chart type.',

        // Stress scenarios selection
        ADD_SCENARIOS: 'You are going to add # scenarios to the list. Do you want to continue?',
        ADD_SCENARIO: 'You are going to add [#] to the list. Do you want to continue?',
        DELETE_SCENARIO: 'You are going to permanently delete [#]. Do you want to continue?',
        CHANGE_SCENARIO_TYPE: 'Changing the scenario type will result in loss of changes. Do you want to continue?',
        SCENARIO_WITH_SAME_NAME: 'A scenario exists with the same name. If you wish to continue, the existing scenario will be overridden.',

        // Attribution Settings
        ATTRIB_METHODOLOGY_CHANGED: 'Changing the Asset Class or the Attribution Model selection will remove any changes made to the Selected Factors or the Additional Settings.',

        // Deprecated sector constraints
        DEPRECATED_SECTOR_CONSTRAINTS: 'Important: Your configuration contains a deprecated active constraint set-up. Please use a relative bound type to the benchmark going forward. More information can be found in the 2024.6 Release Notes.',
        INVALID_DEPRECATED_SECTOR_CONSTRAINTS: 'We do not support this constraint set-up. Please use a "non-active" column. For more details, refer to Aladdin Product Update 2024.6',

        // Change in decision bench info
        DECISION_BENCH_STRUCTURE_CHANGE: 'Important: Changing this config will result in loss of decision benchmark info',

        ENTERPRISE_FAVORITE_TITLE_SAME: 'An enterprise favorite already exists with the same title. Please choose a different title'
    };

    static readonly NOTIFICATION = {
        RELOADING_DATA: 'Reloading Data',
        LOADING_INTERRUPTED: 'Loading interrupted',
        NO_COLUMNS_SELECTED: 'No columns selected',
        NO_DATA_FOUND_IN_SERVER: 'No data found in server',
        ERROR_RETRIEVING_DATA: 'Error retrieving data for this widget',
        ERROR_RETRIEVING_COLUMN_STATIC_VALUE: 'Error retrieving static values of column',
        ERROR_LOADING_DATA_FOR_WIDGET: 'There was an error loading data for this widget.',
        ERROR_LOADING_SECURITIES: 'There was an error loading following securities',
        COMPARISON_MODE_NOT_SUPPORT: {
            EXPOST: 'Ex-post analysis is not supported in Multi-Portfolio Analysis mode.',
            TIME_SERIES: 'Time series widget is not supported in Multi-Portfolio Analysis mode.',
            RETURNS_CHART: 'Returns Chart is not supported in Multi-Portfolio Analysis mode.',
            PIVOT: 'Pivot Widget is not supported in Multi-Portfolio Analysis mode.',
            MARGIN_ANALYTICS: 'Margin Analytics Widget is not supported in Multi-Portfolio Analysis mode.',
            PGS_CHART: 'Charting from Portfolio Group Summary is not supported in Multi-Portfolio Analysis mode.',
            PNL_TS: 'P&L time series widget is not supported in Multi-Portfolio Analysis mode.',
            COMMITMENT_RISK: 'Commitment Risk Widget is not supported in Multi-Portfolio Analysis mode.',
        },
        CUSTOM_PORTGROUP_NOT_SUPPORT: {
            EXPOST: 'Ex-post analysis is not supported for Custom Portfolio Groups.',
            MARGIN_ANALYTICS: 'Margin Analytics Widget is not supported for Custom Portfolios.',
            COMMITMENT_RISK: 'Commitment Risk Widget is not supported for Custom Portfolio Groups.',
            CREDIT_VAR: 'Credit VaR columns are not compatible with Custom Portfolios. Please remove the Credit VaR-related columns from this widget or create a new widget without Credit VaR columns.',
        },
        WHAT_IF_PORTFOLIO_NOT_SUPPORTED: {
            MARGIN_ANALYTICS: 'Margin Analytics Widget is not supported for What-If Portfolios.',
            TIME_SERIES_COMPARISON: 'Compare is not supported for Time series analysis of What-If Portfolios.',
            COMMITMENT_RISK: 'Commitment Risk Widget is not supported for What-If Portfolios.',
            CREDIT_VAR: 'Credit VaR columns are not compatible with What-If analysis. Please remove the Credit VaR-related columns from this widget or create a new widget without Credit VaR columns.',
        },
        BREAKDOWN_DEFINED: {
            PIVOT: 'Pivot widget needs at least a single level of breakdown defined.'
        },
        REMOVE_BREAKDOWN_OR_TOPBOTTOM_FILTER: 'Please remove column Breakdown or Top/Bottom Filter, as both can not be applied on same column.',
        DUPLICATE_RISK_FACTORS: 'The same risk factor has been added multiple times to the analysis. For Risk matrix analyses, duplicates of a risk factor are not supported. Please remove the duplicates to proceed.',
        TIME_SERIES_COMPARISON_NON_MATCHING_DATES: 'To use the compare feature for these portfolios please make sure they have the same reporting date.',
        TIME_SERIES_COMPARISON_EXCEEDS_MAX_NUMBER_OF_DATA_POINTS: 'You have exceeded the data limit on this widget. Please decrease the number of periods in chart settings.',
        PGS_CHART_INVALID_COLUMNS: 'No numerical columns are included in the parent widget, and thus nothing can be plotted. Please add numerical columns and try again.',
        PGS_CHART_COMPATIBILITY_ISSUE: 'Charts created from the Portfolio Group Summary widget are only compatible with the initial portfolio from which they were created. Please create a new chart in order to see data for this portfolio.',
        PGS_REPORT_GROUP_EXPORT: 'When exporting a report group to PDF, charts created from Portfolio Group Summary will only export for the portfolio that is the current selection displaying in the reports. To export the Portfolio Group Summary chart(s) for each portfolio in the report group, please cycle through each portfolio in the report group, creating a PDF export of the report after selecting each portfolio.',
        INVALID_CHILD_COLUMN_OPTIONS: (columnTitle: string) => {
            return 'The column settings applied for  ' + columnTitle + ' generate more than one column. This occurs because a multi-select option is applied, which is not compatible with the optimization objectives. Please review and select a single option per setting.';
        },
        STRESS_SCENARIO_UPDATED: 'A Stress Scenario has been updated. Please perform a hard refresh on all other widgets containing the respective stress scenarios to view the changes.',
        COMPARISON_VIEW_ERROR: 'Generate API Request is not supported with Compare. Click the + Portfolio button on the Workspace left-hand panel to add in a compatible portfolio and re-run Generate API Request.',
        WHAT_IF_PORT_ERROR: 'Generate API Request is not supported with What-If Portfolios. Click the + Portfolio button on the Workspace left-hand panel to add in a compatible portfolio and re-run Generate API Request.',
        CUSTOM_SCRATCH_PORT_ERROR: 'Generate API Request is not supported with Custom Portfolios. Click the + Portfolio button on the Workspace left-hand panel to add in a compatible portfolio and re-run Generate API Request.',
        UNSUPPORTED_WIDGETS_FOR_EXPORT: 'This widget is not currently supported in the Export Hub workflow. Risk and Exposure, Return Analysis, Portfolio Group Summary, Factor Based Analysis, and Time Series widgets are all available for use within the Export Hub',
        UNSUPPORTED_AND_INVALID_WIDGETS_FOR_EXPORT: 'Please note that only the following widgets are  currently supported in the Export Hub workflow - Risk and Exposure, Return Analysis, Portfolio Group Summary, Factor Based Analysis, and Time Series. Additionally, custom breakdowns/filters and custom calculation/style columns must be saved to the \'Enterprise\' folder in order to be used in the Export Hub. Kindly save the custom breakdown and custom calculation components of this widget and try again.'
    };

    static readonly EFFICIENT_FRONTIER_BAD_RESPONSE = 'Received no response from efficient frontier trades';
    static readonly DATE_SERVICE_ERROR = 'Error occurred while parsing relative date';
    static readonly PROVIDE_ABSOLUTE_DATE = 'Please provide a valid absolute date';
}
