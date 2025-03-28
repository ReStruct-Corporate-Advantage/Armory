import {ExploreExportTradeTable} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreExportTradeTableSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {TelemetryTradeTableExportParameters} from '../../parameters/export-actions/telemetry-trade-table-export-parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

/**
 * TelemetryTradeTableExportTracker is used to generated protos to capture user actions on Trade table export
 */
export class TelemetryTradeTableExportTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryTradeTableExportParameters, ExploreExportTradeTable> {

    constructor() {
        super(eventSchema, 'explore:export-trade-table');
    }

    /**
     * Generate a protoBuff for events when the user exports trade table
     */
    generateProtoBuff(parameter: TelemetryTradeTableExportParameters): ExploreExportTradeTable {
        const exploreExportTradeTable = new ExploreExportTradeTable();
        exploreExportTradeTable.setExportType(parameter.exportType);
        return exploreExportTradeTable;
    }
}
