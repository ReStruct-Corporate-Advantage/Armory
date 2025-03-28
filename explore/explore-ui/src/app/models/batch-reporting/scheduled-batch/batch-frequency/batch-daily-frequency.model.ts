import {isObject} from 'lodash';
import {AbstractConfig, SerializeFavoriteType} from '@blk/explore-ui-core';
import {BatchFrequency} from '@interfaces/batch-frequency.interface';
import {BatchScheduleFrequency} from '@enums/batch-reporting/batch-schedule-frequency.enum';

/**
 * Daily frequency model for BatchSchedule
 */
export class BatchDailyFrequency extends AbstractConfig implements BatchFrequency {
    static CONFIG_TYPE = 'BatchDailyFrequency';

    // booleans for each day of the week
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;

    static get configType(): string {
        return BatchDailyFrequency.CONFIG_TYPE;
    }

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
        return BatchScheduleFrequency.DAILY;
    }

    /**
     * Returns text to display for the scheduled batch overview screen
     */
    getOverviewText(): string {
        return 'Days of the week: ' +
            (this.sunday ? '<br><span class="aux-bold">Sunday</span>' : '') +
            (this.monday ? '<br><span class="aux-bold">Monday</span>' : '') +
            (this.tuesday ? '<br><span class="aux-bold">Tuesday</span>' : '') +
            (this.wednesday ? '<br><span class="aux-bold">Wednesday</span>' : '') +
            (this.thursday ? '<br><span class="aux-bold">Thursday</span>' : '') +
            (this.friday ? '<br><span class="aux-bold">Friday</span>' : '') +
            (this.saturday ? '<br><span class="aux-bold">Saturday</span>' : '');
    }

    /**
     * Returns whether the frequency is valid
     */
    isValid(): boolean {
        // Returns true if at least one day is selected
        return this.sunday || this.monday || this.tuesday || this.wednesday || this.thursday || this.friday || this.saturday;
    }

    /**
     * Serialize the config to json.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {configType: BatchDailyFrequency.CONFIG_TYPE};

        data.daysOfWeek = [];
        // Only serialize the day's flag if it's true
        if (this.sunday) {
            data.daysOfWeek.push('sunday');
        }
        if (this.monday) {
            data.daysOfWeek.push('monday');
        }
        if (this.tuesday) {
            data.daysOfWeek.push('tuesday');
        }
        if (this.wednesday) {
            data.daysOfWeek.push('wednesday');
        }
        if (this.thursday) {
            data.daysOfWeek.push('thursday');
        }
        if (this.friday) {
            data.daysOfWeek.push('friday');
        }
        if (this.saturday) {
            data.daysOfWeek.push('saturday');
        }

        return data;
    }

    /**
     * Deserialize the json data into this object
     */
    deserialize(data: any): void {
        this.sunday = data.daysOfWeek.includes('sunday');
        this.monday = data.daysOfWeek.includes('monday');
        this.tuesday = data.daysOfWeek.includes('tuesday');
        this.wednesday = data.daysOfWeek.includes('wednesday');
        this.thursday = data.daysOfWeek.includes('thursday');
        this.friday = data.daysOfWeek.includes('friday');
        this.saturday = data.daysOfWeek.includes('saturday');
    }
}
