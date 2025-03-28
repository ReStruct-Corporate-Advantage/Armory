import {agraph_platform_event_logging_explore_event_v1_PortGroupSummaryChartStatsSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {PortGroupSummaryChartStats} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {PgsChartsParameter} from '../../../parameters';
import {BaseTelemetryActionTracker} from '../../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../../telemetry-abstract-action-tracker';
import {TelemetryPgsChartsAdditionalSettingsTracker} from './telemetry-pgs-charts-additional-settings-tracker';

/**
 * TelemetryPgsChartsTracker is used to generate protos to capture events for charts spawned from PGS widget
 */
export class TelemetryPgsChartsTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<PgsChartsParameter, PortGroupSummaryChartStats> {

    static pgsChartsAdditionalSettingsTracker = new TelemetryPgsChartsAdditionalSettingsTracker();

    constructor() {
        super(eventSchema, 'explore:open-pgs-chart');
    }

    /**
     * generateProtoBuff creates and returns an PortGroupSummaryChartStats object populated with the data in parameters
     */
    generateProtoBuff(parameters: PgsChartsParameter): PortGroupSummaryChartStats {
        const pgsChartStats = new PortGroupSummaryChartStats();
        pgsChartStats.setChartType(parameters.chartType);
        pgsChartStats.setLevel(parameters.chartLevel);
        pgsChartStats.setChartSpriteletClickType(parameters.chartSpriteletClickType);
        pgsChartStats.setAdditionalSetting(TelemetryPgsChartsTracker.pgsChartsAdditionalSettingsTracker.generateProtoBuff(parameters.pgsChartsAdditionalSettings));
        return pgsChartStats;
    }
}
