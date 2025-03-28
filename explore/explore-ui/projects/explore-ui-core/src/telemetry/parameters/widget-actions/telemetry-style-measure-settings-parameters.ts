import {StyleMeasureMode} from '../../enums';
import {isObject} from 'lodash';

/**
 * TelemetryStyleMeasureSettingsParameters captures information related to all measures added to style analysis columns in any widget.
 */
export class TelemetryStyleMeasureSettingsParameters {
    max: number;
    min: number;
    weight: number;
    mode: StyleMeasureMode;

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
        this.max = data.max;
        this.min = data.min;
        this.weight = data.weight;
        this.mode = data.isNormal ? StyleMeasureMode.STYLE_MEASURE_MODE_NORMAL : StyleMeasureMode.STYLE_MEASURE_MODE_INVERSE;
    }
}
