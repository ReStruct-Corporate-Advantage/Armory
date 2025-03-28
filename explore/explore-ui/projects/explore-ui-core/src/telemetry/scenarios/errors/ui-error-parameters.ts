/**
 * UIErrorParameters is used to capture info about default UI errors
 */
export class UIErrorParameters {
    static readonly ACTION = 'UI_ERROR';

    // FUNCTION_NAME recorded in event logging

    //DATE VARY
    static readonly TELEMETRY_FUNCTION_NAME_DATE_VARY_WITH_COLUMN_BREAKDOWN_ERROR = 'explore:date-vary-with-column-breakdown-error';
    static readonly TELEMETRY_FUNCTION_NAME_DATE_VARY_WITH_POSITION_AGGREGATION_ERROR = 'explore:date-vary-with-position-aggregation-error';

    //FAVORITE
    static readonly TELEMETRY_FUNCTION_NAME_QUICK_SAVE_FAVORITE_ERROR = 'explore:quick-save-favorite-error';
    static readonly TELEMETRY_FUNCTION_NAME_SAVE_FAVORITE_ERROR = 'explore:save-favorite-error';
    static readonly TELEMETRY_FUNCTION_NAME_GET_FAVORITE_ERROR = 'explore:get-favorite-error';
    static readonly TELEMETRY_FUNCTION_NAME_DELETE_FAVORITE_ERROR = 'explore:delete-favorite-error';
    static readonly TELEMETRY_FUNCTION_NAME_UPDATE_FAVORITE_FOLDER_ITEM_TO_SAVE_ERROR = 'explore:update-favorite-folder-item-to-save-error';
    static readonly TELEMETRY_FUNCTION_NAME_GET_FAVORITE_WARNING = 'explore:get-favorite-warning';

    //WIDGET
    static readonly TELEMETRY_FUNCTION_NAME_VALIDATE_INPUTS_TIME_SERIES_ERROR = 'explore:validate-inputs-time-series-error';
    static readonly TELEMETRY_FUNCTION_NAME_VALIDATE_INPUTS_MARGIN_ANALYTICS_ERROR = 'explore:validate-inputs-margin-analytics-error';
    static readonly TELEMETRY_FUNCTION_NAME_VALIDATE_INPUTS_PIVOT_TABLE_ERROR = 'explore:validate-inputs-pivot-table-error';
    static readonly TELEMETRY_FUNCTION_NAME_VALIDATE_RETURN_ANALYSIS_ERROR = 'explore:validate-inputs-return-analysis-error';
    static readonly TELEMETRY_FUNCTION_NAME_VALIDATE_INPUTS_COMMITMENT_RISK_ERROR = 'explore:validate-inputs-commitment-risk-error';
    static readonly TELEMETRY_FUNCTION_NAME_ERROR_OUT_WIDGET_ERROR = 'explore:error-out-widget-error';
    static readonly TELEMETRY_FUNCTION_NAME_COPY_WIDGET_ERROR = 'explore:copy-widget-error';
    static readonly TELEMETRY_FUNCTION_NAME_PASTE_WIDGET_ERROR = 'explore:paste_widget-error';
    static readonly TELEMETRY_FUNCTION_NAME_CANCEL_LOADING_WIDGET_ERROR = 'explore:cancel-loading_widget-error';
    static readonly TELEMETRY_FUNCTION_NAME_CONFIGURE_ROW_BASED_SPRITELET_ERROR = 'explore:configure-row-based-spritelet-error';
    static readonly TELEMETRY_FUNCTION_NAME_FACTOR_TIME_SERIES_SUPPORTED_ON_COLUMN_ERROR = 'explore:factor-time-series-supported-on-column-error';
    //ex-post widgets
    static readonly TELEMETRY_FUNCTION_NAME_IS_ON_COMPARE_MODE_ERROR = 'explore:is-on-compare-mode-error';
    static readonly TELEMETRY_FUNCTION_NAME_IS_CUSTOM_PORT_GROUP_ERROR = 'explore:is-custom-port-group-error';

    //NODE
    static readonly TELEMETRY_FUNCTION_NAME_DELETE_NODE_ERROR = 'explore:delete-node-error';
    static readonly TELEMETRY_FUNCTION_NAME_SECTOR_NODE_INSERTION_ERROR = 'explore:sector-node-insertion-error';
    static readonly TELEMETRY_FUNCTION_NAME_GET_SCHEMA_NODE_ERROR = 'explore:get-schema-node-error';

