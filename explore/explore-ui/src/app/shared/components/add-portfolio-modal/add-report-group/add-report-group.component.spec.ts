import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AddReportGroupComponent} from './add-report-group.component';
import {AddPortfolioService} from '../add-portfolio.service';
import {TelemetryClickService} from '@services/telemetry/telemetry-click.service';
import {ReportGroup} from '@models/workspace/report-group.model';
import {CommonConstants} from '@constants/common.constants';


describe('AddReportGroupComponent', () => {
    let component: AddReportGroupComponent;
    let fixture: ComponentFixture<AddReportGroupComponent>;

    const addPortfolioServiceStub = {};
    const telemetryClickServiceStub = {
        reportGroupClick: jest.fn()
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AddReportGroupComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: AddPortfolioService, useValue: addPortfolioServiceStub},
                {provide: TelemetryClickService, useValue: telemetryClickServiceStub}
            ]
        });

        fixture = TestBed.createComponent(AddReportGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('onCheckboxChanged Test', () => {
        it('should add report group to checkedReportGroupList', () => {
            const reportGroup = new ReportGroup();
            reportGroup.title = 'Test Report Group';
            component.checkedReportGroupList = [];
            component.onCheckboxChanged(reportGroup);
            expect(component.checkedReportGroupList.length).toBe(1);
            expect(component.checkedReportGroupList[0].title).toBe('Test Report Group');
        });
        it('should remove report group from checkedReportGroupList', () => {
            const reportGroup = new ReportGroup();
            reportGroup.title = 'Test Report Group';
            component.checkedReportGroupList = [reportGroup];
            component.onCheckboxChanged(reportGroup);
            expect(component.checkedReportGroupList.length).toBe(0);
        });
    });

    describe('tests with editText element', () => {
        beforeEach(() => {
            component.editText = {
                setValue: jest.fn((value: string) => component.editText.value = value),
                focusInput: jest.fn(() => {}),
                value: '',
            } as any;
        });

        it('should test doubleClick method and set editingReportGroup and value of editText textbox', () => {
            const reportGroup = new ReportGroup();
            component.doubleClick(reportGroup);
            expect(component.editingReportGroup).toBe(reportGroup);
        });

        it('should test onInputBlur method and set title of the selected report group', () => {
            const reportGroup = new ReportGroup();
            component.reportGroupList = [reportGroup];
            component.editingReportGroup = reportGroup;
            component.editText.value = 'Test';
            component.onInputSubmit();
            expect(component.editingReportGroup).toBe(undefined);
            expect(component.editText.value).toBe('Test');
        });

        it('should test addReportGroup method and add new report group', () => {
            component.reportGroupList = [];
            component.checkedReportGroupList = [];
            component.addReportGroup();

            expect(component.reportGroupList.length).toBe(1);
            expect(component.checkedReportGroupList.length).toBe(1);
            expect(component['telemetryClickService'].reportGroupClick).toHaveBeenCalled();
        });
    });

    describe('test Add report group button callbacks', () => {
        beforeEach(() => {
            component.isOpen = true;
            jest.spyOn(component.addReportGroupButtonClicked, 'emit');
        });

        it('Test addReportGroupButtonClickedCallback with Done', () => {
            component.addReportGroupButtonClickedCallback(CommonConstants.BUTTON_TEXT.DONE);
            expect(component.isOpen).toBeFalsy();
            expect(component.addReportGroupButtonClicked.emit).toHaveBeenCalledWith(CommonConstants.BUTTON_TEXT.DONE);
        });

        it('Test addReportGroupClickedCallback with Cancel', () => {
            component.addReportGroupButtonClickedCallback(CommonConstants.BUTTON_TEXT.CANCEL);
            expect(component.isOpen).toBeFalsy();
            expect(component.addReportGroupButtonClicked.emit).toHaveBeenCalledWith(CommonConstants.BUTTON_TEXT.CANCEL);
        });
    });
});
