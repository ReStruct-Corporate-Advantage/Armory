import {
    AuxCalendarDateSelectedDetailInterface,
    AuxCalendarValueChangedDetailInterface,
    AuxDatePickerDateFormatEnum,
    AuxDatePickerSeparatorsEnum
} from '@blk/aladdin-angular-components';
import {Directive, Inject, Input, OnChanges, OnInit, Optional, SimpleChanges} from '@angular/core';
import {isNil} from 'lodash';
import moment from 'moment';
import {takeUntil} from 'rxjs/operators';
import {SubscribableComponent} from '../../../core/components/subscribable.component';
import {NOTIFICATION_SERVICE_TOKEN} from '../../../ui/tokens';
import {DateFormatConstants} from '../../constants';
import {DateValue} from '../../models/date-value/date-value.model';
import {DateService} from '../../services/date.service';
import {DateStore} from '../../stores';
import {CalendarDateUtils} from '../../utils';
import {NotificationServiceInterface} from '../../../ui/service-interfaces/notification-service.interface';

/**
 * Base class for the date picker components.  This just wraps some of the common handling between these controls for reuse.
 *
 * No matter what date format we use in date picker (although the default date picker format is UK format),
 * the internal format (the format that we use everywhere else) we would use is US format, since most responses from the server is in US format.
 */
@Directive()
export abstract class BaseDatePickerComponent extends SubscribableComponent implements OnInit, OnChanges {
    public readonly AuxDatePickerSeparatorsEnum = AuxDatePickerSeparatorsEnum;
    public readonly AuxDatePickerDateFormatEnum = AuxDatePickerDateFormatEnum;

    @Input() minDate: moment.Moment;
    @Input() maxDate: moment.Moment;
    @Input() isDisabled = false;
    @Input() includeRelativeDate = true;
    @Input() hideFooter = false;

    isValid = true;
    minDateString: string;
    maxDateString: string;

    readonly DEFAULT_DATE_FORMAT = DateFormatConstants.MMDDYYYY_SLASH;
    // date format of date picker default being ExploreFormat - MM/DD/YYYY
    @Input() DATE_FORMAT = this.DEFAULT_DATE_FORMAT;
    isDateInUKFormat = false;

