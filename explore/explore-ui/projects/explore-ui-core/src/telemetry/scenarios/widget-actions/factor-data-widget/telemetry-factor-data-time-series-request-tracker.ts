import {BaseTelemetryActionTracker} from '../../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../../telemetry-abstract-action-tracker';
import {
    TelemetryFactorDataWidgetTimeSeriesRequestParameters,
} from '../../../parameters';
import {
    ExploreFactorDataWidgetTimeSeriesRequestStats,
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {
    agraph_platform_event_logging_explore_event_v1_ExploreFactorDataWidgetTimeSeriesRequestStatsSchema as eventSchema
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {TelemetryFactorTracker} from './telemetry-factor-tracker';
import {TelemetryTimeSeriesSettingTracker} from './telemetry-time-series-setting-tracker';

/**
 * TelemetryFactorDataTimeSeriesRequestTracker is used to generate protos to capture factor data widget time series requests
 */
export class TelemetryFactorDataTimeSeriesRequestTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryFactorDataWidgetTimeSeriesRequestParameters, ExploreFactorDataWidgetTimeSeriesRequestStats> {

    static telemetryFactorTracker = new TelemetryFactorTracker();
    static telemetryTimeSeriesSettingTracker = new TelemetryTimeSeriesSettingTracker();

    constructor() {
        super(eventSchema, 'explore:factor-data-widget-time-series-request-stats');
    }

    generateProtoBuff(parameter: TelemetryFactorDataWidgetTimeSeriesRequestParameters): ExploreFactorDataWidgetTimeSeriesRequestStats {
        const factorTimeSeriesRequestStats = new ExploreFactorDataWidgetTimeSeriesRequestStats();
        factorTimeSeriesRequestStats.setFactorAnalytic(parameter.factorAnalytic);
        factorTimeSeriesRequestStats.setRiskSettingsChanged(parameter.riskSettingsChanged);
        if (parameter.timeSeriesSetting) {
            factorTimeSeriesRequestStats.setTimeSeriesSetting(TelemetryFactorDataTimeSeriesRequestTracker.telemetryTimeSeriesSettingTracker.generateProtoBuff(parameter.timeSeriesSetting));
        }
        if (parameter.factorColumnsList) {
            const factorColumnsList = parameter.factorColumnsList.map(factor => TelemetryFactorDataTimeSeriesRequestTracker.telemetryFactorTracker.generateProtoBuff(factor));
            factorTimeSeriesRequestStats.setFactorColumnsList(factorColumnsList);
        }
        if (parameter.comparisonFactorColumnsList) {
            const comparisonFactorColumnsList = parameter.comparisonFactorColumnsList.map(factor => TelemetryFactorDataTimeSeriesRequestTracker.telemetryFactorTracker.generateProtoBuff(factor));
            factorTimeSeriesRequestStats.setComparisonFactorColumnsList(comparisonFactorColumnsList);
        }
        factorTimeSeriesRequestStats.setShowAsChart(parameter.showAsChart);
        return factorTimeSeriesRequestStats;
    }
}
