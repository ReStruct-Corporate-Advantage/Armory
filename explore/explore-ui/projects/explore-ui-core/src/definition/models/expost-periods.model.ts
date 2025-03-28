import {Setting} from '../../core/models/setting.model';

export class ExpostPeriods extends Setting {

    /**
     * Expost Period variables
     */
    timePeriodShortName: string;
    label: string;
    numberOfPeriods: number;

    constructor(data?: any) {
        super(data);
    }

    /**
     * Expost Period mapping and then passing to appropriate model
     */
    static createExpostPeriodsMapping(data: any): ExpostPeriods[][] {
        const expostSamplingPeriod: ExpostPeriods[] = [];
        for (const expostSampling of data.expostSamplingPeriods) {
            expostSamplingPeriod.push(new ExpostPeriods(expostSampling));
        }

        const expostStatisticPeriod: ExpostPeriods[] = [];
        for (const expostStatistics of data.expostStatisticPeriods) {
            expostStatisticPeriod.push(new ExpostPeriods(expostStatistics));
        }

        return [expostSamplingPeriod, expostStatisticPeriod];
    }

    /**
     * doDeserialize
     */
    doDeserialize(data: any): void {
        this.timePeriodShortName = data.timePeriodShortName;
        this.label = data.displayName;
        this.numberOfPeriods = data.numberOfPeriods;
    }
}
