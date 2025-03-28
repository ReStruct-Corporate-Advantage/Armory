import {BaseTelemetryActionTracker} from '../../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../../telemetry-abstract-action-tracker';
import {
    TelemetryTimeSeriesSettingParameters,
} from '../../../parameters';
import {
    TimeSeriesSetting,
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {
    agraph_platform_event_logging_explore_event_v1_TimeSeriesSettingSchema as eventSchema
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';

/**
 * TelemetryTimeSeriesSettingTracker is used to generate protos to capture time series settings for factor data widget time series request
 */
export class TelemetryTimeSeriesSettingTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryTimeSeriesSettingParameters, TimeSeriesSetting> {

    constructor() {
        super(eventSchema, 'explore:time-series-setting');
    }

    generateProtoBuff(parameter: TelemetryTimeSeriesSettingParameters): TimeSeriesSetting {
        const timeSeriesSetting = new TimeSeriesSetting();
        timeSeriesSetting.setFrequency(parameter.frequency);
        timeSeriesSetting.setChartType(parameter.chartType);
        timeSeriesSetting.setPeriodCount(parameter.periodCount);
        timeSeriesSetting.setFormatDateType(parameter.formatDateType);
        timeSeriesSetting.setCompareMode(parameter.compareMode);
        return timeSeriesSetting;
    }
}
