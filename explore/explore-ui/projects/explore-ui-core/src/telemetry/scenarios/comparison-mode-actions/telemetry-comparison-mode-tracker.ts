import {TelemetryComparisonModeTrackingParameters} from '../../parameters';
import {
    ExploreComparisonModeStats
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {
    agraph_platform_event_logging_explore_event_v1_ExploreComparisonModeStatsSchema as eventSchema
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';

/**
 * TelemetryComparisonModeTracker is used to generated protos
 * (can be found in https://dev.azure.com/1A4D/Telemetry-Platform/_git/open-aladdin-protos?path=%2Fprotos%2Fexplore_app_events.proto)
 * to capture user actions on running comparison mode
 */
export class TelemetryComparisonModeTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryComparisonModeTrackingParameters, ExploreComparisonModeStats> {

    constructor() {
        super(eventSchema, 'explore:comparison-mode-stats');
    }

    /**
     * Generate a protoBuff for events when the user runs the comparison mode
     * @param parameter
     */
    generateProtoBuff(parameter: TelemetryComparisonModeTrackingParameters): ExploreComparisonModeStats {
        const exploreComparisonModeStats = new ExploreComparisonModeStats();
        exploreComparisonModeStats.setAnchorUsed(parameter.anchorUsed);
        const portfolioTypeCountMappingsMap = exploreComparisonModeStats.getPortfolioTypeCountMappingsMap();
        // iterate over every key-value pair in a map
        parameter.portfolioTypeCountMappings?.forEach((v, k) => {
            portfolioTypeCountMappingsMap.set(k, v);
        });
        const widgetsComparedCountMappingsMap = exploreComparisonModeStats.getWidgetsComparedCountMappingsMap();
        // iterate over every key-value pair in a map
        parameter.widgetsComparedCountMappings?.forEach((v, k) => {
            widgetsComparedCountMappingsMap.set(k, v);
        });
        exploreComparisonModeStats.setPortfoliosCompared(parameter.portfoliosCompared);
        exploreComparisonModeStats.setEditMode(parameter.editMode);
        exploreComparisonModeStats.setChangeApplied(parameter.changeApplied);
        return exploreComparisonModeStats;
    }
}
