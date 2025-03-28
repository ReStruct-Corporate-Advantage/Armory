import {isObject} from 'lodash';
import {TelemetryTierDefinitionRiskBudgetingParameters} from '../tier-definition-risk-budgeting/telemetry-tier-definition-risk-budgeting-parameters';
import {ExploreRiskBudgetingCase} from '../../enums/telemetry-explore-risk-budgeting-case.enum';

/**
 * TelemetryOptimizationRunParameters captures information related to optimization run by user.
 */
export class TelemetryRiskBudgetingParameters {
    riskBudgetingCase: ExploreRiskBudgetingCase;
    tierDefinitionInfo: TelemetryTierDefinitionRiskBudgetingParameters;
    isSecurityConstraintApplied: boolean;
    isScreeningEnabled: boolean;

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
        this.riskBudgetingCase = data.riskBudgetingCase;
        this.tierDefinitionInfo = data.tierDefinitionInfo;
        this.isSecurityConstraintApplied = data.isSecurityConstraintApplied;
        this.isScreeningEnabled = data.isScreeningEnabled;
    }
}
