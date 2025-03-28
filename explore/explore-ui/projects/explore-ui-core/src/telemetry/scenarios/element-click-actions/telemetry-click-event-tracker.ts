import {agraph_platform_event_logging_explore_event_v1_ExploreFrontendClickEventSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {ExploreFrontendClickEvent} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {ClickEventParameters} from '../../parameters';

export class TelemetryClickEventTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<ClickEventParameters, ExploreFrontendClickEvent> {

    constructor() {
        super(eventSchema, 'explore:custom-frontend-click-event');
    }

    /**
     * Generate a protoBuff for events when the user clicks frontend element
     */
    generateProtoBuff(parameter: ClickEventParameters): ExploreFrontendClickEvent {
        const event = new ExploreFrontendClickEvent();
        event.setElementType(parameter.elementType);
        event.setElementLabel(parameter.elementLabel);
        event.setElementSource(parameter.elementSource);
        event.setContextPath(parameter.contextPath);
        event.setParentElementSource(parameter.parentElementSource);
        parameter.addlDetails?.forEach((value: string, key: string) => {
            event.getAdditionalDetailsMap().set(key, value);
        });
        return event;
    }
}
