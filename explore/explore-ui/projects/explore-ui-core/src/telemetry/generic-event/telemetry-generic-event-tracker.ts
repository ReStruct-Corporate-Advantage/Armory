import {ExploreUiEvent} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {
    agraph_platform_event_logging_explore_event_v1_ExploreUiEventSchema as eventSchema
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {TelemetryGenericEventParameters} from './telemetry-generic-event-parameters';
import {TelemetryActionTracker} from '../scenarios/telemetry-abstract-action-tracker';
import {BaseTelemetryActionTracker} from '../scenarios/base-telemetry-action-tracker';

/**
 * Generic Event Tracker
 */
export class TelemetryGenericEventTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryGenericEventParameters, ExploreUiEvent> {
    constructor() {
        super(eventSchema, 'explore:generic-event-event');
    }

    /**
     * Generate a protoBuff for explore generic-event events
     */
    generateProtoBuff(parameter: TelemetryGenericEventParameters): ExploreUiEvent {
        const event = new ExploreUiEvent();
        event.setExploreEventType(parameter.type);
        const details = event.getExploreEventDetailsMap();
        // iterate over every key-value pair in a map
        parameter.details.forEach((v, k) => {
            // value MUST be in string format, as any other type will not be recorded.
            if (typeof k !== 'string') {
                return;
            }
            details.set(k, v);
        });
        return event;
    }
}
