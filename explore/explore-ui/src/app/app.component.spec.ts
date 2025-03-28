import {ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {BehaviorSubject, combineLatest, of, throwError} from 'rxjs';
import {FavoriteConstants} from '@constants/favorite.constants';

import {AppComponent} from './app.component';
import {UserMetaDataService} from './modules/metadata/user-meta-data/user-meta-data.service';
import {LoadingService} from './modules/loading/service/loading.service';
import {DefinitionsService} from './modules/metadata/definitions/definitions.service';
import {UserMetaDataStore, WorkspaceStore} from './stores';
import {WidgetConfigFactory} from './factories';
import {
    FavoriteService,
    MandateMappingService,
    NotificationService,
    PortfolioService,
    WorkspaceService
} from './shared/services';
import {AppUtils} from './utils';
import {URLConstants} from './constants';
import {AppStore} from './app.store';
import {Workspace} from '@models/workspace/workspace.model';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {By} from '@angular/platform-browser';
import {ExploreCachingService} from '@services/widget-data/explore-caching.service';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {
    AlertConstants,
    CommonUtils,
    CoreFavoriteVersioningStore,
    CoreUserMetaDataStore,
    DateService,
    ExploreDialogParam,
    FavoriteType,
    PortfolioDefaults,
    TelemetryService,
    UserMetaData
} from '@blk/explore-ui-core';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {BatchReportingService} from '@services/batch-reporting/batch-reporting.service';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {Report} from '@models/workspace/report.model';
import {DeleteFavoriteAction} from '@models/favorite/delete-favorite-action.model';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {ModalStateActionInfo} from '@models/favorite/modal-state-action-info.interface';
import {CopilotChatService} from '@services/copilot-chat/copilot-chat.service.';
import {AladdinCopilotLauncher} from './aladdin-copilot-launcher';
import {AcwCopilotUtility} from '@blk/acw-global-settings';
import {PgsChartKeyGeneratorService} from '@services/widget/pgs-chart-key-generator.service';
import {JobService} from './modules/export-hub/services/job.service';
import {ExportHubStore} from '@stores/export-hub.store';
import {
    ExportHubJob, ExportHubJobExecutionHistory, ExportHubJobTaskExecutionHistory
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {ScheduleJobModalParams} from './modules/export-hub/types/schedule-job-modal-params.interface';
import {JobExecutionHistoryParamsInterface} from './modules/export-hub/types/job-execution-history-params.interface';

describe('AppComponent', () => {
    let fixture: ComponentFixture<AppComponent>;
    let component;

    const saveFavoriteResponse = {
        'message': 'Successfully saved the favorite',
        'data': {
            'owner': 'seakim',
            'data': '{"configType":"workspace","workpads":[{"configType":"flat-workpad","reports":[{"configType":"WIDGETS_REPORT","widgets":[],"title":"Report"}],"portfolios":[{"configType":"portfolio","ticker":"IP","benchmark":{"type":"RISK","order":1,"name":"LEH_AGG"}}]}],"title":"Untitled Workspace"}',
            'listOrder': 23,
            'list_order': 23,
            'description': '',
            'id': 1719487,
            'title': 'Untitled Workspace',
            'type': 'WORKSPACE',
            'tool': 'Explore',
            'isSlim': false
        },
        'status': 'SUCCESS'
    };

    const favoriteServiceStub = {
        saveFavorite$: jest.fn(() => of(saveFavoriteResponse))
    };

    const chatServiceStub = {};

    const workspaceServiceStub = {
        loadFavoriteWorkspace: jest.fn(),
        loadPortfolioAndCreateWorkspace: jest.fn(),
        loadFavoriteReportWithUrl: jest.fn()
    };

    const userMetaDataServiceStub = {
        fetchUserMetaData$: jest.fn(() => {
            const userMetaDataResponse = new UserMetaData();
            userMetaDataResponse.access = true;
            userMetaDataResponse.pricePopupAccess = true;
            userMetaDataResponse.launchApps = ['SECURITY_MASTER', 'ANSER', 'ALADDIN_VIEW'];
            userMetaDataResponse.login = 'rolin';
            userMetaDataResponse.globalFavPerms = false;
            userMetaDataResponse.perfDataPerms = true;
            userMetaDataResponse.sharedFavPerms = true;
            return of(userMetaDataResponse);
        }),
        setUserPreference: jest.fn()
    };

    const definitionServiceStub = {
        fetchColumnDefinitions$: jest.fn(() => of({}))
    };

    const widgetConfigFactoryStub = {
        loadChartConfig$: jest.fn(() => of({}))
    };

    const loadingServiceStub = {
        isLoading$: jest.fn(),
        getLoadingMessageInfo$: jest.fn()
    };

    const mandateMappingServiceStub = {
        initialize$: jest.fn(() => of({})),
    };

    const notificationServiceStub = {
        warning: jest.fn(),
        showDialog$: jest.fn(() => of(undefined)),
        showToastr$: jest.fn(() => of(undefined)),
        openDialog: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
        showUserSessionInfoMap$: jest.fn(() => of(undefined))
    };

    const toastNotificationStb = {
        open: jest.fn(),
        close: jest.fn()
    };

    const appStoreStub: Partial<AppStore> = {
        saveFavoriteAction$: new BehaviorSubject(new SaveFavoriteAction(null, null, null, null, null, null)),
        deleteFavoriteAction$: new BehaviorSubject(new DeleteFavoriteAction(null, null, null, null, null)),
        openLoadFavoriteModal$: new BehaviorSubject(new LoadFavoriteAction({
            type: null,
            treeType: null,
            displayName: null,
            ignoreEnterpriseTree: null,
            callback: null,
            headerDisplayName: null
        })),
        quickSaveLoadingStatus$: new BehaviorSubject(false),
        reloadReport: jest.fn(),
        isLoadFavoriteModalOpen$: new BehaviorSubject({
            favoriteType: null,
            reason: null,
            sourceUniqueId: null
        })
    };

    const portfolioServiceStub = {
        fetchPortfolioInformation$: jest.fn(() => of({})),
    };

    const exploreCachingServiceStub = {
        clearIndexDbStorage: jest.fn()
    };

    const batchReportingServiceStub = {
        batchSettingsModalOpen$: jest.fn(() => of(undefined))
    };

    const favoriteVersionLogActionStub = {
        favoriteVersionLogAction$: jest.fn(),
        viewUsageTypeAction$: jest.fn()
    };

    const telemetryServiceStub = {
        initializeTelemetry: jest.fn()
    };

    const dateServiceStub = {
        parseDateString$: jest.fn(() => of(new Date(2023, 10, 31))),
        getMaxDateByCalendarCode$: jest.fn(() => of(new Date(2023, 10, 31)))
    };

    const pgsChartKeyGeneratorStub = {
        updatePGSChartKeys: jest.fn()
    };

    const  jobServiceStub = {
        getDailyExecutionHistories$: jest.fn(),
        getJobExecutionHistoryById$: jest.fn(),
        getAllScheduledJobs$: jest.fn(),
        cancel$: jest.fn()
    };

    const exportHubStoreStub = {
        getScheduledJobs: jest.fn(),
        scheduleJobModalOpen$: new BehaviorSubject({isOpen: false} as ScheduleJobModalParams),
        scheduledJobsMap : new Map<number, ExportHubJob>(),
        jobExecutionHistoriesModalOpen$: new BehaviorSubject({isOpen: false, jobHistory: null} as JobExecutionHistoryParamsInterface),
    };

    const cdrStub = {
        detectChanges: jest.fn()
    }

    let userMetaData;
    let userMetaDataError;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                AppComponent
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: LoadingService, useValue: loadingServiceStub},
                {provide: UserMetaDataService, useValue: userMetaDataServiceStub},
                {provide: DefinitionsService, useValue: definitionServiceStub},
                {provide: AppStore, useValue: appStoreStub},
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: PortfolioService, useValue: portfolioServiceStub},
                {provide: WorkspaceService, useValue: workspaceServiceStub},
                {provide: WidgetConfigFactory, useValue: widgetConfigFactoryStub},
                {provide: MandateMappingService, useValue: mandateMappingServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: ExploreCachingService, useValue: exploreCachingServiceStub},
                {provide: BatchReportingService, useValue: batchReportingServiceStub},
                {provide: CoreFavoriteVersioningStore, useValue: favoriteVersionLogActionStub},
                {provide: TelemetryService, useValue: telemetryServiceStub},
                {provide: DateService, useValue: dateServiceStub},
                {provide: CopilotChatService, useValue: chatServiceStub},
                {provide: PgsChartKeyGeneratorService, useValue: pgsChartKeyGeneratorStub},
                {provide: JobService, useValue: jobServiceStub},
                {provide: ExportHubStore, useValue: exportHubStoreStub},
                { provide: ChangeDetectorRef, useValue: cdrStub }
            ]
        });

        fixture = TestBed.createComponent(AppComponent);
        component = fixture.debugElement.componentInstance;
        component.toastNotification = toastNotificationStb;
        WorkspaceStore.init();

        userMetaData = new UserMetaData();
        userMetaData.access = true;
        userMetaData.pricePopupAccess = true;
        userMetaData.launchApps = ['SECURITY_MASTER', 'ANSER', 'ALADDIN_VIEW'];
        userMetaData.login = 'seakim';
        userMetaData.globalFavPerms = true;
        userMetaData.perfDataPerms = true;
        userMetaData.sharedFavPerms = true;
        userMetaData.aiChatAccess = false;

        CoreFavoriteVersioningStore.viewUsageTypeAction$.next({id: 0, type: FavoriteType.WORKSPACE,isOpen: false});
        CoreUserMetaDataStore.userMetaData = userMetaData;
        userMetaDataError = new HttpErrorResponse({
            error: 'Authentication credentials are required',
            statusText: 'Unauthorized'
        });
    });

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it('should match html template', () => {
        // Testing with globalFavPerms = false. Admin button should not show
        component.ngOnInit();
        fixture.detectChanges();
        expect(fixture.debugElement.nativeElement.querySelector('aux-app-frame')).toMatchSnapshot();
    });

    it('should destroy', () => {
        jest.spyOn(exploreCachingServiceStub, 'clearIndexDbStorage');
        component.ngOnDestroy();
        expect(exploreCachingServiceStub.clearIndexDbStorage).toHaveBeenCalled();
    });

    it('should display workspace owner when opening a saved workspace', () => {
        jest.spyOn(UserMetaDataStore, 'getPreferenceSubject').mockReturnValue(new BehaviorSubject('false'));
        const workspace = new Workspace();
        workspace.title = 'example workspace';
        workspace.owner = 'tilee';
        workspace.addWorkpads(new FlatWorkpad());
        WorkspaceStore.workspace$.next(workspace);

        expect(fixture.debugElement.query(By.css('.workspace-top-header-author'))).toBeFalsy();

        component.isAppReady = true;
        component.isNavDrawerOpen = false;
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('.workspace-top-header-author'))).toBeTruthy();
    });

    // Enable it back once we remove updateMandateSettingsVisibilityState the workaround for AXF api method: updateVisibility for AcwAccountUtility.
    xdescribe('Loading Test', () => {
        it('should show loading', (done) => {
            jest.spyOn(component['userMetaDataService'], 'fetchUserMetaData$').mockImplementation(() => of(userMetaData));
            jest.spyOn(component['loadingService'], 'isLoading$').mockReturnValue(of(true));
            jest.spyOn(component['loadingService'], 'getLoadingMessageInfo$').mockReturnValue(of('Checking Access'));
            component.ngOnInit();
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(fixture.debugElement.nativeElement.querySelector('.loading-area')).toBeTruthy();
                combineLatest([component.isLoading$, component.loadingMessageInfo$])
                    .subscribe(([isLoading, loadingMessage]) => {
                        expect(isLoading).toEqual(true);
                        expect(loadingMessage).toEqual('Checking Access');
                        done();
                    });
            });
        });
        jest.clearAllMocks();
    });

    it('tests isLoadFavoriteModalOpen$ open', async () => {
        jest.spyOn(appStoreStub.isLoadFavoriteModalOpen$, 'next').mockImplementationOnce(_a => {
        });
        fixture.detectChanges();
        appStoreStub.openLoadFavoriteModal$.next(new LoadFavoriteAction({
            type: 'TYPE',
            treeType: null,
            displayName: null,
            ignoreEnterpriseTree: null,
            callback: null,
            headerDisplayName: null
        }));
        await fixture.whenStable();
        expect(appStoreStub.isLoadFavoriteModalOpen$.next).toHaveBeenLastCalledWith({
            favoriteType: 'TYPE',
            reason: 2,
            sourceUniqueId: undefined
        });
    });

    it('tests scheduleJobModalOpen$ open', async () => {
        component.jobToBeEdited = null;
        exportHubStoreStub.scheduleJobModalOpen$.next({isOpen: false});
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.isScheduleJobModalOpen).toBeFalsy();
        expect(component.jobToBeEdited).toBeFalsy()

        component.jobToBeEdited = null;
        exportHubStoreStub.scheduleJobModalOpen$.next({isOpen: true});
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.isScheduleJobModalOpen).toBeTruthy();
        expect(component.jobToBeEdited).toBeTruthy();

        component.jobToBeEdited = null;
        const job = new ExportHubJob();
        exportHubStoreStub.scheduleJobModalOpen$.next({isOpen: true, job});
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.isScheduleJobModalOpen).toBeTruthy();
        expect(component.jobToBeEdited).toEqual(job);
    });

    it('should update showSemanticSearchModal when launchSemanticSearchCallBack is called', () => {
        expect(component.showSemanticSearchModal).toBeFalsy();
        component.launchSemanticSearchCallBack();
        expect(component.showSemanticSearchModal).toBeTruthy();
    });

    it('should update showSemanticSearchModal when closeSemanticSearchModal is called', () => {
        component.showSemanticSearchModal = true;
        component.closeSemanticSearchModal();
        expect(component.showSemanticSearchModal).toBeFalsy();
    });

    describe('workpadValidation$ Test', () => {
        const workspace = new Workspace();
        workspace.owner = '_ADMIN';
        workspace.userPermGrps = ['Test EPG'];
        const workpad1 = new FlatWorkpad();
        const workpad2 = new ReportGroup();
        const port1 = new Portfolio('PEP');
        const port2 = new Portfolio('IP');
        const port3 = new Portfolio('CORE-HQ');
        port1.portfolioDefaults = new PortfolioDefaults();
        workpad1.portfolio = port1;
        workpad2.portfolios = [port1, port2, port3];
        workspace.workpads = [workpad1, workpad2];

        describe('getPortfoliosToFetch Test', () => {
            it('should not return anything if workpad is not passed', () => {
                expect(component['getPortfoliosToFetch'](null)).toBeUndefined();
            });
            it('should check and return all portfolios to fetch', () => {
                workpad2.reports.push(new Report('report 1'));
                const comparisonConfig = new ComparisonConfig();
                comparisonConfig.portComparisonList = [port1.portId, port2.portId];
                const comparisonConfigMap = new Map<number, ComparisonConfig>();
                comparisonConfigMap.set(1, comparisonConfig);
                workpad2.comparisonConfigMap = comparisonConfigMap;
                expect(component['getPortfoliosToFetch'](workpad2, port1)).toEqual([port2]);
            });
        });

        describe('fetchPortInfoAndUpdateWorkpad Test', () => {
            it('should fetch port info for all portfolios passed in and update accordingly', () => {
                workpad2.activeReport = new Report();
                jest.spyOn(component['portfolioService'], 'fetchPortfolioInformation$').mockReturnValue(of({}));
                jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad');
                jest.spyOn(WorkspaceStore.workspace$, 'next');
                component['fetchPortInfoAndUpdateWorkpad']([port2, port3], workpad2, port1, null, workspace);

                expect(component['portfolioService'].fetchPortfolioInformation$).toHaveBeenCalledTimes(2);
                expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalledWith(workpad2, port1, null);
                expect(WorkspaceStore.workspace$.next).toHaveBeenCalledWith(workspace);
            });

            it('Tests fetchPortInfoAndUpdateWorkpad - should open dialog with alert if error occured while fetching portfolio information', async () => {
                jest.spyOn(component['portfolioService'], 'fetchPortfolioInformation$').mockReturnValue(throwError('error'));
                jest.spyOn(component['notificationService'], 'openDialog');
                component['fetchPortInfoAndUpdateWorkpad']([port2], workpad2, port1, null, workspace);
                expect(component['notificationService'].openDialog).toHaveBeenCalledWith(new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT,
                    AlertConstants.HEADER.PORT_INFO_MISSING,
                    AlertConstants.BODY.PORT_INFO_MISSING,
                    AlertConstants.BTN.OK
                ));
            });
        });

        it('should validateWorkpadAndUpdate - if portfoliosToFetch', () => {
            jest.spyOn(component['userMetaDataService'], 'fetchUserMetaData$').mockReturnValue(of({}));
            jest.spyOn(component, 'fetchPortInfoAndUpdateWorkpad');
            component.ngOnInit();
            BatchReportingService.batchSettingsModalOpen$.next(true);
            CoreFavoriteVersioningStore.favoriteVersionLogAction$.next({
                id: 12345,
                type: 'Workspace',
                isOpen: true
            });
            CoreFavoriteVersioningStore.viewUsageTypeAction$.next({
                id: 54321,
                type: 'Workspace',
                isOpen: true
            });
            expect(component.isBatchSettingsModalOpen).toBeTruthy();

            const comparisonConfig = new ComparisonConfig();
            comparisonConfig.portComparisonList = [port1.portId, port2.portId];
            const comparisonConfigMap = new Map<number, ComparisonConfig>();
            comparisonConfigMap.set(1, comparisonConfig);

            workpad2.reports.push(new Report('report 1'));
            workpad2.comparisonConfigMap = comparisonConfigMap;
            WorkspaceStore.currentWorkpad$.next(workpad2);
            WorkspaceStore.validateWorkpadAndUpdate(workpad2, port1, null, workspace);
            expect(component['fetchPortInfoAndUpdateWorkpad']).toHaveBeenCalledWith([port2], workpad2, port1, null, workspace, undefined);
        });

        it('should validateWorkpadAndUpdate - if NO portfoliosToFetch', () => {
            jest.spyOn(component['userMetaDataService'], 'fetchUserMetaData$').mockReturnValue(of({}));
            jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad');
            jest.spyOn(WorkspaceStore.workspace$, 'next');
            component.ngOnInit();
            WorkspaceStore.validateWorkpadAndUpdate(workpad1, port1, null, workspace);

            expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalledWith(workpad1, port1, null);
            expect(WorkspaceStore.workspace$.next).toHaveBeenCalledWith(workspace);
        });

        it('should validateWorkpadAndUpdate - should reload report', () => {
            jest.spyOn(component['userMetaDataService'], 'fetchUserMetaData$').mockReturnValue(of({}));
            jest.spyOn(component['appStore'], 'reloadReport');
            component.ngOnInit();
            WorkspaceStore.validateWorkpadAndUpdate(workpad1, port1, null, null, false);
            expect(component['appStore'].reloadReport).not.toHaveBeenCalledWith();

            WorkspaceStore.validateWorkpadAndUpdate(workpad1, port1, null, null, true);
            expect(component['appStore'].reloadReport).toHaveBeenCalledWith();
        });
    });

    describe('openSaveFavoriteModal/closeSaveFavoriteModal Test', () => {
        it('should set isSaveFavoriteModalOpened to true and show app-save-favorite-modal in the html template', () => {
            component['openSaveFavoriteModal']();

            expect(component.isSaveFavoriteModalOpen).toBeTruthy();
        });

        it('should set isSaveFavoriteModalOpened to false and remove app-save-favorite-modal in the html template', () => {
            component.closeSaveFavoriteModal();

            expect(component.isSaveFavoriteModalOpen).toBeFalsy();
        });
    });

    describe('isQuickSaveEnabled Test', () => {
        it('should return true if the action is QUICK_SAVE and favToSave belongs to current user', () => {
            const workspace = new Workspace();
            const favToSave = workspace.createFavorite('WORKSPACE');
            expect(component['isQuickSaveEnabled'](favToSave.owner, 'QUICK_SAVE')).toBeFalsy();

            favToSave.owner = 'aaanand';
            expect(component['isQuickSaveEnabled'](favToSave.owner, 'QUICK_SAVE')).toBeFalsy();

            favToSave.owner = 'seakim';
            expect(component['isQuickSaveEnabled'](favToSave.owner, undefined)).toBeFalsy();
            favToSave.owner = 'seakim';
            expect(component['isQuickSaveEnabled'](favToSave.owner, 'QUICK_SAVE')).toBeTruthy();
        });
    });

    describe('handleSaveFavorite Test', () => {
        it('should notify success after save favorite', () => {
            jest.spyOn(CommonUtils, 'getURLParam').mockReturnValue('true');
            jest.spyOn<any, string>(component, 'isQuickSaveEnabled').mockReturnValue(true);
            jest.spyOn(component['notificationService'], 'success');
            const workspace = new Workspace();
            workspace.title = 'saved workspace';
            WorkspaceStore.workspace$.next(workspace);
            component['handleSaveFavorite'](workspace, workspace.owner, 'WORKSPACE', 'QUICK_SAVE');

            expect(component['notificationService'].success).toHaveBeenCalledWith('Successfully saved saved workspace');
        });

        it('should notify error if save favorite failed, and then open saveFavoriteModal', () => {
            jest.spyOn(CommonUtils, 'getURLParam').mockReturnValue('true');
            jest.spyOn<any, string>(component, 'isQuickSaveEnabled').mockReturnValue(true);
            jest.spyOn(component['favoriteService'], 'saveFavorite$').mockReturnValue(throwError('error'));
            jest.spyOn(component['notificationService'], 'error');
            jest.spyOn<any, string>(component, 'openSaveFavoriteModal');
            const workspace = new Workspace();
            workspace.title = 'saved workspace';
            WorkspaceStore.workspace$.next(workspace);
            component['handleSaveFavorite'](workspace, workspace.owner, 'WORKSPACE', 'QUICK_SAVE');

            expect(component['notificationService'].error).toHaveBeenCalled();
            expect(component['openSaveFavoriteModal']).toHaveBeenCalled();
        });

        it('should open saveFavoriteModal if isQuickSaveEnabled is false', () => {
            jest.spyOn<any, string>(component, 'isQuickSaveEnabled').mockReturnValue(false);
            jest.spyOn(component['favoriteService'], 'saveFavorite$');
            jest.spyOn<any, string>(component, 'openSaveFavoriteModal');
            const workspace = new Workspace();
            component['handleSaveFavorite'](workspace.createFavorite('WORKSPACE'), 'QUICK_SAVE');
        });

        it('should call updateSaveWorkspaceState(true) if LEGACY_SAVING is not true and type is WORKSPACE', () => {
            jest.spyOn(CommonUtils, 'getURLParam').mockReturnValue('false');
            jest.spyOn(component, 'updateSaveWorkspaceState');
            const workspace = new Workspace();
            component['handleSaveFavorite'](workspace, FavoriteConstants.WORKSPACE, 'action');

            expect(component.updateSaveWorkspaceState).toHaveBeenCalledWith(true);
        });

        it('should call updateSaveReportModalState(true) if LEGACY_SAVING is not true and type is LAYOUT', () => {
            jest.spyOn(CommonUtils, 'getURLParam').mockReturnValue('false');
            jest.spyOn(component, 'updateSaveReportModalState');
            const workspace = new Workspace();
            component['handleSaveFavorite'](workspace, FavoriteConstants.LAYOUT, 'action');

            expect(component.updateSaveReportModalState).toHaveBeenCalledWith(true);
        });
    });

    describe('Workspace Test', () => {
        it('should display main slot', () => {
            jest.spyOn(component['userMetaDataService'], 'fetchUserMetaData$').mockImplementation(() => of(userMetaData));
            jest.spyOn(component['loadingService'], 'isLoading$').mockReturnValue(of(false));

            component.isAppReady = true;
            component.ngOnInit();
            fixture.detectChanges();

            expect(fixture.debugElement.nativeElement.querySelector('.main-slot')).toBeTruthy();
        });
    });

    describe('onInit Test', () => {
        it('should show userMetaDataError if error on fetching userMetaData', () => {
            jest.spyOn(component['userMetaDataService'], 'fetchUserMetaData$').mockImplementation(() => throwError(userMetaDataError));
            component.ngOnInit();
            fixture.detectChanges();

            expect(fixture.debugElement.nativeElement.querySelector('#user-meta-data-error')).toBeTruthy();
            expect(fixture.debugElement.nativeElement.querySelector('h1').textContent).toBe('HttpErrorResponse');
        });

        it('should show Access Denied if user does not have access', () => {
            const noAccess = new UserMetaData();
            noAccess.access = false;
            noAccess.pricePopupAccess = false;
            noAccess.launchApps = [];
            noAccess.login = 'seakim';
            noAccess.globalFavPerms = false;
            noAccess.perfDataPerms = false;
            noAccess.sharedFavPerms = false;
            noAccess.aiChatAccess = false;

            jest.spyOn(component['userMetaDataService'], 'fetchUserMetaData$').mockImplementation(() => of(noAccess));
            component.ngOnInit();
            fixture.detectChanges();

            expect(fixture.debugElement.nativeElement.querySelector('#no-access')).toBeTruthy();
            expect(fixture.debugElement.nativeElement.querySelector('h1').textContent).toBe('Access Denied');
        });

        it('should call fetchColumnDefinitions$() after checking user has access', () => {
            jest.spyOn(component['userMetaDataService'], 'fetchUserMetaData$').mockImplementation(() => of(userMetaData));
            component.ngOnInit();

            expect(component['definitionsService'].fetchColumnDefinitions$).toHaveBeenCalled();
        });

        it('should call loadFavoriteWorkspace() if workspaceId is in the URL Params', () => {
            jest.spyOn(CommonUtils, 'getURLParam').mockImplementation((param: string) => {
                return param === URLConstants.WORKSPACE ? '1570516' : undefined;
            });
            jest.spyOn(component['workspaceService'], 'loadFavoriteWorkspace');
            jest.spyOn(component['userMetaDataService'], 'fetchUserMetaData$').mockImplementation(() => of(userMetaData));
            component.initializeWorkspaceOnAppReady();

            expect(component['workspaceService'].loadFavoriteWorkspace).toHaveBeenCalled();
        });

        it('should call loadPortfolioAndCreateWorkspace() if portfolio and no reportId is in the URL Params', () => {
            jest.spyOn(CommonUtils, 'getURLParam').mockImplementation((param: string) => {
                return param === URLConstants.PORTFOLIO ? 'PEP' : undefined;
            });
            jest.spyOn(component['workspaceService'], 'loadPortfolioAndCreateWorkspace');
            jest.spyOn(component['userMetaDataService'], 'fetchUserMetaData$').mockImplementation(() => of(userMetaData));
            component.initializeWorkspaceOnAppReady();

            expect(component['workspaceService'].loadPortfolioAndCreateWorkspace).toHaveBeenCalled();
        });

        it('should call loadFavoriteReportWithUrl() if portfolio and reportId is in the URL Params', () => {
            jest.spyOn(CommonUtils, 'getURLParam').mockImplementation((param: string) => {
                if (param === URLConstants.PORTFOLIO) {
                    return 'PEP';
                } else if (param === URLConstants.REPORT_ID) {
                    return '1234';
                }
                return undefined;
            });
            jest.spyOn(component['workspaceService'], 'loadFavoriteReportWithUrl');
            jest.spyOn(component['userMetaDataService'], 'fetchUserMetaData$').mockImplementation(() => of(userMetaData));
            component.initializeWorkspaceOnAppReady();

            expect(component['workspaceService'].loadFavoriteReportWithUrl).toHaveBeenCalled();
        });

        it('should subscribe to showDialog$ and update isDialogOpened to open dialog', () => {
            const subscription = component.notificationService.showDialog$().subscribe(() => {
                expect(component.isDialogOpen).toBeTruthy();
            });
            subscription.unsubscribe();
        });

        it('should subscribe to saveFavoriteAction$ and handle save favorite', () => {
            jest.spyOn(component, 'handleSaveFavorite');
            component.ngOnInit();
            component['appStore'].saveFavoriteAction$.next(new SaveFavoriteAction(new Workspace(), 'owner', 'type', 'action'));
            expect(component.handleSaveFavorite).toHaveBeenCalledWith({'title': 'Untitled Workspace', 'workpads': []}, 'type', undefined);
        });
    });

    describe('closeDialog Test', () => {
        it('should close dialog', () => {
            jest.spyOn(component['notificationService'], 'openDialog');
            component.closeDialog();

            expect(component['notificationService'].openDialog).toHaveBeenCalledWith(null);
        });
    });

    describe('onQuickSaveWorkspace Test', () => {
        const workspace = new Workspace();

        it('should quick save workspace', () => {
            workspace.id = 12345;
            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(workspace);
            jest.spyOn(component['appStore'].saveFavoriteAction$, 'next');
            component.onQuickSaveWorkspace();

            expect(component['appStore'].saveFavoriteAction$.next).toHaveBeenCalledWith(
                new SaveFavoriteAction(
                    WorkspaceStore.getWorkspace(),
                    FavoriteConstants.WORKSPACE_PASCAL,
                    FavoriteConstants.WORKSPACE,
                    FavoriteConstants.WORKSPACE_FOLDER,
                    undefined,
                    FavoriteConstants.QUICK_SAVE
                ));
        });

        it('should NOT quick save and open the save modal if workspace does not have an id', () => {
            delete workspace.id;

            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(workspace);
            jest.spyOn(component['appStore'].saveFavoriteAction$, 'next');
            component.onQuickSaveWorkspace();

            expect(component['appStore'].saveFavoriteAction$.next).toHaveBeenCalledWith(
                new SaveFavoriteAction(
                    WorkspaceStore.getWorkspace(),
                    FavoriteConstants.WORKSPACE_PASCAL,
                    FavoriteConstants.WORKSPACE,
                    FavoriteConstants.WORKSPACE_FOLDER
                ));
        });
    });

    describe('closeLoadFavoriteModal Test', () => {
        it('should set isLoadFavoriteModalOpen to false', () => {
            jest.spyOn(appStoreStub.isLoadFavoriteModalOpen$, 'next').mockImplementationOnce(_a => {});
            const modalStateActionInfo: Partial<ModalStateActionInfo> = {};
            component.closeLoadFavoriteModal(modalStateActionInfo as ModalStateActionInfo);
            expect(component.isLoadFavoriteModalOpen).toBeFalsy();
            expect(appStoreStub.isLoadFavoriteModalOpen$.next).toHaveBeenLastCalledWith(modalStateActionInfo);
        });
    });

    describe('showReloadPrompt Test', () => {
        let beforeUnloadEvent: BeforeUnloadEvent;

        beforeEach(() => {
            beforeUnloadEvent = new Event('beforeunload');
            jest.spyOn(component, 'showReloadPrompt');
            jest.spyOn(beforeUnloadEvent, 'preventDefault');
        });

        afterEach(() => jest.resetAllMocks());

        it('tests showReloadPrompt - url params absent', () => {
            window.dispatchEvent(beforeUnloadEvent);
            validateTest(beforeUnloadEvent, 1);
        });

        it('tests showReloadPrompt - url params found', () => {
            jest.spyOn(AppUtils, 'getURLParamWithDefault').mockReturnValue(true);
            window.dispatchEvent(beforeUnloadEvent);
            validateTest(beforeUnloadEvent, 0);
        });

        const validateTest = (beforeUnloadEvt: BeforeUnloadEvent, preventDefaultFreq: number) => {
            expect(component.showReloadPrompt).toHaveBeenCalledWith(beforeUnloadEvt);
            expect(beforeUnloadEvent.preventDefault).toHaveBeenCalledTimes(preventDefaultFreq);
        };
    });

    it('should test updateMandateSettingsModalState', () => {
        jest.spyOn(component['cdr'], 'markForCheck');
        component['updateMandateSettingsModalState'](true, true);
        expect(component.isMandateSettingsModalOpen).toBeTruthy();
        expect(component['cdr'].markForCheck).toHaveBeenCalled();
    });

    describe('Test copilot', () => {
        let mockAcwCopilotUtilityAdapter;

        beforeEach(() => {
            mockAcwCopilotUtilityAdapter = {
                updateVisibility: jest.fn(),
                getCopilotUtilitySelection$: jest.fn().mockReturnValue(of({}))
            };
            jest.spyOn(AcwCopilotUtility, 'getInstance').mockImplementation(() => mockAcwCopilotUtilityAdapter);

            AladdinCopilotLauncher.launchAladdinCopilotDeepLinking = jest.fn();

            component.aiChatAccess = true;
            component.embeddedCopilot = false;
            component.isAppReady = true;
            component.isAladdinCopilotChatInitialized = false;
            component.isAladdinCopilotChatVisible = false;
        });

        it('Should fallback to opening copilot via launcher/window mode', fakeAsync(() => {
            component.enableAladdinCopilot();
            expect(mockAcwCopilotUtilityAdapter.updateVisibility).toHaveBeenCalledWith(true);
            expect(mockAcwCopilotUtilityAdapter.getCopilotUtilitySelection$).toHaveBeenCalled();
            tick();
            expect(AladdinCopilotLauncher.launchAladdinCopilotDeepLinking).toHaveBeenCalled();
        }));

        it('Should open copilot via embedded', () => {
            component.embeddedCopilot = true;
            component.enableAladdinCopilot();
            expect(component.isAladdinCopilotChatInitialized).toBe(true);
            expect(component.isAladdinCopilotChatVisible).toBe(true);
        });
        it('Should open copilot via embedded but app is not read', () => {
            component.isAppReady = false;
            component.embeddedCopilot = true;
            component.enableAladdinCopilot();
            expect(component.isAladdinCopilotChatInitialized).toBe(false);
            expect(component.isAladdinCopilotChatVisible).toBe(false);
        });
        it('No aiaccess', () => {
            component.aiChatAccess = false;
            component.enableAladdinCopilot();
            expect(mockAcwCopilotUtilityAdapter.updateVisibility).not.toHaveBeenCalled();
        });
    });

    it('tests favoriteVersionLogAction$ open', async () => {
        jest.spyOn(CoreFavoriteVersioningStore.favoriteVersionLogAction$, 'next').mockImplementationOnce(_a => {
        });
        CoreFavoriteVersioningStore.favoriteVersionLogAction$.next({
            id: 12345,
            type: 'Workspace',
            isOpen: true
        });
        await fixture.whenStable();
        expect(CoreFavoriteVersioningStore.favoriteVersionLogAction$.next).toHaveBeenLastCalledWith({
            id: 12345,
            type: 'Workspace',
            isOpen: true
        });
    });

    it('tests viewUsageTypeAction$ open', async () => {
        jest.spyOn(CoreFavoriteVersioningStore.viewUsageTypeAction$, 'next').mockImplementationOnce(_a => {
        });
        CoreFavoriteVersioningStore.viewUsageTypeAction$.next({
            id: 54321,
            type: 'Workspace',
            isOpen: true
        });
        await fixture.whenStable();
        expect(CoreFavoriteVersioningStore.viewUsageTypeAction$.next).toHaveBeenLastCalledWith({
            id: 54321,
            type: 'Workspace',
            isOpen: true
        });
    });

    describe('versionLog Modal Test', () => {
        it('should set closeBatchSettingsModal to false', () => {
            component.closeBatchSettingsModal();
            expect(component.isBatchSettingsModalOpen).toBeFalsy();
        });

        it('should set closeViewUsageLinkModal to false', () => {
            component.closeViewUsageLinkModal();
            expect(component.isViewUsageModalOpen).toBeFalsy();
        });

        it('should set closeFavoriteVersionModal to false', () => {
            component.closeFavoriteVersionModal();
            expect(component.isFavoriteVersionLogModalOpen).toBeFalsy();
        });
    });

    describe('job scheduler test', ()=>{
        it('should fetch scheduled jobs successfully', () => {
            const scheduledJobs: ExportHubJobExecutionHistory[] = [new ExportHubJobExecutionHistory()];
            (jobServiceStub.getDailyExecutionHistories$ as jest.Mock).mockReturnValue(of(scheduledJobs));
            (exportHubStoreStub.getScheduledJobs as jest.Mock).mockReturnValue(scheduledJobs);

            component.jobSchedulerPopupOpened();

            expect(component.jobSchedulerInProgress).toBe(false);
            expect(component.dailyExecutionHistories).toEqual(scheduledJobs);
        });

        it('should handle no scheduled jobs', () => {
            (jobServiceStub.getDailyExecutionHistories$ as jest.Mock).mockReturnValue(of([]));

            component.jobSchedulerPopupOpened();

            expect(component.jobSchedulerInProgress).toBe(false);
            expect(component.dailyExecutionHistories).toEqual([]);
        });

        it('should handle error when fetching scheduled jobs', () => {
            (jobServiceStub.getDailyExecutionHistories$ as jest.Mock).mockReturnValue(throwError(() => new Error('error')));

            component.jobSchedulerPopupOpened();

            expect(component.jobSchedulerInProgress).toBe(false);
        });

    });

    describe('create job scheduler test', () => {
        it('should create job successfully and notify user', () => {
            component.createJobHandler('test');
            expect(notificationServiceStub.openDialog).toHaveBeenCalled();
        });

    });

    describe('viewJobDetails', () => {
        it('should open the job execution histories modal with the given job history', () => {
            const jobHistory = new ExportHubJobExecutionHistory();
            jest.spyOn(jobServiceStub, 'getJobExecutionHistoryById$').mockReturnValue(of([jobHistory]));
            component.viewJobDetails(jobHistory);

            expect(component.isJobExecutionHistoriesModalOpen).toBe(true);
            expect(component.jobExecutionHistory).toEqual([jobHistory]);
        });
    });

    describe('closeJobExecutionHistoriesModal', () => {
        it('should close the job execution histories modal', () => {
            component.isJobExecutionHistoriesModalOpen = true;
            component.closeJobExecutionHistoriesModal();

            expect(component.isJobExecutionHistoriesModalOpen).toBe(false);
        });
    });

    describe('countPortfoliosAndWidgets', () => {
        it('should count the portfolios and widgets for each job', () => {
            const taskExecutionHistory1 = new ExportHubJobTaskExecutionHistory();
            taskExecutionHistory1.setPortfolioId('portfolio1');
            taskExecutionHistory1.setWidgetId('widget1');
            const taskExecutionHistory2 = new ExportHubJobTaskExecutionHistory();
            taskExecutionHistory2.setPortfolioId('portfolio2');
            taskExecutionHistory2.setWidgetId('widget2');

            const taskExecutionHistory3 = new ExportHubJobTaskExecutionHistory();
            taskExecutionHistory3.setPortfolioId('portfolio1');
            taskExecutionHistory3.setWidgetId('widget3');

            const jobExecutionHistory = new ExportHubJobExecutionHistory();
            jobExecutionHistory.setJobId('job1');
            jobExecutionHistory.setTaskExecutionHistoriesList([taskExecutionHistory1, taskExecutionHistory2, taskExecutionHistory3]);

            component.dailyExecutionHistories = [jobExecutionHistory];
            component.countPortfoliosAndWidgets();

            expect(component.scheduledJobWidgetsCountMap.get('job1')).toBe(3);
            expect(component.scheduledJobPortfoliosCountMap.get('job1')).toBe(2);
        });
    });
});
