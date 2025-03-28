import {isObject} from 'lodash';

/**
 * PgsChartsAdditionalSettingsParameter captures the additional settings for the PGS charts spawned from PGS widget.
 */
export class PgsChartsAdditionalSettingsParameter {
    isBreakdownAdded: boolean;
    isStackedChart: boolean;
    numberOfObservations: number;

    /**
     * Constructor.
     */
    constructor(data) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    private deserialize(data) {
        // Get out of here if there is no data.
        if (!data) {
            return;
        }
        this.isBreakdownAdded = data.isBreakdownAdded;
        this.isStackedChart = data.isStackedChart;
        this.numberOfObservations = data.numberOfObservations;
    }
}
