import {ExploreClickOnOptimizationSummary} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreClickOnOptimizationSummarySchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

export class TelemetryClickOnOptimizationSummaryTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<undefined, ExploreClickOnOptimizationSummary> {

    constructor() {
        super(eventSchema, 'explore:click-on-optimization-summary');
    }

    /**
     * Generate a protoBuff for events when the user clicks on optimize model
     */
    generateProtoBuff(): ExploreClickOnOptimizationSummary {
        return new ExploreClickOnOptimizationSummary();
    }
}
