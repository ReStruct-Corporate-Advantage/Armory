import {isObject} from 'lodash';

/**
 * TelemetryTimeSeriesSettingParameters captures information related to time series settings for any chart
 */
export class TelemetryTimeSeriesSettingParameters {
    frequency: string;
    periodCount: number;
    chartType: string;
    formatDateType: string;
    compareMode: string;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize.
     */
    deserialize(data: any): void {
        // Get out of here if there is no data.
        if (!data) {
            return;
        }
        this.frequency = data.frequency;
        this.periodCount = data.periodCount;
        this.chartType = data.chartType;
        this.formatDateType = data.formatDateType;
        this.compareMode = data.compareMode;
    }
}
