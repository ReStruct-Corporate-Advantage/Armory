import {TelemetryOptimizationRunTracker} from './telemetry-optimization-run-tracker';
import {TelemetryOptimizationRunParameters} from '../../parameters';
import {TelemetryOptimizationTypeEnum} from '../../enums/telemetry-optimization-type.enum';
import {OptimizationScenarioDetailsParameters} from '../../parameters/optimization-scenario-details/optimization-scenario-details-parameters';
import {TelemetryOptimizationScenarioLoadingTypeEnum} from '../../enums/telemetry-optimization-scenario-loading-type.enum';

describe('Telemetry Run Optimization Tracker', () => {
    it('should test generateProtoBuff', () => {
        const tracker = new TelemetryOptimizationRunTracker();
        const optimizationScenarioDetailsParameters = new OptimizationScenarioDetailsParameters('scenario', TelemetryOptimizationScenarioLoadingTypeEnum.LOADING_TYPE_PRE_CANNED);
        const params = new TelemetryOptimizationRunParameters({
            objectives: [],
            constraints: [],
            columnsAsAlpha: [],
            isEfficientFrontierRun: false,
            iterationsCount: 10,
            optimizationType: TelemetryOptimizationTypeEnum.RISK_BUDGETING,
            requestId: '546456',
            workspaceId: '66666566565',
            loadedOptimizationScenario: optimizationScenarioDetailsParameters,
            isOptimizationScenarioChanged: true

    });
        const stats = tracker.generateProtoBuff(params);
        expect(stats.getOptimizationScenarioChanged()).toBe(true);
        expect(stats.getOptimizationType()).toBe(2);
    });
});
