import {ExploreCreateWhatIfPortfolio} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreCreateWhatIfPortfolioSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {TelemetryWhatIfPortfolioTrackingParameters} from '../../parameters/portfolio-actions/telemetry-what-if-portfolio-tracking-parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

export class TelemetryWhatIfPortfolioTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryWhatIfPortfolioTrackingParameters, ExploreCreateWhatIfPortfolio> {

    constructor() {
        super(eventSchema, 'explore-create-what-if-portfolio');
    }

    /**
     * Generate a protoBuff for events when the user creates what-if portfolio
     */
    generateProtoBuff(parameter: TelemetryWhatIfPortfolioTrackingParameters): ExploreCreateWhatIfPortfolio {
        const exploreCreateWhatIfPortfolio = new ExploreCreateWhatIfPortfolio();
        exploreCreateWhatIfPortfolio.setWhatIfPortfolioType(parameter.typeOfPortfolio);
        return exploreCreateWhatIfPortfolio;
    }
}
