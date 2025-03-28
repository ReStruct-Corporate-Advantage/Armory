import {ExploreGenerateApiRequest} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreWidgetReloadUserBehaviorSchema as eventSchema
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {TelemetryGenerateApiRequestParameters} from '../../parameters/widget-actions/telemetry-generate-api-request-parameters';

export class TelemetryGenerateApiRequestActionTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryGenerateApiRequestParameters, ExploreGenerateApiRequest> {

    constructor() {
        super(eventSchema, 'explore:generate-api-request');
    }

    /**
     * Generate a protoBuf for events when the user clicks generateApiRequest
     */
    generateProtoBuff(parameter: TelemetryGenerateApiRequestParameters): ExploreGenerateApiRequest {
        const exploreGenerateApiRequest = new ExploreGenerateApiRequest();
        exploreGenerateApiRequest.setGenerateApiRequestUnsupportedError(parameter.errorType);
        return exploreGenerateApiRequest;
    }
}
