import {ExploreClickOnAddCash} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreClickOnAddCashSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {TelemetryWhatIfPortfolioTrackingParameters} from '../../parameters';

/**
 * TelemetryClickOnAddCashTracker is used to generated protos to capture click on add cash
 */
export class TelemetryClickOnAddCashTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryWhatIfPortfolioTrackingParameters, ExploreClickOnAddCash> {

    constructor() {
        super(eventSchema, 'explore:click-on-add-cash');
    }

    /**
     * Generate a protoBuff for events when the user clicks on add cash
     */
    generateProtoBuff(parameters: TelemetryWhatIfPortfolioTrackingParameters): ExploreClickOnAddCash {
        const exploreClickOnAddCash = new ExploreClickOnAddCash();
        exploreClickOnAddCash.setWhatIfPortfolioType(parameters.typeOfPortfolio);
        return exploreClickOnAddCash;
    }
}
