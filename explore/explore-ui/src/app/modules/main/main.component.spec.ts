import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BehaviorSubject, of} from 'rxjs';

import {MainComponent} from './main.component';
import {Report} from '@models/workspace/report.model';
import {BatchExportingStore, WorkspaceStore} from '../../stores';
import {FavoriteService, NotificationService} from '../../shared/services';
import {Workspace} from '@models/workspace/workspace.model';
import {AppStore} from '../../app.store';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {Breakdown, BreakdownBuilderSettings} from '@blk/explore-ui-breakdown';
import {ReportGroup} from '@models/workspace/report-group.model';
import {PDFExportAction} from '@models/export/pdf-export-action.model';
import {CoreUserMetaDataStore, Favorite, UserMetaData} from '@blk/explore-ui-core';
import moment from 'moment';
import 'moment-timezone/index';

describe('MainComponent', () => {
    let component: MainComponent;
    let fixture: ComponentFixture<MainComponent>;
    WorkspaceStore.currentReport$ = new BehaviorSubject<Report>(new Report());

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

    const appStoreStub = {
        openExportOptionsModal$: new BehaviorSubject(null),
        openGetWorkspaceURLModal$: new BehaviorSubject(null),
        openSetWorkspaceDateModal$: new BehaviorSubject(null),
        openReportGroupDateModal$: new BehaviorSubject(null),
        openLoadFavoriteModal$: new BehaviorSubject({type: null, treeType: null, displayName: null, loadEnterpriseTree: null, callback: null}),
        saveFavoriteAction$: new BehaviorSubject(new SaveFavoriteAction(new Workspace(), null, 'workspace', null, null)),
        quickSaveLoadingStatus$: new BehaviorSubject(false),
        openBreakdownSettingsModal$: new BehaviorSubject(null),
        updateExportDownloadingStatus: jest.fn()
    };

    const notificationServiceStub = {
        success: jest.fn(),
        error: jest.fn()
    };

    let favToSave: Favorite;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MainComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: AppStore, useValue: appStoreStub},
                {provide: NotificationService, useValue: notificationServiceStub}
            ]
        });

        fixture = TestBed.createComponent(MainComponent);
        component = fixture.componentInstance;
        component.workspace = new Workspace();
        jest.spyOn(moment.tz, 'guess').mockReturnValue('America/New_York');
        favToSave = component.workspace.createFavorite('WORKSPACE');
        jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(component.workspace);
        BatchExportingStore.currentPDFExportAction$ = new BehaviorSubject<PDFExportAction>(new PDFExportAction(undefined, undefined, undefined, undefined, undefined));
    });

    beforeAll(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.access = true;
        CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
        CoreUserMetaDataStore.userMetaData.login = 'seakim';
        WorkspaceStore.init();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelector('.main-area')).toMatchSnapshot();
    });

    describe('openExportOptionsModal/closeExportOptionsModal Test', () => {
        beforeEach(() => {
            const exportComposite = new ExportComposite();
            exportComposite.exportConfig = new PDFExportConfig();
            component['appStore'].openExportOptionsModal$.next(exportComposite);
            component.ngOnInit();
            fixture.detectChanges();
        });

        it('should set isExportOptionsModalOpen to true and show app-export-options-modal in the html template', () => {
            expect(component.isExportOptionsModalOpen).toBeTruthy();
            const exportComposite = new ExportComposite();
            exportComposite.exportConfig = new PDFExportConfig();
            expect(component.exportComposite).toEqual(exportComposite);
            expect(fixture.debugElement.nativeElement.querySelector('app-export-options-modal')).toMatchSnapshot();
        });

        it('should set isExportOptionsModalOpen to false and remove app-export-options-modal in the html template', () => {
            component.closeExportOptionsModal();
            fixture.detectChanges();

            expect(component.isExportOptionsModalOpen).toBeFalsy();
            expect(fixture.debugElement.nativeElement.querySelector('app-export-options-modal')).toMatchSnapshot();
        });
    });

    describe('openSetReportGroupDateModal/closeSetReportGroupDateModal Test', () => {
        beforeEach(() => {
            const reportGroup = new ReportGroup();
            component['appStore'].openReportGroupDateModal$.next(reportGroup);
            component.ngOnInit();
            fixture.detectChanges();
        });

        it('should set isReportGroupOptionsModalOpen to true and show app-report-group-settings-modal in the html template', () => {
            expect(component.isSetReportGroupDateModalOpen).toBeTruthy();

            expect(fixture.debugElement.nativeElement.querySelector('app-report-group-settings-modal')).toMatchSnapshot();

        });

        it('should set isReportGroupOptionsModalOpen to false and remove app-export-options-modal in the html template', () => {
            component.closeSetReportGroupDateModal();
            fixture.detectChanges();

            expect(component.isSetReportGroupDateModalOpen).toBeFalsy();
            expect(fixture.debugElement.nativeElement.querySelector('app-report-group-settings-modal')).toMatchSnapshot();
        });
    });

    describe('openSetWorkspaceDateModal/closeSetWorkspaceDateModal Test', () => {
        beforeEach(() => {
            component['appStore'].openSetWorkspaceDateModal$.next(true);
            component.ngOnInit();
            fixture.detectChanges();
        });

        it('should set isSetWorkspaceDate to true and show app-set-workspace-date-modal in the html template', () => {
            expect(component.isSetWorkspaceDateModalOpen).toBeTruthy();
            expect(fixture.debugElement.nativeElement.querySelector('app-set-workspace-date-modal')).toMatchSnapshot();
        });

        it('should set isSetWorkspaceDateModalOpen to false and remove app-set-workspace-date-modal in the html template', () => {
            component.closeSetWorkspaceDateModal();
            fixture.detectChanges();

            expect(component.isSetWorkspaceDateModalOpen).toBeFalsy();
            expect(fixture.debugElement.nativeElement.querySelector('app-set-workspace-date-modal')).toMatchSnapshot();
        });
    });

    describe('openBreakdownSettingsModal$ Test', () => {

        it('breakdownSettingsModalConfig is null', fakeAsync(() => {
            component.breakdownSettingsModalConfig = {} as any;
            component.isBreakdownSettingsModalOpen = true;
            component['appStore'].openBreakdownSettingsModal$.next(null);
            component.ngOnInit();
            fixture.detectChanges();
            tick();
            expect(component.isBreakdownSettingsModalOpen).toBeFalsy();
            expect(component.breakdownSettingsModalConfig).toBeNull();
        }));

        it('breakdownSettingsModalConfig is defined', fakeAsync(() => {
            component.isBreakdownSettingsModalOpen = false;
            component['appStore'].openBreakdownSettingsModal$.next({
                breakdown: new Breakdown(), breakdownBuilderSettings: new BreakdownBuilderSettings(), breakdownUpdatedCallback: () => {
                }
            });
            component.ngOnInit();
            fixture.detectChanges();
            tick();
            expect(component.isBreakdownSettingsModalOpen).toBeTruthy();
            expect(component.breakdownSettingsModalConfig).toBeDefined();
        }));
    });

    it('should set isBreakdownSettingsModalOpen to false and remove app-breakdown-settings-modal-dialog in the html template', () => {
        component.closeBreakdownSettingsModal();
        fixture.detectChanges();

        expect(component.isBreakdownSettingsModalOpen).toBeFalsy();
        expect(fixture.debugElement.nativeElement.querySelector('app-breakdown-settings-modal-dialog')).toMatchSnapshot();
    });

    describe('update Export status Test', () => {

        it('update ExportStatus if current PDF export Action is null', () => {
            jest.spyOn(component['appStore'], 'updateExportDownloadingStatus');
            BatchExportingStore.currentPDFExportAction$ = new BehaviorSubject<PDFExportAction>(null);
            setTimeout(() => {
                expect(component['appStore'].updateExportDownloadingStatus).toHaveBeenCalled();
            }, 2000);
        });
    });
});
