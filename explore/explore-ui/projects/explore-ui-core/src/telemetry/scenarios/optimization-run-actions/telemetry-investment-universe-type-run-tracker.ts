import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {ExploreTypeInInvestmentUniverse} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {TelemetryInvestmentUniverseTypeParameters} from '../../parameters/optimization-run//telemetry-investment-universe-type-parameters';
import {agraph_platform_event_logging_explore_event_v1_ExploreTypeInInvestmentUniverseSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';

/**
 * TelemetryInvestmentUniverseTypeTracker is used to generated protos to capture user actions on Investment Universe Items.
 */
export class TelemetryInvestmentUniverseTypeTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryInvestmentUniverseTypeParameters, ExploreTypeInInvestmentUniverse>

{
    constructor() {
        super(eventSchema, 'explore:type-in-investment-universe');
    }

    /**
     * Generate a protoBuff for Investment Universe Type
     */
    generateProtoBuff(parameter: TelemetryInvestmentUniverseTypeParameters): ExploreTypeInInvestmentUniverse {
        const exploreTypeInvestmentUniverse = new ExploreTypeInInvestmentUniverse();
        exploreTypeInvestmentUniverse.setInvestmentUniverseType(parameter.investmentUniverseType)
        exploreTypeInvestmentUniverse.setName(parameter.name);
        return exploreTypeInvestmentUniverse;
    }
}
