import {isObject} from 'lodash';

export class TelemetrySecurityConstraintDetailParameter {
    constraintAttribute: string;
    wayToApplySecurityConstraint: string;

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
        this.constraintAttribute = data.constraintAttribute;
        this.wayToApplySecurityConstraint = data.wayToApplySecurityConstraint;
    }
}
