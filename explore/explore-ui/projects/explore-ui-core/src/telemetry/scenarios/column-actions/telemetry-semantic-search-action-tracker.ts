import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {ExploreSemanticSearchStats} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreSemanticSearchStatsSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {TelemetrySemanticSearchParameters} from '../../parameters/column-actions/telemetry-semantic-search-parameters';
import {isNil} from 'lodash';

export class TelemetrySemanticSearchActionTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetrySemanticSearchParameters, ExploreSemanticSearchStats> {

    constructor() {
        super(eventSchema, 'explore:column-semantic-search-query');
    }

    /**
     * Generate a protoBuff for events when the user do column search
     */
    generateProtoBuff(parameter: TelemetrySemanticSearchParameters): ExploreSemanticSearchStats {
        const exploreSemanticSearchStats = new ExploreSemanticSearchStats();
        exploreSemanticSearchStats.setWidgetType(parameter.widgetType);
        exploreSemanticSearchStats.setColSearchType(parameter.colSearchType);
        exploreSemanticSearchStats.setRequestedRow(parameter.requestedRows);
        exploreSemanticSearchStats.setSearchQuery(parameter.searchQuery);
        exploreSemanticSearchStats.setQueryDuration(parameter.timeTaken);
        exploreSemanticSearchStats.setResultSize(parameter.columnCount);
        if (!isNil(parameter.likeResult)) {
            exploreSemanticSearchStats.setLikeResult(parameter.likeResult);
        }
        return exploreSemanticSearchStats;
    }
}
