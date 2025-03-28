import {BaseTelemetryActionTracker} from '../../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../../telemetry-abstract-action-tracker';
import {
    ExploreFactorDataWidgetRiskMatrixRequestStats,
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {
    agraph_platform_event_logging_explore_event_v1_ExploreFactorDataWidgetRiskMatrixRequestStatsSchema as eventSchema
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {TelemetryFactorTracker} from './telemetry-factor-tracker';
import {TelemetryFactorDataWidgetRiskMatrixRequestParameters} from '../../../parameters';

/**
 * TelemetryFactorDataRiskMatrixRequestTracker is used to generate protos to capture factor data widget risk matrix requests
 */
export class TelemetryFactorDataRiskMatrixRequestTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryFactorDataWidgetRiskMatrixRequestParameters, ExploreFactorDataWidgetRiskMatrixRequestStats> {

    static telemetryFactorTracker = new TelemetryFactorTracker();

    constructor() {
        super(eventSchema, 'explore:factor-data-widget-risk-matrix-request-stats');
    }

    generateProtoBuff(parameter: TelemetryFactorDataWidgetRiskMatrixRequestParameters): ExploreFactorDataWidgetRiskMatrixRequestStats {
        const factorRiskMatrixRequestStats = new ExploreFactorDataWidgetRiskMatrixRequestStats();
        factorRiskMatrixRequestStats.setFactorAnalytic(parameter.factorAnalytic);
        factorRiskMatrixRequestStats.setRiskSettingsChanged(parameter.riskSettingsChanged);
        if (parameter.factorColumnsList) {
            const factorColumnsList = parameter.factorColumnsList.map(factor => TelemetryFactorDataRiskMatrixRequestTracker.telemetryFactorTracker.generateProtoBuff(factor));
            factorRiskMatrixRequestStats.setFactorColumnsList(factorColumnsList);
        }
        factorRiskMatrixRequestStats.setTriangularMatrix(parameter.triangularMatrix);
        factorRiskMatrixRequestStats.setComparisonMode(parameter.comparisonMode);
        factorRiskMatrixRequestStats.setShowChangeUpperTriangle(parameter.showChangeUpperTriangle);
        factorRiskMatrixRequestStats.setConditionalFormattingEnabled(parameter.conditionalFormattingEnabled);
        return factorRiskMatrixRequestStats;
    }
}
