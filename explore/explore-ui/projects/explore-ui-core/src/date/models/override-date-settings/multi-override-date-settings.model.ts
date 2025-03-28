import {isNil} from 'lodash';
import {DateValue} from '../date-value/date-value.model';

/**
 * MultiOverrideDateSettings model
 */
export class MultiOverrideDateSettings {

    /**
     * Constructor that declares and create an instance of MultiOverrideDateSettings
     * @param multiOverrideDateTypeFrequency Frequency for the multiple override dates
     * @param numberOfObservations Number of observations for the  multi override dates
     * @param startDate Observation start date
     * @param endDate Observation end date
     */
    constructor(public multiOverrideDateTypeFrequency: string, public numberOfObservations: number, public startDate: DateValue, public endDate: DateValue, public appendReportDate?: boolean) {}


    /**
     * Return false if the passed in MultiOverrideDateSettings is not equal to this
     */
    equals(multiOverrideDateSettings: MultiOverrideDateSettings): boolean {
        if (this.multiOverrideDateTypeFrequency !== multiOverrideDateSettings.multiOverrideDateTypeFrequency) {
            return false;
        }
        // return false if any of the startDate or endDate is null but multiOverrideDateSettings.startDate or endDate is not null
        if ((isNil(this.startDate) && !isNil(multiOverrideDateSettings.startDate)) || (isNil(this.endDate) && !isNil(multiOverrideDateSettings.endDate))){
            return false;
        }
        if (!isNil(this.startDate) && !this.startDate.equals(multiOverrideDateSettings.startDate)) {
            return false;
        }
        if (!isNil(this.endDate) && !this.endDate.equals(multiOverrideDateSettings.endDate)) {
            return false;
        }
        if (this.appendReportDate !== multiOverrideDateSettings.appendReportDate) {
            return false;
        }
        return this.numberOfObservations === multiOverrideDateSettings.numberOfObservations;
    }
}
