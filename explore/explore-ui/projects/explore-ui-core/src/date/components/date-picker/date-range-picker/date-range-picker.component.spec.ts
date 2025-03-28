import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import moment from 'moment';
import {DateValue} from '../../../models/date-value/date-value.model';
import {DateService} from '../../../services/date.service';
import {DateRangePickerComponent} from './date-range-picker.component';
import {Observable, of} from 'rxjs';
import {DateFormatConstants} from '../../../constants';

describe('Date Range Picker Component', () => {
    let component: DateRangePickerComponent;
    let fixture: ComponentFixture<DateRangePickerComponent>;

    let dateMockValue: Date;
    const dateServiceStub = {
        parseDateString$: jest.fn((): Observable<Date> => {
            return of(dateMockValue);
        }),
        getMaxDateByCalendarCode$: jest.fn(() => of(dateMockValue))
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                DateRangePickerComponent,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: DateService, useValue: dateServiceStub}
            ]
        });

        // Create the component.
        fixture = TestBed.createComponent(DateRangePickerComponent);
        component = fixture.componentInstance;

        // Add the required parameters.
        component.fromDate = DateValue.newDate('01/01/2020');
        component.toDate = DateValue.newDate('01/10/2020');
        component.maxDate = moment('01/11/2020', DateFormatConstants.MMDDYYYY_SLASH, true);

        fixture.detectChanges();
        component.ngOnInit();

        const changes = {
            fromDate: new SimpleChange(null, DateValue.newDate('01/01/2020'), false),
            toDate: new SimpleChange(null, DateValue.newDate('01/10/2020'), false)
        };

        component.ngOnChanges(changes);
    });

    it('The control initializes correctly', () => {
        expect(component.absoluteStartDate).toBe('01/01/2020');
        expect(component.displayStartDate).toBe('01/01/2020');
        expect(component.absoluteEndDate).toBe('01/10/2020');
        expect(component.displayEndDate).toBe('01/10/2020');
    });

    it('validateDateRange Test', () => {
            component.toDate = DateValue.newDate('01/20/2020');
            component.fromDate = DateValue.newDate('01/15/2020');
            component.validateDateRange(DateValue.newDate('01/20/2020'), 'startValueChanged');
            expect(component.isValid).toBeTruthy();
            component.validateDateRange(DateValue.newDate('01/21/2020'), 'startValueChanged');
            expect(component.isValid).toBeFalsy();
            component.validateDateRange(DateValue.newDate('01/19/2020'), 'startValueChanged');
            expect(component.isValid).toBeTruthy();
            component.validateDateRange(DateValue.newDate('01/25/2020'), 'endValueChanged');
            expect(component.isValid).toBeTruthy();
            component.validateDateRange(DateValue.newDate('01/15/2020'), 'endValueChanged');
            expect(component.isValid).toBeTruthy();
            component.validateDateRange(DateValue.newDate('01/14/2020'), 'endValueChanged');
            expect(component.isValid).toBeFalsy();
    });

    it('Get the date format for the date picker', () => {
        // Validate for a relative date.
        let dateValue = DateValue.newRelativeDate('T-5');
        expect(dateValue.format(component.DATE_FORMAT)).toBe(dateValue.dateStringValue);

        // Validate for an actual date.
        dateValue = DateValue.newDate('01/10/2020');
        expect(dateValue.format(component.DATE_FORMAT, true)).toBe('01/10/2020');
    });

    it('Date change event - relative date', () => {
        const event = {detail: {value: 't-5'}} as any as CustomEvent;

        // Set the date value we are expecting in this test.
        dateMockValue = moment('05-01-2020', 'DD-MM-YYYY').toDate();

        // Trigger event to set the date.
        const dateValue = new DateValue();
        component.onDateChanged(dateValue, event);

        // Validate that the scenario is no longer enabled.
        expect(dateValue.dateString).toBeTruthy();
        expect(dateValue.dateStringValue).toBe('t-5');

        // When a relative date is set we also need to validate that the date request happens.
        expect(dateServiceStub.parseDateString$).toHaveBeenCalled();
        expect(dateValue.format('DD-MM-YYYY', true)).toBe('05-01-2020');
    });

    it('Date change event - actual date', () => {
        const event = {
             detail: {value: '01/10/2020'},
            dateMoment: moment('10-01-2020', 'DD-MM-YYYY')
        } as any as CustomEvent;

        // Trigger event to set the date.
        const dateValue = new DateValue();
        component.onDateChanged(dateValue, event);

        // Validate that the date is set correctly
        expect(dateValue.dateString).toBeFalsy();
        expect(dateValue.format('MM/DD/YYYY')).toBe('01/10/2020');
    });

    describe('updateDatePicker Test', () => {
        const dateValue = new DateValue({calCode: 'GP_HK_STD', dateString: true, dateStringValue: 'T-1', date: '09/15/2020'});

        beforeEach(() => {
            jest.spyOn(component.dateRangeChange, 'emit');
        });

        it('should update absoluteStartDate/displayStartDate with startDateChange event', () => {
            component.updateDatePicker(dateValue, 'startValueChanged');

            expect(component.absoluteStartDate).toBe('09/15/2020');
            expect(component.displayStartDate).toBe('T-1');
            expect(component.dateRangeChange.emit).toHaveBeenCalled();
        });

        it('should update absoluteEndDate/displayEndDate with endDateChange event', () => {
            component.updateDatePicker(dateValue, 'endValueChanged');

            expect(component.absoluteEndDate).toBe('09/15/2020');
            expect(component.displayEndDate).toBe('T-1');
            expect(component.dateRangeChange.emit).toHaveBeenCalled();
        });
    });
});
