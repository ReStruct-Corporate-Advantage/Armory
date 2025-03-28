import {isObject} from 'lodash';

/**
 * TelemetryFactorParameters captures information related to factor column in Factor Data widget
 */
export class TelemetryFactorParameters {
    factorKey: string;
    factorTag: string;
    riskSettingsChanged: boolean;
    fxCrossCurrencyChanged: boolean;
    shockSettingsChanged: boolean;

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
        this.factorKey = data.factorKey;
        this.factorTag = data.factorTag;
        this.riskSettingsChanged = data.riskSettingsChanged;
        this.fxCrossCurrencyChanged = data.fxCrossCurrencyChanged;
        this.shockSettingsChanged = data.shockSettingsChanged;
    }
}
