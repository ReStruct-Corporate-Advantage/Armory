import {ExploreClickOnHelpButtonModelling} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreClickOnHelpButtonModellingSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {TelemetryModellingHelpClickParameters} from '../../parameters/modelling-actions/telemetry-modelling-help-click-parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

/**
 * TelemetryClickOnHelpTracker is used to generated protos to capture user actions on click on help button
 */
export class TelemetryClickOnHelpTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryModellingHelpClickParameters, ExploreClickOnHelpButtonModelling> {

    constructor() {
        super(eventSchema, 'explore:click-on-help-button-modelling');
    }

    /**
     * Generate a protoBuff for events when the user opens help popover
     */
    generateProtoBuff(parameter: TelemetryModellingHelpClickParameters): ExploreClickOnHelpButtonModelling {
        const exploreClickOnHelpButtonModelling = new ExploreClickOnHelpButtonModelling();
        exploreClickOnHelpButtonModelling.setModellingHelpOption(parameter.modellingHelpOption);
        return exploreClickOnHelpButtonModelling;
    }
}