    //EXPORT/UPLOAD SERVICE
    static readonly TELEMETRY_FUNCTION_NAME_EXPORT_FILE_WARNING = 'explore:export-file-warning';
    static readonly TELEMETRY_FUNCTION_NAME_RENDER_ELEMENTS_ON_CANVAS_WARNING = 'explore:render-element-on-canvas-warning';
    static readonly TELEMETRY_FUNCTION_NAME_GET_BATCH_CONTAINER_STATUS_WARNING = 'explore:get-batch-container-status-warning';
    static readonly TELEMETRY_FUNCTION_NAME_GENERATE_WIDGET_REQUESTS_FOR_BATCH_WARNING = 'explore:generate-widget-requests-for-batch-warning';
    static readonly TELEMETRY_FUNCTION_NAME_RENDER_NEXT_WIDGET_WARNING = 'explore:render-next-widget-warning';
    static readonly TELEMETRY_FUNCTION_NAME_PARSE_DATA_FROM_CSV_ERROR = 'explore:parse-data-from-csv';

    //MODAL
    static readonly TELEMETRY_FUNCTION_NAME_ADD_BATCH_SCHEDULE_TO_QUEUE_ERROR = 'explore:add-batch-schedule-to-queue-error';
    static readonly TELEMETRY_FUNCTION_NAME_CLOSE_MODAL_ERROR = 'explore:close-modal-error';
    static readonly TELEMETRY_FUNCTION_NAME_ON_CLOSED_ERROR = 'explore:on_closed-error';
    static readonly TELEMETRY_FUNCTION_NAME_CLOSE_COLUMN_MEASURES_MODAL_ERROR = 'explore:close-column-measure-modal-error';

    //BREAKDOWN
    static readonly TELEMETRY_FUNCTION_NAME_ADD_MANDATE_DEFAULT_BREAKDOWN_NODE_ERROR = 'explore:add-mandate-default-breakdown-node-error';
    static readonly TELEMETRY_FUNCTION_NAME_MULTI_LEVEL_BREAKDOWN_WARNING = 'explore:multi-level-breakdown-warning';
    static readonly TELEMETRY_FUNCTION_NAME_RESTRICT_BREAKDOWN_TO_SINGLE_WARNING = 'explore:restrict-breakdown-to-single-warning';

    //OPTIMIZATION
    static readonly TELEMETRY_FUNCTION_NAME_ON_RUN_ERROR = 'explore:on-run-error';
    static readonly TELEMETRY_FUNCTION_NAME_LOAD_OPTIMIZATION_SETTINGS_ERROR = 'explore:load-optimization-settings-error';
    static readonly TELEMETRY_FUNCTION_NAME_ON_DOWNLOAD_ROS_REQUEST_ERROR = 'explore:on-download-ros-request-error';
    static readonly TELEMETRY_FUNCTION_NAME_PROCESS_OPTIMIZATION_RESULTS_WARNING = 'explore:process-optimization-results-warning';
    static readonly TELEMETRY_FUNCTION_NAME_SHOW_EFFICIENT_FRONTIER_WARNING = 'explore:show-efficient-frontier-warning';

    //PORTFOLIO SECURITIES
    static readonly TELEMETRY_FUNCTION_NAME_FETCH_HOLDING_CHANGES_FOR_PORT_SECURITIES_RULES_ERROR = 'explore:fetch-holding-changes-for-port-securities-rules-error';
    static readonly TELEMETRY_FUNCTION_NAME_ADD_RECORDS_FOR_PORTFOLIO_SECURITIES_ERROR = 'explore:add-records-for-portfolio-securities-changes-error';
    static readonly TELEMETRY_FUNCTION_NAME_NOTIFY_ON_BAD_PORT_SECURITIES_ERROR = 'explore:notify-on-bad-port-securities-error';

    //LAUNCH/OPEN ALADDIN HELP/CLARITY AI
    static readonly TELEMETRY_FUNCTION_NAME_VALIDATE_RESPONSE_CLARITY_AI_ERROR = 'explore:validate-response-clarity-ai-error';
    static readonly TELEMETRY_FUNCTION_NAME_LAUNCH_APP_CLARITY_AI_ERROR = 'explore:launch-app-clarity-ai-error';
    static readonly TELEMETRY_FUNCTION_NAME_LAUNCH_APP_CLARITY_AI_WARNING = 'explore:launch-app-clarity-ai-warning';
    static readonly TELEMETRY_FUNCTION_NAME_OPEN_ALADDIN_HELP_WARNING = 'explore:open-aladdin-help-warning';

