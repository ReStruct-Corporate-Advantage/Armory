import {ExploreReportConfig} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_telemetry_config_pb';
import {ReportContextParameters} from '../../parameters/report-context/report-context-parameters';
import {TelemetryUtil} from '../../utils/telemetry.util';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

export class ReportContextTracker implements TelemetryActionTracker<ReportContextParameters, ExploreReportConfig> {

    /**
     * create a protoBuff holding report related info
     */
    generateProtoBuff(parameters: ReportContextParameters): ExploreReportConfig {
        const exploreReportConfig = new ExploreReportConfig();
        exploreReportConfig.setReportTitle(parameters.reportTitle);
        exploreReportConfig.setReportId(TelemetryUtil.getAdjustedFavoriteId(parameters.reportId));
        exploreReportConfig.setReportOwner(parameters.reportOwner);
        return exploreReportConfig;
    }
}
