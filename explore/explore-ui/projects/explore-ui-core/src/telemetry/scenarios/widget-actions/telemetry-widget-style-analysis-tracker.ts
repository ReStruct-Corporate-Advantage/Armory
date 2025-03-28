import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {TelemetryStyleAnalysisParameters} from '../../parameters';
import {
    agraph_platform_event_logging_explore_event_v1_ExploreStyleAnalysisStatsSchema as eventSchema
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {
    ExploreStyleAnalysisStats
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {TelemetryStyleColumnSettingsTracker} from './telemetry-style-column-settings-tracker';

/**
 * TelemetryWidgetStyleAnalysisTracker is used to generate protos to capture user actions on adding style columns in any widget
 */
export class TelemetryWidgetStyleAnalysisTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryStyleAnalysisParameters, ExploreStyleAnalysisStats> {

    static styleColumnSettingsTracker = new TelemetryStyleColumnSettingsTracker();

    constructor() {
        super(eventSchema, 'explore:style-analysis-stats');
    }

    /**
     * Generate a protoBuff for events when the user adds style columns in any widget
     */
    generateProtoBuff(parameter: TelemetryStyleAnalysisParameters): ExploreStyleAnalysisStats {
        const styleAnalysisStats = new ExploreStyleAnalysisStats();
        styleAnalysisStats.setWidgetType(parameter.widgetType);
        const columnSettingsMap = styleAnalysisStats.getColumnSettingsMap();
        parameter.columnSettings.forEach((value, key) => {
            columnSettingsMap.set(key, TelemetryWidgetStyleAnalysisTracker.styleColumnSettingsTracker.generateProtoBuff(value));
        });
        return styleAnalysisStats;
    }
}
