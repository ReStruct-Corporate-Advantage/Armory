import {ExploreCreateFromScratchStats} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreCreateFromScratchStatsSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {TelemetryCustomPortfolioTrackingParameters} from '../../parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

/**
 * TelemetryCustomPortfolioTracker is used to generated protos to capture events done while creating custom portfolios
 */

export class TelemetryCustomPortfolioTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryCustomPortfolioTrackingParameters, ExploreCreateFromScratchStats> {

    constructor() {
        super(eventSchema, 'explore:create-from-scratch-stats');
    }

    /**
     * Generate a protoBuff for events when the user creates custom portfolio
     */
    generateProtoBuff(parameter: TelemetryCustomPortfolioTrackingParameters): ExploreCreateFromScratchStats {
        const exploreCreateCustomPortfolioStats = new ExploreCreateFromScratchStats();
        exploreCreateCustomPortfolioStats.setCustomPortfolioType(parameter.typeOfPortfolio);
        exploreCreateCustomPortfolioStats.setRouteSecurityAdded(parameter.wayToAddSecurity);
        exploreCreateCustomPortfolioStats.setModellingColumnUsed(parameter.modellingColumnUsed);
        exploreCreateCustomPortfolioStats.setSecuritiesFailedCount(parameter.securitiesFailedToUpload);
        exploreCreateCustomPortfolioStats.setSecuritiesSuccessfullyUploadedCount(parameter.securitiesUploadedSuccessfully);
        exploreCreateCustomPortfolioStats.setCalculateNavUsed(parameter.isCalculateNavUsed);
        exploreCreateCustomPortfolioStats.setHasOtherWhatIf(parameter.hasOtherWhatIfs);
        exploreCreateCustomPortfolioStats.setSecuritiesCleared(parameter.isSecuritiesCleared);
        parameter.addedPortfoliosTypeToCountMap?.forEach((value, key) => {
           exploreCreateCustomPortfolioStats.getAddedPortfoliosTypeCountsMap().set(key, value) ;
        });
        return exploreCreateCustomPortfolioStats;
    }
}
