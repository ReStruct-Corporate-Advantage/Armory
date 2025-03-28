import {isObject} from 'lodash';

/**
 * TelemetryModellingHelpClickParameters captures information related to help in modelling.
 */
export class TelemetryModellingHelpClickParameters {
    modellingHelpOption: string;

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
    protected deserialize(data: any): void {
        // Get out of here if there is no data.
        if (!data) {
            return;
        }
        this.modellingHelpOption = data.modellingHelpOption;
    }
}
