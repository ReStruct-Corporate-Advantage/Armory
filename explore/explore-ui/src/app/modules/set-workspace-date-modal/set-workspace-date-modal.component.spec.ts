import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {Workspace} from '@models/workspace/workspace.model';
import {WorkpadService} from '@services/workspace';
import {of} from 'rxjs';
import {WorkspaceStore} from '../../stores';
import {SetWorkspaceDateModalComponent} from './set-workspace-date-modal.component';
import {NotificationService} from '@services/notification';
import {DateValue} from '@blk/explore-ui-core';

describe('SetWorkspaceDateModalComponent', () => {
    let component: SetWorkspaceDateModalComponent;
    let fixture: ComponentFixture<SetWorkspaceDateModalComponent>;

    const WorkpadServiceStub = {
        updatePortInfoOnDateChange: jest.fn()
    };

    const notificationServiceStub = {
        invokeWidgetReloadPrompt: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SetWorkspaceDateModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: WorkpadService, useValue: WorkpadServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub}]
        });

        fixture = TestBed.createComponent(SetWorkspaceDateModalComponent);
        component = fixture.componentInstance;
        const testDate = new DateValue({date: '01/01/2020', dateString: false, dateStringValue: ''});
        const testPortfolio = new Portfolio();
        testPortfolio.datePicker = testDate;
        jest.spyOn(WorkspaceStore, 'getCurrentPortfolio').mockImplementation(function() {
            return testPortfolio;
        });
        fixture.detectChanges();
        component.isOpen = true;
    });

    describe('ngOnInit Test', () => {
        it('should update the html template and set modal header and update date', () => {
            component.ngOnInit();
            expect(fixture.debugElement.nativeElement.querySelector('aux-modal')).toMatchSnapshot();
            expect(component.modalHeader).toBe('Apply Workspace Date');
            expect(component.DONE_TEXT).toBe('Apply');
            expect(component.CLOSE_TEXT).toBe('Cancel');
            expect(component.date).toStrictEqual(new DateValue({
                date: '01/01/2020',
                dateString: false,
                dateStringValue: ''
            }));
        });
    });

    describe('closeModal Test', () => {
        it('should close modal on close button clicked', () => {
            jest.spyOn(component.modalClosed, 'emit');
            component.closeModal();

            expect(component.isOpen).toBeFalsy();
            expect(component.modalClosed.emit).toHaveBeenCalled();
        });
    });

    describe('closeModal Test', () => {
        it('should close modal on done button clicked', () => {
            jest.spyOn(component.modalClosed, 'emit');
            component.closeModal();

            expect(component.isOpen).toBeFalsy();
            expect(component.modalClosed.emit).toHaveBeenCalled();
        });
    });

    describe('onDateChange Test', () => {
        it('should update date when date is changed from calendar', () => {
            let event = new DateValue({dateStringValue: 'T-1', dateString: true, calcode: 'GreenPkg'});
            component.onDateChange(event);
            expect(component.isRelativeDate).toBeTruthy();
            expect(component.updatedDate).toStrictEqual(new DateValue({
                dateString: true,
                dateStringValue: 'T-1',
                calcode: 'GreenPkg'
            }));

            event = new DateValue({date: '02/01/2020', dateString: false, calcode: 'GreenPkg'});
            component.onDateChange(event);
            expect(component.updatedDate).toStrictEqual(new DateValue({
                date: '02/01/2020',
                dateString: false,
                calcode: 'GreenPkg'
            }));
            expect(component.isRelativeDate).toBeFalsy();
        });
    });

    describe('onDone Test', () => {
        it('should update date of portfolios when done is clicked and close modal should be called', () => {
            WorkspaceStore.init();
            component.updatedDate = new DateValue({date: '01/01/2020', dateString: false, calcode: 'GreenPkg'});
            const workspace = new Workspace();
            const workpad = new FlatWorkpad();
            const testPortfolio = new Portfolio();
            testPortfolio.datePicker = new DateValue({date: '01/01/2020', dateString: false, calcode: 'GreenPkg'});
            workpad.addPortfolios(testPortfolio);
            workspace.workpads.push(workpad);
            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(workspace);
            jest.spyOn(WorkspaceStore, 'getWorkspace$').mockReturnValue(of(workspace));
            jest.spyOn(component, 'closeModal');
            jest.spyOn(WorkpadServiceStub, 'updatePortInfoOnDateChange');
            component.onDone();
            expect(notificationServiceStub.invokeWidgetReloadPrompt).not.toHaveBeenCalled();
            expect(WorkpadServiceStub.updatePortInfoOnDateChange).not.toHaveBeenCalled();
            expect(component.closeModal).toHaveBeenCalled();
            expect(testPortfolio.datePicker).not.toBe(component.updatedDate);
            expect(testPortfolio.datePicker).toEqual(component.updatedDate);
            component.updatedDate = new DateValue({date: '02/01/2020', dateString: false, calcode: 'GreenPkg'});
            component.onDone();
            expect(notificationServiceStub.invokeWidgetReloadPrompt).toHaveBeenCalled();
            expect(WorkpadServiceStub.updatePortInfoOnDateChange).toHaveBeenCalled();
            expect(component.closeModal).toHaveBeenCalled();
            expect(testPortfolio.datePicker).not.toBe(component.updatedDate);
            expect(testPortfolio.datePicker).toEqual(component.updatedDate);
        });
    });
});
