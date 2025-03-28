import {isObject} from 'lodash';

/**
 * contains tier definition info used for risk budgeting
 */
export class TelemetryTierDefinitionRiskBudgetingParameters {
    // type
    definitionType: string;
    // tier 1 value
    tierOne: number;
    // tier 2 value
    tierTwo: number;
    // tier 2 ratio
    tierTwoRatio: number;
    // tier 3 ratio
    tierThreeRatio: number;

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
        this.definitionType = data.definitionType;
        this.tierOne = data.tierOne;
        this.tierTwo = data.tierTwo;
        this.tierTwoRatio = data.tierTwoRatio;
        this.tierThreeRatio = data.tierThreeRatio;
    }
}
