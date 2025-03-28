import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {ReportBarComponent} from './report-bar.component';
import {AppStore} from '../../../../app.store';
import {ExportLevel} from '../../../../constants';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {AppUtils} from '@utils/app.utils';
import {ReportAction} from '@interfaces/report-action-interface';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {Report} from '@models/workspace/report.model';
import {ExportDownloadingStatus} from '@interfaces/export-downloading-status.interface';
import {CancelService} from '@services/cancel/cancel.service';
import {WorkspaceStore} from '../../../../stores';
import {Widget} from '@models/widget/widget.model';
import {ReportActionType} from '@enums/report-action-type.enum';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {FavoriteConstants} from '@constants/favorite.constants';
import {DeleteFavoriteAction} from '@models/favorite/delete-favorite-action.model';
import {ExploreWidgetPasteService} from '@services/widget-data/explore-widget-paste.service';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {TokenUtils, CoreFavoriteVersioningStore, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {Workspace} from '@models/workspace/workspace.model';
import { ReportService } from '../../../../shared/services';

describe('ReportBarComponent', () => {
    let component: ReportBarComponent;
    let fixture: ComponentFixture<ReportBarComponent>;

    const appStoreStub = {
        saveFavoriteAction$: new BehaviorSubject(new SaveFavoriteAction(null, null, null, null, null, null)),
        reportActionSubject$: new Subject<ReportAction>(),
        deleteFavoriteAction$: new BehaviorSubject(new DeleteFavoriteAction(null, null, null, null, null)),
    };

    const pasteWidgetServiceStub = {
        pasteWidget: jest.fn(),
        pasteComplete: jest.fn()
    };

    const cancelServiceStub = {
        cancelAll: jest.fn()
    };

    const reportServiecStub = {
        loadFavoriteReport: jest.fn()
    }

    beforeAll(() => {
        const report = new Report();
        report.widgets = [new Widget(), new Widget(), new Widget()];
        report.key = 12345;
        WorkspaceStore.currentReport$ = new BehaviorSubject(report);
        const reportGroup = new ReportGroup();
        reportGroup.addPortfolios(new Portfolio('SNP500'));
        reportGroup.addReports(report);
        WorkspaceStore.currentWorkpad$ = new BehaviorSubject(reportGroup);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ReportBarComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: AppStore, useValue: appStoreStub}, {
                provide: CancelService,
                useValue: cancelServiceStub
            }, {provide: ExploreWidgetPasteService, useValue: pasteWidgetServiceStub},{provide: ReportService, useValue: reportServiecStub}]
        });

        WorkspaceStore.getWorkspace = jest.fn().mockReturnValue('');
        TokenUtils.isFeatureEnabled = jest.fn().mockReturnValue(false);
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        fixture = TestBed.createComponent(ReportBarComponent);
        component = fixture.componentInstance;
        component.deleteReport = jest.fn();
        component.currentReport = WorkspaceStore.getCurrentReport();
    });

    describe('onInit Test', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should match snapshot', () => {
            expect(fixture.debugElement.nativeElement.querySelector('.report-bar-area')).toMatchSnapshot();
        });
    });

    it('Test isExportIcon Visible', () => {
        TokenUtils.isFeatureEnabled = jest.fn().mockReturnValue(true);
        component.currentReport.owner = '_ADMIN';
        component.currentReport.id = 12345;
        CoreUserMetaDataStore.userMetaData.userPermissionGroups = ['APG RIO Team'];
        component.currentReport.userPermGrps = ['APG RIO Team'];
        const exportComposite = new ExportComposite();
        exportComposite.exportConfig = new ExcelExportConfig();
        exportComposite.exportConfig.exportLevel = ExportLevel.REPORT;
        exportComposite.report = new Report();
        component['appStore'].exportDownloadingStatus$ = new BehaviorSubject<ExportDownloadingStatus>(null);
        component['appStore'].exportDownloadingStatus$.next({downloadInProgress: true, exportComposite});
        component.ngOnInit();
        expect(component.exportingInProgress).toBeTruthy();
        component['appStore'].exportDownloadingStatus$.next(undefined);
        expect(component.exportingInProgress).toBeFalsy();
    });

    it('should call openPasteWidgetModal', fakeAsync(() => {
        const readTextMock = jest.fn();
        Object.assign(navigator, {
            clipboard: {readText: readTextMock}
        });
        readTextMock.mockReturnValue(Promise.resolve({}));
        jest.spyOn(component.openPasteModal, 'emit');
        const event = {
            preventDefault: jest.fn()
        };
        component.callOpenPasteWidgetModal(event);
        tick();
        expect(component.openPasteModal.emit).not.toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
        expect(pasteWidgetServiceStub.pasteWidget).toHaveBeenCalled();
        readTextMock.mockReturnValue(Promise.reject());
        component.callOpenPasteWidgetModal(event);
        tick();
        expect(component.openPasteModal.emit).toHaveBeenCalled();
    }));

    it('test reloadReport', () => {
        jest.spyOn(component['appStore'].reportActionSubject$, 'next');
        jest.spyOn(AppUtils, 'isCtrlPressed').mockReturnValue(false);
        const workspace = new Workspace();
        workspace.owner = '_ADMIN';
        WorkspaceStore.getWorkspace=jest.fn().mockReturnValue(workspace);
        TokenUtils.isFeatureEnabled = jest.fn().mockReturnValue(true);

        const event = {target: {label: ReportActionType.RELOAD_REPORT}, preventDefault: jest.fn()};
        component.setReportAction(event);
        expect(component['appStore'].reportActionSubject$.next).toHaveBeenCalledWith({
                'debugContext': false,
                'hardRefresh': false,
                'reportAction': ReportActionType.RELOAD_REPORT,
            }
        );
        expect(cancelServiceStub.cancelAll).toHaveBeenCalledTimes(0);
    });

    it('test cancelReportReload', () => {
        jest.spyOn(component['appStore'].reportActionSubject$, 'next');
        jest.spyOn(AppUtils, 'isCtrlPressed').mockReturnValue(false);
        const event = {target: {label: ReportActionType.CANCEL_RELOAD}, preventDefault: jest.fn()};
        component.setReportAction(event);
        expect(component['appStore'].reportActionSubject$.next).toHaveBeenCalledWith({
                'reportAction': ReportActionType.CANCEL_RELOAD,
            }
        );
        expect(cancelServiceStub.cancelAll).toHaveBeenCalledTimes(1);
    });

    describe('openDeleteFavoriteModal Test', () => {
        it('should trigger deleteFavoriteAction$', () => {
            jest.spyOn(component['appStore'].deleteFavoriteAction$, 'next');
            component.openDeleteFavoriteModal();

            expect(component['appStore'].deleteFavoriteAction$.next).toHaveBeenCalledWith(
                new DeleteFavoriteAction(
                    WorkspaceStore.getCurrentReport(),
                    FavoriteConstants.REPORT_PASCAL,
                    FavoriteConstants.LAYOUT,
                    FavoriteConstants.LAYOUT_FOLDER
                ));
        });
    });

    it('should test comparison modal open/close', () => {
        expect(component.isCompareModeOn).toBeFalsy();
        expect(component.isCompareModalOpen).toBeFalsy();

        component.openCompareModal();
        expect(component.isCompareModalOpen).toBeTruthy();

        WorkspaceStore.getCurrentReport().comparisonConfigId = 123;
        const mockComparisonConfig = new ComparisonConfig();
        mockComparisonConfig.portComparisonList = ['a', 'b'];
        WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.set(123, mockComparisonConfig);

        component.closeCompareModal(true);
        expect(component.isCompareModeOn).toBeTruthy();
        expect(component.isCompareModalOpen).toBeFalsy();
    });

    it('should test onReportBarMenuClicked', () => {
        jest.spyOn(component, 'openSaveFavoriteModal');
        const event: any = {detail: {element: {label: component.SAVE_REPORT}}};
        component.onReportBarMenuClicked(event);

        expect(component.openSaveFavoriteModal).toHaveBeenCalled();

        jest.spyOn(component, 'openDeleteFavoriteModal');
        event.detail.element.label = component.DELETE_REPORT;
        component.onReportBarMenuClicked(event);

        expect(component.openDeleteFavoriteModal).toHaveBeenCalled();

        jest.spyOn(CoreFavoriteVersioningStore.viewUsageTypeAction$, 'next' as any);
        event.detail.element.label = component.VIEW_USAGE;
        component.onReportBarMenuClicked(event);
        expect(CoreFavoriteVersioningStore.viewUsageTypeAction$['next']).toHaveBeenCalled();
    });

    it('should test onReportBarMenuClicked', () => {
        jest.spyOn(component, 'openSaveFavoriteModal');
        const event: any = {detail: {element: {label: component.SAVE_REPORT}}};
        component.onReportBarMenuClicked(event);

        expect(component.openSaveFavoriteModal).toHaveBeenCalled();

        jest.spyOn(component, 'openDeleteFavoriteModal');
        event.detail.element.label = component.DELETE_REPORT;
        component.onReportBarMenuClicked(event);

        expect(component.openDeleteFavoriteModal).toHaveBeenCalled();
    });
});
