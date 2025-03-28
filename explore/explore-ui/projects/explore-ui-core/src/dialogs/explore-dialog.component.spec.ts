import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of} from 'rxjs';

import {ExploreDialogComponent} from './explore-dialog.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ExploreDialogParam} from '../ui/models/explore-dialog-param.model';
import {AlertConstants} from '../ui/constants/alert.constants';

describe('ExploreDialogComponent', () => {
    let component: ExploreDialogComponent;
    let fixture: ComponentFixture<ExploreDialogComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExploreDialogComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExploreDialogComponent);
        component = fixture.componentInstance;

        component.dialogContent$ = of(new ExploreDialogParam(
            AlertConstants.TYPE.PROMPT,
            AlertConstants.HEADER.CONFIRM,
            AlertConstants.BODY.FAVORITE_WITH_SAME_NAME,
            AlertConstants.BTN.OK,
            AlertConstants.BTN.CANCEL,
            jest.fn,
            jest.fn,
            {favId: 12345, owner: 'seakim'}
        ));

        component.ngOnInit();
    });

    describe('onInit Test', () => {
        it('should subscribe to showDialog$ and update variables with callBack', () => {
            fixture.detectChanges();

            expect(component.type).toBe('prompt');
            expect(component.header).toBe('Please confirm');
            expect(component.message).toBe('A favorite exists with the same name. If you wish to continue, the existing favorite will be overridden.');
            expect(component.primaryButtonLabel).toBe('Ok');
            expect(component.secondaryButtonLabel).toBe('Cancel');
            expect(component.dialogCallBack1).toEqual(jest.fn);
            expect(component.dialogCallBack2).toEqual(jest.fn);
            expect(component.dialogCallBackArgs).toEqual({favId: 12345, owner: 'seakim'});
            expect(fixture.debugElement.nativeElement.querySelector('aux-dialog')).toMatchSnapshot();
        });
    });

    describe('closeDialog Test', () => {
        it('should close dialog and run dialogCallBack2 if provided', () => {
            jest.spyOn(component, 'dialogCallBack2');
            jest.spyOn(component.emitDialogClosed, 'emit');
            component.closeDialog();

            expect(component.dialogCallBack2).toHaveBeenCalled();
            expect(component.isOpen).toBeFalsy();
            expect(component.emitDialogClosed.emit).toHaveBeenCalled();
        });

        it('should close dialog and run dialogCallBack1 with dialogCallBackArgs if provided', () => {
            jest.spyOn(component, 'dialogCallBack1');
            jest.spyOn(component.emitDialogClosed, 'emit');
            component.closeDialog(true);

            expect(component.dialogCallBack1).toHaveBeenCalledWith({favId: 12345, owner: 'seakim'});
            expect(component.isOpen).toBeFalsy();
            expect(component.emitDialogClosed.emit).toHaveBeenCalled();
        });
    });
});
