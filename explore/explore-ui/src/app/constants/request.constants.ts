/**
 * RequestConstants
 */
export class RequestConstants {
    static readonly GET_USER_META_DATA = 'getUserMetadata';
    static readonly SET_USER_PREFERENCE = 'setUserPreference';
    static readonly GET_EPNL_RESPONSE = 'getEpnlResponse';

    static readonly PORT_SEARCH = 'portsearch';
    static readonly SECURITY_SEARCH = 'securitySearch';
    static readonly UPDATE_DESIGNATED_VALUE = 'updateDesignatedValue';
    static readonly INDEX_SEARCH = 'getIndexResearchPortfolios';
    static readonly LOAD_MANDATES = 'loadMandates';
    static readonly CFM_FUNDS = 'getCFMFunds';

    // REQUEST PARAMS
    static readonly GET_TIME_PERIOD_DATES_AND_NAME = 'getTimePeriodDatesAndName';
    static readonly WIDGET_ID = 'widgetId';
    static readonly ENABLE_BACKGROUND_CLK = 'enableClickOnBackground';
    static readonly SESSION_ID = 'sessionId';

    // LONG RUNNING
    static readonly GET_LONG_RUNNING_REQUEST = 'longRunningRequest';
    static readonly REQUEST_ID_PARAM = 'requestId';
    static readonly ORIGINAL_DATA_REQUEST_ID_PARAM = 'originalDataRequestId';
    static readonly LONG_RUNNING_STATUS_ID_PARAM = 'originalRequestId';
    static readonly GET_LONG_RUNNING_STATUS_REQUEST = 'getLongRunningStatus';

    // OPTIMIZATION
    static readonly GET_OPTIMIZATION_RESPONSE = 'getOptimizationResponse';
    static readonly COLUMN_SEARCH = 'columnsearch';

    // EXPORT HUB
    static readonly EXPORT_HUB =  'export-hub';
    static readonly GET_JOB_EXECUTION_HISTORIES = RequestConstants.EXPORT_HUB + '/getJobExecutionHistories';
    static readonly GET_ALL_EXPORT_HUB_JOBS = RequestConstants.EXPORT_HUB + '/getAllExportHubJobs';
    static readonly DELETE_SCHEDULED_JOB = RequestConstants.EXPORT_HUB + '/deleteExportHubJob';
    static readonly CANCEL_SCHEDULED_JOB = RequestConstants.EXPORT_HUB + '/cancelScheduledJob';
    static readonly CREATE_EXPORT_HUB_JOB = RequestConstants.EXPORT_HUB + '/createExportHubJob';
    static readonly GET_EXPORT_HUB_JOB_BY_ID = RequestConstants.EXPORT_HUB + '/getExportHubJobById';
    static readonly RUN_TEST_EXPORT_HUB_JOB = RequestConstants.EXPORT_HUB + '/runTestExportHubJob';
    static readonly GET_JOB_EXECUTION_HISTORY_BY_ID = RequestConstants.EXPORT_HUB + '/getExecutionHistoriesByJobId';
}
