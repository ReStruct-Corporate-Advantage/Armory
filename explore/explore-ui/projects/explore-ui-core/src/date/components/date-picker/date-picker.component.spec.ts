import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Observable, of, Subject} from 'rxjs';
import {DateValue} from '../../models/date-value/date-value.model';
import {DateService} from '../../services/date.service';
import {DateStore} from '../../stores';
import {CalendarDateUtils} from '../../utils';
import {DatePickerComponent} from './date-picker.component';
import moment from 'moment';

describe('datePickerComponent', () => {
    let component: DatePickerComponent;
    let fixture: ComponentFixture<DatePickerComponent>;

    let dateMockValue: Date = new Date('5/18/2020');
    let dateServiceStub;

    beforeEach(() => {
        dateServiceStub = {
            parseDateString$: jest.fn(
                (): Observable<Date> => {
                    return of(dateMockValue);
                }
            ),
            midNightRefresh$: new Subject(),
            getMaxDateByCalendarCode$: jest.fn(() => of(dateMockValue))
        };

        TestBed.configureTestingModule({
            declarations: [DatePickerComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: DateService, useValue: dateServiceStub}]
        });

        fixture = TestBed.createComponent(DatePickerComponent);
        component = fixture.componentInstance;
        component.dateObject = DateValue.newRelativeDate('T-1');
        component.dateObject.calCode = 'GP_HK_STD';
        component.maxDate = CalendarDateUtils.getDateInMoment('01/01/2021');

        DateStore.updateCurrentDate(new DateValue({date: '05/18/2020'}));
    });

    it('Test ngOnInit', () => {
        component.ngOnInit();
        expect(component.minDateString).toBe(undefined);
        expect(component.maxDateString).toBe('01/01/2021');

        // Give it a null maxDate and re-initialize
        component.maxDate = null;
        dateServiceStub.getMaxDateByCalendarCode$ = () => of(new Date('04/01/2020'));
        component.ngOnInit();
        expect(component.maxDateString).toBe('04/01/2020');
        expect(component.closeCalendarOnBlur).toBeDefined();
        expect(component.closeCalendarOnBlur).not.toBeNull();
    });

    it('Test ngOnInit maxDate on Sunday', () => {
        dateServiceStub.getMaxDateByCalendarCode$ = () => of(new Date('10/01/2023'));

        component.maxDate = null;
        component.ngOnInit();

        expect(component.maxDateString).toEqual('10/01/2023');
    });

    it('Test ngOnChanges maxDate', () => {
        dateServiceStub.getMaxDateByCalendarCode$ = () => of(new Date('10/03/2023'));

        const previousValue = component.dateObject;
        const currentValue = new DateValue();
        currentValue.date = '10/03/2023';
        component.dateObject = currentValue;
        component.ngOnChanges({ dateObject: { previousValue, currentValue, isFirstChange: () => false, firstChange: null}});

        expect(component.maxDateString).toEqual('10/03/2023');
    });

    describe('Today button clicked Test', () => {
        const event = new CustomEvent<any>('');

        beforeEach(() => {
            component.absoluteDate = '03/11/2016';
            component.absoluteDateCopy = '03/11/2016';
        });

        it('should update absoluteDate for calendar page to show where today is', () => {
            jest.spyOn(CalendarDateUtils, 'checkOverrideAndGetToday').mockReturnValue(moment('10/23/2020'));
            event.initCustomEvent('', true, true, {todayInFooter: true});
            component.onFooterClicked(event);

            expect(component.absoluteDate).toBe('10/23/2020');
        });
    });

    describe('onDateChanged', () => {
        const event = new CustomEvent<any>('');
        it('tests the date change with an Absolute Date', () => {
            // Create the required spies to check validate the outcome.
            jest.spyOn(dateServiceStub, 'parseDateString$');
            jest.spyOn(component.dateChange, 'emit');

            // The date comes in with the format DD/MM/YYYY.
            event.initCustomEvent('', true, true, {
                value: '01/23/2020',
                dateMoment: CalendarDateUtils.getDateInMoment('01/23/2020')
            });

            // Trigger the date change.
            component.onDateChanged(component.dateObject, event);

            // Validate the expected outcomes.
            expect(dateServiceStub.parseDateString$).not.toHaveBeenCalled();
            expect(component.dateChange.emit).toHaveBeenCalled();
            expect(component.dateObject.date).toBe('01/23/2020');
        });

        it('tests the date change with a Relative Date', () => {
            // Create the required spies to check validate the outcome.
            dateMockValue = new Date(2020, 3, 19);
            jest.spyOn(dateServiceStub, 'parseDateString$');
            jest.spyOn(component.dateChange, 'emit');

            // Set the event with a relative ate..
            event.initCustomEvent('', true, true, {
                value: 'T-3'
            });

            // Trigger the date change.
            component.onDateChanged(component.dateObject, event);

            // Validate the expected outcomes.
            expect(dateServiceStub.parseDateString$).toHaveBeenCalled();
            expect(component.dateChange.emit).toHaveBeenCalled();
            expect(component.dateObject.dateString).toBeTruthy();
            expect(component.dateObject.dateStringValue).toBe('T-3');
            expect(component.dateObject.date).toBe('04/19/2020');
        });

        it('tests the date change with an invalid date', () => {
            // Create the required spies to check validate the outcome.
            jest.spyOn(dateServiceStub, 'parseDateString$');
            jest.spyOn(component.dateChange, 'emit');
            dateServiceStub.parseDateString$.mockReset();

            // The date comes in with the format DD/MM/YYYY.
            event.initCustomEvent('', true, true, {
                value: '01/23/2099',
                dateMoment: CalendarDateUtils.getDateInMoment('01/23/2099', true)
            });

            // Trigger the date change.
            expect(() => {
                component.onDateChanged(component.dateObject, event);
            }).toThrow(Error('Please enter a valid date'));

            // Validate the expected outcomes.
            expect(dateServiceStub.parseDateString$).not.toHaveBeenCalled();
            expect(component.dateChange.emit).not.toHaveBeenCalled();
            expect(component.dateObject.date).toBeUndefined();
        });
    });

    describe('validate', () => {
        it('tests with an undefined date', () => {
            const testDate: DateValue = undefined;
            expect(() => {
                component['validateDate'](testDate);
            }).toThrow(Error('The date is invalid'));
        });

        it('tests with an date greater than the maxDate', () => {
            const testDate: DateValue = DateValue.newDate('01/01/2099');
            component.maxDate = CalendarDateUtils.getDateInMoment('01/01/2021', true);
            expect(() => {
                component['validateDate'](testDate);
            }).toThrow(Error('Please enter a valid date'));
        });
    });

    describe('onDateChangedFromInputBox Test', () => {
        let dateValue: DateValue;
        beforeEach(() => {
            component.absoluteDate = '03/11/2016';
            dateValue = new DateValue({calCode: 'GP_HK_STD', dateString: false, date: '03/11/2016'});
            jest.spyOn(component, 'onDateChanged');
        });

        it('should not do anything if event is not from manual input box change', () => {
            const event: any = new CustomEvent('build', {detail: {srcEvent: undefined}});
            component.onDateChangedFromInputBox(dateValue, event);

            expect(component.onDateChanged).not.toHaveBeenCalled();
        });

        it('should set isValid to false if event is from manual input box change and no value', () => {
            const event: any = new CustomEvent('build', {detail: {srcEvent: new MouseEvent('click'), value: ''}});
            component.onDateChangedFromInputBox(dateValue, event);

            expect(component.isValid).toBeFalsy();
            expect(component.onDateChanged).not.toHaveBeenCalled();
        });

        it('should call onDateChanged if event is from manual input box change on value changed', () => {
            const event: any = new CustomEvent('build', {detail: {srcEvent: new MouseEvent('click'), value: '03/11/2016'}});
            component.onDateChangedFromInputBox(dateValue, event);

            expect(component.onDateChanged).toHaveBeenCalledWith(dateValue, event);
        });
    });

    describe('isInputInCorrectFormat Test', () => {
        it('should check if the input string is in correct format', () => {
            component.DATE_FORMAT = 'MM/DD/YYYY';
            component.includeRelativeDate = true;

            expect(component.isInputInCorrectFormat('01/15/2020')).toBeTruthy();
            expect(component.isInputInCorrectFormat('T-1ME')).toBeTruthy();

            expect(component.isInputInCorrectFormat('01/15/202')).toBeFalsy();
            expect(component.isInputInCorrectFormat('T-1MA')).toBeFalsy();
            expect(component.isInputInCorrectFormat('15/01/2020')).toBeFalsy();

            component.includeRelativeDate = false;
            expect(component.isInputInCorrectFormat('T-1ME')).toBeFalsy();

            component.DATE_FORMAT = 'DD-MMM-YYYY';
            expect(component.isInputInCorrectFormat('01/15/2020')).toBeFalsy();
            expect(component.isInputInCorrectFormat('15-JAN-2020')).toBeTruthy();
        });
    });
});
