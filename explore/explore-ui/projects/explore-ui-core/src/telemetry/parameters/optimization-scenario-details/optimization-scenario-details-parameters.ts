import {TelemetryOptimizationScenarioLoadingTypeEnum} from '../../enums/telemetry-optimization-scenario-loading-type.enum';

/**
 * contains report related info captured while tracking events via telemetry
 */
export class OptimizationScenarioDetailsParameters {
    scenarioName: string;
    loadingType: TelemetryOptimizationScenarioLoadingTypeEnum;

    constructor(scenarioName: string, loadingType: TelemetryOptimizationScenarioLoadingTypeEnum) {
        this.scenarioName = scenarioName;
        this.loadingType = loadingType;
    }
}