    /**
     * Construct with the required services.
     */
    protected constructor(
        protected dateService: DateService,
        @Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) protected notificationService: NotificationServiceInterface
    ) {
        super();
    }

    /**
     * Init the control.
     */
    ngOnInit(): void {
        // If the max date has not already been set then set it to today.
        // Do it using the maxSelectableDate from CalendarDateUtils
        if (isNil(this.maxDate)) {
            const calCode = DateStore.getCurrentDate()?.calCode || null;
            this.dateService.getMaxDateByCalendarCode$(calCode)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((maxDate) => {
                    this.maxDate = CalendarDateUtils.getDateInMoment(maxDate);
                    this.updateMinMaxDateStrings();
                });
        } else {
            this.updateMinMaxDateStrings();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.maxDate || changes.minDate) {
            this.updateMinMaxDateStrings();
        }
    }

    private updateMinMaxDateStrings(): void {
        this.minDateString = this.minDate ? CalendarDateUtils.getDateInFormat(this.minDate, this.DATE_FORMAT) : undefined;
        this.maxDateString = this.maxDate ? CalendarDateUtils.getDateInFormat(this.maxDate, this.DATE_FORMAT) : undefined;
    }

    /**
     * Event that is fired then a date is changed in the UX component.
     */
    onDateChanged(dateValue: DateValue, event: CustomEvent<AuxCalendarValueChangedDetailInterface | AuxCalendarDateSelectedDetailInterface>): void {
        const eventValue: string = String(this.getEventDetail(event).value);

        const isRelativeDate = CalendarDateUtils.isRelativeDate(eventValue);
        if (isRelativeDate) {
            const newDateValue = new DateValue({dateString: isRelativeDate, dateStringValue: eventValue});
            // Since it is a relative date we should resolve this to the actual date so this can be shown to the users.
            this.dateService.parseDateString$(dateValue.calCode, newDateValue.dateStringValue)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((newDate: Date) => {
                    // Set the date in the date object.
                    newDateValue.setMoment(moment(newDate));
                    this.validateAndTriggerDateChanged(dateValue, newDateValue, event.type);
                });
        } else {
            const selectedDateInExploreFormat = CalendarDateUtils.getDateInFormat(eventValue, DateFormatConstants.MMDDYYYY_SLASH, this.isDateInUKFormat);
            const newDateValue = new DateValue({date: selectedDateInExploreFormat, dateString: false, dateStringValue: ''});
            this.validateAndTriggerDateChanged(dateValue, newDateValue, event.type);
        }
    }

    /**
     * Convenience method to validate/update/trigger the date change.
     */
    private validateAndTriggerDateChanged(origDate: DateValue, newDate: DateValue, eventType?: string) {
        this.validateDate(newDate, eventType);

        // If we got here then the date is valid.  So update the new date into the original one.
        origDate.dateString = newDate.dateString;
        origDate.date = newDate.date;
        origDate.dateStringValue = newDate.dateStringValue;

        this.updateDatePicker(origDate, eventType);
    }

    /**
     * Validates that the date selected is good.
     */
    private validateDate(dateValue: DateValue, eventType?: string): void {
        if (!dateValue || dateValue.date === 'Invalid date') {
            this.isValid = false;
            throw new Error('The date is invalid');
        }

        // If the user tries to change the date beyond the max date, reset it back.
        // Note:  Even the relative dates have the date value set, so it is ok to validate it is within the range.
        if ((this.maxDate && dateValue.getMoment().isAfter(this.maxDate)) || (this.minDate && dateValue.getMoment().isBefore(this.minDate))) {
            // Alert the user of the invalid date
            this.isValid = false;
            if (this.notificationService) {
                this.notificationService.error('Please enter a valid date');
            }
            throw new Error('Please enter a valid date');
        }
        this.validateDateRange(dateValue, eventType);
    }

    /**
     * On date changed from date picker input box
     */
    onDateChangedFromInputBox(dateValue: DateValue, event: CustomEvent<AuxCalendarValueChangedDetailInterface>): void {
        const eventDetail = this.getEventDetail(event);

        if (!this.isInputInCorrectFormat(String(eventDetail.value))) {
            this.isValid = false;
            return;
        }
        this.onDateChanged(dateValue, event);
    }

    /**
     * Gets the event details when date is typed in input box or selected from calendar
     */
    getEventDetail(event: CustomEvent<AuxCalendarValueChangedDetailInterface | AuxCalendarDateSelectedDetailInterface>): AuxCalendarValueChangedDetailInterface | AuxCalendarDateSelectedDetailInterface {
        return event.detail;
    }

    /**
     * Is input in correct format
     */
    isInputInCorrectFormat(date: string): boolean {
        if (!date) {
            return false;
        }
        let isCorrectFormat: boolean;

        // TODO: more cases will be added with user preference in the future
        switch (this.DATE_FORMAT) {
            case DateFormatConstants.DDMMMYYYY_DASH:
                isCorrectFormat = CalendarDateUtils.isAladdinDateFormat(date);
                break;
            case this.DEFAULT_DATE_FORMAT:
            default:
                isCorrectFormat = CalendarDateUtils.isUSDateFormat(date);
                break;
        }

        if (this.includeRelativeDate) {
            isCorrectFormat = isCorrectFormat || CalendarDateUtils.isRelativeDate(date);
        }

        return isCorrectFormat;
    }

    /**
     * Validate date range
     */
    abstract validateDateRange(dateValue: DateValue, eventType?: string): void;

    /**
     * Update date picker
     */
    abstract updateDatePicker(dateValue?: DateValue, eventType?: string): void;
}
