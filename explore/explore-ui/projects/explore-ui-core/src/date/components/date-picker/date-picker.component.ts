import {
    Component,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnInit,
    Optional,
    Output,
    SimpleChanges
} from '@angular/core';
import {
    AuxCalendarDateSelectedDetailInterface,
    AuxCalendarFooterClickedDetailInterface
} from '@blk/aladdin-angular-components';
import {NOTIFICATION_SERVICE_TOKEN} from '../../../ui/tokens';
import {DateValue} from '../../models/date-value/date-value.model';
import {switchMap, takeUntil} from 'rxjs/operators';
import {DateService} from '../../services/date.service';
import {CalendarDateUtils} from '../../utils';
import {BaseDatePickerComponent} from './base-date-picker.component';
import {NotificationServiceInterface} from '../../../ui/service-interfaces/notification-service.interface';

/**
 * This component wraps the aux-date-picker component to handle relative and absolute dates.
 *
 * @example
 *  <app-date-picker [label]="'Date'"
 *                   [dateObject]="datePicker"
 *                   (dateChange)="onDateChange($event)">
 *  </app-date-picker>
 *
 *  <app-date-picker [dateObject]="rowConfig.portfolio.datePicker"
 *                   [isDisabled]="getRowDisabled(true)">
 *  </app-date-picker>
 *
 *  <app-date-picker [isDisabled]="isDatePickerDisabled()"
 *                   [dateObject]="customOverrideDate"
 *                   (dateChange)="setCustomOverrideDate($event)">
 *  </app-date-picker>
 */

@Component({
    selector: 'explore-core-date-picker',
    templateUrl: './date-picker.component.html'
})
export class DatePickerComponent extends BaseDatePickerComponent implements OnChanges, OnInit {
    // label for aux-date-picker
    @Input() label?: string;
    @Input() dateObject: DateValue;
    @Input() isLeftLabel = true;
    @Input() size = 'small';
    @Input() closeCalendarOnBlur = false;

    isDatePickerOpen = false;

    /**
     * Event that is triggered when the date is changed.
     */
    @Output() dateChange: EventEmitter<DateValue> = new EventEmitter<DateValue>();

    absoluteDate: string;
    absoluteDateCopy: string;
    displayDate: string;

    /**
     * Construct with the required services.
     */
    constructor(
        protected dateService: DateService,
        @Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) protected notificationService: NotificationServiceInterface
    ) {
        super(dateService, notificationService);
    }

    /**
     * ngOnInit
     */
    ngOnInit() {
        super.ngOnInit();
        this.dateService.midNightRefresh$
            .pipe(
                takeUntil(this.ngUnsubscribe),
                switchMap(() => this.dateService.getMaxDateByCalendarCode$(this.dateObject.calCode))
            )
            .subscribe((updatedMaxDate: Date) => {
                this.updateMaxDate(updatedMaxDate);
            });
    }

    /**
     * Update the component based on the input changes.
     */
    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);
        if (changes.dateObject) {
            this.dateService.getMaxDateByCalendarCode$(this.dateObject?.calCode)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((updatedMaxDate: Date) => {
                    this.updateMaxDate(updatedMaxDate);
                });
        }
        if (this.dateObject) {
            this.absoluteDateCopy = this.absoluteDate = this.dateObject.format(this.DATE_FORMAT, true);
            // if dateObject is not initialized, set to 'MM/DD/YYYY' which will act as a placeholder in the date picker
            this.displayDate = this.dateObject.format(this.DATE_FORMAT) || this.DEFAULT_DATE_FORMAT;
        }
    }

    /**
     * On DatePicker opened
     */
    onDatePickerOpened(): void {
        this.isDatePickerOpen = true;
    }

    /**
     * On DatePicker opened
     */
    onDatePickerClosed(): void {
        this.isDatePickerOpen = false;
        if (this.absoluteDate !== this.absoluteDateCopy) {
            this.absoluteDate = this.absoluteDateCopy;
        }
    }

    /**
     * Update max selectable date with midNightRefresh$
     */
    updateMaxDate(updatedMaxDate: Date): void {
        const maxDate = CalendarDateUtils.getDateInMoment(updatedMaxDate);
        // If the new DateValue object has a later date than the current maxDate, set that date to be the max selectable date
        if (!this.maxDate || maxDate > this.maxDate) {
            this.maxDate = maxDate;
            this.maxDateString = CalendarDateUtils.getDateInFormat(maxDate, this.DATE_FORMAT);
        }
    }

    /**
     * On footer clicked
     */
    onFooterClicked(event: CustomEvent<AuxCalendarFooterClickedDetailInterface>): void {
        if (event.detail.todayInFooter) {
            // When Today button is clicked, then update absoluteDate to update the calendar page, but also store the old absolteDate value to the copy.
            // So when the calendar page is closed without date selected, we still can reset the absoluteDate from the copy.
            this.absoluteDateCopy = this.absoluteDate;
            this.absoluteDate = CalendarDateUtils.checkOverrideAndGetToday().format(this.DATE_FORMAT);
        }
    }

    /**
     * No need to validate range - just set isValid to true
     */
    validateDateRange(): void {
        this.isValid = true;
    }

    /**
     * Update date picker
     */
    updateDatePicker(dateValue: DateValue): void {
        this.absoluteDateCopy = this.absoluteDate = dateValue.format(this.DATE_FORMAT, true);
        this.displayDate = dateValue.format(this.DATE_FORMAT);
        this.dateChange.emit(dateValue);
    }
}
