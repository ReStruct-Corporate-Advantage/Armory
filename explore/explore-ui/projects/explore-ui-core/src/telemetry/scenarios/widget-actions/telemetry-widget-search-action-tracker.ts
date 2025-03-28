import {ExploreWidgetSearch} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreWidgetSearchSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {TelemetryWidgetSearchParameters} from '../../parameters/widget-actions/telemetry-widget-search-parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

export class TelemetryWidgetSearchActionTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryWidgetSearchParameters, ExploreWidgetSearch> {

    constructor() {
        super(eventSchema, 'explore:widget-search');
    }

    /**
     * Generate a protoBuff for events when the user reloads a widget
     */
    generateProtoBuff(parameter: TelemetryWidgetSearchParameters): ExploreWidgetSearch {
        const exploreWidgetSearch = new ExploreWidgetSearch();
        exploreWidgetSearch.setWidgetType(parameter.widgetType);
        exploreWidgetSearch.setSearchColumn(parameter.searchColumn);
        exploreWidgetSearch.setSearchValue(parameter.searchValue);
        exploreWidgetSearch.setWrapSearchEnabled(parameter.isWrapSearchEnabled);
        return exploreWidgetSearch;
    }
}
