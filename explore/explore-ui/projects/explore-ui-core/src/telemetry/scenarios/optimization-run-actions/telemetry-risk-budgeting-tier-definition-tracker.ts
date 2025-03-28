import {TelemetryTierDefinitionRiskBudgetingParameters} from '../../parameters';
import {ExploreTierDefinitionInfo} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreTierDefinitionInfoSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

/**
 * TelemetryTierDefinition is used to generated protos to capture info related to tier definition
 */
export class TelemetryRiskBudgetingTierDefinitionTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryTierDefinitionRiskBudgetingParameters, ExploreTierDefinitionInfo> {

    constructor() {
        super(eventSchema, 'explore:tier-definition-info');
    }

    /**
     * Generate a protoBuff for tier definition
     */
    generateProtoBuff(parameter: TelemetryTierDefinitionRiskBudgetingParameters): ExploreTierDefinitionInfo {
        const exploreTierDefinitionInfo = new ExploreTierDefinitionInfo();
        exploreTierDefinitionInfo.setDefinitionType(parameter.definitionType);
        exploreTierDefinitionInfo.setTierOne(parameter.tierOne);
        exploreTierDefinitionInfo.setTierTwo(parameter.tierTwo);
        exploreTierDefinitionInfo.setTierTwoRatio(parameter.tierTwoRatio);
        exploreTierDefinitionInfo.setTierThreeRatio(parameter.tierThreeRatio);
        return exploreTierDefinitionInfo;
    }
}
