import {ExploreColumnSearchStats} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {TelemetryColumnSearchActionTracker} from './telemetry-column-search-action-tracker';
import {TelemetryColumnSearchParameters} from '../../parameters';
import {ExploreColumnQueryAction, ExploreColumnSearchByOption} from '../../enums';
import {TelemetryUtil} from '../../utils/telemetry.util';
import {Duration} from 'google-protobuf/google/protobuf/duration_pb';

describe('TelemetryColumnSearchActionTracker', () => {
    const telemetryColumnSearchActionTracker = new TelemetryColumnSearchActionTracker();

    it('should log TelemetryColumnSearchActionTracker', () => {
        const addedColumnAndOrder = new Map<string, number>();
        addedColumnAndOrder.set('Market Value', 1);

        const parameters = new TelemetryColumnSearchParameters('Market Value', false, 4, TelemetryUtil.getDuration(3005), ExploreColumnQueryAction.EXPLORE_COLUMN_QUERY_ACTION_SEARCH_NO_RESULTS, addedColumnAndOrder);
        const duration = new Duration();
        duration.setSeconds(3);
        duration.setNanos(5000);
        const protoBuff = telemetryColumnSearchActionTracker.generateProtoBuff(parameters);
        expect(protoBuff instanceof ExploreColumnSearchStats).toBe(true);
        expect((protoBuff as ExploreColumnSearchStats).getSearchQuery()).toEqual('Market Value');
        expect((protoBuff as ExploreColumnSearchStats).getResultSize()).toEqual(4);
        expect((protoBuff as ExploreColumnSearchStats).getColumnQueryAction()).toEqual(ExploreColumnQueryAction.EXPLORE_COLUMN_QUERY_ACTION_SEARCH_NO_RESULTS);
        expect((protoBuff as ExploreColumnSearchStats).getColumnSearch()).toEqual(ExploreColumnSearchByOption.EXPLORE_COLUMN_SEARCH_BY_OPTION_NAME);
        expect((protoBuff as ExploreColumnSearchStats).getQueryDuration()).toEqual(duration);
    });
});
