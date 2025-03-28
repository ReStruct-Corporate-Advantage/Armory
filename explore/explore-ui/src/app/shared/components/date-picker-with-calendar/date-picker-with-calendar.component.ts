import {ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {
    AuxCalendarHolidays,
    AuxCalendarLabelSelectOption,
    AuxCalendarSelectedDetailInterface
} from '@blk/aladdin-angular-components';
import {
    Calendar,
    CalendarDateUtils,
    CoreDefinitionStore,
    DatePickerComponent,
    DateService,
    DateStore, DateValue
} from '@blk/explore-ui-core';
import {NotificationService} from '@services/notification';
import {BehaviorSubject} from 'rxjs';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ICellEditorAngularComp} from 'ag-grid-angular';
import {ICellEditorParams} from 'ag-grid-community';
import {takeUntil} from 'rxjs/operators';

/**
 * This component extends from DatePicker for CalendarPicker which will are used in main portfolio panel and batch.
 */

@Component({
    selector: 'app-date-picker-with-calendar',
    templateUrl: './date-picker-with-calendar.component.html'
})
export class DatePickerWithCalendarComponent extends DatePickerComponent implements OnChanges, ICellEditorAngularComp {

    /** START ** ag-grid cell editor fields */
    private params: ICellEditorParams;
    /** END ** ag-grid cell editor fields */

    @Input() portfolio: Portfolio;

    calendars: Calendar[];
    calendarOptions: AuxCalendarLabelSelectOption[];
    selectedCalendar: Calendar;

    auxHolidaysData$ = new BehaviorSubject<AuxCalendarHolidays>({});

    /**
     * Construct with the required services.
     */
    constructor(protected dateService: DateService, protected notificationService: NotificationService, private cdRef: ChangeDetectorRef) {
        super(dateService, notificationService);
        this.calendars = CoreDefinitionStore.calendars;
        this.createCalendarOptions();
    }

    /**
     * Create calendar options to pass into the aux-date-picker
     * These are options that show up in the settings menu on the right
     * Maps our Calendar option to AuxCalendarLabelSelectOption interface
     */
    createCalendarOptions(): void {
        this.calendarOptions = this.calendars.map(calendar => {
            return {
                displayValue: calendar.calendarName,
                value: {
                    calendar: calendar.calendarName,
                    key: calendar.calendarCode
                },
                isSelected: false
            };
        });
    }

    /**
     * Update the component based on the input changes.
     */
    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);
        if (this.dateObject.calCode) {
            this.selectedCalendar = CalendarDateUtils.getCalendarByCode(this.calendars, this.dateObject.calCode);
            this.updateCalendar(this.selectedCalendar);
        }
    }

    /**
     * On DatePicker opened
     */
    onDatePickerOpened(): void {
        super.onDatePickerOpened();
        if (!this.selectedCalendar) {
            this.selectedCalendar = CalendarDateUtils.getCalendarByCode(this.calendars, DateStore.getCurrentDate().calCode);
            this.updateCalendar(this.selectedCalendar);
        }
    }

    /**
     * update Calendar name and holidays
     */
    updateCalendar(selectedCalendar: Calendar): void {
        // if auxHolidayData is Map<number, string[]>, it doesn't display data in the date picker calendar
        const auxHolidaysData = {};

        for (const holiday of selectedCalendar.holidays) {
            const holidayDate = this.isDateInUKFormat ? holiday.day + '/' + holiday.month + '/' + holiday.year : holiday.month + '/' + holiday.day + '/' + holiday.year;
            const dateString = CalendarDateUtils.getDateInFormat(holidayDate, this.DATE_FORMAT, this.isDateInUKFormat);

            if (auxHolidaysData[holiday.year]) {
                auxHolidaysData[holiday.year].push(dateString);
            } else {
                auxHolidaysData[holiday.year] = [dateString];
            }
        }

        this.auxHolidaysData$.next(auxHolidaysData);
        for (const dsCalendar of this.calendarOptions) {
            dsCalendar.isSelected = dsCalendar.value.key === selectedCalendar.calendarCode;
        }
    }

    /**
     * Callback on when a calendar is selected in the side menu
     */
    onCalendarSelected(event: CustomEvent<AuxCalendarSelectedDetailInterface>): void {
        const selectedCalendarCode = event.detail.value.key;
        this.selectedCalendar = CalendarDateUtils.getCalendarByCode(this.calendars, selectedCalendarCode);
        this.updateCalendar(this.selectedCalendar);
        this.dateObject.calCode = this.selectedCalendar.calendarCode;
        this.dateChange.emit(this.dateObject);
    }

    /** START ** ag-grid cell editor hooks */

    agInit(params: ICellEditorParams): void {
        this.params = params;
        this.params.eGridCell.addEventListener('keydown', this.onKeyDown.bind(this));
        this.portfolio = params['portfolio'];
        this.dateObject = new DateValue(this.portfolio.datePicker.serialize());
        super.updateDatePicker(this.dateObject);
        if (this.dateObject.calCode) {
            this.selectedCalendar = CalendarDateUtils.getCalendarByCode(this.calendars, this.dateObject.calCode);
            this.updateCalendar(this.selectedCalendar);
            this.dateService.getMaxDateByCalendarCode$(this.dateObject.calCode)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((updatedMaxDate: Date) => {
                    this.updateMaxDate(updatedMaxDate);
                    this.cdRef.detectChanges();
                });
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (['Enter', 'Tab'].includes(event.key)) {
            this.params.stopEditing();
        }
    }

    getValue(): DateValue {
        return this.dateObject;
    }

    updateDatePicker(dateValue: DateValue) {
        super.updateDatePicker(dateValue);
        this.params?.stopEditing();
    }

    /** END ** ag-grid cell editor hooks */
}
