import {ExploreWidgetReloadUserBehavior} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreWidgetReloadUserBehaviorSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {TelemetryWidgetReloadParameters} from '../../parameters/report-actions/telemetry-widget-reload-parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

export class TelemetryWidgetReloadActionTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryWidgetReloadParameters, ExploreWidgetReloadUserBehavior> {

    constructor() {
        super(eventSchema, 'explore:widget-reload-user-behavior');
    }

    /**
     * Generate a protoBuff for events when the user reloads a widget
     */
    generateProtoBuff(parameter: TelemetryWidgetReloadParameters): ExploreWidgetReloadUserBehavior {
        const exploreWidgetReloadUserBehavior = new ExploreWidgetReloadUserBehavior();
        exploreWidgetReloadUserBehavior.setWidgetType(parameter.widgetType);
        exploreWidgetReloadUserBehavior.setColumnTagsList(parameter.columns);
        exploreWidgetReloadUserBehavior.setHardRefresh(parameter.isHardRefresh);
        exploreWidgetReloadUserBehavior.setWidgetName(parameter.widgetDisplayName);
        return exploreWidgetReloadUserBehavior;
    }
}
