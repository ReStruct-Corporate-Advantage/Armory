import {ExploreExportExcelRequest} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreExportExcelRequestSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {TelemetryExportExcelRequestParameters} from '../../parameters/export-actions/telemetry-export-excel-request-parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';


/**
 *  TelemetryExportExcelRequestTracker is used to generated protos to capture user actions on export Excel with options
 */
export class TelemetryExportExcelRequestTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryExportExcelRequestParameters, ExploreExportExcelRequest> {

    constructor() {
        super(eventSchema, 'explore:export-excel-request');
    }

    /**
     * Generate a protoBuff for events when the user exports Excel with options
     */
    generateProtoBuff(parameter: TelemetryExportExcelRequestParameters): ExploreExportExcelRequest {
        const exploreExportExcelRequest = new ExploreExportExcelRequest();
        exploreExportExcelRequest.setExportLevel(parameter.exportLevel);
        exploreExportExcelRequest.setShowAllRecord(parameter.showAllRecord);
        exploreExportExcelRequest.setBreakdownDisplay(parameter.breakdownDisplay);
        exploreExportExcelRequest.setOutlineStyle(parameter.outlineStyle);
        exploreExportExcelRequest.setFreezeColumnHeader(parameter.freezeColumnHeaders);
        exploreExportExcelRequest.setSuppressRowShading(parameter.suppressRowShading);
        exploreExportExcelRequest.setUseMergedCellFooter(parameter.useMergedCellFooter);
        exploreExportExcelRequest.setAppendTimestamp(parameter.appendTimestamp);
        return exploreExportExcelRequest;
    }
}
