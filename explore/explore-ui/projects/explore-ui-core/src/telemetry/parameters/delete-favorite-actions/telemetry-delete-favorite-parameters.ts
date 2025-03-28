/**
 * TelemetryDeleteFavoriteParameters captures information related to delete favorite event
 */
import {ExploreDeleteFavoriteEventLocation} from '../../enums/telemetry-delete-favorite-event-location.enum';

export class TelemetryDeleteFavoriteParameters {
    eventLocation: ExploreDeleteFavoriteEventLocation;
    favoriteType: string;
    favoriteId: number|string;
    title: string;
    owner: string;

    constructor(eventLocation: ExploreDeleteFavoriteEventLocation, favoriteType: string, favoriteId: number|string, title: string, owner: string) {
        this.eventLocation = eventLocation;
        this.favoriteType = favoriteType;
        this.favoriteId = favoriteId;
        this.title = title;
        this.owner = owner;
    }
}
