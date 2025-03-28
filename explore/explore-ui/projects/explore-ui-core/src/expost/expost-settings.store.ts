import {each} from 'lodash';
import {TimePeriod, TimePeriodShortName} from '../date/models/time-period/time-period.model';

export class ExpostSettingsStore {

    /**
     * Member variable that holds all supported samplingPeriods
     */
    static supportedSamplingPeriods: TimePeriod[] = [];

    /**
     * Member variable that holds all supported statisticPeriods
     */
    static supportedStatisticPeriods: TimePeriod[] = [];

    /**
     * Set expost supported settings from the inputs passed in
     */
    static setSupportedSettings(expostSamplingPeriods: any, expostStatisticPeriods: any) {
        this.supportedSamplingPeriods = [];
        this.supportedStatisticPeriods = [];
        const supportedSamplingPeriods = this.supportedSamplingPeriods;
        each(expostSamplingPeriods, function (expostSamplingPeriod: any) {
            supportedSamplingPeriods.push(new TimePeriod(expostSamplingPeriod.displayName, expostSamplingPeriod.numberOfPeriods, expostSamplingPeriod.timePeriodShortName));
        });
        const supportedSupportedStatisticPeriods = this.supportedStatisticPeriods;
        each(expostStatisticPeriods, function (expostStatisticPeriod: any) {
            supportedSupportedStatisticPeriods.push(new TimePeriod(expostStatisticPeriod.displayName, expostStatisticPeriod.numberOfPeriods, expostStatisticPeriod.timePeriodShortName));
        });
    }

    /**
     * Return supported expost time series time periods
     */
    static getSupportedExpostTimeSeriesPeriods(): TimePeriod[] {
        const supportedTimePeriods: TimePeriod[] = [];
        supportedTimePeriods.push(new TimePeriod('1 Month', 1, TimePeriodShortName.MONTHS));
        supportedTimePeriods.push(new TimePeriod('6 Months', 6, TimePeriodShortName.MONTHS));
        supportedTimePeriods.push(new TimePeriod('1 Year', 1, TimePeriodShortName.YEARS));
        supportedTimePeriods.push(new TimePeriod('3 Years', 3, TimePeriodShortName.YEARS));
        supportedTimePeriods.push(new TimePeriod('5 Years', 5, TimePeriodShortName.YEARS));
        supportedTimePeriods.push(new TimePeriod('Inception to Date', 1, TimePeriodShortName.ITD));
        return supportedTimePeriods;
    }

    /**
     * Return supported expost returns statistic periods
     */
    static getSupportedReturnStatisticPeriods(): TimePeriod[] {
        const supportedTimePeriods: TimePeriod[] = [];
        supportedTimePeriods.push(new TimePeriod('1 Month', 1, TimePeriodShortName.MONTHS));
        supportedTimePeriods.push(new TimePeriod('1 Quarter', 1, TimePeriodShortName.QUARTERS));
        return supportedTimePeriods;
    }
}
