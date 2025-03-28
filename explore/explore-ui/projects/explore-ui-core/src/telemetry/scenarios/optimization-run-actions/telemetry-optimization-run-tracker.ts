import {ExploreRunOptimizationStats} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreRunOptimizationStatsSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {TelemetryOptimizationRunParameters} from '../../parameters/optimization-run/telemetry-optimization-run-parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {OptimizationScenarioDetailTracker} from '../modelling-actions/optimization-scenario-detail-tracker';

/**
 * TelemetryOptimizationRunTracker is used to generated protos to capture user actions on running optimization
 */
export class TelemetryOptimizationRunTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryOptimizationRunParameters, ExploreRunOptimizationStats> {

    static optimizationScenarioDetailTracker = new OptimizationScenarioDetailTracker();

    constructor() {
        super(eventSchema, 'explore:run-optimization-stats');
    }

    /**
     * Generate a protoBuff for events when the user runs optimization
     */
    generateProtoBuff(parameter: TelemetryOptimizationRunParameters): ExploreRunOptimizationStats {
        const exploreRunOptimizationStats = new ExploreRunOptimizationStats();
        exploreRunOptimizationStats.setObjectivesList(parameter.objectives);
        exploreRunOptimizationStats.setConstraintsList(parameter.constraints);
        exploreRunOptimizationStats.setColumnsAsAlphasList(parameter.columnsAsAlpha);
        exploreRunOptimizationStats.setEfficientFrontierRun(parameter.isEfficientFrontierRun);
        exploreRunOptimizationStats.setIterationsCount(parameter.iterationsCount);
        exploreRunOptimizationStats.setOptimizationScenarioChanged(parameter.isOptimizationScenarioChanged);
        exploreRunOptimizationStats.setOptimizationType(parameter.optimizationType);
        exploreRunOptimizationStats.setRequestId(parameter.requestId);
        exploreRunOptimizationStats.setWorkspaceId(parameter.workspaceId);
        exploreRunOptimizationStats.setOptimizationScenarioDetail(TelemetryOptimizationRunTracker.optimizationScenarioDetailTracker.generateProtoBuff(parameter.loadedOptimizationScenario));
        return exploreRunOptimizationStats;
    }
}
