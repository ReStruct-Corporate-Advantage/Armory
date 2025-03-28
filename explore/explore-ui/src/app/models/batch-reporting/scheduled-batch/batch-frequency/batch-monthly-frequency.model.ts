import {isNumber, isObject} from 'lodash';
import {AbstractConfig, SerializeFavoriteType} from '@blk/explore-ui-core';
import {BatchFrequency} from '@interfaces/batch-frequency.interface';
import {BatchScheduleFrequency} from '@enums/batch-reporting/batch-schedule-frequency.enum';

/**
 * Monthly frequency model for BatchSchedule
 */
export class BatchMonthlyFrequency extends AbstractConfig implements BatchFrequency {
    static CONFIG_TYPE = 'BatchMonthlyFrequency';

    static get configType(): string {
        return BatchMonthlyFrequency.CONFIG_TYPE;
    }

    numericalDay: number = 1; // Numerical day representing which day of the month the ScheduledBatchConfig should run. Ex: Day 15 of each month

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Returns the corresponding BatchScheduleFrequency enum value
     */
    getBatchScheduleFrequency(): string {
        return BatchScheduleFrequency.MONTHLY;
    }

    /**
     * Returns text to display for the scheduled batch overview screen
     */
    getOverviewText(): string {
        return 'Day <span class="aux-bold">' +  + this.numericalDay + '</span> of each month';
    }

    /**
     * Returns whether the frequency is valid
     */
    isValid(): boolean {
        return isNumber(this.numericalDay) && this.numericalDay > 0 && this.numericalDay <= 31;
    }

    /**
     * Serialize the config to json.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            configType: BatchMonthlyFrequency.CONFIG_TYPE,
            numericalDay: this.numericalDay
        };
    }

    /**
     * Deserialize the json data into this object
     */
    deserialize(data: any): void {
        if (data.numericalDay) {
            this.numericalDay = data.numericalDay;
        }
    }
}
