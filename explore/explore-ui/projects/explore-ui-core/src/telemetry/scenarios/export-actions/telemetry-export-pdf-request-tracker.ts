import {ExploreExportPDFRequest} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreExportPDFRequestSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {TelemetryExportPDFRequestParameters} from '../../parameters/export-actions/telemetry-export-pdf-request-parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';


/**
 *  TelemetryExportPDFRequestTracker is used to generated protos to capture user actions on export PDF with options
 */
export class TelemetryExportPDFRequestTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryExportPDFRequestParameters, ExploreExportPDFRequest> {

    constructor() {
        super(eventSchema, 'explore:export-pdf-request');
    }

    /**
     * Generate a protoBuff for events when the user exports PDF with options
     */
    generateProtoBuff(parameter: TelemetryExportPDFRequestParameters): ExploreExportPDFRequest {
        const exploreExportPDFRequest = new ExploreExportPDFRequest();
        exploreExportPDFRequest.setExportLevel(parameter.exportLevel);
        exploreExportPDFRequest.setOrientation(parameter.orientation);
        exploreExportPDFRequest.setAppendTimestamp(parameter.appendTimestamp);
        exploreExportPDFRequest.setLayout(parameter.layout);
        exploreExportPDFRequest.setPageFormat(parameter.pageFormat);
        exploreExportPDFRequest.setPageMargin(parameter.pageMargin);
        exploreExportPDFRequest.setPrintAsis(parameter.printAsIs);
        exploreExportPDFRequest.setIsLogoEnabled(parameter.isLogoEnabled);
        exploreExportPDFRequest.setLogoPresent(parameter.logoPresent);
        exploreExportPDFRequest.setLogoPosition(parameter.logoPosition);
        exploreExportPDFRequest.setShowLogoPreview(parameter.showLogoPreview);
        return exploreExportPDFRequest;
    }
}

