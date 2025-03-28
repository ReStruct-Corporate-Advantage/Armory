import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BehaviorSubject} from 'rxjs';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ReportContainerComponent} from './report-container.component';
import {WorkspaceStore} from '../../../stores';
import {AppStore} from '../../../app.store';
import {Report} from '@models/workspace/report.model';
import {Widget} from '@models/widget/widget.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {AlertConstants, ExploreDialogParam} from '@blk/explore-ui-core';
import {AuxBadgeStyleEnum} from '@blk/aladdin-angular-components';
import { ComparisonConfig } from '@models/config/comparison-config.model';

describe('ReportContainerComponent', () => {
    let component: ReportContainerComponent;
    let fixture: ComponentFixture<ReportContainerComponent>;
    let workpad: FlatWorkpad;
    let report1: Report;
    let report2: Report;
    let report3: Report;

    beforeEach(() => {
        report1 = new Report();
        report1.title = 'Report 1';
        report1.key = 12345;
        report1.widgets = [new Widget()];
        report2 = new Report();
        report2.title = 'Report 2';
        report2.key = 23456;
        report2.widgets = [new Widget()];
        report3 = new Report();
        report3.title = 'Report 3';
        report3.key = 34567;
        report3.widgets = [new Widget()];   
        workpad = new FlatWorkpad();
        workpad.reports = [report1, report2, report3];
        WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(workpad);
        WorkspaceStore.currentReport$ = new BehaviorSubject<Report>(report1);
        WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(new Portfolio('PEP'));
        WorkspaceStore.currentWidget$ = new BehaviorSubject<Widget>(undefined);
        AppStore.showCompositionModel$ = new BehaviorSubject<boolean>(false);

        TestBed.configureTestingModule({
            declarations: [ReportContainerComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: []
        });

        fixture = TestBed.createComponent(ReportContainerComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    describe('onInit Test', () => {
        it('should have required subscriptions defined.', () => {
            expect(component.currentReport$).toBeDefined();
            expect(component.showCompositionModel).toBeDefined();
        });

        it('should show report-bar in AND report-presenter in the DOM if currentReport has widget', () => {
            expect(WorkspaceStore.getCurrentReport().widgets.length > 0).toBeTruthy();
            expect(fixture.debugElement.nativeElement.querySelector('app-report-bar')).toMatchSnapshot();
            expect(fixture.debugElement.nativeElement.querySelector('app-report-presenter')).toMatchSnapshot();
        });

        it('should NOT show report-presenter in DOM if currentReport doesn`t have a widget', () => {
            report1.widgets = [];
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement.querySelector('app-report-bar')).toMatchSnapshot();
            expect(fixture.debugElement.nativeElement.querySelector('app-report-presenter')).toMatchSnapshot();
        });
    });

    describe('onAddTabClicked Test', () => {
        it('should create a new report and show report-template-selector AND NOT report-presenter in the DOM', () => {
            component.onAddTabClicked();
            fixture.detectChanges();

            expect(WorkspaceStore.getCurrentWorkpad().reports.length).toBe(4);
            expect(WorkspaceStore.getCurrentWorkpad().reports[3].title).toBe('Report 4');

            expect(WorkspaceStore.getCurrentReport()).toBe(WorkspaceStore.getCurrentWorkpad().reports[3]);

            expect(fixture.debugElement.nativeElement.querySelector('app-new-report')).toBeTruthy();
            expect(fixture.debugElement.nativeElement.querySelector('app-report-bar')).toBeNull();
            expect(fixture.debugElement.nativeElement.querySelector('app-report-presenter')).toBeNull();
        });
    });

    /*describe('deleteReportModal Test', () => {
        it('should remove report if present in report panel', ()  => {
            expect(WorkspaceStore.getCurrentWorkpad().reports.length).toBe(3);
            expect(WorkspaceStore.getCurrentReport()).toBe(report1);
            component.deleteReportModal(report1);

            expect(WorkspaceStore.getCurrentWorkpad().reports.length).toBe(2);
            expect(WorkspaceStore.getCurrentReport()).toBe(report2);
        });
    });*/

    describe('onTabSelected Test', () => {
        const event = new CustomEvent('');
        event.initCustomEvent('', true, true, {
            uid: '23456'
        });

        it('should updateCurrentReport and show show report-bar with title, "Report 2", in AND report-presenter in the DOM', () => {
            expect(WorkspaceStore.getCurrentReport()).toBe(report1);

            component.onTabSelected(event);
            fixture.detectChanges();

            expect(WorkspaceStore.getCurrentReport()).toBe(report2);
            expect(fixture.debugElement.nativeElement.querySelector('app-report-bar')).toMatchSnapshot();
            expect(fixture.debugElement.nativeElement.querySelector('app-report-presenter')).toMatchSnapshot();
        });

        it('should error out', () => {
            jest.spyOn(console, 'error');
            event.detail['uid'] = undefined;
            component.onTabSelected(event);
            expect(console.error).toHaveBeenCalledWith('error on finding tab uid');
        });
    });

    describe('onTabEdited Test', () => {
        const event = new CustomEvent('') as any;
        event.initCustomEvent('', true, true, {
            uid: '12345',
            newLabel: 'Edited Report Name'
        });

        it('should update report title and show report-bar with title, "Edited Report name", AND report-presenter in the DOM', () => {
            component.onTabEdited(event);
            fixture.detectChanges();

            expect(WorkspaceStore.getCurrentReport()).toBe(report1);
            expect(WorkspaceStore.getCurrentReport().title).toBe('Edited Report Name');
            expect(fixture.debugElement.nativeElement.querySelector('app-report-bar')).toMatchSnapshot();
            expect(fixture.debugElement.nativeElement.querySelector('app-report-presenter')).toMatchSnapshot();

            // Also validate that when the event has no text the value is left as is.
            event.detail.newLabel = ' ';
            component.onTabEdited(event);
            expect(WorkspaceStore.getCurrentReport().title).toBe('Edited Report Name');
        });

        it('should error out', () => {
            jest.spyOn(console, 'error');
            event.detail['uid'] = undefined;
            component.onTabSelected(event);
            expect(console.error).toHaveBeenCalledWith('error on finding tab uid');
        });
    });

    describe('onTabDragAndDropped Test', () => {
        it('should update currentWorkpad reports` order on tab dragged', () => {
            expect(WorkspaceStore.getCurrentWorkpad().reports[0].title).toBe('Report 1');
            expect(WorkspaceStore.getCurrentWorkpad().reports[1].title).toBe('Report 2');
            expect(WorkspaceStore.getCurrentWorkpad().reports[2].title).toBe('Report 3');

            let event: any = {detail: {oldIndex: 2, newIndex: 0}};
            component.onTabDragAndDropped(event);

            expect(WorkspaceStore.getCurrentWorkpad().reports[0].title).toBe('Report 3');
            expect(WorkspaceStore.getCurrentWorkpad().reports[1].title).toBe('Report 1');
            expect(WorkspaceStore.getCurrentWorkpad().reports[2].title).toBe('Report 2');

            event = {detail: {oldIndex: 0, newIndex: 2}};
            component.onTabDragAndDropped(event);

            expect(WorkspaceStore.getCurrentWorkpad().reports[0].title).toBe('Report 1');
            expect(WorkspaceStore.getCurrentWorkpad().reports[1].title).toBe('Report 2');
            expect(WorkspaceStore.getCurrentWorkpad().reports[2].title).toBe('Report 3');
        });
    });

    describe('onRemoveTabClicked Test', () => {
        let tab;
        const event = new CustomEvent('') as any;
        event.initCustomEvent('', true, true, {
            uid: '12345'
        });

        beforeEach(() => {
            tab = {eventData: report1};
        });

        it('should open dialog with warning before to delete report', () => {

            jest.spyOn(component['notificationService'], 'openDialog');

            const expectedParam = new ExploreDialogParam(
                AlertConstants.TYPE.ALERT_WITH_OPTIONS,
                AlertConstants.HEADER.CLOSE_REPORT,
                AlertConstants.BODY.CLOSE_REPORT,
                AlertConstants.BTN.CONFIRM,
                AlertConstants.BTN.CANCEL,
                component.deleteReport,
                null,
                12345
            );

            component.onRemoveTabClicked(event);

            expect(component['notificationService'].openDialog).toHaveBeenCalledWith(expectedParam);
        });

        it('should error out', () => {
            jest.spyOn(console, 'error');
            event.detail['uid'] = undefined;
            component.onTabSelected(event);
            expect(console.error).toHaveBeenCalledWith('error on finding tab uid');
        });

        it('should remove report if present in report panel', ()  => {
            expect(WorkspaceStore.getCurrentWorkpad().reports.length).toBe(3);
            expect(WorkspaceStore.getCurrentReport()).toBe(report1);
            component.removeReportFromReportPanel(report1);

            expect(WorkspaceStore.getCurrentWorkpad().reports.length).toBe(2);
            expect(WorkspaceStore.getCurrentReport()).toBe(report2);
        });


        describe('deleteReport Test', () => {
            it('should delete report', () => {
                expect(WorkspaceStore.getCurrentWorkpad().reports.length).toBe(3);
                expect(WorkspaceStore.getCurrentReport()).toBe(report1);
                component.deleteReport(12345);

                expect(WorkspaceStore.getCurrentWorkpad().reports.length).toBe(2);
                expect(WorkspaceStore.getCurrentReport()).toBe(report2);
                component.deleteReport(23456);

                expect(WorkspaceStore.getCurrentWorkpad().reports.length).toBe(1);
                expect(WorkspaceStore.getCurrentReport()).toBe(report3);
                component.deleteReport(34567);

                expect(WorkspaceStore.getCurrentWorkpad().reports.length).toBe(1);
                expect(WorkspaceStore.getCurrentReport().title).toBe('Report 1');
            });
        });
    });

    it('should test updateAuxTabBar with badge for compare mode', () => {
        const currentReport = WorkspaceStore.getCurrentReport();
        currentReport.comparisonConfigId = 123;
        const mockComparisonConfig = new ComparisonConfig();
        mockComparisonConfig.portComparisonList = ['a', 'b'];
        WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.set(123, mockComparisonConfig);

        expect(currentReport.title).toBe('Report 1');
        expect(currentReport.key).toBe(12345);
        expect(component.reportTabs[0]).toEqual({label: 'Report 1', uid: '12345'});

        component.initializeReportTabs();
        expect(component.reportTabs[0]).toEqual({label: 'Report 1', uid: '12345', badgeSlot: {badgeStyle: AuxBadgeStyleEnum.NEUTRAL, badgeValue: 'Multi'}});

        WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.delete(123);

        component.initializeReportTabs();
        expect(component.reportTabs[0]).toEqual({label: 'Report 1', uid: '12345'});
    });

    describe('New Report Modal Tests', () => {
        it('should display the new report modal when isNewReportModalOpen is true', () => {
            component.isNewReportModalOpen = true;
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement.querySelector('app-new-report')).toMatchSnapshot();
        })

        it('should not display the new report modal when isNewReportModalOpen is false', () => {
            component.isNewReportModalOpen = false;
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement.querySelector('app-new-report')).toBeNull();
        });
    })
});
