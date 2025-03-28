import {TelemetryInvestmentUniverseParameters} from '../../parameters/optimization-run/telemetry-investment-universe-parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {ExploreLoggingInvestmentUniverse} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreLoggingInvestmentUniverseSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {TelemetryInvestmentUniverseTypeTracker} from './telemetry-investment-universe-type-run-tracker';

/**
 * TelemetryInvestmentUniverseTracker is used to generated protos to capture user actions on Investment Universe Items.
 */
export class TelemetryInvestmentUniverseTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryInvestmentUniverseParameters, ExploreLoggingInvestmentUniverse>
{
    static  exploreType  = new TelemetryInvestmentUniverseTypeTracker();

    constructor() {
        super(eventSchema, 'explore:investment-universe');
    }

    /**
     * Generate a protoBuff for Investment Universe
     */
    generateProtoBuff(parameter: TelemetryInvestmentUniverseParameters): ExploreLoggingInvestmentUniverse {
        const exploreLoggingInvestmentUniverse = new ExploreLoggingInvestmentUniverse();
        // Telemetry for workspace where id is number or UUID
        exploreLoggingInvestmentUniverse.setWorkspaceId(parameter.workspaceId.toString());

        exploreLoggingInvestmentUniverse.setRequestId(parameter.requestId);
        const investmentUniverseItems = parameter.investmentUniverseTypeAndNamesList.map(element => TelemetryInvestmentUniverseTracker.exploreType.generateProtoBuff(element))
        exploreLoggingInvestmentUniverse.setInvestmentUniverseTypeAndNamesList(investmentUniverseItems);
        return exploreLoggingInvestmentUniverse;
    }
}


