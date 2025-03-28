/**
 * constants class for notification messages
 */
export class NotificationConstants {
    static readonly WORKPAD_LOOKTHROUGH_RISK_NOTIFICATION_MSG_TOKEN_DISABLED = 'Look-through is not supported on Portfolio Risk data';
    static readonly RISK_LOOKTHROUGH_OTHER_THEN_RISK_PROXY = 'Risk data look-through is supported with Underlying Fund only';
    static readonly RISK_LOOKTHROUGH_WITH_CUSTOMIZATION_MSG = 'Portfolio Risk data look-through can only be performed with full look-through type, and can\'t be performed for benchmark securities';
    static readonly WORKPAD_LOOKTHROUGH_ERROR_MSG = 'Can\'t perform benchmark or sector look-through on the Performance data';
    static readonly INDEX_PORT_BREAKDOWN_MESSAGE = 'Breakdown fields under the Common Hierarchies section are not supported in Index Research mode. Please use fields under Individual Measures to create breakdowns.';
    static readonly SHOW_SUMMARY_PERF_BREAKDOWN_MESSAGE = 'Show Summary performance calculations are not supported for custom breakdowns';
    static readonly SHOW_SUMMARY_PERF_CUSTOM_PORT_GROUP = 'Show Summary performance calculations are not supported for custom portfolio groups';
    static readonly BREAKDOWN_FLATTEN_COMPONENT_MESSAGE = 'The selected breakdown is not compatible with the Flatten Components setting';
    static readonly REMOVE_BREAKDOWN_OR_TOPBOTTOM_FILTER = 'Please remove column Breakdown or Top/Bottom Filter, as both can not be applied on same column';
    static readonly PORTFOLIO_RISK_PORTNAME_BREAKDOWN = 'Portfolio Risk data look-through is not supported with Portfolio Name breakdown on a risk column';
    static readonly MACRO_FACTOR_BREAKDOWN_WITH_PERFORMANCE_COL_MSG = 'Please remove performance column with macro factor as column breakdown, as they are not currently supported';
    static readonly WIDGET_MACRO_FACTOR_BREAKDOWN_WITH_PERFORMANCE_COL_MSG = 'Please remove performance columns, as they do not support macro factors';
    static readonly INVALID_PORTNAME_MESSAGE = 'Received invalid ticker';
    static readonly INVALID_PORTDATE_MESSAGE = 'Received invalid date for portfolio';
    static readonly NO_STRESS_SCENARIOS_SELECTED = 'Please select at least one Scenario for each Stress column. Otherwise, please remove that column';
    static readonly FACTOR_MAPPING_SECTOR_INSERT_ERROR_MSG = 'Please remove existing nodes to add Factor model mapping.';
    static readonly MANDATE_DEFAULT_BREAKDOWN_INSERT_ERROR_MSG = 'Please remove existing nodes to add mandate default breakdown.';
    static readonly MANDATE_SCHEMA_TEXT_INSERT_ERROR_MSG = 'Please remove existing nodes to add Schema.';
    static readonly PRIVATE_FUND_SELECTION_ERROR_MSG = 'Please select private fund.';
    static readonly COLLAPSED_LOOKTHROUGH_NON_MATCHING_SECURITY_TYPES_ERROR_MSG = 'Collapsed look-through only supports the same security type configurations in a single widget. Please adjust your \'Collapsed look-through\' settings across columns to have matching security types.';
    static readonly CHILD_ADHOC_WITH_RISK_COLUMN = 'Portfolio Risk data is not supported for child create-from-scratch portfolios';
    static readonly DECOMPOSITION_AGGREGATION_TYPE_ERROR_MSG = 'The \'Compare to current with decomposition\' options are only available for \'Weighted average\' and \'Score with short handling\' aggregations. Please select one of these aggregations, or remove the decomposition option.';
    static readonly MULTI_LEVEL_QUANTILES_NOT_SUPPORTED_IN_RETURNS = 'Multi-level breakdowns with quantiles are not supported in the Returns Analysis widget. Please either switch to different bucketing or only use a single level breakdown.';
    static readonly EXPOSURE_COLUMNS_NOT_SUPPORTED_IN_RETURNS_WITH_QUANTILES = ' column(s) cannot be supported with this quantile breakdown. Please remove the column(s) or change the breakdown.';
    static readonly SAVED_BREAKDOWN_NOT_SUPPORTED = 'This saved breakdown is not currently supported in this type of widget.';
    static readonly FACTOR_DATA_LAUNCH_ERROR_FOR_MATRIX_COLUMNS = 'Accessing underlying factor data is not possible when including matrix columns in the Factor Based Analysis widget. Please remove these columns in order to drill into the data associated with individual factors.';
    static readonly MCVAR_COVAR_MATRIX_NOT_SUPPORTED = '"Use pre-specified equity covariances with fixed income-equity covariances calculated and fixed income covariances calculated from the defined settings" is not supported with MCVaR column and will be changed to "All covariances are calculated"';
    static readonly DIVERSIFICATION_COVAR_MATRIX_NOT_SUPPORTED = 'The "Use pre-specified equity covariances with fixed income-equity covariances calculated and fixed income covariances calculated from the defined settings" option under the BFRE covariance matrix controls setting in advanced risk options is not supported for diversification analytics. Please change the setting to "All covariances are calculated" parameter to proceed.';
    static readonly PGS_MULTI_MANAGER_COLUMNS_NOT_SUPPORTED: string = 'Multi-Manager columns are only supported in the Portfolio Group Summary with "Portfolio Tree" based decision benchmarks mapping.';
    static readonly RAS_RISK_COLUMNS_BEYOND_DATE_ERROR = (columns: string, date: string) => `The portfolio risk columns you have selected - ${columns} - do not have data beyond ${date}. Please remove the columns or change the workspace date to after ${date}.`;
    static readonly INCOMPLETE_DECISION_BENCHMARKS = 'Each decision level must be filled in completely. For example, if 1 level is selected, all the entries in that column must have a decision benchmark assigned. Please review the decision benchmark setup to ensure that a mapping is made for each relevant row.';
    static readonly MM_DECOMPOSITION_NOT_SUPPORTED_WITHOUT_BREAKDOWN = "Multi-manager risk decomposition requires the use of a portfolio attribute or a portfolio tree breakdown. Please configure this on the breakdown screen and try again."
    static readonly INCOMPATIBLE_BREAKDOWN_FOR_MM_DECOMPOSITION = "The breakdown for multi-manager risk decomposition analysis must align with the decision benchmark configuration in portfolio settings. Please use the Portfolio Tree breakdown option if using the tree setup in the decision benchmark screen or, if using the attribute-based decision benchmark configuration, use the same portfolio attributes to construct the breakdown in this widget.";
    static readonly PGS_CHARTS_NOT_SUPPORTED_FOR_DIVERSIFICATION_COLUMNS = 'Charts created from the Portfolio Group Summary widget do not support the Diversification Score column set. Please remove the column from the widget or create a chart using a different column in the widget.';
}
