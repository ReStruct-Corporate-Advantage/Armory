/**
 *  TelemetryDeleteFavoriteTracker is used to generated protos to capture user actions on delete favorite location
 */
import {TelemetryDeleteFavoriteParameters} from '../../parameters/delete-favorite-actions/telemetry-delete-favorite-parameters';
import {agraph_platform_event_logging_explore_event_v1_ExploreDeleteFavoriteConfigSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {ExploreDeleteFavoriteConfig} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

export class TelemetryDeleteFavoriteTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryDeleteFavoriteParameters, ExploreDeleteFavoriteConfig> {

    constructor() {
        super(eventSchema, 'explore:delete-favorite-location');
    }

    /**
     * Generate a protoBuff for events when the user clicks delete workspace
     */
    generateProtoBuff(parameter: TelemetryDeleteFavoriteParameters): ExploreDeleteFavoriteConfig {
        const config = new ExploreDeleteFavoriteConfig();
        config.setEventLocation(parameter.eventLocation);
        config.setFavoriteType(parameter.favoriteType);
        config.setFavoriteId(parameter.favoriteId ? parameter.favoriteId.toString() : undefined);
        config.setTitle(parameter.title);
        config.setOwner(parameter.owner);
        return config;
    }
}
