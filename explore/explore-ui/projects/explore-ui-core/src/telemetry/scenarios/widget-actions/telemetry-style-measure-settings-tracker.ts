import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {
    TelemetryStyleMeasureSettingsParameters
} from '../../parameters';
import {
    MeasureSettings
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {
    agraph_platform_event_logging_explore_event_v1_MeasureSettingsSchema as eventSchema
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';

/**
 * TelemetryStyleMeasureSettingsTracker is used to generate protos to capture measures added to style columns in any widget
 */
export class TelemetryStyleMeasureSettingsTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryStyleMeasureSettingsParameters, MeasureSettings> {

    constructor() {
        super(eventSchema, 'explore:style-measure-settings-stats');
    }

    /**
     * Generate a protoBuff for events when the user adds measures to style columns in any widget
     */
    generateProtoBuff(parameter: TelemetryStyleMeasureSettingsParameters): MeasureSettings {
        const measureSettings = new MeasureSettings();
        measureSettings.setMaxLimit(parameter.max);
        measureSettings.setMinLimit(parameter.min);
        measureSettings.setWeight(parameter.weight);
        measureSettings.setMode(parameter.mode);
        return measureSettings;
    }
}
