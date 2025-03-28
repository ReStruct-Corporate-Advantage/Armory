import {TelemetryLoadOptimizationScenariosTracker} from '..';
import {OptimizationScenarioDetailsParameters} from '../../parameters/optimization-scenario-details/optimization-scenario-details-parameters';
import {TelemetryOptimizationScenarioLoadingTypeEnum} from '../../enums/telemetry-optimization-scenario-loading-type.enum';
import {TelemetryLoadingOptimizationScenariosParameters} from '../../parameters';

describe('Telemetry load Optimization scenarios Tracker', () => {
    it('should test generateProtoBuff', () => {
        const tracker = new TelemetryLoadOptimizationScenariosTracker();

        const optimizationScenarioDetailsParameters = new OptimizationScenarioDetailsParameters('scenario', TelemetryOptimizationScenarioLoadingTypeEnum.LOADING_TYPE_PRE_CANNED);
        const params = new TelemetryLoadingOptimizationScenariosParameters({
            loadedOptimizationScenario: optimizationScenarioDetailsParameters,
        });
        const stats = tracker.generateProtoBuff(params);
        expect(stats.getOptimizationScenarioDetail().getOptimizationScenarioName()).toBe('scenario');
    });
});
