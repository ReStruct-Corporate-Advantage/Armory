import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {ExploreLoadWhatIfStats} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {TelemetryLoadPortfolioTypeParameters} from '../../parameters/portfolio-actions/telemetry-load-portfolio-type-parameters';
import {agraph_platform_event_logging_explore_event_v1_ExploreLoadWhatIfStatsSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';

/**
 * TelemetryLoadPortfolioTracker is used to generated protos
 * (can be found in https://dev.azure.com/1A4D/Telemetry-Platform/_git/open-aladdin-protos?path=%2Fprotos%2Fexplore_app_events.proto)
 * to capture user actions on loading portfolio
 */
export class TelemetryLoadPortfolioTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryLoadPortfolioTypeParameters, ExploreLoadWhatIfStats> {
    constructor() {
        super(eventSchema, 'explore-load-what-if-portfolio');
    }

    /**
     * Generate a protoBuff for events when the user loads what-if portfolio
     */
    generateProtoBuff(parameter: TelemetryLoadPortfolioTypeParameters): ExploreLoadWhatIfStats {
        const exploreLoadIfPortfolio = new ExploreLoadWhatIfStats();
        exploreLoadIfPortfolio.setWhatIfFavoriteType(parameter.typeOfFavorite);
        exploreLoadIfPortfolio.setWhatIfName(parameter.whatIfName);
        exploreLoadIfPortfolio.setWhatIfPortfolioType(parameter.whatIfPortfolioType);
        return exploreLoadIfPortfolio;
    }
}
