import {ExploreUIError} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {ExploreAnalysisContext, ExploreReportConfig, ExploreWidgetContext} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_telemetry_config_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreUIErrorSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {UIErrorParameters} from './ui-error-parameters';
import {isEmpty} from 'lodash';

export class TelemetryUIErrorTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<UIErrorParameters, ExploreUIError> {

    constructor() {
        super(eventSchema);
    }

    /**
     * Create a protoBuff holding Error info
     */
    generateProtoBuff(parameter: UIErrorParameters): ExploreUIError {
        const exploreUIError = new ExploreUIError();

        exploreUIError.setErrorType(parameter.errorType);
        exploreUIError.setErrorMessage(parameter.errorMessage);

        this.setAnalysisContext(parameter, exploreUIError);
        this.setWidgetContext(parameter, exploreUIError);

        return exploreUIError;
    }

    /**
     * Set analysis context to ExploreUIError if available
     */
    private setAnalysisContext(parameter: UIErrorParameters, exploreUIError: ExploreUIError) {
        const analysisContext = new ExploreAnalysisContext();
        this.setReportContext(parameter, analysisContext);

        // If analysis context is NOT available, don't set it to ExploreUiError.
        if (isEmpty(parameter.portfolioTickers) && !parameter.isComparisonEnabled && !analysisContext.hasReportContext()) {
            return;
        }

        if (parameter.portfolioTickers) {
            analysisContext.setPortfolioNamesList(parameter.portfolioTickers);
        }

        if (parameter.isComparisonEnabled) {
            analysisContext.setComparisonEnabled(parameter.isComparisonEnabled);
        }

        exploreUIError.setExploreAnalysisContext(analysisContext);

    }

    /**
     * Set report context to ExploreAnalysisContext if available
     */
    private setReportContext(parameter: UIErrorParameters, analysisContext: ExploreAnalysisContext): void {
        // If report context is NOT available, don't set it to analysis context.
        if (!parameter.reportTitle && !parameter.reportId && !parameter.reportOwner) {
            return;
        }

        const reportContext = new ExploreReportConfig();

        if (parameter.reportTitle) {
            reportContext.setReportTitle(parameter.reportTitle);
        }

        if (parameter.reportId) {
            reportContext.setReportId(parameter.reportId ? parameter.reportId.toString() : undefined);
        }

        if (parameter.reportOwner) {
            reportContext.setReportOwner(parameter.reportOwner);
        }

        analysisContext.setReportContext(reportContext);
    }

    /**
     * Set widget context to ExploreUIError if available
     */
    private setWidgetContext(parameter: UIErrorParameters, exploreUIError: ExploreUIError): void {
        // If widget context is NOT available, don't set it to analysis context.
        if (!parameter.widgetType && !parameter.widgetTitle) {
            return;
        }

        const widgetContext = new ExploreWidgetContext();
        if (parameter.widgetType) {
            widgetContext.setWidgetType(parameter.widgetType);
        }

        if (parameter.widgetTitle) {
            widgetContext.setWidgetTitle(parameter.widgetTitle);
        }

        exploreUIError.setExploreWidgetContext(widgetContext);
    }
}
