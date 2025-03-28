/**
 * URL Constants
 */
export class URLConstants {

    // Enable opto feature in the app (true, false)
    static readonly ENABLE_OPTIMIZATION = 'enableOptimization';

    // Override today for T- date references  (e.g: todayOverride=08/26/2017)
    static readonly TODAY_OVERRIDE = 'todayOverride';

    // Load up a workspace with it's favorite id (e.g: workspace=1234)
    static readonly WORKSPACE = 'workspace';

    // Disable pop up when user tries to exit the app (true or false)
    static readonly DISABLE_BACK_BUTTON_POPUP = 'disableBackButtonPopup';

    // Enable frontend telemetry (true or false)
    static readonly TELEMETRY = 'telemetry';

    // Encode request sent from Explore UI to backend
    static readonly ENCODE_REQUEST = 'encodeRequest';

    // External BEN domain name
    static readonly BEN_DOMAIN_NAME = 'www.blackrock.com';

    // External BENDMZ domain name
    static readonly BENDMZ_DOMAIN_NAME =  'bendmz.blackrock.com';

    // TST BEN domain name
    static readonly TST_BEN_DOMAIN_NAME = 'test3.blackrock.com';

    // BENEUDMZ domain name
    static readonly BEN_EU_DMZ_DOMAIN_NAME = 'eu.blackrock.com';

    // HTTP2BMS Base url for routing requests from UI to middleware
    static readonly HTTP2BMS_BASE_URL = '/bms/request/app/';

    // Explore prod context path
    static readonly EXPLORE_CONTEXT_PATH = 'explore';

    // Explore beta context path
    static readonly EXPLORE_BETA_CONTEXT_PATH = 'explore-beta';

    // Explore gamma context path
    static readonly EXPLORE_GAMMA_CONTEXT_PATH = 'explore-gamma';

    // When true, will replace timestamp in colId with column sequence number. Useful while running testing suite with mock data
    static readonly MOCK_DATA_MODE = 'mockDataMode';

    // URL param to indicate if caching is to be used or not
    static readonly CACHE = 'cache';

    // URL param to indicate what type of caching is to be used
    static readonly CACHE_TYPE = 'cacheType';

    // This flag will be used to specify if curated reports need to load or not. By default, curated reports are loaded
    static readonly LOAD_CURATED_REPORTS = 'loadCuratedReports';

    // This flag will be used to specify if widgets are to maximized or not. By default, it is false
    static readonly MAXIMIZE_WIDGETS = 'maximizeWidgets';

    // This flag will be used to specify if colDefs are to be logged
    static readonly LOG_COLUMN_DEFINITIONS = 'logColumnDefinitions';

    // URL param to indicate the requested portfolio.
    static readonly QUERY_PORTFOLIO = 'queryPortName';

    // URL param to indicate the requested portfolio.
    static readonly SHOW_INTRO = 'showIntro';

    // URL param to open up a particular portfolio
    static readonly PORTFOLIO = 'portfolio';

    static readonly REPORT_ID = 'reportId';

    // URL param to indicate the requested portfolio.
    static readonly LOAD_REPORT = 'loadReport';

    // URL param to indicate the requested portfolio.
    static readonly PORTS = 'ports';

    // Set date as specified (e.g: date=02/03/2018)
    static readonly DATE = 'date';

    // URL param to indicate the requested portfolio.
    static readonly LOG_STAT = 'logstat';

    // URL for dev env.
    static readonly DEV_URL = 'https://dev.blackrock.com';

    static readonly DEV_EXPLORE_BETA_URL = 'https://dev.blackrock.com/apps/explore-beta/';

    static readonly HIDE_WIDGET_SETTINGS_PREVIEW = 'hideWidgetSettingsPreview';

    // URL param to show the batch pdf toggle button (to see the invisible batch report container)
    static readonly SHOW_BATCH_PDF_TOGGLE_BUTTON = 'batchPDFDebug';

    // URL endpoint to send a command request to ExploreServer to broadcast to batch coordinator
    static readonly SCHEDULE_BATCH_COMMAND_URL = 'scheduledBatchCommand';

    // URL param to show the scheduled batch debug buttons (adhoc add to queue, etc)
    static readonly ENABLE_SCHEDULED_BATCH_DEBUG = 'scheduledBatchDebug';

    static readonly WORKSPACE_URL = 'Workspace URL';

    static readonly WORKSPACE_URL_COPY_SUCCESS = 'Workspace URL successfully copied!';

    static readonly URL_PARAMS_WITH_DEFAULT_VALUES: Map<string, string> = new Map([['fallBackToGPX' , 'false']]);

    // URL param to use old workspace/report saving screens
    static readonly LEGACY_SAVING = 'legacySaving';

    static readonly FORCE_FETCH_DEFINITIONS = 'forceFetchDefinitions';

    static readonly SHOW_BETA_FEATURES = 'showBetaFeatures';

    static readonly WIDGET_AUTO_LOAD = 'widgetAutoLoad';

    static readonly SKIP_ESG_ENTITLEMENTS_FOR_PRE_PROD = 'skipESGEntitlementsForPreProd';

    static readonly SKIP_CLIMATE_SCENARIOS_FOR_PRE_PROD = 'skipClimateScenariosForPreProd';
}
