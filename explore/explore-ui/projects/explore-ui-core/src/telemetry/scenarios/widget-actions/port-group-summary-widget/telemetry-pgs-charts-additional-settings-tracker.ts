import {agraph_platform_event_logging_explore_event_v1_PortGroupSummaryChartAdditionalSettingsSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {PortGroupSummaryChartAdditionalSettings} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {BaseTelemetryActionTracker} from '../../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../../telemetry-abstract-action-tracker';
import {PgsChartsAdditionalSettingsParameter} from '../../../parameters';

/**
 * TelemetryPgsChartsAdditionalSettingsTracker is used to generate protos to capture events related to PGS charts additional settings
 */
export class TelemetryPgsChartsAdditionalSettingsTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<PgsChartsAdditionalSettingsParameter, PortGroupSummaryChartAdditionalSettings> {

    constructor() {
        super(eventSchema, 'explore:open-pgs-chart');
    }

    /**
     * generateProtoBuff creates and returns an PortGroupSummaryChartAdditionalSettings object populated with the data in parameters
     */
    generateProtoBuff(parameters: PgsChartsAdditionalSettingsParameter): PortGroupSummaryChartAdditionalSettings {
        const pgsChartAdditionalSettings = new PortGroupSummaryChartAdditionalSettings();
        pgsChartAdditionalSettings.setStackedChart(parameters.isStackedChart);
        pgsChartAdditionalSettings.setBreakdown(parameters.isBreakdownAdded);
        pgsChartAdditionalSettings.setObservationNumber(parameters.numberOfObservations);
        return pgsChartAdditionalSettings;
    }
}
