import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FavoriteConstants} from '@constants/favorite.constants';
import {WorkspaceActionsMenuComponent} from './workspace-actions-menu.component';
import {Workspace} from '@models/workspace/workspace.model';
import {NotificationService, WorkspaceService} from '../../../../shared/services';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {WorkspaceStore} from '../../../../stores';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {CoreUserMetaDataStore, TelemetryService, TokenUtils, UserMetaData, CoreFavoriteVersioningStore, CoreFavoriteUtils} from '@blk/explore-ui-core';
import {AppStore} from '../../../../app.store';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {BatchReportingService} from '@services/batch-reporting/batch-reporting.service';
import {map} from 'rxjs/operators';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {LoadAllService} from '@services/load-all/load-all.service';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {WorkspaceExportComposite} from '@models/export/export-composite/workspace-export-composite.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {DeleteFavoriteAction} from '@models/favorite/delete-favorite-action.model';
import {ClipboardService} from 'ngx-clipboard';
import {WorkspaceMenuItemsConstants} from '@constants/workspace-menu-items.constants';
import {FavoriteChangeDetectionService} from '@services/favorite-change-detection/favorite-change-detection.service';

describe('WorkspaceActionsMenuComponent', () => {
    let component: WorkspaceActionsMenuComponent;
    let fixture: ComponentFixture<WorkspaceActionsMenuComponent>;
    let userMetaData;

    const notificationServiceStub = {
        openDialog: jest.fn(),
        success: jest.fn()
    };

    const telemetryServiceStub = {
        initializeTelemetry: jest.fn()
    };
    const appStoreStub = {
        openExportOptionsModal$: new BehaviorSubject(null),
        saveFavoriteAction$: new BehaviorSubject(new SaveFavoriteAction(null, null, null, null, null, null)),
        deleteFavoriteAction$: new BehaviorSubject(new DeleteFavoriteAction(null, null, null, null, null)),
        openLoadFavoriteModal$: new BehaviorSubject<LoadFavoriteAction>(new LoadFavoriteAction({
            type: null,
            treeType: null,
            displayName: null,
            callback: null,
            headerDisplayName: null
        })),
        openSetWorkspaceDateModal$: new BehaviorSubject(null)
    };

    const workspaceServiceStub = {
        loadFavoriteWorkspace: jest.fn()
    };

    const loadAllServiceStub = {
        loadAllInProgress: false,
        initiateLoadAllProcess: jest.fn(),
        workspacePercentLoaded$: new Subject()
    };

    let favoriteChangeDetectionStub;

    beforeAll(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.access = true;
        CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
        CoreUserMetaDataStore.userMetaData.launchApps = ['SECURITY_MASTER', 'ANSER', 'ALADDIN_VIEW'];
        CoreUserMetaDataStore.userMetaData.login = 'ktalwar';
        CoreUserMetaDataStore.userMetaData.globalFavPerms = true;
        CoreUserMetaDataStore.userMetaData.perfDataPerms = true;
        CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;

    });

    beforeEach(() => {
        WorkspaceStore.init();

        favoriteChangeDetectionStub = {
            getWorkspaceChangedFavoritesTree: () => ({
                getChangesCount: () => (0)
            })
        };

        TestBed.configureTestingModule({
            declarations: [WorkspaceActionsMenuComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: AppStore, useValue: appStoreStub},
                {provide: WorkspaceService, useValue: workspaceServiceStub},
                {provide: LoadAllService, useValue: loadAllServiceStub},
                {provide: TelemetryService, useValue: telemetryServiceStub},
                {provide: ClipboardService},
                {provide: FavoriteChangeDetectionService, useValue: favoriteChangeDetectionStub}
            ]
        });

        fixture = TestBed.createComponent(WorkspaceActionsMenuComponent);
        component = fixture.componentInstance;
        TokenUtils.isFeatureEnabled = jest.fn().mockReturnValue(false);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelector('.workspace-action-menu-area')).toMatchSnapshot();
    });

    describe('ngOnInit Test', () => {
        it('should call to update menuOptions', () => {
            jest.spyOn<any, string>(component, 'updateMenuOptions').mockImplementation(() => {
            });
            component['loadAllService'].workspacePercentLoaded$ = new Subject<string>();
            component.ngOnInit();
            expect(component['updateMenuOptions']).toHaveBeenCalled();
        });
    });

    describe('onMenuClicked Test', () => {
        it('should emit to rename workspace if "Rename" is clicked', () => {
            jest.spyOn(component.renameWorkspace, 'emit');
            const event = new CustomEvent('build', {detail: {element: {label: 'Rename'}}});
            component.onMenuClicked(event as any);

            expect(component.renameWorkspace.emit).toHaveBeenCalled();
        });

        it('should call loadAllWorkspace if "Run All Reports" is clicked', () => {
            jest.spyOn<any>(component, 'loadAllWorkspace');
            const event = new CustomEvent('build', {detail: {element: {label: 'Run All Reports'}}});
            component.onMenuClicked(event as any);
            expect(component['loadAllWorkspace']).toHaveBeenCalled();
        });

        it('loadAllWorkspace should not do anything if token is disabled', () => {
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(false);
            jest.spyOn(component['loadAllService'], 'initiateLoadAllProcess');
            const event = new CustomEvent('build', {detail: {element: {label: 'Run All Reports'}}});
            component.onMenuClicked(event as any);
            expect(component['loadAllService'].initiateLoadAllProcess).not.toHaveBeenCalled();
        });

        it('test loadAllWorkspace', () => {
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);

            WorkspaceStore.currentWorkpad$.next(new ReportGroup());
            WorkspaceStore.workspace$.next(new Workspace({id: 0, owner: 'TST Owner', title: 'TST Workspace'}));
            jest.spyOn(component['loadAllService'], 'initiateLoadAllProcess');
            component.menuOptions = [
                [
                    {},
                    {},
                    {label: 'Run All Reports', isDisabled: false},
                ]
            ];
            const event = new CustomEvent('build', {detail: {element: {label: 'Run All Reports'}}});
            component.onMenuClicked(event as any);
            expect(component['loadAllService'].initiateLoadAllProcess).toHaveBeenCalled();
            expect(component.menuOptions[0][2].label).toEqual('Run All Reports (0%)');
            expect(component.menuOptions[0][2].isDisabled).toBeTruthy();
        });

        it('should open Load Workspace Warning modal if workspace is modified and "Load Workspace" is clicked', () => {
            WorkspaceStore.getWorkspace().id = 1234;
            WorkspaceStore.getWorkspace().workpads = [new FlatWorkpad()];
            favoriteChangeDetectionStub.getWorkspaceChangedFavoritesTree = () => ({
                getChangesCount: () => (2)
            });

            const event = new CustomEvent('build', {detail: {element: {label: WorkspaceMenuItemsConstants.LABELS.LOAD_WORKSPACE}}});
            component.onMenuClicked(event as any);

            expect(component.clickedMenuItem).toEqual(WorkspaceMenuItemsConstants.LABELS.LOAD_WORKSPACE);
            expect(component.isLoadWorkspaceWarningModalOpen).toEqual(true);
        });

        it('should open Load Workspace Warning modal if workspace is unsaved and "Load Workspace" is clicked', () => {
            WorkspaceStore.getWorkspace().workpads = [new FlatWorkpad()];

            const event = new CustomEvent('build', {detail: {element: {label: WorkspaceMenuItemsConstants.LABELS.LOAD_WORKSPACE}}});
            component.onMenuClicked(event as any);

            expect(component.clickedMenuItem).toEqual(WorkspaceMenuItemsConstants.LABELS.LOAD_WORKSPACE);
            expect(component.isLoadWorkspaceWarningModalOpen).toEqual(true);
        });

        it('should open Load Favorite modal if workspace has no changes and "Load Workspace" is clicked', () => {
            WorkspaceStore.getWorkspace().id = 1234;
            WorkspaceStore.getWorkspace().workpads = [new FlatWorkpad()];
            favoriteChangeDetectionStub.getWorkspaceChangedFavoritesTree = () => ({
                getChangesCount: () => (0)
            });

            const event = new CustomEvent('build', {detail: {element: {label: WorkspaceMenuItemsConstants.LABELS.LOAD_WORKSPACE}}});
            component.onMenuClicked(event as any);

            expect(component.clickedMenuItem).toBeUndefined();
            expect(component.isLoadWorkspaceWarningModalOpen).toEqual(false);
        });

        it('should open Load Favorite modal if workspace is blank and "Load Workspace" is clicked', () => {
            const event = new CustomEvent('build', {detail: {element: {label: WorkspaceMenuItemsConstants.LABELS.LOAD_WORKSPACE}}});
            component.onMenuClicked(event as any);

            expect(component.clickedMenuItem).toBeUndefined();
            expect(component.isLoadWorkspaceWarningModalOpen).toEqual(false);
        });

        it('should open delete favorite modal for workspace if "Delete Workspace" is clicked', () => {
            jest.spyOn(component['appStore'].deleteFavoriteAction$, 'next');
            const event = new CustomEvent('build', {detail: {element: {label: 'Delete Workspace'}}});
            component.onMenuClicked(event as any);

            expect(component['appStore'].deleteFavoriteAction$.next).toHaveBeenCalledWith(
                new DeleteFavoriteAction(
                    WorkspaceStore.getWorkspace(),
                    FavoriteConstants.WORKSPACE_PASCAL,
                    FavoriteConstants.WORKSPACE,
                    FavoriteConstants.WORKSPACE_FOLDER,
                    WorkspaceStore.refreshWorkspace
                ));
        });

        it('should open Load/New Workspace Warning modal if workspace is modified and "New Workspace" is clicked', () => {
            WorkspaceStore.getWorkspace().id = 1234;
            WorkspaceStore.getWorkspace().workpads = [new FlatWorkpad()];
            favoriteChangeDetectionStub.getWorkspaceChangedFavoritesTree = () => ({
                getChangesCount: () => (2)
            });

            const event = new CustomEvent('build', {detail: {element: {label: WorkspaceMenuItemsConstants.LABELS.NEW_WORKSPACE}}});
            component.onMenuClicked(event as any);

            expect(component.clickedMenuItem).toEqual(WorkspaceMenuItemsConstants.LABELS.NEW_WORKSPACE);
            expect(component.isLoadWorkspaceWarningModalOpen).toEqual(true);
        });

        it('should open Load/New Workspace Warning modal if workspace is unsaved and "New Workspace" is clicked', () => {
            WorkspaceStore.getWorkspace().workpads = [new FlatWorkpad()];

            const event = new CustomEvent('build', {detail: {element: {label: WorkspaceMenuItemsConstants.LABELS.NEW_WORKSPACE}}});
            component.onMenuClicked(event as any);

            expect(component.clickedMenuItem).toEqual(WorkspaceMenuItemsConstants.LABELS.NEW_WORKSPACE);
            expect(component.isLoadWorkspaceWarningModalOpen).toEqual(true);
        });

        it('should open new workspace if workspace has no changes and "New Workspace" is clicked', () => {
            WorkspaceStore.getWorkspace().id = 1234;
            WorkspaceStore.getWorkspace().workpads = [new FlatWorkpad()];
            favoriteChangeDetectionStub.getWorkspaceChangedFavoritesTree = () => ({
                getChangesCount: () => (0)
            });

            const event = new CustomEvent('build', {detail: {element: {label: WorkspaceMenuItemsConstants.LABELS.NEW_WORKSPACE}}});
            component.onMenuClicked(event as any);

            expect(component.clickedMenuItem).toBeUndefined();
            expect(component.isLoadWorkspaceWarningModalOpen).toEqual(false);
        });

        it('should call markWorkspaceAsDefault if "Mark as Default" is clicked', () => {
            jest.spyOn<any, string>(component, 'markWorkspaceAsDefault').mockImplementation(() => {
            });
            const event = new CustomEvent('build', {detail: {element: {label: 'Mark as Default'}}});
            component.onMenuClicked(event as any);

            expect(component['markWorkspaceAsDefault']).toHaveBeenCalled();
        });

        it('should call markWorkspaceAsDefault if "Unmark as Default" is clicked', () => {
            jest.spyOn<any, string>(component, 'unmarkWorkspaceAsDefault').mockImplementation(() => {
            });
            const event = {detail: {element: {label: 'Unmark as Default'}}};
            // @ts-ignore - to mock event since detail in CustomEvent is read-only property
            component.onMenuClicked(event);

            expect(component['unmarkWorkspaceAsDefault']).toHaveBeenCalled();
        });

        it('should open dialog to export workspace if "Export to PDF" is clicked', () => {
            jest.spyOn<any>(component, 'exportWorkspace');
            const event = new CustomEvent('build', {detail: {element: {label: 'Export to PDF'}}});
            component.onMenuClicked(event as any);

            expect(component['exportWorkspace']).toHaveBeenCalled();
        });

        it('should open dialog to export workspace if "Export to Excel" is clicked', () => {
            jest.spyOn<any>(component, 'exportWorkspace');
            const event = new CustomEvent('build', {detail: {element: {label: 'Export to Excel'}}});
            component.onMenuClicked(event as any);

            expect(component['exportWorkspace']).toHaveBeenCalled();
        });

        it('test get workspace URL', () => {
            jest.spyOn(component['notificationService'], 'success');
            const spy = jest.spyOn(component['clipboardService'], 'copyFromContent');
            const workspace = new Workspace({id: 0, owner: 'TST Owner', title: 'TST Workspace'});
            jest.spyOn(workspace, 'generateWorkspaceUrl').mockReturnValue('test URL');
            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(workspace);
            const event = new CustomEvent('build', {detail: {element: {label: 'Copy Workspace URL'}}});
            // @ts-ignore - to mock event since detail in CustomEvent is read-only property
            component.onMenuClicked(event);
            expect(component['notificationService'].success).toHaveBeenCalledWith('Workspace URL successfully copied!');
            expect(spy).toHaveBeenCalledWith('test URL');
        });

        it('should open dialog if set workspace date is clicked', () => {
            jest.spyOn<any>(component, 'setWorkspaceDate');
            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(new Workspace());
            const event = new CustomEvent('build', {detail: {element: {label: 'Set Workspace Date'}}});
            component.onMenuClicked(event as any);

            expect(component['setWorkspaceDate']).toHaveBeenCalled();
        });

        it('should open batchSettingsModal is Batch Reporting is clicked', () => {
            BatchReportingService.batchSettingsModalOpen$.asObservable()
                .pipe(
                    map((modalOpen: boolean) => {
                        expect(modalOpen).toBeTruthy();
                    })
                );

            const event = {detail: {element: {label: 'Batch Reporting'}}};
            // @ts-ignore - to mock event since detail in CustomEvent is read-only property
            component.onMenuClicked(event);
        });

        it('should trigger saveFavoriteAction$ with params if "Save Workspace" is clicked', () => {
            jest.spyOn(component['appStore'].saveFavoriteAction$, 'next');
            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(new Workspace());
            const event = new CustomEvent('build', {detail: {element: {label: 'Save Workspace'}}});
            component.onMenuClicked(event as any);

            expect(component['appStore'].saveFavoriteAction$.next).toHaveBeenCalledWith(
                new SaveFavoriteAction(
                    WorkspaceStore.getWorkspace(),
                    FavoriteConstants.WORKSPACE_PASCAL,
                    FavoriteConstants.WORKSPACE,
                    FavoriteConstants.WORKSPACE_FOLDER,
                    WorkspaceStore.refreshWorkspace
                ));
        });
        it('should open dialog if View Usage is clicked', () => {
            const workspace = new Workspace();
            workspace.id = 12345;
            workspace.owner = 'ktalwar';
            workspace.workpads.push(new FlatWorkpad());
            jest.spyOn(WorkspaceStore, 'getWorkspace$').mockReturnValue(of(workspace));
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            jest.spyOn(CoreFavoriteVersioningStore.viewUsageTypeAction$, 'next' as any);
            const event = new CustomEvent('build', {detail: {element: {label: 'View Usage'}}});
            component.onMenuClicked(event as any);
            expect(CoreFavoriteVersioningStore.viewUsageTypeAction$['next']).toHaveBeenCalled();
        });

        it('should open dialog if View Version Log is clicked', () => {
            const workspace = new Workspace();
            workspace.id = 12345;
            workspace.owner = 'ktalwar';
            workspace.workpads.push(new FlatWorkpad());
            jest.spyOn(WorkspaceStore, 'getWorkspace$').mockReturnValue(of(workspace));
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            jest.spyOn(CoreFavoriteVersioningStore.favoriteVersionLogAction$, 'next' as any);
            const event = new CustomEvent('build', {detail: {element: {label: 'View Version Log'}}});
            component.onMenuClicked(event as any);
            expect(CoreFavoriteVersioningStore.favoriteVersionLogAction$['next']).toHaveBeenCalled();
        });

        it('should return true if latestFavoriteVersion is not same as currentFavoriteVersion', () => {
            const workspace = new Workspace();
            workspace.id = 'UUID';
            workspace.owner = '_ADMIN';
            workspace.latestFavoriteVersion = 'LATEST';
            workspace.currentFavoriteVersion = 'CURRENT';
            workspace.workpads.push(new FlatWorkpad());
            jest.spyOn(WorkspaceStore, 'getWorkspace$').mockReturnValue(of(workspace));
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            const event = new CustomEvent('build', {detail: {element: {label: 'View Usage'}}});
            component.onMenuClicked(event as any);
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            jest.spyOn(CoreFavoriteUtils, 'isAdminOrGlobalFavorite').mockReturnValue(true);

            const result = component.disableDelete(workspace);

            expect(result).toBe(true);
        });
        it('should return false if latestFavoriteVersion equals currentFavoriteVersion', () => {
            const workspace = new Workspace();
            workspace.id = 'UUID';
            workspace.owner = '_ADMIN';
            workspace.latestFavoriteVersion = 'LATEST';
            workspace.currentFavoriteVersion = 'LATEST';
            workspace.workpads.push(new FlatWorkpad());
            jest.spyOn(WorkspaceStore, 'getWorkspace$').mockReturnValue(of(workspace));
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            const event = new CustomEvent('build', {detail: {element: {label: 'View Usage'}}});
            component.onMenuClicked(event as any);
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            jest.spyOn(CoreFavoriteUtils, 'isAdminOrGlobalFavorite').mockReturnValue(true);

            const result = component.disableDelete(workspace);

            expect(result).toBe(false);
        });

    });

    describe('updateMenuOptions Test', () => {
        it('should disable labels based on workspace conditions', () => {
            jest.spyOn(WorkspaceStore, 'getWorkspace$').mockReturnValue(of(new Workspace()));
            component['updateMenuOptions']();

            expect(component.menuOptions).toEqual([
                [
                    {label: 'Rename', isDisabled: false},
                    {label: 'Mark as Default', isDisabled: true},
                    {label: 'Run All Reports', isDisabled: true},
                    {label: 'Set Workspace Date', isDisabled: false}
                ],
                [
                    {label: 'Save Workspace', isDisabled: true}
                ],
                [
                    {label: 'New Workspace'},
                    {label: 'Load Workspace'},
                    {label: 'Delete Workspace', isDisabled: true},
                    {label: 'Copy Workspace URL', isDisabled: true},
                ],
                [
                    {label: 'Export to PDF', isDisabled: true},
                    {label: 'Export to Excel', isDisabled: true},
                    {label: 'Batch Exporting'},
                ],
            ]);
        });

        it('should enable labels based on workspace conditions', () => {
            const workspace = new Workspace();
            workspace.id = 12345;
            workspace.owner = 'ktalwar';
            workspace.workpads.push(new FlatWorkpad());
            jest.spyOn(WorkspaceStore, 'getWorkspace$').mockReturnValue(of(workspace));
            component['updateMenuOptions']();

            expect(component.menuOptions).toEqual([
                [
                    {label: 'Rename', isDisabled: false},
                    {label: 'Mark as Default', isDisabled: false},
                    {label: 'Run All Reports', isDisabled: false},
                    {label: 'Set Workspace Date', isDisabled: false}
                ],
                [
                    {label: 'Save Workspace', isDisabled: false}
                ],
                [
                    {label: 'New Workspace'},
                    {label: 'Load Workspace'},
                    {label: 'Delete Workspace', isDisabled: false},
                    {label: 'Copy Workspace URL', isDisabled: false},
                ],
                [
                    {label: 'Export to PDF', isDisabled: false},
                    {label: 'Export to Excel', isDisabled: false},
                    {label: 'Batch Exporting'},
                ],
            ]);
        });
    });

    it('Test exportWorkspace', () => {
        const dummyWorkspace = new Workspace();
        jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(dummyWorkspace);
        component['appStore'].openExportOptionsModal$ = new BehaviorSubject<ExportComposite>(null);
        const exportConfig = new PDFExportConfig();
        component['exportWorkspace'](exportConfig);
        const composite = component['appStore'].openExportOptionsModal$.getValue();
        expect(composite instanceof WorkspaceExportComposite).toBeTruthy();
        expect((composite as WorkspaceExportComposite).workspace).toBe(dummyWorkspace);
        expect(composite.exportConfig).toBe(exportConfig);
    });

    describe('markWorkspaceAsDefault Test', () => {
        it('should mark workspace as default and give success notification', () => {
            jest.spyOn(component['notificationService'], 'success');
            const workspace = new Workspace();
            workspace.title = 'testWorkspace';
            workspace.id = 12345;
            workspace.workpads.push(new FlatWorkpad());
            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(workspace);
            jest.spyOn(WorkspaceStore, 'getWorkspace$').mockReturnValue(of(workspace));
            CoreUserMetaDataStore.userMetaData.preferences['defaultWorkspace'] = '12345';
            component['markWorkspaceAsDefault']();
            expect(component.menuOptions).toEqual([
                [
                    {label: 'Rename', isDisabled: false},
                    {label: 'Unmark as Default'},
                    {label: 'Run All Reports', isDisabled: false},
                    {label: 'Set Workspace Date', isDisabled: false}
                ],
                [
                    {label: 'Save Workspace', isDisabled: false}
                ],
                [
                    {label: 'New Workspace'},
                    {label: 'Load Workspace'},
                    {label: 'Delete Workspace', isDisabled: false},
                    {label: 'Copy Workspace URL', isDisabled: false},
                ],
                [
                    {label: 'Export to PDF', isDisabled: false},
                    {label: 'Export to Excel', isDisabled: false},
                    {label: 'Batch Exporting'},
                ],
            ]);
            expect(component['notificationService'].success).toHaveBeenCalledWith(
                'Workspace testWorkspace marked as default');
        });
    });

    describe('unmarkWorkspaceAsDefault Test', () => {
        it('should unmark workspace as default and give success notification', () => {
            jest.spyOn(component['notificationService'], 'success');
            const workspace = new Workspace();
            workspace.title = 'testWorkspace';
            workspace.id = 12345;
            workspace.owner = 'ktalwar';
            workspace.workpads.push(new FlatWorkpad());
            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(workspace);
            jest.spyOn(WorkspaceStore, 'getWorkspace$').mockReturnValue(of(workspace));
            CoreUserMetaDataStore.userMetaData.preferences['defaultWorkspace'] = '12345';
            component['unmarkWorkspaceAsDefault']();
            expect(component.menuOptions).toEqual([
                [
                    {label: 'Rename', isDisabled: false},
                    {label: 'Mark as Default', isDisabled: false},
                    {label: 'Run All Reports', isDisabled: false},
                    {label: 'Set Workspace Date', isDisabled: false}
                ],
                [
                    {label: 'Save Workspace', isDisabled: false}
                ],
                [
                    {label: 'New Workspace'},
                    {label: 'Load Workspace'},
                    {label: 'Delete Workspace', isDisabled: false},
                    {label: 'Copy Workspace URL', isDisabled: false},
                ],
                [
                    {label: 'Export to PDF', isDisabled: false},
                    {label: 'Export to Excel', isDisabled: false},
                    {label: 'Batch Exporting'},
                ],
            ]);
            expect(component['notificationService'].success).toHaveBeenCalledWith(
                'Workspace testWorkspace unmarked as default');
        });
    });

    describe('view Usage modal menu option Test', () =>
        it('should unmark workspace as default and give success notification', () => {
            jest.spyOn(component['notificationService'], 'success');
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockImplementation((tokeName) => {
                return tokeName !== 'ExploreEnableStatusTags';
            });
            const workspace = new Workspace();
            workspace.title = 'testWorkspace';
            workspace.id = 12345;
            workspace.owner = '_ADMIN';
            workspace.workpads.push(new FlatWorkpad());
            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(workspace);
            jest.spyOn(WorkspaceStore, 'getWorkspace$').mockReturnValue(of(workspace));
            CoreUserMetaDataStore.userMetaData.preferences['defaultWorkspace'] = '12345';
            component['unmarkWorkspaceAsDefault']();
            expect(component.menuOptions).toEqual([
                [
                    {label: 'Rename', isDisabled: false},
                    {label: 'Mark as Default', isDisabled: false},
                    {label: 'Run All Reports', isDisabled: false},
                    {label: 'Set Workspace Date', isDisabled: false},
                    {label: 'View Version Log', isDisabled: true},
                    {label: 'View Usage', isDisabled: false}
                ],
                [
                    {label: 'Save Workspace', isDisabled: false}
                ],
                [
                    {label: 'New Workspace'},
                    {label: 'Load Workspace'},
                    {label: 'Delete Workspace', isDisabled: false},
                    {label: 'Copy Workspace URL', isDisabled: false},
                ],
                [
                    {label: 'Export to PDF', isDisabled: false},
                    {label: 'Export to Excel', isDisabled: false},
                    {label: 'Batch Exporting'},
                ],
            ]);
            expect(component['notificationService'].success).toHaveBeenCalledWith(
                'Workspace testWorkspace unmarked as default');
        }));

});
