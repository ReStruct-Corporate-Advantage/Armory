import {TimePeriod} from './time-period.model';
import {CoreCommonConstants} from '../../../core/constants';

/**
 * TimePeriod model
 */
export class PerformanceTimePeriod extends TimePeriod {
    parentTimePeriod: PerformanceTimePeriod;
    sourceName: string;

    /**
     * based on a key(property name), gets the name of the source
     */
    getSourceName(): string {
        if (!this.parentTimePeriod || !this.equals(this.parentTimePeriod)) {
            return this.sourceName;
        }
        return this.parentTimePeriod.getSourceName();
    }

    getSourceDisplayName(): string {
        const srcName = this.getSourceName();
        return CoreCommonConstants.SETTINGS_HIERARCHY_DISPLAY_NAME[srcName] || srcName;
    }

    /**
     * Create copy for the TimePeriod object
     */
    createCopy(): PerformanceTimePeriod {
        const newTimePeriod = new PerformanceTimePeriod();
        this.createTimePeriodCopy(newTimePeriod);
        return newTimePeriod;
    }
}
