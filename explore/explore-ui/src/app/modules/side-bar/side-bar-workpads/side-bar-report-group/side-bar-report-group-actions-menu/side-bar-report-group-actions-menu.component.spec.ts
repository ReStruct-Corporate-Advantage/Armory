import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SideBarReportGroupActionsMenuComponent} from './side-bar-report-group-actions-menu.component';
import {BehaviorSubject} from 'rxjs';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AppStore} from '../../../../../app.store';
import {NotificationService} from '@services/notification';
import {ReportGroup} from '@models/workspace/report-group.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {AlertConstants, DateValue, ExploreDialogParam} from '@blk/explore-ui-core';
import {WorkpadExportComposite} from '@models/export/export-composite/workpad-export-composite.model';
import {WorkpadExcelExportConfig} from '@models/export/workpad-excel-export-config.model';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {ExportConstants} from '@constants/export.constants';
import {PortfolioMenuItemsConstants} from '@constants/portfolio-menu-items.constants';
import {PortfolioType} from '../../../../../shared/components/add-portfolio-modal/portfolio-type.enum';

describe('SideBarReportGroupActionsMenuComponent', () => {
    let component: SideBarReportGroupActionsMenuComponent;
    let fixture: ComponentFixture<SideBarReportGroupActionsMenuComponent>;

    const appStoreStub = {
        updatePortfolioAndReloadReport: jest.fn(),
        openExportOptionsModal$: new BehaviorSubject<ExportComposite>(null)
    };

    const notificationServiceStub = {
        invokeWidgetReloadPrompt: jest.fn(),
        openDialog: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SideBarReportGroupActionsMenuComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: AppStore, useValue: appStoreStub},
                {provide: NotificationService, useValue: notificationServiceStub}
            ]
        });

        fixture = TestBed.createComponent(SideBarReportGroupActionsMenuComponent);
        component = fixture.componentInstance;
        component.reportGroup = new ReportGroup();
        WorkspaceStore.init();

        const currentPortfolio = new Portfolio('PEP');
        currentPortfolio.datePicker = new DateValue({date: '05/18/2020', calCode: 'GP_HK_STD'});
        WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(currentPortfolio);
        fixture.detectChanges();
    });

    describe('deleteReportGroup Test', () => {
        it('should delete report group', () => {
            WorkspaceStore.addWorkpadsAndUpdateCurrent(component.reportGroup);
            expect(WorkspaceStore.getWorkspace().workpads.length).toBe(1);
            component.deleteReportGroup();
            expect(WorkspaceStore.getWorkspace().workpads.length).toBe(0);
            expect(true).toBeTruthy();
        });
    });

    describe('Init Menu Options Test', () => {
        it('No portfolio', () => {
            component.reportGroup = new ReportGroup();
            component.initMenuOptions();
            expect(component.reportGroupMenuOptions).toEqual([
                [
                    {
                        label: 'Add to Group',
                        flyoutData: [[
                            {label: 'Add Portfolio'},
                            {label: 'Add What-if Portfolio'},
                            {label: 'Add Custom Portfolio'},
                            {label: 'Add Index Research'}]]
                    },
                    {
                        'label': 'Enable Multi-Portfolio Analysis'
                    }
                ],
                [
                    {
                        'label': 'Rename'
                    },
                    {
                        'label': 'Delete Report Group'
                    }
                ],
                [
                    {
                        'isDisabled': true,
                        'label': 'Export to PDF'
                    },
                    {
                        'isDisabled': true,
                        'label': 'Export to Excel'
                    }
                ],
                [
                    {
                        'label': 'Set Report Group Date'
                    }
                ],
                [
                    {
                        'label': 'Expand All Report Groups'
                    },
                    {
                        'label': 'Collapse All Report Groups'
                    }
                ]
            ]);
        });
        it('Has portfolios', () => {
            component.reportGroup = new ReportGroup();
            component.reportGroup.portfolios = [new Portfolio()];
            component.initMenuOptions();
            expect(component.reportGroupMenuOptions).toEqual([
                [
                    {
                        label: 'Add to Group',
                        flyoutData: [[
                            {label: 'Add Portfolio'},
                            {label: 'Add What-if Portfolio'},
                            {label: 'Add Custom Portfolio'},
                            {label: 'Add Index Research'}]]
                    },
                    {'label': 'Enable Multi-Portfolio Analysis'}
                ],
                [
                    {
                        'label': 'Rename'
                    },
                    {
                        'label': 'Delete Report Group'
                    }
                ],
                [
                    {
                        'isDisabled': false,
                        'label': 'Export to PDF'
                    },
                    {
                        'isDisabled': false,
                        'label': 'Export to Excel'
                    }
                ],
                [
                    {
                        'label': 'Set Report Group Date'
                    }
                ],
                [
                    {
                        'label': 'Expand All Report Groups'
                    },
                    {
                        'label': 'Collapse All Report Groups'
                    }
                ]
            ]);
        });
    });

    it('should open dialog with params', () => {
        jest.spyOn(component['notificationService'], 'openDialog');
        let event = {ctrlKey: false};
        component['confirmToDeleteReportGroup'](event  as MouseEvent);

        expect(component['notificationService'].openDialog).toHaveBeenCalledWith(
            new ExploreDialogParam(
                AlertConstants.TYPE.ALERT_WITH_OPTIONS,
                AlertConstants.HEADER.DELETE_REPORT_GROUP,
                AlertConstants.BODY.DELETE_REPORT_GROUP,
                AlertConstants.BTN.DELETE,
                AlertConstants.BTN.CANCEL,
                component.deleteReportGroup
            ));

        const spy = jest.spyOn(component, 'deleteReportGroup');
        event = {ctrlKey: true};
        component['confirmToDeleteReportGroup'](event as MouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    describe('onReportGroupMenuClicked Test', () => {
        it('should emit to rename Report Group if "Rename" is clicked', () => {
            jest.spyOn(component.renameReportGroup, 'emit');
            const event = new CustomEvent('build', {detail: {element: {label: 'Rename'}}});
            component.onReportGroupMenuClicked(event as any);

            expect(component.renameReportGroup.emit).toHaveBeenCalled();
        });

        it('should call confirmToDeleteReportGroup', () => {
            jest.spyOn<any>(component, 'confirmToDeleteReportGroup');
            const event = new CustomEvent('build', {detail: {element: {label: 'Delete Report Group'}}});
            component.onReportGroupMenuClicked(event as any);
            expect(component['confirmToDeleteReportGroup']).toHaveBeenCalled();
        });

        it('openExportModal pdf', () => {
            jest.spyOn<any>(component, 'openExportModal');
            const event = new CustomEvent('build', {detail: {element: {label: 'Export to PDF'}}});
            component.onReportGroupMenuClicked(event as any);
            expect(component['openExportModal']).toHaveBeenLastCalledWith(ExportConstants.PDF_TYPE);
        });

        it('openExportModal Excel', () => {
            jest.spyOn<any>(component, 'openExportModal');
            const event = new CustomEvent('build', {detail: {element: {label: 'Export to Excel'}}});
            component.onReportGroupMenuClicked(event as any);
            expect(component['openExportModal']).toHaveBeenLastCalledWith(ExportConstants.EXCEL);
        });

        it('openReportGroupDateModal', () => {
            jest.spyOn<any, string>(component, 'openReportGroupDateModal').mockImplementationOnce(() => {});
            const event = new CustomEvent('build', {detail: {element: {label: 'Set Report Group Date'}}});
            component.onReportGroupMenuClicked(event as any);
            expect(component['openReportGroupDateModal']).toHaveBeenCalled();
        });

        it('should call expandAllReportGroups with isExpand true', () => {
            WorkspaceStore.addWorkpadsAndUpdateCurrent(component.reportGroup);
            jest.spyOn<any>(component, 'expandAllReportGroups');
            const event = new CustomEvent('build', {detail: {element: {label: 'Expand All Report Groups'}}});
            component.onReportGroupMenuClicked(event as any);
            expect(component['expandAllReportGroups']).toHaveBeenCalledWith(true);
            expect(component.reportGroup.isOpen).toBeTruthy();
        });

        it('should call expandAllReportGroups with isExpand false', () => {
            WorkspaceStore.addWorkpadsAndUpdateCurrent(component.reportGroup);
            jest.spyOn<any>(component, 'expandAllReportGroups');
            const event = new CustomEvent('build', {detail: {element: {label: 'Collapse All Report Groups'}}});
            component.onReportGroupMenuClicked(event as any);
            expect(component['expandAllReportGroups']).toHaveBeenCalledWith(false);
            expect(component.reportGroup.isOpen).toBeFalsy();
        });

        it('should call openCreateMultiPortfolioAnalysisModalComponent if "Enable Multi-Portfolio Analysis" is clicked', () => {
            jest.spyOn(component, 'openCreateMultiPortfolioAnalysisModalComponent');
            const event = new CustomEvent('build', {detail: {element: {label: SideBarReportGroupActionsMenuComponent.LABELS.ENABLE_MULTI_PORTFOLIO_ANALYSIS}}});
            component.onReportGroupMenuClicked(event as any);
            expect(component.openCreateMultiPortfolioAnalysisModalComponent).toHaveBeenCalled();
        });

        it('Test Add to Group', () => {
            component.onReportGroupMenuClicked({detail: {element: {label: PortfolioMenuItemsConstants.LABELS.ADD_PORTFOLIO}}} as any);
            expect(component.isAddPortfolioModalOpen).toBeTruthy();
            expect(component.portfolioType).toEqual(PortfolioType.PORTFOLIO);
            component.onReportGroupMenuClicked({detail: {element: {label: PortfolioMenuItemsConstants.LABELS.ADD_CUSTOM_PORTFOLIO}}} as any);
            expect(component.portfolioType).toEqual(PortfolioType.CUSTOM);
            component.onReportGroupMenuClicked({detail: {element: {label: PortfolioMenuItemsConstants.LABELS.ADD_INDEX_RESEARCH}}} as any);
            expect(component.portfolioType).toEqual(PortfolioType.INDEX_RESEARCH);
            component.onReportGroupMenuClicked({detail: {element: {label: PortfolioMenuItemsConstants.LABELS.ADD_WHAT_IF_PORTFOLIO}}} as any);
            expect(component.portfolioType).toEqual(PortfolioType.WHAT_IF);
        });
    });

    describe('openExportModal', () => {
        it('openExportModal with EXCEL', () => {
            const reportGroup = new ReportGroup();
            component.reportGroup = reportGroup;
            component.openExportModal('Excel');

            const exportComposite = new WorkpadExportComposite();
            exportComposite.workpad = reportGroup;
            exportComposite.exportConfig = new WorkpadExcelExportConfig();
            exportComposite.exportConfig.appendTimestamp = true;
            expect(component['appStore'].openExportOptionsModal$.getValue()).toEqual(exportComposite);
        });

        it('openExportModal with PDF', () => {
            const reportGroup = new ReportGroup();
            component.reportGroup = reportGroup;
            component.openExportModal('PDF');

            const exportComposite = new WorkpadExportComposite();
            exportComposite.workpad = reportGroup;
            exportComposite.exportConfig = new PDFExportConfig();
            expect(component['appStore'].openExportOptionsModal$.getValue()).toEqual(exportComposite);
        });
    });

    describe('isAddPortfolioModalOpen Tests', () => {
        it('should set isAddPortfolioModalOpen to true', () => {
            component.isAddPortfolioModalOpen = true;
            expect(component.isAddPortfolioModalOpen).toBe(true);
        });

        it('should set isAddPortfolioModalOpen to false if value is undefined', () => {
            component.isAddPortfolioModalOpen = undefined;
            expect(component.isAddPortfolioModalOpen).toBe(false);
        });

        it('should get isAddPortfolioModalOpen value', () => {
            component.isAddPortfolioModalOpen = true;
            expect(component.isAddPortfolioModalOpen).toBe(true);
            component.isAddPortfolioModalOpen = false;
            expect(component.isAddPortfolioModalOpen).toBe(false);
        });
    });

    describe('handleAddPortfolioModalOpenChange Test', () => {
        it('should call openAddPortfolioModal with PortfolioType.PORTFOLIO', () => {
            jest.spyOn(component, 'openAddPortfolioModal');
            component.handleAddPortfolioModalOpenChange(true);
            expect(component.openAddPortfolioModal).toHaveBeenCalledWith(PortfolioType.PORTFOLIO);
        });
    });




});
