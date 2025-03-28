import {TelemetryStyleColumnSettingsParameters} from './telemetry-style-column-settings-parameters';
import {isObject} from 'lodash';

/**
 * TelemetryStyleAnalysisParameters captures information related to all style analysis columns added in any widget.
 */
export class TelemetryStyleAnalysisParameters {
    columnSettings: Map<string, TelemetryStyleColumnSettingsParameters> = new Map();
    widgetType: string;

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
        this.columnSettings = data.columnSettings;
        this.widgetType = data.widgetType;
    }
}
