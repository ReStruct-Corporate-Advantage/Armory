import {isObject} from 'lodash';

/**
 * TelemetryFactorConstraintDetailParameter captures the information about Factor Constraints
 */
export class TelemetryFactorConstraintDetailParameter {
    constraintAttribute: string;
    factorConstraintName: string;

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

        if (data.constraintAttribute != null) {
            this.constraintAttribute = data.constraintAttribute;
        }

        if (data.factorConstraintName != null) {
            this.factorConstraintName = data.factorConstraintName;
        }
    }
}
