import {agraph_platform_event_logging_explore_event_v1_ExploreRiskBudgetingDetailsSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {TelemetryRiskBudgetingParameters} from '../../parameters';
import {TelemetryRiskBudgetingTierDefinitionTracker} from './telemetry-risk-budgeting-tier-definition-tracker';
import {ExploreRiskBudgetingDetails} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';

/**
 * TelemetryRiskBudgeting is used to generated protos to capture info related to risk budgeting run
 */
export class TelemetryRiskBudgetingTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryRiskBudgetingParameters, ExploreRiskBudgetingDetails> {

    constructor() {
        super(eventSchema, 'explore:risk-budgeting-details');
    }

    /**
     * Generate a protoBuff for risk budgeting
     */
    generateProtoBuff(parameter: TelemetryRiskBudgetingParameters): ExploreRiskBudgetingDetails {
        const exploreRiskBudgetingDetails = new ExploreRiskBudgetingDetails();
        const telemetryRiskBudgetingTierDefinitionTracker = new TelemetryRiskBudgetingTierDefinitionTracker();
        exploreRiskBudgetingDetails.setRiskBudgetingCase(parameter.riskBudgetingCase);
        exploreRiskBudgetingDetails.setScreeningEnabled(parameter.isScreeningEnabled);
        exploreRiskBudgetingDetails.setSecurityConstraintsApplied(parameter.isSecurityConstraintApplied);
        exploreRiskBudgetingDetails.setTierDefinitionInfo(telemetryRiskBudgetingTierDefinitionTracker.generateProtoBuff(parameter.tierDefinitionInfo));
        return exploreRiskBudgetingDetails;
    }
}
