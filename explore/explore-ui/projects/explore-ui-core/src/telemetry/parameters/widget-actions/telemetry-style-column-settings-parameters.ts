import {TelemetryStyleMeasureSettingsParameters} from './telemetry-style-measure-settings-parameters';
import {isObject} from 'lodash';

/**
 * TelemetryStyleColumnSettingsParameters captures information related to all columns settings in style analysis columns added in any widget.
 */
export class TelemetryStyleColumnSettingsParameters {
    subColumn: string;
    measuresSettings: Map<string, TelemetryStyleMeasureSettingsParameters> = new Map();
    measuresExpanded: boolean;

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
        this.subColumn = data.subColumn;
        this.measuresSettings = data.measuresSettings;
        this.measuresExpanded = data.measuresExpanded;
    }
}
