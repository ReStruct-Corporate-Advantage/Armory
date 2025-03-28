import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {ExploreLoadOptimizationScenarios} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreLoadOptimizationScenariosSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {TelemetryLoadingOptimizationScenariosParameters} from '../../parameters/loading-optimization-scenarios/telemetry-loading-optimization-scenarios-parameters';
import {OptimizationScenarioDetailTracker} from './optimization-scenario-detail-tracker';

/**
 * TelemetryLoadOptimizationScenariosTracker is used to generated protos to capture events done while loading optimization scenarios
 */
export class TelemetryLoadOptimizationScenariosTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryLoadingOptimizationScenariosParameters, ExploreLoadOptimizationScenarios> {

    constructor() {
        super(eventSchema, 'explore:load-optimization-scenarios');
    }

    /**
     * Generate a protoBuff for events when the user clicks Loads Optimization Scenarios
     */
    generateProtoBuff(parameter: TelemetryLoadingOptimizationScenariosParameters): ExploreLoadOptimizationScenarios {
        const exploreLoadOptimizationScenarios = new ExploreLoadOptimizationScenarios();
        const optimizationScenarioDetailTracker = new OptimizationScenarioDetailTracker();
        exploreLoadOptimizationScenarios.setOptimizationScenarioDetail(optimizationScenarioDetailTracker.generateProtoBuff(parameter.loadedOptimizationScenario));
        return exploreLoadOptimizationScenarios;
    }
}
