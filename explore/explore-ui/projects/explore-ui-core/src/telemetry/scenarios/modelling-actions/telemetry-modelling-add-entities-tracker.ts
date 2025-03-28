import {ExploreOptimizationAddingEntitiesStats} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {agraph_platform_event_logging_explore_event_v1_ExploreOptimizationAddingEntitiesStatsSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {TelemetryAddEntitiesParameters} from '../../parameters/adding-entities-actions/telemetry-adding-entites-parameters';

/**
 * TelemetryModellingAddEntitiesTracker is used to generated protos to capture events done while adding securities in optimization panel
 */
export class TelemetryModellingAddEntitiesTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryAddEntitiesParameters, ExploreOptimizationAddingEntitiesStats> {

    constructor() {
        super(eventSchema, 'explore:optimization-adding-entities-stats');
    }

    /**
     * Generate a protoBuff for events when the user adds entities in optimization
     */
    generateProtoBuff(parameter: TelemetryAddEntitiesParameters): ExploreOptimizationAddingEntitiesStats {
        const exploreOptimizationAddEntityStats = new ExploreOptimizationAddingEntitiesStats();
        exploreOptimizationAddEntityStats.setRouteEntityAdded(parameter.wayToAddSecurity);
        exploreOptimizationAddEntityStats.setModellingColumnUsed(parameter.modellingColumnUsed);
        exploreOptimizationAddEntityStats.setSecuritiesFailedCount(parameter.securitiesFailedToUpload);
        exploreOptimizationAddEntityStats.setSecuritiesSuccessfullyUploadedCount(parameter.securitiesUploadedSuccessfully);
        exploreOptimizationAddEntityStats.setAddedEntityType(parameter.addedEntityType);
        exploreOptimizationAddEntityStats.setAddedPortfolioType(parameter.addedPortfolioType);
        exploreOptimizationAddEntityStats.setBasePortfolioType(parameter.basePortfolioType);
        exploreOptimizationAddEntityStats.setSpecificPortfolio(parameter.specificPortfolio);
        return exploreOptimizationAddEntityStats;
    }
}
