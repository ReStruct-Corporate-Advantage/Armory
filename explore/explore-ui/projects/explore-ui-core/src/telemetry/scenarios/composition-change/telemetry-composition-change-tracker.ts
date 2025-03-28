import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {
    ExploreModellingLevelStats
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {TelemetryCompositionChangeTrackingParameters} from '../../parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {
    agraph_platform_event_logging_explore_event_v1_ExploreModellingLevelStatsSchema as eventSchema
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';

/**
 * TelemetryCompositionChangeTracker is used to generated protos
 * (can be found in https://dev.azure.com/1A4D/Telemetry-Platform/_git/open-aladdin-protos?path=%2Fprotos%2Fexplore_app_events.proto)
 * to capture user actions on composition change
 */
export class TelemetryCompositionChangeTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryCompositionChangeTrackingParameters, ExploreModellingLevelStats> {

    constructor() {
        super(eventSchema, 'explore:modelling-level-stats');
    }

    generateProtoBuff(parameter: TelemetryCompositionChangeTrackingParameters): ExploreModellingLevelStats {
        const exploreModellingLevelStats = new ExploreModellingLevelStats();
        exploreModellingLevelStats.setModellingLevel(parameter.modellingLevel);
        exploreModellingLevelStats.setWhatIfPortfolioType(parameter.portfolioType);
        return exploreModellingLevelStats;
    }
}
