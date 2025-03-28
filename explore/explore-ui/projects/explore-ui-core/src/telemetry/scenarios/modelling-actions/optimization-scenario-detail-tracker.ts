import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {OptimizationScenarioDetailsParameters} from '../../parameters/optimization-scenario-details/optimization-scenario-details-parameters';
import {ExploreOptimizationScenariosDetail} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';

export class OptimizationScenarioDetailTracker implements TelemetryActionTracker<OptimizationScenarioDetailsParameters, ExploreOptimizationScenariosDetail> {
    /**
     * create a protoBuff holding report related info
     */
    generateProtoBuff(parameters: OptimizationScenarioDetailsParameters): ExploreOptimizationScenariosDetail {
        const exploreOptimizationScenariosDetail = new ExploreOptimizationScenariosDetail();
        exploreOptimizationScenariosDetail.setOptimizationScenarioName(parameters.scenarioName);
        exploreOptimizationScenariosDetail.setOptimizationScenarioLoadingType(parameters.loadingType);
        return exploreOptimizationScenariosDetail;
    }
}
