import {ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
    AbstractFavoriteConfig,
    Calendar,
    CalendarDateUtils,
    CoreDefinitionStore,
    DateService,
    DateStore,
    DateValue
} from '@blk/explore-ui-core';
import {Observable, of, Subject} from 'rxjs';
import {CalendarTestUtils} from './calendar-test.utils';
import {DatePickerWithCalendarComponent} from './date-picker-with-calendar.component';
import {Portfolio} from "../../../models/portfolio/portfolio.model";
import dummyScheduledJobs from '@assets/data/dummy-scheduled-jobs.json';
import {ICellEditorParams} from 'ag-grid-community';

describe('DatePickerWithCalendarComponent', () => {
    let component: DatePickerWithCalendarComponent;
    let fixture: ComponentFixture<DatePickerWithCalendarComponent>;

    const dateMockValue: Date = new Date('5/18/2020');
    const dateServiceStub = {
        parseDateString$: jest.fn(
            (): Observable<Date> => {
                return of(dateMockValue);
            }
        ),
        getMaxDateByCalendarCode$: jest.fn(
            (): Observable<Date> => {
                return of(dateMockValue);
            }
        ),
        midNightRefresh$: new Subject()
    };
    const changeDetectorRefStub = {
        detectChanges: jest.fn()
    };

    const expectedSelectedCalendar = new Calendar({
        calendarCode: 'GP_HK_STD',
        calendarName: 'HK_STD',
        holidays: [
            {month: 1, year: 2010, day: 1},
            {month: 1, year: 2013, day: 1},
            {month: 1, year: 2014, day: 1},
            {month: 1, year: 2015, day: 1},
            {month: 1, year: 2016, day: 1},
            {month: 1, year: 2017, day: 2},
            {month: 1, year: 2018, day: 1},
            {month: 1, year: 2019, day: 1},
            {month: 1, year: 2020, day: 1}
        ]
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DatePickerWithCalendarComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: DateService, useValue: dateServiceStub},
                {provide: ChangeDetectorRef, useValue: changeDetectorRefStub}
            ]
        });

        fixture = TestBed.createComponent(DatePickerWithCalendarComponent);
        component = fixture.componentInstance;
        component.dateObject = DateValue.newRelativeDate('T-1');
        component.dateObject.calCode = 'GP_HK_STD';
        component.maxDate = CalendarDateUtils.getDateInMoment('01/01/2021');

        component.calendars = CoreDefinitionStore.calendars = CalendarTestUtils.getMockCalendars();

        DateStore.updateCurrentDate(new DateValue({date: '05/18/2020', calCode: 'GP_HK_STD'}));
    });

    describe('open/closeSetCalendarModal Test', () => {
        describe('onCalendarOpened Test', () => {
            beforeEach(() => {
                jest.spyOn(component, 'updateCalendar' as any);
                component.onDatePickerOpened();
            });

            it('should set selectedCalendar and holidays on init', () => {
                expect(component.calendars).toEqual(CalendarTestUtils.getMockCalendars());
                expect(component.selectedCalendar).toEqual(expectedSelectedCalendar);
                expect(component['updateCalendar']).toHaveBeenCalledWith(component.selectedCalendar);
            });
        });
    });

    describe('updateCalendar Test', () => {
        it('should set holidays with selectedCalendar', () => {
            const expectedHolidayData = {
                '2010': ['01/01/2010'],
                '2013': ['01/01/2013'],
                '2014': ['01/01/2014'],
                '2015': ['01/01/2015'],
                '2016': ['01/01/2016'],
                '2017': ['01/02/2017'],
                '2018': ['01/01/2018'],
                '2019': ['01/01/2019'],
                '2020': ['01/01/2020']
            };

            component['updateCalendar'](CoreDefinitionStore.calendars[3]);

            expect(component.auxHolidaysData$.getValue()).toEqual(expectedHolidayData);
        });
    });

    describe('Footer button tests', () => {
        let event = new CustomEvent<any>('');

        beforeEach(() => {
            event = new CustomEvent<any>('');
            component.isDatePickerOpen = true;
        });

        describe('Today button clicked Test', () => {
            beforeEach(() => {
                component.absoluteDate = '03/11/2016';
                component.absoluteDateCopy = '03/11/2016';
            });

            it('should reset absoluteDate onCalendarClosed', () => {
                component.absoluteDate = '10/23/2020';
                component.onDatePickerClosed();

                expect(component.absoluteDate).toBe('03/11/2016');
            });
        });

        it ('onCalendarSelected Test', () => {
            component.isDatePickerOpen = true;
            jest.spyOn(component, 'updateCalendar' as any);

            event.initCustomEvent('', true, true, {
                value: {
                    calendar: 'Japan',
                    key: 'TOK'
                }
            });

            const usCalendar = new Calendar();
            usCalendar.calendarCode = 'GreenPkg';
            usCalendar.calendarName = 'United States';
            usCalendar.holidays = [];
            component.selectedCalendar = usCalendar;

            const japanCalendar = new Calendar();
            japanCalendar.calendarCode = 'TOK';
            japanCalendar.calendarName = 'Japan';
            japanCalendar.holidays = [];

            component.calendars = [usCalendar, japanCalendar];

            const dateValue = new DateValue('02/01/2024');
            dateValue.calCode = 'GreenPkg';
            component.dateObject = dateValue;

            component.onCalendarSelected(event);

            expect(component['updateCalendar']).toHaveBeenCalledTimes(1);
            expect(component.selectedCalendar.calendarCode).toEqual('TOK');
        });
    });

    describe('onDateChangedFromInputBox Test', () => {
        let dateValue: DateValue;
        beforeEach(() => {
            component.absoluteDate = '03/11/2016';
            dateValue = new DateValue({calCode: 'GP_HK_STD', dateString: false, date: '03/11/2016'});
            jest.spyOn(component, 'onDateChanged');
        });

        // Check ngOnChanges updates the calendar
        it('should call onDateChanged with newDateValue', () => {
            jest.spyOn(CalendarDateUtils, 'getCalendarByCode').mockReturnValueOnce(null);
            jest.spyOn(component, 'updateCalendar').mockImplementation(() => {
            });
            component.dateObject = new DateValue();
            component.dateObject.calCode = 'LN';
            jest.spyOn(component.dateObject, 'format').mockReturnValue('');
            component.ngOnChanges({});

            expect(CalendarDateUtils.getCalendarByCode).toHaveBeenCalledWith(component.calendars, 'LN');
            expect(component.updateCalendar).toHaveBeenCalled();
        });
    });

    it('initialize component in cell editor', () => {
        const portfolio: AbstractFavoriteConfig = new Portfolio();
        const eGridCell: HTMLElement = document.createElement('div');
        portfolio.deserialize(dummyScheduledJobs.portfolioTableData[0].portfolio);

        component.agInit({portfolio, eGridCell, stopEditing: jest.fn()} as any);
        expect(component['dateObject'].getDateAsText()).toEqual((portfolio as Portfolio).datePicker.getDateAsText());
        expect(component['selectedCalendar'].calendarCode).toEqual((portfolio as Portfolio).datePicker.calCode);
        expect(component['params'].stopEditing).not.toHaveBeenCalled();
    });

    it('should call stopEditing on Enter key press', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component['params'] = {stopEditing: jest.fn()} as unknown as ICellEditorParams;
        component.onKeyDown(event);
        expect(component['params'].stopEditing).toHaveBeenCalled();
    });

    it('should call stopEditing on Tab key press', () => {
        const event = new KeyboardEvent('keydown', { key: 'Tab' });
        component['params'] = {stopEditing: jest.fn()} as unknown as ICellEditorParams;
        component.onKeyDown(event);
        expect(component['params'].stopEditing).toHaveBeenCalled();
    });

    it('should call parent updateDatePicker and stopEditing in updateDatePicker', () => {
        const dateValue = new DateValue('2020-05-18');
        jest.spyOn(component, 'updateDatePicker');
        component['params'] = {stopEditing: jest.fn()} as unknown as ICellEditorParams;
        component.updateDatePicker(dateValue);
        expect(component.updateDatePicker).toHaveBeenCalledWith(dateValue);
        expect(component['params'].stopEditing).toHaveBeenCalled();
    });
});
