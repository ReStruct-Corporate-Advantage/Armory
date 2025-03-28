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
import {NOTIFICATION_SERVICE_TOKEN} from '../../../../ui/tokens';
import {DateValue} from '../../../models/date-value/date-value.model';
import {DateService} from '../../../services/date.service';
import {BaseDatePickerComponent} from '../base-date-picker.component';
import {NotificationServiceInterface} from '../../../../ui/service-interfaces/notification-service.interface';
import {AuxDateInputValueChangedDetailInterface} from '@blk/aladdin-angular-components';

/**
 * This component wraps the aux-date-picker-range component to handle relative and absolute dates.
 *
 * @example
 *  <app-date-range-picker fromDateLabel=""
 *                         toDateLabel="to"
 *                         [isDisabled]="timePeriod.type !== 'Custom'"
 *                         [fromDate]="timePeriod.fromDate"
 *                         [toDate]="timePeriod.toDate"
 *                         (dateRangeChange)="onDateRangeChange()">
 *  </app-date-range-picker>
 */
@Component({
    selector: 'explore-core-date-range-picker',
    templateUrl: './date-range-picker.component.html'
})
export class DateRangePickerComponent extends BaseDatePickerComponent implements OnChanges, OnInit {
    @Input() fromDate: DateValue;
    @Input() toDate: DateValue;
    @Input() uniqueId: string;

    @Output() dateRangeChange: EventEmitter<void> = new EventEmitter<void>();

    absoluteStartDate: string;
    absoluteEndDate: string;
    displayStartDate: string;
    displayEndDate: string;

    /**
     * Constructor.
     */
    constructor(
        protected dateService: DateService,
        @Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) protected notificationService: NotificationServiceInterface
    ) {
        super(dateService, notificationService);
    }

    /**
     * If the inputs have changed then rebind any required variables.
     */
    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);
        if (changes.fromDate?.currentValue?.date || changes.toDate?.currentValue?.date) {
            this.initializePickerVariables();
        }
    }

    /**
     * Simple function to take the control inputs and update the variables for the picker component.
     */
    private initializePickerVariables(): void {
        this.absoluteStartDate = this.fromDate ? this.fromDate.format(this.DATE_FORMAT, true) : undefined;
        this.displayStartDate = this.fromDate ? this.fromDate.format(this.DATE_FORMAT) : undefined;
        this.absoluteEndDate = this.toDate ? this.toDate.format(this.DATE_FORMAT, true) : undefined;
        this.displayEndDate = this.toDate ? this.toDate.format(this.DATE_FORMAT) : undefined;

        // in order to be valid:
        // 1. fromDate/toDate both initialized
        // 2. toDate must be after fromDate or same
        this.isValid = this.fromDate && this.toDate && this.toDate.getMoment().isSameOrAfter(this.fromDate.getMoment());
    }

    /**
     * Called whenever the start or end date is updated via date input or calendar picker
     * @param dateValue  Start date or End Date
     * @param event  Event emitted from date range picker
     */
    onDateRangeChanged(dateValue: DateValue, event: CustomEvent<AuxDateInputValueChangedDetailInterface>) {
        const newValue = event?.detail?.value;
        if (!this.isInputInCorrectFormat(newValue)) {
            this.isValid = false;
            return;
        }
        if (dateValue.isSameDate(newValue)) {
            this.isValid = true;
            return;
        }
        this.onDateChanged(dateValue, event);
    }

    /**
     * Update date range picker
     */
    updateDatePicker(dateValue: DateValue, eventType: string): void {
        if (this.isStartDateEvent(eventType)) {
            this.absoluteStartDate = dateValue.format(this.DATE_FORMAT, true);
            this.displayStartDate = dateValue.format(this.DATE_FORMAT);
        } else {
            this.absoluteEndDate = dateValue.format(this.DATE_FORMAT, true);
            this.displayEndDate = dateValue.format(this.DATE_FORMAT);
        }
        this.dateRangeChange.emit();
    }

    /**
     * Validate date range
     *  throw error when startDate is after the endDate
     */
    validateDateRange(dateValue: DateValue, eventType: string): void {
        if (this.isDateRangeValid(dateValue, eventType)) {
            this.isValid = true;
        } else {
            this.isValid = false;
            if (this.notificationService) {
                this.notificationService.error('Please enter a valid date range');
            }
        }
    }

    /**
     * Check if date range is valid.  Only validate when the end date is changed.
     */
    private isDateRangeValid(dateValue: DateValue, eventType: string): boolean {
        // if the end date was not changed, consider it valid
        if (this.isEndDateEvent(eventType)) {
            return dateValue.getMoment().isSameOrAfter(this.fromDate.getMoment());
        } else if (this.isStartDateEvent(eventType)){
            return this.toDate.getMoment().isSameOrAfter(dateValue.getMoment());
        }
    }

    /**
     * isStartDateEvent
     */
    private isStartDateEvent(eventType: string): boolean {
        return eventType === 'startValueChanged';
    }

    /**
     * isEndDateEvent
     */
    private isEndDateEvent(eventType: string): boolean {
        return eventType === 'endValueChanged';
    }
}
