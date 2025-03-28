import {GenerateApiRequestUnsupportedError} from "../../enums/telemetry-generate-api-request-unsupported-error.enum";
import {isObject} from "lodash";

/**
 * TelemetryGenerateApiRequestParameters captures info when the user clicks on generate api request
 * and when they encounter an unsupported error
 */
export class TelemetryGenerateApiRequestParameters {
    errorType: GenerateApiRequestUnsupportedError;

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
        this.errorType = data.errorType;
    }
}
