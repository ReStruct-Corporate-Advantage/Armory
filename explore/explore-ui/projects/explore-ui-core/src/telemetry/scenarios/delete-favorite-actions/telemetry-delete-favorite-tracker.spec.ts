import {ExploreDeleteFavoriteConfig} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {TelemetryDeleteFavoriteTracker} from './telemetry-delete-favorite-tracker';
import {ExploreDeleteFavoriteEventLocation} from '../../enums/telemetry-delete-favorite-event-location.enum';
import {TelemetryDeleteFavoriteParameters} from '../../parameters/delete-favorite-actions/telemetry-delete-favorite-parameters';


describe('TelemetryDeleteFavoriteTracker', () => {

    const telemetryDeleteFavoriteActionTracker = new TelemetryDeleteFavoriteTracker();

    it('should log TelemetryReportUserActionTracker', () => {
        const deleteFavoriteActionParameters = new TelemetryDeleteFavoriteParameters(ExploreDeleteFavoriteEventLocation.EXPLORE_DELETE_FAVORITE_EVENT_LOCATION_SAVE, 'WORKSPACE',
            123, 'Dummy Title', 'abc');
        const protoBuff = telemetryDeleteFavoriteActionTracker.generateProtoBuff(deleteFavoriteActionParameters);
        expect(protoBuff instanceof ExploreDeleteFavoriteConfig).toBe(true);
        expect((protoBuff as ExploreDeleteFavoriteConfig).getEventLocation()).toEqual(ExploreDeleteFavoriteEventLocation.EXPLORE_DELETE_FAVORITE_EVENT_LOCATION_SAVE);
        expect((protoBuff as ExploreDeleteFavoriteConfig).getFavoriteType()).toEqual('WORKSPACE');
        expect((protoBuff as ExploreDeleteFavoriteConfig).getFavoriteId()).toEqual("123");
        expect( (protoBuff as ExploreDeleteFavoriteConfig).getTitle()).toEqual('Dummy Title');
        expect( (protoBuff as ExploreDeleteFavoriteConfig).getOwner()).toEqual('abc');
    });
});
