import {
    AbstractConfig,
    ChartWidgetInputConfigType,
    SerializeFavoriteType,
    WidgetInput
} from '@blk/explore-ui-core';
import {isObject} from 'lodash';

/**
 * Chart Widget Input Config - timePeriodIntervalSettings model
 * widgetInputConfigTypes: timePeriodIntervalSettings
 */
export class TimePeriodIntervalSettings extends AbstractConfig implements WidgetInput{
    timePeriodInterval: TimePeriodInterval;
    originalTimePeriodInterval: TimePeriodInterval;

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize the passed in data into properties of this object
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }
        this.timePeriodInterval = data.timePeriodInterval;
        this.originalTimePeriodInterval = data.timePeriodInterval;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize this object properties into a plain javascript style object
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (this.isEmpty()) {
            return;
        }
        // This is to cater false positives in change detection for existing favorites.
        if (this.timePeriodInterval === TimePeriodInterval.DAILY && this.originalTimePeriodInterval === undefined) {
            return;
        }
        return {timePeriodInterval: this.timePeriodInterval};
    }

    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof TimePeriodIntervalSettings)) {
            return false;
        }
        return this.timePeriodInterval === widgetInput.timePeriodInterval;
    }

    /**
     * @return true as it's a data store input
     */
    isDataStoreInput(): boolean {
        return false;
    }

    isEmpty(): boolean {
        return !this.timePeriodInterval;
    }

    /**
     * gets the config type.
     */
    getConfigType(): string {
        return ChartWidgetInputConfigType.TIME_PERIOD_INTERVAL_SETTINGS;
    }
}

export enum TimePeriodInterval {
    DAILY = 'Daily',
    WEEKLY = 'Weekly',
    MONTHLY = 'Monthly',
    QUARTERLY = 'Quarterly',
    YEARLY = 'Yearly'
}
