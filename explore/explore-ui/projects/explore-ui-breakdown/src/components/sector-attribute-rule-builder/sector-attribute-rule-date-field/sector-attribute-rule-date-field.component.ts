import {Component, SimpleChanges} from '@angular/core';
import moment from 'moment';
import {BaseSectorAttributeRuleValueFieldComponent} from '../base-sector-attribute-rule-value-field';
import {CalendarDateUtils, DateFormatConstants, DateValue} from '@blk/explore-ui-core';

/**
 * This component is used to set comparision value of Column Sector Rule of type attribute, when column data type is date
 */
@Component({
    selector: 'explore-sector-attribute-rule-date-field',
    templateUrl: './sector-attribute-rule-date-field.component.html'
})
export class SectorAttributeRuleDateFieldComponent extends BaseSectorAttributeRuleValueFieldComponent<string> {

    dateValueObject: DateValue;

    // Maximum possible date
    maxDate = moment(1e15);

    /**
     * onChanges
     */
    onChanges(changes: SimpleChanges): void {
        this.initializeDateField(this.value);
    }

    /**
     * Method to initialize date field
     * if dataString argument is provided, it is used as initial date value
     * dateString is Aladdin Date Format in this case (DD-MMM-YYYY)
     */
    initializeDateField(dateString?: string) {
        const todayDate: moment.Moment = CalendarDateUtils.checkOverrideAndGetToday();

        // date is now dateString if exist, or todayDate
        const date: string | moment.Moment = dateString || todayDate;
        this.dateValueObject = DateValue.newDate(CalendarDateUtils.getDateInFormat(date, DateFormatConstants.MMDDYYYY_SLASH));

        // emitting date string in UK Format
        this.valueChange.emit(CalendarDateUtils.getDateInFormat(this.dateValueObject.date, DateFormatConstants.DDMMMYYYY_DASH));
    }

    /**
     * Action taken when the date is changed
     * @param dateObject has the new date
     */
    onDateChange(dateObject: DateValue): void {
        this.valueChange.emit(CalendarDateUtils.getDateInFormat(dateObject.date, DateFormatConstants.DDMMMYYYY_DASH));
    }
}
