import {ExploreReportUserBehaviour} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreReportUserBehaviourSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {TelemetryReportActionParameters} from '../../parameters/report-actions/telemetry-report-action-parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {ReportContextTracker} from '../report-context/report-context-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

export class TelemetryReportActionTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryReportActionParameters, ExploreReportUserBehaviour> {

    constructor() {
        super(eventSchema, 'explore:report-user-behaviour');
    }

    /**
     * Generate a protoBuff for events when a user clicks on reload/cancel on the report-bar
     * Generate a protoBuff for events when a user clicks "+ Widget" from the widget gallery
     * Generate a protoBuff for events when a user clicks "show footnote" on a widget
     */
    generateProtoBuff(parameters: TelemetryReportActionParameters): ExploreReportUserBehaviour {
        const exploreReportUserBehaviour = new ExploreReportUserBehaviour();
        const reportContext = new ReportContextTracker();
        exploreReportUserBehaviour.setActionType(parameters.actionType);
        exploreReportUserBehaviour.setWidgetsCount(parameters.numberOfWidgets);
        exploreReportUserBehaviour.setWidgetTypesList(parameters.widgetTypes);
        exploreReportUserBehaviour.setWhatIfPortfolio(parameters.isWhatIfPortfolio);
        exploreReportUserBehaviour.setExploreReportContext(reportContext.generateProtoBuff(parameters.reportContext));
        return exploreReportUserBehaviour;
    }
}
