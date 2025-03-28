import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {
    TelemetryStyleColumnSettingsParameters
} from '../../parameters';
import {
    StyleAnalysisColumnSettings
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {
    agraph_platform_event_logging_explore_event_v1_StyleAnalysisColumnSettingsSchema as eventSchema
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {TelemetryStyleMeasureSettingsTracker} from './telemetry-style-measure-settings-tracker';

/**
 * TelemetryStyleColumnSettingsTracker is used to generate protos to capture column settings in style columns in any widget
 */
export class TelemetryStyleColumnSettingsTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryStyleColumnSettingsParameters, StyleAnalysisColumnSettings> {

    static measureSettingsTracker = new TelemetryStyleMeasureSettingsTracker();

    constructor() {
        super(eventSchema, 'explore:style-column-settings-stats');
    }

    /**
     * Generate a protoBuff for events when the user changes columns settings in style columns in any widget
     */
    generateProtoBuff(parameter: TelemetryStyleColumnSettingsParameters): StyleAnalysisColumnSettings {
        const styleAnalysisColumnSettings = new StyleAnalysisColumnSettings();
        styleAnalysisColumnSettings.setSubColumn(parameter.subColumn);
        styleAnalysisColumnSettings.setMeasuresExpanded(parameter.measuresExpanded);
        const measureSettingsMap = styleAnalysisColumnSettings.getMeasuresSettingsMap();
        parameter.measuresSettings?.forEach((value, key) => {
            measureSettingsMap.set(key, TelemetryStyleColumnSettingsTracker.measureSettingsTracker.generateProtoBuff(value));
        });
        return styleAnalysisColumnSettings;
    }
}