    //SECURITY SEARCH
    static readonly TELEMETRY_FUNCTION_NAME_VALIDATE_RECEIVED_SECURITIES_ERROR = 'explore:validate-received-securities';
    static readonly TELEMETRY_FUNCTION_NAME_SEARCH_SECURITY_ERROR = 'explore:search-security-error';

    //LOOKTHROUGH SETTINGS
    static readonly TELEMETRY_FUNCTION_NAME_GET_LOOKTHROUGH_INFO_ERROR = 'explore:get-lookthrough-info-error';
    static readonly TELEMETRY_FUNCTION_NAME_EXTRACT_LOOKTHROUGH_INFO_ERROR = 'explore:extract-lookthrough-info-error';
    static readonly TELEMETRY_FUNCTION_NAME_ON_EXPORT_ITEM_CLICKED_ERROR = 'explore:on-export-item-clicked-error';

    //PORTFOLIO
    static readonly TELEMETRY_FUNCTION_NAME_FETCH_PORTFOLIO_INFORMATION_ERROR = 'explore:fetch-portfolio-information-error';
    static readonly TELEMETRY_FUNCTION_NAME_FETCH_ALL_PORTFOLIOS_WARNING = 'explore:fetch-all-portfolios-warning';

    //ADD CASH
    static readonly TELEMETRY_FUNCTION_NAME_CHECK_FOR_SKIPPED_RULES_ERROR = 'explore:check-for-skipped-rules-error';
    static readonly TELEMETRY_FUNCTION_NAME_PARSE_CASH_VALUE_ERROR = 'explore:parse-cash-value-error';

    //MISCELLANOUS
    static readonly TELEMETRY_FUNCTION_NAME_PROCESS_EPNL_REPORT_RESPONSE_ERROR = 'explore:process-epnl-report-response-error';
    static readonly TELEMETRY_FUNCTION_NAME_GET_DATA_ERROR = 'explore:get-data-error';
    static readonly TELEMETRY_FUNCTION_NAME_HANDLE_RESPONSE_ERROR = 'explore:handle-response-error';
    static readonly TELEMETRY_FUNCTION_NAME_SET_SPRITELET_COLUMNS_REJECTED_WARNING = 'explore:set-spirtelet-columns-rejected-warning';
    static readonly TELEMETRY_FUNCTION_NAME_SAVE_MANDATE_SETTINGS_ERROR = 'explore:save-mandate-settings-error';
    static readonly TELEMETRY_FUNCTION_NAME_EFFICIENT_FRONTIER_RUN_ERROR = 'explore:efficient-frontier-run-error';
    static readonly TELEMETRY_FUNCTION_NAME_ON_CLONED_ERROR = 'explore:on-cloned-error';
    static readonly TELEMETRY_FUNCTION_NAME_FETCH_HOLDING_CHANGES_FOLLOWED_BY_COMPOSITION_DATA_ERROR = 'explore:fetch-holding-changes-followed-by-composition-data-error';
    static readonly TELEMETRY_FUNCTION_NAME_SET_MODELLING_TABLE_OPTION_ERROR = 'explore:set-modelling-table-option-error';
    static readonly TELEMETRY_FUNCTION_NAME_GET_PUBLISHED_STATUS_ERROR = 'explore:get-published-status-error';
    static readonly TELEMETRY_FUNCTION_NAME_VALIDATE_DATE_ERROR = 'explore:validate-date-error';


    /**
     * @param errorType - error info - ErrorTypeConstants
     * @param errorMessage - error info
     * @param portfolioTickers - analysis context (optional)
     * @param isComparisonEnabled - analysis context (optional)
     * @param reportTitle - analysis context (optional)
     * @param reportId - analysis context (optional)
     * @param reportOwner - analysis context (optional)
     * @param widgetType - widget context (optional)
     * @param widgetTitle - widget context (optional)
     */
    constructor(public errorType: string,
                public errorMessage: string,
                public portfolioTickers?: string[],
                public isComparisonEnabled?: boolean,
                public reportTitle?: string,
                public reportId?: number,
                public reportOwner?: string,
                public widgetType?: string,
                public widgetTitle?: string
                ) {
    }

}
