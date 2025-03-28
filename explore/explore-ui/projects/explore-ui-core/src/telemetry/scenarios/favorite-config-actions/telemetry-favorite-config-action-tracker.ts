import {ExploreAddFavoriteConfig} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreAddFavoriteConfigSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {FavoriteConfigParameters} from '../../parameters/favorite-config-actions/telemetry-favorite-config-parameters';
import {TelemetryUtil} from '../../utils/telemetry.util';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

/**
 * TelemetryFavoriteConfigActionTracker is used to generated protos to capture when reports are run or added
 */
export class TelemetryFavoriteConfigActionTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<FavoriteConfigParameters, ExploreAddFavoriteConfig> {

    constructor() {
        super(eventSchema, 'explore:add-favorite-config');
    }

    generateProtoBuff(parameters: FavoriteConfigParameters): ExploreAddFavoriteConfig {
        const exploreFavoriteConfig = new ExploreAddFavoriteConfig();
        exploreFavoriteConfig.setFavoriteId(TelemetryUtil.getAdjustedFavoriteId(parameters.favoriteId));
        exploreFavoriteConfig.setFavoriteType(parameters.favoriteType);
        exploreFavoriteConfig.setOwner(parameters.owner);
        exploreFavoriteConfig.setTitle(parameters.title);
        return exploreFavoriteConfig;
    }
}

