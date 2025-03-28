import {TelemetrySemanticSearchActionTracker} from './telemetry-semantic-search-action-tracker';
import {TelemetrySemanticSearchParameters} from '../../parameters/column-actions/telemetry-semantic-search-parameters';
import {ExploreSemanticSearchStats} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {Duration} from 'google-protobuf/google/protobuf/duration_pb';

describe('TelemetrySemanticSearchActionTracker', () => {
    const telemetrySemanticSearchActionTracker = new TelemetrySemanticSearchActionTracker();

    it('should log TelemetrySemanticSearchActionTracker', () => {
        const duration = new Duration();
        duration.setSeconds(3);
        duration.setNanos(5000);

        const parameters = new TelemetrySemanticSearchParameters('RE', 'SS1', 10, 'Market', duration, 5, true);
        const protoBuff = telemetrySemanticSearchActionTracker.generateProtoBuff(parameters);

        expect(protoBuff instanceof ExploreSemanticSearchStats).toBe(true);
        expect(protoBuff.getWidgetType()).toEqual('RE');
        expect(protoBuff.getColSearchType()).toEqual('SS1');
        expect(protoBuff.getRequestedRow()).toEqual(10);
        expect(protoBuff.getSearchQuery()).toEqual('Market');
        expect(protoBuff.getQueryDuration()).toEqual(duration);
        expect(protoBuff.getResultSize()).toEqual(5);
        expect(protoBuff.getLikeResult()).toEqual(true);
    });
});
