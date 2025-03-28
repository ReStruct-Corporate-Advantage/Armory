import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Title} from '@angular/platform-browser';
import {
    AuxAppFrameMainContentScrollDetailInterface,
    AuxBadgeTypeEnum,
    AuxButtonTypeEnum,
    AuxNotificationGroup,
    AuxNotificationGroupConfig,
    AuxValuePairLabelPositionEnum
} from '@blk/aladdin-angular-components';
import {
    AbstractFavoriteConfig,
    AlertConstants,
    CommonUtils,
    CoreFavoriteConstants, CoreFavoriteStore,
    CoreFavoriteVersioningStore,
    CoreUrlConstants,
    CoreUserMetaDataStore,
    DateService,
    DateStore,
    DateValue,
    ErrorTypeConstants,
    ExploreDialogParam,
    Favorite,
    FavoriteConfigParameters,
    SaveFavoriteResult,
    SubscribableComponent,
    TelemetryActionConstants,
    TelemetryService,
    TokenConstants,
    TokenUtils,
    UIErrorParameters,
    UserMetaData
} from '@blk/explore-ui-core';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {ExploreConstants} from '@constants/explore.constants';
import {FavoriteConstants} from '@constants/favorite.constants';
import {DeleteFavoriteAction} from '@models/favorite/delete-favorite-action.model';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {ModalStateActionInfo} from '@models/favorite/modal-state-action-info.interface';
import {ModalStateAction} from '@models/favorite/modal-state-action.enum';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {LoadingMessageInfo} from '@models/loading-message-info.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Notification} from '@models/widget/notification.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {Report} from '@models/workspace/report.model';
import {Workspace} from '@models/workspace/workspace.model';
import {BatchReportingService} from '@services/batch-reporting/batch-reporting.service';
import {ExploreCachingService} from '@services/widget-data/explore-caching.service';
import {UIErrorTelemetryContextUtils} from '@utils/ui-error-telemetry.context.utils';
import {isEmpty, isNil} from 'lodash';
import {BehaviorSubject, forkJoin, Observable, of, Subject, throwError} from 'rxjs';
import {catchError, filter, switchMap, takeUntil, tap} from 'rxjs/operators';
import packageJson from '../../package.json';
import {AppStore} from './app.store';
import {CommonConstants, DataRequestConstants, StatusConstants, URLConstants, UserPreference} from './constants';
import {WidgetConfigFactory} from './factories';
import {LoadingService} from './modules/loading/service/loading.service';
import {DefinitionsService} from './modules/metadata/definitions/definitions.service';
import {UserMetaDataService} from './modules/metadata/user-meta-data/user-meta-data.service';
import {
    FavoriteService,
    MandateMappingService,
    NotificationService,
    PortfolioService,
    WorkspaceService
} from './shared/services';
import {BatchExportingStore, UserMetaDataStore, WorkspaceStore} from './stores';
import {AppUtils, WorkspaceUtils} from './utils';
import {
    AcwAccountUtility,
    AcwCopilotUtility,
    AcwCustomMenu,
    AcwTheme,
    MenuItemTemplate
} from '@blk/acw-global-settings';
import {
    AXFHeaderMenuOption,
    LAUNCH_ABOUT_EXPLORE_HEADER_MENU,
    LAUNCH_EXPLORE_FAQS_HEADER_MENU,
    SEMANTIC_SEARCH_EXPLORE_HEADER_MENU
} from '@enums/axf-header.enum';
import {Theme} from '@blk/acw-utils';
import {AuxDefaultState} from '@blk/aladdin-web-components';
import {AladdinCopilotLauncher} from './aladdin-copilot-launcher';
import {CopilotChatService} from '@services/copilot-chat/copilot-chat.service.';
import {PgsChartKeyGeneratorService} from '@services/widget/pgs-chart-key-generator.service';
import {JobService} from './modules/export-hub/services/job.service';
import {ExportHubStore} from '@stores/export-hub.store';
import {badgeStyles, ExportHubUtils} from './modules/export-hub/utils/export-hub.utils';
import {
    EXPORT_HUB_JOB_STATES_REVERSED,
    PORTFOLIO,
    PORTFOLIOS, WIDGET, WIDGETS
} from './modules/export-hub/constants/export-hub.constants';
import {JobStatus} from './modules/export-hub/enums/job-status';
import {
    ExportHubJob,
    ExportHubJobExecutionHistory, ExportHubJobTaskExecutionHistory
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {DateUtils} from '@utils/date.utils';
import {FavoriteStatusUpdate} from '../../projects/explore-ui-core/src/favorite/interfaces/favorite-status-update.interface';
import {JobCreationParams} from './modules/export-hub/interfaces/job-creation-params.interface';

/**
 * App Component (root level)
 */
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AppComponent extends SubscribableComponent implements OnInit {
    readonly AuxValuePairLabelPositionEnum = AuxValuePairLabelPositionEnum;
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    readonly jobStatus = JobStatus;
    readonly auxBadgeTypeEnum = AuxBadgeTypeEnum;
    readonly badgeStyles = badgeStyles;
    readonly WORKSPACE_PREV_VERSION_MESSAGE = 'You are currently viewing a previous version of this workspace';

    appName = 'EXPLORE';

    // App is ready once metadata, definitions, mandates, and widget configs have loaded
    isAppReady = false;
    showIntro = true;
    showMain = false;
    isLoadFavoriteModalOpen = false;

    // Flag to show Admin modal for mandate settings
    adminAccess = false;

    workspace$: Observable<Workspace>;

    // toast notification
    @ViewChild('toastNotification', {static: true}) toastNotification: AuxNotificationGroup;

    // ngIf for modals
    isMandateSettingsModalOpen = false;
    isBatchSettingsModalOpen = false;
    isJobSchedulerModalOpen = false;
    isJobExecutionHistoriesModalOpen = false;
    isScheduleJobModalOpen = false;
    isSaveFavoriteModalOpen = false;
    isSaveReportModalOpen = false;
    isSaveWorkspaceModalOpen = false;
    isDeleteWorkspaceModalOpen = false;
    isFavoriteVersionLogModalOpen = false;
    isViewUsageModalOpen = false;
    isFavoriteStatusModalOpen = false;

    // userMetaData
    userMetaDataError: HttpErrorResponse | false;
    definitionsError: Error | false;
    definitionErrorFailMessage: string = ExploreConstants.EXPLORE_LOAD_FAIL_MESSAGE;
    access: boolean;
    aiChatAccess: boolean;
    localeSettingAccess: boolean;

    // loading
    isLoading$: Observable<boolean>;
    loadingMessageInfo$: Observable<LoadingMessageInfo>;
    quickSaveLoadingStatus$: BehaviorSubject<boolean>;

    // sidebar
    isNavDrawerOpen = false;

    // Sticky toolbar
    isVisibleToggledMainToolbar = false;
    scrollPastPortfolioSection = false;
    scrollPastReportSection = false;

    dialogContent$: Observable<ExploreDialogParam>;

    // Batch hide main container flag
    hideMainContainer = false;
    // Flag to show the BatchPDF toggle button that shows/hides the main app
    showBatchPDFToggleButton = false;

    // show alert count
    alertCount = 0;

    loadAladdinTemplate: boolean;

    isAladdinCopilotChatInitialized = false;
    isAladdinCopilotChatVisible = false;
    embeddedCopilot: boolean;

    // Report Type of Favorite Version View
    favoriteType: string;
    favoriteId: number|string;
    loadFavoriteCallBack: Function;

    // Scheduled job
    jobToBeEdited: ExportHubJob;
    jobSchedulerInProgress: boolean = false;
    jobExecutionHistory: ExportHubJobExecutionHistory[];



    showSemanticSearchModal = false;
    showLocaleSettingModal = false;
    // TODO: We'll define type model for jobs once the job scheduler backend is implemented
    dailyExecutionHistories: ExportHubJobExecutionHistory[] = [];
    scheduledJobPortfoliosCountMap = new Map<string, number>();
    scheduledJobWidgetsCountMap = new Map<string, number>();
    dailyExecutionJobsErrorMessage : string;

    favStatusUpdate: FavoriteStatusUpdate;

    /**
     * constructor
     */
    constructor(private loadingService: LoadingService, private userMetaDataService: UserMetaDataService, private definitionsService: DefinitionsService, private appStore: AppStore, private portfolioService: PortfolioService, private workspaceService: WorkspaceService,
                private widgetConfigFactory: WidgetConfigFactory, private mandateMappingService: MandateMappingService, private notificationService: NotificationService, private exploreCachingService: ExploreCachingService,
                private favoriteService: FavoriteService, private titleService: Title, private batchReportingService: BatchReportingService, private telemetryService: TelemetryService, private dateService: DateService, private pgsChartKeyGeneratorService: PgsChartKeyGeneratorService,
                private cdr: ChangeDetectorRef, protected chatService: CopilotChatService, private jobService: JobService, private exportHubStore: ExportHubStore) {
        super();
    }

    /**
     * Handle userPreference after fetch user meta data
     */
    private handleUserPreference(): void {
        // Now we can also hook up the events for the user preferences.
        // If the sidebar is shown/hidden then we need to update the floating header.
        UserMetaDataStore.getPreferenceSubject(UserPreference.NAVIGATION_DRAWER_OPEN)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(value => this.isNavDrawerOpen = value === 'true');

        // Subscribe to changes in the theme.
        UserMetaDataStore.getPreferenceSubject(UserPreference.THEME)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(value => {
                AcwTheme.getInstance()
                    .publish(value === ExploreConstants.THEME_LIGHT_MODE ? Theme.LIGHT : Theme.DARK, true);
            });

        AcwTheme.getInstance()
            .getActiveTheme()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(async (active: Theme) => {
                const saved = await AcwTheme.getInstance().getSavedTheme();
                if (active !== saved) {
                    const currentTheme = UserMetaDataStore.getPreferenceValue(UserPreference.THEME);
                    UserMetaDataStore.setPreferenceValue(
                        UserPreference.THEME,
                        currentTheme === ExploreConstants.THEME_LIGHT_MODE ? ExploreConstants.THEME_DARK_MODE : ExploreConstants.THEME_LIGHT_MODE
                    );
                }
            });

        // Now that the user has perms hook up the save preference.
        UserMetaDataStore.preferenceChangeSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(preference => {
                // If we didn't get a preference or it is not sticky then do not same it.
                if (!preference || !preference.isSticky) {
                    return;
                }
                this.userMetaDataService.setUserPreference(
                    preference.name,
                    CoreUserMetaDataStore.userMetaData.preferences.get(preference.name)
                );
            });
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        AppStore.isEBC = AppUtils.checkEbcEnvironment();
        if (AppStore.isEBC) {
            console.log('Explore is running in Electron');
        }

        AcwCustomMenu.getInstance().updateVisibility(ExploreConstants.PREFERENCES, false);

        // hide header menu options while access is checked
        this.initializeHeaderMenuOptions(false);
        // hide admin button while perms are checked
        this.updateMandateSettingsVisibilityState('axf-header__account', false);

        this.workspace$ = WorkspaceStore.getWorkspace$();
        this.isLoading$ = this.loadingService.isLoading$();
        this.loadingMessageInfo$ = this.loadingService.getLoadingMessageInfo$();
        this.quickSaveLoadingStatus$ = this.appStore.quickSaveLoadingStatus$;

        // Check if the user is on AWC
        AppStore.isAWC = (/AWC/g.test(navigator.userAgent));

        // Set the application name based on the url.
        this.titleService.setTitle(AppUtils.getExploreTitle());

        this.appName = this.titleService.getTitle().toUpperCase();

        const stopOnNoAccess$: Subject<void> = new Subject();

        // fetch userMetaData and handle access and user preferences
        this.userMetaDataService.fetchUserMetaData$().pipe(
            catchError((error) => {
                console.error('Error loading user metadata', error);
                this.userMetaDataError = error;
                return throwError(() => new Error(error));
            }),
            tap((payload: UserMetaData) => {
                // Set the flag to indicate that the user has access.
                this.access = !!payload.access;
                if (!this.access) {
                    stopOnNoAccess$.next();
                }
                // Hide or show the export hub icon based on token value
                const exportHubAccess = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_EXPORT_HUB_ENABLED) && payload.exportHubAccess;
                this.updateMandateSettingsVisibilityState('axf-header__global-utilities', exportHubAccess);

                this.initializeHeaderMenuOptions(true);

                // Set the flag to indicate that the user has access to ai chat
                this.aiChatAccess = payload.aiChatAccess;
                // Set the flag for if copilot should be embedded version
                this.embeddedCopilot = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_EMBEDDED_COPILOT_ENABLED);
                this.enableAladdinCopilot();

                // add token for localeSettingAccess
                this.localeSettingAccess = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_LOCALE_SETTING_ENABLED);
                if (this.localeSettingAccess) {
                    this.enablePreferencesMenu();
                }

                // Set the adminAccess flag to show Admin (mandate settings) in header
                this.adminAccess = payload.globalFavPerms;
                this.enableMandateSettings();

                AppStore.isEBCDownloaderEnabled = AppStore.isEBC && TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_FILE_DOWNLOADER_IN_EBC);

                if (!TokenUtils.isFeatureEnabled(TokenConstants.USER_PREFERENCE_DISABLED)) {
                    this.handleUserPreference();
                }
            }),
            // triggered when the user does not have access, breaks out of pipe
            takeUntil(stopOnNoAccess$),
            // load definitions and mandates in parallel now that tokens have been fetched
            switchMap((payload: UserMetaData) => forkJoin([this.initializeDefinitions$(payload.login), this.initializeMandates$()])),
            // widget configs can be loaded after definitions have finished
            switchMap(() => this.initializeWidgetConfigs$()),
            tap(() => {
                this.isAppReady = true;

                this.initializeWorkspaceOnAppReady();

                this.isAladdinCopilotChatInitialized = true;
            }),
            // Enable telemetry to track user actions once we have loaded both definitions and use metaData
            tap(() => this.telemetryService.initializeTelemetry(
                +CommonUtils.getURLParam(URLConstants.WORKSPACE), // Initialize with a null workspaceId
                CoreUserMetaDataStore.userMetaData.login,
                CoreUserMetaDataStore.userMetaData.userOrg,
                AppUtils.checkBrowser(),
                AppUtils.isTelemetryTrackingEnabled(),
                this.titleService.getTitle(),
                packageJson.version)
            ),
            // once definitions have loaded, determine what the max date (T-1 date) is
            switchMap(() => this.dateService.getMaxDateByCalendarCode$(null))
        ).subscribe((date) => {
            DateStore.defaultMaxDate$.next(date);
        });

        WorkspaceStore.getCurrentPortfolio$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((portfolio: Portfolio) => {
                this.showIntro = isNil(portfolio);
                this.showMain = !this.showIntro;
            });

        WorkspaceStore.workpadValidation$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(({workspace, currentWorkpad, currentPortfolio, currentReport, reloadReport}) => {
                const portfoliosToFetch = this.getPortfoliosToFetch(currentWorkpad, currentPortfolio);

                if (portfoliosToFetch && portfoliosToFetch.length) {
                    this.fetchPortInfoAndUpdateWorkpad(portfoliosToFetch, currentWorkpad, currentPortfolio, currentReport, workspace, reloadReport);
                } else {
                    this.pgsChartKeyGeneratorService.updatePGSChartKeys(isNil(currentPortfolio) ? currentWorkpad?.getAllPortfolios()[0] : currentPortfolio, currentWorkpad);
                    WorkspaceStore.updateCurrentWorkpad(currentWorkpad, currentPortfolio, currentReport);
                    if (workspace) {
                        WorkspaceStore.workspace$.next(workspace);
                        TelemetryService.updateWorkspaceId(WorkspaceStore.getWorkspace().id);
                        this.saveFavoriteToTelemetry(workspace);
                    }
                    if (reloadReport) {
                        // need to reload the report when switching between the portfolios in a report group
                        this.appStore.reloadReport();
                    }
                }
            });

        // open loadFavoriteModal on subscribe
        this.appStore.openLoadFavoriteModal$
            .pipe(
                takeUntil(this.ngUnsubscribe),
                filter((payload: LoadFavoriteAction) => !isNil(payload.type)))
            .subscribe(({type, sourceUniqueId}) => {
                // if  load fav modal is from opto settings, show aladdin templates
                if (type === FavoriteConstants.OPTO_SETTINGS) {
                    this.loadAladdinTemplate = true;
                }
                this.isLoadFavoriteModalOpen = true;
                this.appStore.isLoadFavoriteModalOpen$.next({
                    reason: ModalStateAction.MODAL_OPEN,
                    sourceUniqueId,
                    favoriteType: type
                });
            });

        // Open the batch settings modal on subscribe
        BatchReportingService.batchSettingsModalOpen$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((showModal) => {
            this.isBatchSettingsModalOpen = showModal;
        });

        // Open the Schedule a Job modal on subscribe
        this.exportHubStore.scheduleJobModalOpen$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((showModal) => {
            this.jobToBeEdited = showModal.isOpen ? showModal.job ?? new ExportHubJob() : showModal.job;
            this.isScheduleJobModalOpen = showModal.isOpen;
            this.isJobSchedulerModalOpen = false;
        });

        // Open the Schedule a Job modal on subscribe
        this.exportHubStore.jobExecutionHistoriesModalOpen$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((showModal) => {
            this.jobExecutionHistory = showModal.jobHistory;
            this.isJobExecutionHistoriesModalOpen = showModal.isOpen;
        });


        // Open the workspace VersionLog modal on subscribe
        CoreFavoriteVersioningStore.favoriteVersionLogAction$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((showModal) => {
            this.isFavoriteVersionLogModalOpen = showModal.isOpen;
            if (!isNil(showModal.type)) {
                this.favoriteType = showModal.type;
            }
            this.favoriteId = showModal.id;
            this.loadFavoriteCallBack = showModal?.loadFavoriteCallBack;
        });

        CoreFavoriteStore.favStatusUpdateAction$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((favStatus: FavoriteStatusUpdate) => {
            this.favStatusUpdate = favStatus;
            this.isFavoriteStatusModalOpen = !isNil(favStatus);
        });

        // Open the Main Users Link Log modal on subscribe
        CoreFavoriteVersioningStore.viewUsageTypeAction$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((showModal) => {
            this.favoriteId = showModal.id;
            this.isViewUsageModalOpen = showModal.isOpen;
            if (!isNil(showModal.type)) {
                this.favoriteType = CommonUtils.getInSentenceCase(showModal.type);
            }
        });

        this.appStore.saveFavoriteAction$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((saveFavoriteAction: SaveFavoriteAction) => {
            if (!saveFavoriteAction.type || !saveFavoriteAction.configToSave) {
                this.isSaveFavoriteModalOpen = false;
                return;
            }
            this.handleSaveFavorite(saveFavoriteAction.configToSave, saveFavoriteAction.type, saveFavoriteAction.action);
        });

        this.appStore.deleteFavoriteAction$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((deleteAction: DeleteFavoriteAction) => {
            this.isDeleteWorkspaceModalOpen = !(!deleteAction.type || !deleteAction.configToDelete);
        });

        /**
         * Open notification modal according to notification Style and message
         */
        this.notificationService.showToastr$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((notificationEvent: Notification | AuxNotificationGroupConfig) => {
                // track notification with telemetry
                if (notificationEvent instanceof Notification) {
                    UIErrorTelemetryContextUtils.notificationTrack(notificationEvent);
                    if (this.toastNotification.open) {
                        this.toastNotification.open(notificationEvent.toPlainObj());
                    }
                } else {
                    this.toastNotification.open(notificationEvent);
                }

            });

        this.dialogContent$ = this.notificationService.showDialog$();
    }

    private initializeDefinitions$(userName: string): Observable<any> {
        return this.definitionsService.fetchColumnDefinitions$(userName).pipe(
            catchError((error) => {
                console.error('Error loading definitions', error);
                this.definitionsError = error;
                return throwError(() => new Error(error));
            })
        );
    }

    private initializeMandates$(): Observable<any> {
        return this.mandateMappingService.initialize$().pipe(
            catchError((error) => {
                console.error('Error loading mandates', error);
                return throwError(() => new Error(error));
            })
        );
    }

    private initializeWidgetConfigs$(): Observable<any> {
        return this.widgetConfigFactory.loadChartConfig$().pipe(
            catchError((error) => {
                console.error('Error loading widget configs', error);
                return throwError(() => new Error(error));
            })
        );
    }

    protected initializeWorkspaceOnAppReady(): void {
        // Get the workspace to load for the user.
        //  - First check the URL if a workspace has been specified.
        //  - Then check the user favorite, unless the showIntro flag has been set.
        let workspaceId = CommonUtils.getURLParam(URLConstants.WORKSPACE);
        const portfolio = CommonUtils.getURLParam(URLConstants.PORTFOLIO);
        const reportId = CommonUtils.getURLParam(URLConstants.REPORT_ID);
        const date = CommonUtils.getURLParam(URLConstants.DATE);
        const dateValueObj = date ? new DateValue({date}) : null;


        if (!workspaceId && CommonUtils.getURLParam(URLConstants.SHOW_INTRO) !== 'true') {
            workspaceId = UserMetaDataStore.getPreferenceValue(UserPreference.DEFAULT_WORKSPACE);
        }

        this.showBatchPDFToggleButton = CommonUtils.getURLParam(URLConstants.SHOW_BATCH_PDF_TOGGLE_BUTTON) === 'true';

        if (workspaceId && !portfolio) {
            this.showIntro = false;
            this.workspaceService.loadFavoriteWorkspace(workspaceId, StatusConstants.LOADING_FAVORITE_WORKSPACE);
        }

        if (portfolio) {
            this.showIntro = false;
            if (!reportId) {
                this.workspaceService.loadPortfolioAndCreateWorkspace(PortfolioService.getPortfolioObject(new PortfolioSearchItem(portfolio), dateValueObj));
                return;
            }
            this.workspaceService.loadFavoriteReportWithUrl(reportId.split(','), PortfolioService.getPortfolioObject(new PortfolioSearchItem(portfolio), dateValueObj));
        }
    }

    /**
     * track current workspace in use with telemetry
     * @param workspace
     * @private
     */
    private saveFavoriteToTelemetry(workspace: Workspace) {
        if (workspace && workspace.id) {
            const workspaceConfigParameters = new FavoriteConfigParameters(workspace.id, FavoriteConstants.WORKSPACE.toString(), workspace.title, workspace.owner);
            TelemetryService.track(
                TelemetryActionConstants.FAVORITE.LOAD_FAVORITE,
                workspaceConfigParameters
            );
        }
    }

    /**
     * Handle save favorite
     */
    private handleSaveFavorite(favConfig: AbstractFavoriteConfig, type: string, action: string): void {
        if (CommonUtils.getURLParam(URLConstants.LEGACY_SAVING) !== 'true' && type === FavoriteConstants.WORKSPACE) {
            // new Save Workspace modal with favorite changes
            this.updateSaveWorkspaceState(true);
        } else if (CommonUtils.getURLParam(URLConstants.LEGACY_SAVING) !== 'true' && type === FavoriteConstants.LAYOUT) {
            // new Save Report modal with favorite changes
            this.updateSaveReportModalState(true);
        } else if (this.isQuickSaveEnabled(favConfig.owner, action)) {
            // if quickSave is enabled, call saveFavorite$ to save
            this.quickSaveFavorite(favConfig.createFavorite(type));
        } else {
            // if quickSave is not enabled, open saveFavoriteModal
            this.openSaveFavoriteModal();
        }
    }

    /**
     * Quick save favorite
     */
    private quickSaveFavorite(favToSave: Favorite): void {
        this.appStore.quickSaveLoadingStatus$.next(true);

        this.favoriteService
            .saveFavorite$(favToSave)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (response: SaveFavoriteResult) => {
                    if (response && response.status === DataRequestConstants.SUCCESS_RESPONSE) {
                        this.notificationService.success('Successfully saved ' + WorkspaceStore.getWorkspace().title);
                    }
                    this.appStore.quickSaveLoadingStatus$.next(false);
                },
                (error) => {
                    this.notificationService.error('Failed to save the favorite:  ' + WorkspaceStore.getWorkspace().title, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_QUICK_SAVE_FAVORITE_ERROR);
                    // if error, open saveFavoriteModal
                    this.openSaveFavoriteModal();
                    this.appStore.quickSaveLoadingStatus$.next(false);
                }
            );
    }

    /**
     * Open saveFavoriteModal
     */
    private openSaveFavoriteModal(): void {
        this.isSaveFavoriteModalOpen = true;
    }

    /**
     * Close save favorite modal, bound with emit event
     */
    closeSaveFavoriteModal(): void {
        this.appStore.saveFavoriteAction$.next(new SaveFavoriteAction(null, null, null, null, null));
    }

    /**
     * Close delete workspace modal, bound with emit event
     */
    closeDeleteWorkspaceModal(): void {
        this.appStore.deleteFavoriteAction$.next(new DeleteFavoriteAction(null, null, null, null));
    }

    /**
     * Quick save check for "Workspace" favorite
     * only allowing to quick save for current user's workspace
     */
    private isQuickSaveEnabled(owner: string, action: string): boolean {
        return action === FavoriteConstants.QUICK_SAVE && owner === CoreUserMetaDataStore.userMetaData.login;
    }

    /**
     * Get portfolios to fetch info
     */
    private getPortfoliosToFetch(currentWorkpad: BaseWorkpad, currentPortfolio: Portfolio): Portfolio[] {
        if (!currentWorkpad) {
            return;
        }
        const portIdSet = new Set<string>();
        // Loop through each report and get the portId's of all portfolios that are in a ComparisonConfig
        for (const comparisonConfig of currentWorkpad.comparisonConfigMap.values()) {
            for (const portId of comparisonConfig.portComparisonList) {
                portIdSet.add(portId);
            }
        }
        const portfolios = [];
        for (const portfolio of currentWorkpad.getAllPortfolios()) {
            // We only care if the portfolio hasn't been initialized
            if (!portfolio.isInitialized() && portfolio.portName) {
                // If it's a FlatWorkpad, just add it. There should only be one portfolio
                // Else, if it's the current portfolio (out of a ReportGroup's portfolios) OR it's a portfolio that's part of a comparison, then add it
                if (currentWorkpad instanceof FlatWorkpad || (currentPortfolio === portfolio || portIdSet.has(portfolio.portId))) {
                    portfolios.push(portfolio);
                }
            }
        }
        return portfolios;
    }

    /**
     * Fetch portfolio info and update current workpad
     */
    private fetchPortInfoAndUpdateWorkpad(portfoliosToFetch: Portfolio[], currentWorkpad: BaseWorkpad, currentPortfolio: Portfolio, currentReport: Report, workspace: Workspace, reloadReport?: boolean): void {
        const observableQueue = [];
        for (const port of portfoliosToFetch) {
            observableQueue.push(this.portfolioService.fetchPortfolioInformation$(port, { isLightVersion: true, includeMandate: true })
                .pipe(
                    catchError(error => {
                        console.error('Fetch portfolio information error', error);
                        this.notificationService.openDialog(
                            new ExploreDialogParam(
                                AlertConstants.TYPE.ALERT,
                                AlertConstants.HEADER.PORT_INFO_MISSING,
                                AlertConstants.BODY.PORT_INFO_MISSING,
                                AlertConstants.BTN.OK
                            ));
                        return of(error);
                    })
                )
            );
        }

        forkJoin(observableQueue).subscribe(() => {
            this.pgsChartKeyGeneratorService.updatePGSChartKeys(isNil(currentPortfolio) ? currentWorkpad?.getAllPortfolios()[0] : currentPortfolio, currentWorkpad);
            WorkspaceStore.updateCurrentWorkpad(currentWorkpad, currentPortfolio, currentReport);
            if (workspace) {
                WorkspaceStore.workspace$.next(workspace);
                TelemetryService.updateWorkspaceId(WorkspaceStore.getWorkspace().id);
            }
            if (reloadReport) {
                // need to reload the report when switching between the portfolios in a report group
                this.appStore.reloadReport();
            }
        });
    }

    /**
     * on mainContentScrollHandler
     * (on main only)
     */
    onMainContentScrollHandler(event: CustomEvent<AuxAppFrameMainContentScrollDetailInterface>): void {
        if (this.showMain) {
            this.isVisibleToggledMainToolbar = event.detail.isSticky;
            const portElement = document.getElementById('portfolio-input-container');
            const reportElement = document.getElementById('report-section-container');

            // There is a scroll buffer of 60 from the aux-app-frame component (event won't emit until scrollTop exceeds buffer)
            // and the portfolio-input-container element is 40px from the top. Therefore, we want to show the floating portfolio toolbar ASAP
            this.scrollPastPortfolioSection = event.detail.scrollTop - portElement.offsetTop > 20;
            this.scrollPastReportSection = event.detail.scrollTop - reportElement.offsetTop > 50;
        }
    }

    /**
     * On quick save workspace
     */
    onQuickSaveWorkspace(): void {
        this.appStore.saveFavoriteAction$.next(WorkspaceUtils.getSaveWorkspaceActionObject(WorkspaceStore.getWorkspace(), true));
    }

    /**
     * Opens/close mandate settings modal
     */
    private updateMandateSettingsModalState = (isOpen: boolean, markForCheck?: boolean): void => {
        this.isMandateSettingsModalOpen = isOpen;
        if (markForCheck) {
            this.cdr.markForCheck();
        }
    }

    /**
     * Close dialog, bound with eventEmitter from PromptDialogComponent
     */
    closeDialog(): void {
        this.notificationService.openDialog(null);
    }

    /**
     * Close load favorite modal, bound with emit event
     */
    closeLoadFavoriteModal(event?: ModalStateActionInfo): void {
        this.loadAladdinTemplate = false;
        this.isLoadFavoriteModalOpen = false;
        this.appStore.isLoadFavoriteModalOpen$.next(event);
    }

    /**
     * Close batch setting modal, bound with emit event
     */
    closeBatchSettingsModal(): void {
        this.isBatchSettingsModalOpen = false;
    }

    /**
     * Close Job Scheduler modal, bound with emit event
     */
    closeJobSchedulerModal(): void {
        this.isJobSchedulerModalOpen = false;
    }

    /**
     * Close Schedule Job modal, bound with emit event
     */
    closeScheduleJobModal(): void {
        this.isScheduleJobModalOpen = false;
    }
    /**
     * Create job and notify user with modal
     */
    createJobHandler(event: JobCreationParams): void {

        AppUtils.alertNotification(
            null,
            (event.isJobEdited) ? AlertConstants.HEADER.EDIT_JOB_SUCCESSFUL : AlertConstants.HEADER.SUCCESSFUL_JOB_CREATION,
            'The job, ' + event.jobName + ', has been successfully ' + (event.isJobEdited ? 'edited. ' : 'created. ') + 'You can review the job in the Job Scheduler.',
            AlertConstants.BTN.LAUNCH_JOB_SCHEDULER,
            AlertConstants.BTN.CLOSE,
            this.launchJobScheduler,
            this.notificationService,
            AlertConstants.TYPE.PROMPT
        );
    }

    /**
     * Launch job scheduler again with updated job details
     */
    launchJobScheduler = () => {
        this.openJobScheduler();
    }

     /**
      * Close View Usage modal, bound with emit event
      */
     closeViewUsageLinkModal(): void {
        this.isViewUsageModalOpen = false;
    }

    /**
     * Close favorite version modal, bound with emit event
     */
    closeFavoriteVersionModal(): void {
        this.isFavoriteVersionLogModalOpen = false;
        CoreFavoriteVersioningStore.favoriteVersionLogAction$.next({ id: null, type: null, isOpen: false });
    }

    /**
     * Initialize header menu options after definitions are loaded.
     */
    private initializeHeaderMenuOptions(hasAccess: boolean): void {
        // SubMenu Items
        const exploreFAQsUrl = CommonUtils.getApplicationUrl(CoreUrlConstants.EXPLORE_FAQS_PATH);
        this.enableAXFSubMenu(LAUNCH_EXPLORE_FAQS_HEADER_MENU, CommonUtils.launchApplicationCallBack(exploreFAQsUrl), hasAccess);
        const aboutExploreUrl = CommonUtils.getApplicationUrl(CoreUrlConstants.ABOUT_EXPLORE_PATH);
        this.enableAXFSubMenu(LAUNCH_ABOUT_EXPLORE_HEADER_MENU, CommonUtils.launchApplicationCallBack(aboutExploreUrl), hasAccess);
        this.enableAXFSubMenu(SEMANTIC_SEARCH_EXPLORE_HEADER_MENU, this.launchSemanticSearchCallBack, hasAccess);
    }

    /**
     * Launch Semantic Search Modal callback
     */
    launchSemanticSearchCallBack = () => {
        this.showSemanticSearchModal = true;
        this.cdr.detectChanges();
    }

    /**
     * Launch Locale Setting Modal callback
     */
    launchLocaleSettingCallBack = () => {
        this.showLocaleSettingModal = true;
        this.cdr.detectChanges();
    }

    /**
     * AddAcw accountUtility action: Open Mandate Settings
     */
    private enableAladdinCopilot(): void {
        AuxDefaultState.isChatEnabled = this.aiChatAccess && this.embeddedCopilot;
        if (!this.aiChatAccess) {
            return;
        }
        AcwCopilotUtility.getInstance().updateVisibility(true);
        AcwCopilotUtility.getInstance()
            .getCopilotUtilitySelection$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
                if (this.embeddedCopilot) {
                    this.openAladdinCopilot();
                } else {
                    AladdinCopilotLauncher.launchAladdinCopilotDeepLinking();
                }
            });
    }

    /** * Add AXF SubMenu Action */
    private enablePreferencesMenu(): void {
        AcwCustomMenu.getInstance().updateVisibility(ExploreConstants.PREFERENCES, true);
        AcwCustomMenu.getInstance().getCustomMenuSelection$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((item: MenuItemTemplate) => {
            const itemLabel = item?.label;
            if (itemLabel === ExploreConstants.PREFERENCES) {
                this.launchLocaleSettingCallBack();
            }
        });
    }

    /**
     * Launches Aladdin Copilot in Embedded mode
     */
    @HostListener('embeddedPanelClosed')
    openAladdinCopilot(): void {
        if (!this.isAppReady) { return; }
        this.isAladdinCopilotChatInitialized = true;
        this.isAladdinCopilotChatVisible = !this.isAladdinCopilotChatVisible;
        this.cdr.markForCheck();
    }

    /**
     * AddAcw accountUtility action: Open Mandate Settings
     */
    private enableMandateSettings(): void {
        if (!this.adminAccess) {
            return;
        }
        this.updateMandateSettingsVisibilityState('axf-header__account', true);
        AcwAccountUtility.getInstance()
            .getAccountUtilitySelection$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
                if (this.isAppReady) {
                    this.updateMandateSettingsModalState(true, true);
                }
            });
    }

    /**
     * Add AXF SubMenu Action
     */
    private enableAXFSubMenu(headerMenuOption: AXFHeaderMenuOption, callback: () => void, hasAccess = true): void {
        if (!hasAccess) {
            return;
        }
        AcwCustomMenu.getInstance().updateVisibility(headerMenuOption.DISPLAY, hasAccess);
        AcwCustomMenu.getInstance()
            .getCustomMenuSelection$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((item: MenuItemTemplate<{id: string}>) => {
                const itemId = item?.customProp?.id;
                if (hasAccess && itemId === headerMenuOption.ID) {
                    callback();
                }
            });
    }

    /**
     * Update mandateSettings visibility state
     *  Until updateVisibility api method is exposed we need to handle it from Explore side.
     */
    private updateMandateSettingsVisibilityState(elemClass:string, setVisible: boolean): void {
        if (setVisible) {
            document.getElementsByClassName(elemClass)[0].classList.remove('hide');
            return;
        }

        function waitForElement(selector) {
            return new Promise(resolve => {
                if (document.querySelector(selector)) {
                    return resolve(document.querySelector(selector));
                }

                const observer = new MutationObserver(() => {
                    if (document.querySelector(selector)) {
                        observer.disconnect();
                        resolve(document.querySelector(selector));
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            });
        }

        waitForElement('.' + elemClass).then(() => {
            document.getElementsByClassName(elemClass)[0].classList.add('hide');
        });
    }

    /**
     * beforeunload event handler to get confirmation from user for reload
     */
    @HostListener('window:beforeunload', ['$event']) showReloadPrompt(event: BeforeUnloadEvent): void {
        if (!AppUtils.getURLParamWithDefault(URLConstants.DISABLE_BACK_BUTTON_POPUP, false)) {
            event.preventDefault();
            event.returnValue = '';
        }
    }

    protected onDestroy() {
        this.exploreCachingService.clearIndexDbStorage();
    }

    /**
     * Batch debug method to run the currently configured batch report
     */
    runCurrentBatch() {
        this.batchReportingService.runBatchExport(BatchExportingStore.getCurrentBatchReport());
    }

    /**
     * Update saveReportModal state
     */
    updateSaveReportModalState(isOpen: boolean): void {
        this.isSaveReportModalOpen = isOpen;
    }

    /**
     * Opens/closes the Save Workspace modal
     */
    updateSaveWorkspaceState(isOpen: boolean): void {
        this.isSaveWorkspaceModalOpen = isOpen;
    }

    /**
     * Close semantic search modal
     */
    closeSemanticSearchModal() {
        this.showSemanticSearchModal = false;
    }

    /**
     * Close Locale Setting modal
     */
    closeLocaleSettingModal() {
        this.showLocaleSettingModal = false;
    }

    /**
     * Open the Job scheduler modal
     */
    openJobScheduler() {
        this.jobService.getAllScheduledJobs$().subscribe({
            next: (jobs: ExportHubJob[]) => {
                if (!isEmpty(jobs)) {
                    this.exportHubStore.populateJobsMap(jobs);
                    this.exportHubStore.jobExecutionHistoriesModalOpen$.next({isOpen: false, jobHistory: []});
                    this.isJobSchedulerModalOpen = true;
                } else {
                    this.notificationService.error('No scheduled jobs found');
                }
            },
            error: () => {
                this.notificationService.error('Failed to get the scheduled jobs');
            }
        });
    }

    /**
     * Refresh the daily status of the job scheduler
     */
    refreshDailyStatus(){
        this.jobSchedulerPopupOpened();
    }

    /**
     * Handler when the job scheduler popup is opened
     * @param event
     */
    jobSchedulerPopupOpened() {
        this.jobSchedulerInProgress = true;

        // Get scheduled jobs when popup is opened
        this.jobService.getDailyExecutionHistories$().subscribe({
            next: (executionJobHistories: ExportHubJobExecutionHistory[]) => {
                this.jobSchedulerInProgress = false;
                // return if no scheduled jobs
                if (isEmpty(executionJobHistories)) {
                    this.dailyExecutionJobsErrorMessage = 'No jobs currently running or recently completed.';
                    this.cdr.markForCheck();
                    return;
                }
                this.dailyExecutionHistories = executionJobHistories;
                this.countPortfoliosAndWidgets();
                this.cdr.markForCheck();
            },
            error: () => {
                this.jobSchedulerInProgress = false;
                this.dailyExecutionJobsErrorMessage = 'Failed to get daily execution history';
                this.cdr.markForCheck();
            }
        });
    }

    /**
     * Open the jobHistory execution histories modal
     * @param jobHistory
     */
    viewJobDetails(jobHistory: ExportHubJobExecutionHistory) {
        this.jobService.getJobExecutionHistoryById$(jobHistory.getJobId()).subscribe({
            next: (jobExecutionHistory: ExportHubJobExecutionHistory[]) => {
                if(isEmpty(jobExecutionHistory)){
                    this.notificationService.error('No job execution history found for ' + jobHistory.getJobName());
                    return;
                }
                this.jobExecutionHistory = jobExecutionHistory;
                this.isJobExecutionHistoriesModalOpen = true;
            },
            error: () => {
                this.notificationService.error('Failed to fetch job execution history for ' + jobHistory.getJobName());
            }
        });

    }

    /**
     * Close the job execution histories modal
     */
    closeJobExecutionHistoriesModal() {
        this.isJobExecutionHistoriesModalOpen = false;
    }

    /**
     * Count the portfolios and widgets for each job
     */
    private countPortfoliosAndWidgets() {
        this.dailyExecutionHistories.forEach((history: ExportHubJobExecutionHistory) => {
            let uniquePortfolios = new Set<string>();
            let uniqueWidgets = new Set<string>();
            history.getTaskExecutionHistoriesList().forEach((taskExecutionHistory: ExportHubJobTaskExecutionHistory) => {
                uniquePortfolios.add(taskExecutionHistory.getPortfolioId());
                uniqueWidgets.add(taskExecutionHistory.getWidgetId());
            });
            this.scheduledJobWidgetsCountMap.set(history.getJobId(), uniqueWidgets.size);
            this.scheduledJobPortfoliosCountMap.set(history.getJobId(), uniquePortfolios.size);
        });
    }



    protected readonly exportHubJobsStates = EXPORT_HUB_JOB_STATES_REVERSED;
    protected readonly DateUtils = DateUtils;
    protected readonly CommonConstants = CommonConstants;
    protected readonly PORTFOLIO = PORTFOLIO;
    protected readonly PORTFOLIOS = PORTFOLIOS;
    protected readonly WIDGETS = WIDGETS;
    protected readonly WIDGET = WIDGET;
    protected readonly ExportHubJob = ExportHubJob;
    protected readonly ExportHubUtils = ExportHubUtils;
}
