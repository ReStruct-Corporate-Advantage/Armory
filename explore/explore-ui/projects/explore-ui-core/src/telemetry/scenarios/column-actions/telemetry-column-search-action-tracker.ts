import {TelemetryColumnSearchParameters} from '../../parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {ExploreColumnSearchStats} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreColumnSearchStatsSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {ExploreColumnQueryAction, ExploreColumnSearchByOption} from '../../enums';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

export class TelemetryColumnSearchActionTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryColumnSearchParameters, ExploreColumnSearchStats> {

    constructor() {
        super(eventSchema, 'explore:column-search-query');
    }

    /**
     * Generate a protoBuff for events when the user do column search
     */
    generateProtoBuff(parameter: TelemetryColumnSearchParameters): ExploreColumnSearchStats {
        const exploreColumnSearchStats = new ExploreColumnSearchStats();
        exploreColumnSearchStats.setSearchQuery(parameter.searchQuery);
        exploreColumnSearchStats.setColumnSearch(parameter.isDescriptionSearch ? ExploreColumnSearchByOption.EXPLORE_COLUMN_SEARCH_BY_OPTION_DEFINITION : ExploreColumnSearchByOption.EXPLORE_COLUMN_SEARCH_BY_OPTION_NAME);
        exploreColumnSearchStats.setResultSize(parameter.columnCount);
        exploreColumnSearchStats.setQueryDuration(parameter.timeTaken);
        exploreColumnSearchStats.setColumnQueryAction(parameter.columnSearchQueryAction ? parameter.columnSearchQueryAction :  ExploreColumnQueryAction.EXPLORE_COLUMN_QUERY_ACTION_UNSPECIFIED);
        const addedColumnAndOrder = exploreColumnSearchStats.getAddedColumnAndOrdersMap();
        // iterate over every key-value pair in a map
        parameter.addedColumnAndOrder?.forEach((v, k) => {
            addedColumnAndOrder.set(k, v);
        });
        return exploreColumnSearchStats;
    }
}
