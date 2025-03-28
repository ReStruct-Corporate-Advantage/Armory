import {ExploreWidgetColumnFilter} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreWidgetColumnFilterSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {ColumnFilteringParameters} from '../../parameters/column-actions/telemetry-column-filtering-parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {ReportContextTracker} from '../report-context/report-context-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

/**
 * TelemetryColumnFilteringActionTracker is used to generated protos to capture events done when columns are filtered
 */
export class TelemetryColumnFilteringActionTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<ColumnFilteringParameters, ExploreWidgetColumnFilter> {

    constructor() {
        super(eventSchema, 'explore:widget-column-filter');
    }

    /**
     * generateProtoBuff creates and returns an ExploreWidgetColumnFilter object populated with the data in parameters
     */
    generateProtoBuff(parameters: ColumnFilteringParameters): ExploreWidgetColumnFilter {
        const exploreWidgetColumnFilter = new ExploreWidgetColumnFilter();
        const reportContext = new ReportContextTracker();
        exploreWidgetColumnFilter.setColumnTag(parameters.columnTag);
        exploreWidgetColumnFilter.setWidgetType(parameters.widgetType);
        exploreWidgetColumnFilter.setFilterValue(parameters.filterValue);
        exploreWidgetColumnFilter.setFilterType(parameters.filterType);
        exploreWidgetColumnFilter.setReportContext(reportContext.generateProtoBuff(parameters.reportContext));

        return exploreWidgetColumnFilter;
    }
}

