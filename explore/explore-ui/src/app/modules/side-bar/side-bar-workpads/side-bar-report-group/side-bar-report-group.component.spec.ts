import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {SideBarReportGroupComponent} from './side-bar-report-group.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {WorkspaceStore} from '../../../../stores';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {CommonConstants} from '@constants/common.constants';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {Report} from '@models/workspace/report.model';
import {WorkpadExportComposite} from '@models/export/export-composite/workpad-export-composite.model';
import {BehaviorSubject} from 'rxjs';
import {ExportDownloadingStatus} from '@interfaces/export-downloading-status.interface';

describe('ReportGroupComponent', () => {
    const reportGroup1 = new ReportGroup();
    const portfolio1 = new Portfolio('PEP');

    let component: SideBarReportGroupComponent;
    let fixture: ComponentFixture<SideBarReportGroupComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SideBarReportGroupComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });

        fixture = TestBed.createComponent(SideBarReportGroupComponent);
        component = fixture.componentInstance;
        reportGroup1.title = 'Test Report';
        reportGroup1.portfolios = [portfolio1];
        reportGroup1.id = '12345';
        component.reportGroup = reportGroup1;
        component['appStore'].exportDownloadingStatus$ = new BehaviorSubject<ExportDownloadingStatus>(undefined);

        fixture.detectChanges();
    });

    beforeAll(() => {
        WorkspaceStore.init();
    });

    describe('selectPortfolio Test', () => {
        it('should select portfolio', () => {
            jest.spyOn(WorkspaceStore, 'validateWorkpadAndUpdate').mockImplementation(() => {});
            component.selectPortfolio(portfolio1);
            expect(WorkspaceStore.validateWorkpadAndUpdate).toHaveBeenCalled();

        });


        it('should set active report in reportGroup', () => {
            const report = new Report();
            reportGroup1.reports = [report];
            component.selectPortfolio(portfolio1);
            expect(reportGroup1.activeReport).toBe(report);
        });

        it('should test select portfolio with active report in reportGroup', () => {
            const report = new Report();
            const report2 = new Report();
            reportGroup1.reports = [report, report2];
            reportGroup1.activeReport = report2;
            component.selectPortfolio(portfolio1);
            expect(reportGroup1.activeReport).toBe(report2);
        });

        it('should test select Portfolio with no report in reportGroup', () => {
            reportGroup1.activeReport = undefined;
            reportGroup1.reports = [];
            component.selectPortfolio(portfolio1);
            expect(reportGroup1.activeReport).toBe(null);
        });
    });

    it('Test isSelected', () => {
        jest.spyOn(WorkspaceStore, 'validateWorkpadAndUpdate').mockImplementation((workpad, portfolio) => WorkspaceStore.updateCurrentWorkpad(workpad, portfolio));

        component.isSelected = true;
        WorkspaceStore.addWorkpadsAndUpdateCurrent(new ReportGroup());
        expect(component.isSelected).toBeFalsy();
        WorkspaceStore.addWorkpadsAndUpdateCurrent(component.reportGroup);
        expect(component.isSelected).toBeTruthy();
    });

    it('Test isExportIcon Visible', () => {
        const reportGroupExportComposite = new WorkpadExportComposite();
        reportGroupExportComposite.workpad = new ReportGroup();
        (reportGroupExportComposite.workpad as ReportGroup).id = '12345';
        component['appStore'].exportDownloadingStatus$.next({
            downloadInProgress: true,
            exportComposite: reportGroupExportComposite
        });
        expect(component.exportingInProgress).toBeTruthy();
        component['appStore'].exportDownloadingStatus$.next(undefined);
        expect(component.exportingInProgress).toBeFalsy();
    });

    it('Test Delete Portfolio', () => {
        const portfolio = new Portfolio('Test Port');
        jest.spyOn(WorkspaceStore, 'removePortfolioAndUpdateCurrent');
        jest.spyOn(WorkspaceStore.portfolioLoadingStatusMap, 'delete');
        jest.spyOn(component['notificationService'], 'invokeWidgetReloadPrompt');
        component.deletePortfolio(portfolio);
        expect(component['notificationService'].invokeWidgetReloadPrompt).toHaveBeenCalled();
        expect(WorkspaceStore.portfolioLoadingStatusMap.delete).toHaveBeenCalledWith(portfolio.portId);
        expect(WorkspaceStore.removePortfolioAndUpdateCurrent).toHaveBeenCalledWith(component.reportGroup, portfolio);
    });

    it('Test Set Edit Report Group Name', fakeAsync(() => {
        component.reportGroupNameField = {focusInput: jest.fn()} as any;
        jest.spyOn(component.reportGroupNameField, 'focusInput');
        component.setEditReportGroupName(false);
        expect(component.editReportGroupName).toBeFalsy();
        component.setEditReportGroupName(true);
        expect(component.editReportGroupName).toBeTruthy();
        tick(0);
        expect(component.reportGroupNameField.focusInput).toHaveBeenCalled();
    }));

    it('Test update report group name', () => {
        component.reportGroup = new ReportGroup();
        component.updateReportGroupName('Test Report 23');
        expect(component.reportGroup.title).toEqual('Test Report 23');
        component.updateReportGroupName('Test Report 23');
        expect(component.reportGroup.title).toEqual('Test Report 23');
    });

    describe('Test onReportGroupDrag', () => {
        it('Test onReportGroupDrag', () => {
            const dragEvent = {
                dataTransfer: {
                    setData: jest.fn()
                },
                stopPropagation: jest.fn()
            };
            component.reportGroup = new ReportGroup();
            WorkspaceStore.getWorkspace().workpads = [new ReportGroup(), component.reportGroup, new FlatWorkpad()];
            component.onReportGroupDrag(dragEvent as any);
            expect(dragEvent.dataTransfer.setData).toHaveBeenNthCalledWith(
                1,
                CommonConstants.DRAG_DROP_PARAMS.WORKPAD_INDEX,
                '1'
            );
            expect(dragEvent.stopPropagation).toHaveBeenCalledTimes(1);
        });
    });

    describe('Test onWorkpadDrop', () => {
        const dragEvent = {
            dataTransfer: {
                getData: jest.fn()
            },
            preventDefault: jest.fn()
        };

        it('Reorder workpad', () => {
            const port2 = new Portfolio();
            component.reportGroup = new ReportGroup();
            const flatWorkpad = new FlatWorkpad();
            flatWorkpad.addPortfolios(port2);
            WorkspaceStore.getWorkspace().workpads = [component.reportGroup, flatWorkpad];
            dragEvent.dataTransfer.getData.mockImplementation((key: string) => {
                if (key === CommonConstants.DRAG_DROP_PARAMS.WORKPAD_INDEX) {
                    return WorkspaceStore.getWorkspace().workpads.indexOf(flatWorkpad);
                }
            });
            component.onWorkpadDrop(dragEvent as any);
            expect(WorkspaceStore.getWorkspace().workpads).toEqual([flatWorkpad, component.reportGroup]);
        });
    });

    describe('Test onWorkpadDrop - Drag portfolio out of a report group', () => {
        const dragEvent = {
            dataTransfer: {
                getData: jest.fn()
            },
            preventDefault: jest.fn()
        };
        beforeEach(() => {
            const port1 = new Portfolio('A');
            const port2 = new Portfolio('B');
            component.reportGroup = new ReportGroup();
            component.reportGroup.addPortfolios(port1);
            const flatWorkpad = new FlatWorkpad();
            flatWorkpad.addPortfolios(port2);
            WorkspaceStore.getWorkspace().workpads = [component.reportGroup, flatWorkpad];
            dragEvent.dataTransfer.getData.mockImplementation((key: string) => {
                if (key === CommonConstants.DRAG_DROP_PARAMS.WORKPAD_INDEX) {
                    return WorkspaceStore.getWorkspace().workpads.indexOf(component.reportGroup);
                } else if (key === CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID) {
                    return 'xyz1234';
                } else if (key === CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_INDEX_IN_WORKPAD) {
                    return 0;
                }
            });
        });

        it('Drag Portfolio From ReportGroup To Workspace - TOP', () => {
            component.onWorkpadDrop(dragEvent as any, 'TOP');
            expect(WorkspaceStore.getWorkspace().workpads.length).toBe(3);
            expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios()[0].getDisplayTitle()).toBe('A');
            expect(WorkspaceStore.getWorkspace().workpads[2].getAllPortfolios()[0].getDisplayTitle()).toBe('B');
        });

        it('Drag Portfolio From ReportGroup To Workspace - BOTTOM', () => {
            component.onWorkpadDrop(dragEvent as any, 'BOTTOM');
            expect(WorkspaceStore.getWorkspace().workpads.length).toBe(3);
            expect(WorkspaceStore.getWorkspace().workpads[1].getAllPortfolios()[0].getDisplayTitle()).toBe('A');
            expect(WorkspaceStore.getWorkspace().workpads[2].getAllPortfolios()[0].getDisplayTitle()).toBe('B');
        });
    });

    describe('Test allowDropAboveBelowReportGroup', () => {
        beforeEach(() => {
            component.reportGroupBorder = null;
            component.isReportGroupDropTarget = true;
            component.isHeaderDrop = true;

            WorkspaceStore.getWorkspace().workpads = [new FlatWorkpad(), component.reportGroup];
        });

        it('should not allow what-if portfolio to be dropped', () => {
            const dragEvent = {
                dataTransfer: {
                    types: [CommonConstants.DRAG_DROP_PARAMS.IS_WHAT_IF_PORTFOLIO]
                },
                preventDefault: jest.fn()
            };
            component.allowDropAboveBelowReportGroup(dragEvent as any, 'TOP');
            expect(component.isReportGroupDropTarget).toEqual(true);
            expect(component.isHeaderDrop).toEqual(true);
            expect(component.reportGroupBorder).toBeNull();
            expect(dragEvent.preventDefault).not.toHaveBeenCalled();
        });

        it('should add border to top for valid drop above report group', () => {
            const dragEvent = {
                dataTransfer: {
                    types: [
                        CommonConstants.DRAG_DROP_PARAMS.DRAGGED_WORKPAD_INDEX + 2
                    ]
                },
                preventDefault: jest.fn()
            };
            component.allowDropAboveBelowReportGroup(dragEvent as any, 'TOP');
            expect(component.isReportGroupDropTarget).toEqual(false);
            expect(component.isHeaderDrop).toEqual(false);
            expect(component.reportGroupBorder.borderStyle).toEqual('solid none none none');
            expect(dragEvent.preventDefault).toHaveBeenCalled();
        });

        it('should add border to bottom for valid drop below report group', () => {
            const dragEvent = {
                dataTransfer: {
                    types: [
                        CommonConstants.DRAG_DROP_PARAMS.DRAGGED_WORKPAD_INDEX + 0
                    ]
                },
                preventDefault: jest.fn()
            };
            component.allowDropAboveBelowReportGroup(dragEvent as any, 'BOTTOM');
            expect(component.isReportGroupDropTarget).toEqual(false);
            expect(component.isHeaderDrop).toEqual(false);
            expect(component.reportGroupBorder.borderStyle).toEqual('none none solid none');
            expect(dragEvent.preventDefault).toHaveBeenCalled();
        });
    });

    describe('Test allowAddToReportGroup', () => {
        beforeEach(() => {
            component.isReportGroupDropTarget = false;
            component.isHeaderDrop = false;
        });

        it('allows drop for portfolio not in a report group', () => {
            const dragEvent = {
                dataTransfer: {
                    types: [CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID, CommonConstants.DRAG_DROP_PARAMS.DRAGGED_WORKPAD_INDEX + '0', CommonConstants.DRAG_DROP_PARAMS.DRAGGED_PORTFOLIO_INDEX_IN_WORKPAD + '0']
                },
                preventDefault: jest.fn()
            };
            component.allowAddToReportGroup(dragEvent as any, true);
            expect(component.isReportGroupDropTarget).toEqual(true);
            expect(component.isHeaderDrop).toEqual(true);
            expect(dragEvent.preventDefault).toHaveBeenCalled();
        });
        it('does not allow drop for portfolio in a report group', () => {
            const dragEvent = {
                dataTransfer: {
                    types: [CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID, CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID, CommonConstants.DRAG_DROP_PARAMS.DRAGGED_WORKPAD_INDEX + '0', CommonConstants.DRAG_DROP_PARAMS.DRAGGED_PORTFOLIO_INDEX_IN_WORKPAD + '0']
                },
                preventDefault: jest.fn()
            };
            component.allowAddToReportGroup(dragEvent as any, false);
            expect(component.isReportGroupDropTarget).toEqual(false);
            expect(component.isHeaderDrop).toEqual(false);
            expect(dragEvent.preventDefault).toHaveBeenCalledTimes(0);
        });
        it('allows drop for custom portfolio', () => {
            const dragEvent = {
                dataTransfer: {
                    types: [CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID, CommonConstants.DRAG_DROP_PARAMS.IS_CUSTOM_PORTFOLIO]
                },
                preventDefault: jest.fn()
            };
            component.allowAddToReportGroup(dragEvent as any, true);
            expect(component.isReportGroupDropTarget).toEqual(true);
            expect(component.isHeaderDrop).toEqual(true);
            expect(dragEvent.preventDefault).toHaveBeenCalled();
        });
        it('does not allow drop for what-if portfolio', () => {
            const dragEvent = {
                dataTransfer: {
                    types: [CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID, CommonConstants.DRAG_DROP_PARAMS.IS_WHAT_IF_PORTFOLIO]
                },
                preventDefault: jest.fn()
            };
            component.allowAddToReportGroup(dragEvent as any, true);
            expect(component.isReportGroupDropTarget).toEqual(false);
            expect(component.isHeaderDrop).toEqual(false);
            expect(dragEvent.preventDefault).toHaveBeenCalledTimes(0);
        });
        it('does not allow drop for non-portfolio', () => {
            const dragEvent = {
                dataTransfer: {
                    types: []
                },
                preventDefault: jest.fn()
            };
            component.allowAddToReportGroup(dragEvent as any, false);
            expect(component.isReportGroupDropTarget).toEqual(false);
            expect(component.isHeaderDrop).toEqual(false);
            expect(dragEvent.preventDefault).toHaveBeenCalledTimes(0);
        });
    });

    it('Test onPortfolioDrop', () => {
        const port1 = new Portfolio();
        const port2 = new Portfolio();
        component.reportGroup = new ReportGroup();
        component.reportGroup.addPortfolios(port1);
        const flatWorkpad = new FlatWorkpad();
        flatWorkpad.addPortfolios(port2);
        const report = new Report();
        flatWorkpad.reports = [report];
        flatWorkpad.activeReport = report;
        component.reportGroup.isOpen = false;
        WorkspaceStore.getWorkspace().workpads = [component.reportGroup, flatWorkpad];
        const dragEvent = {
            dataTransfer: {
                getData: jest.fn()
            },
            preventDefault: jest.fn()
        };
        dragEvent.dataTransfer.getData.mockImplementation((key: string) => {
            if (key === CommonConstants.DRAG_DROP_PARAMS.WORKPAD_INDEX) {
                return WorkspaceStore.getWorkspace().workpads.indexOf(flatWorkpad);
            }
        });

        jest.spyOn(WorkspaceStore, 'validateWorkpadAndUpdate').mockImplementation((workpad, portfolio) => WorkspaceStore.updateCurrentWorkpad(workpad, portfolio));

        component.onPortfolioDrop(dragEvent as any);
        expect(WorkspaceStore.getWorkspace().workpads.includes(flatWorkpad)).toBeFalsy();
        expect(component.reportGroup.getAllPortfolios().includes(port2)).toBeTruthy();
        expect(component.reportGroup.activeReport).not.toBeUndefined();
        expect(WorkspaceStore.getCurrentPortfolio()).toEqual(port2);
        expect(component.reportGroup.reports.indexOf(flatWorkpad.reports[0]) > -1).toBeTruthy();
        expect(component.reportGroup.isOpen).toBeTruthy();
    });

});
