import {isObject} from 'lodash';
import {OptimizationScenarioDetailsParameters} from '../optimization-scenario-details/optimization-scenario-details-parameters';

/**
 * TelemetryLoadingOptimizationScenariosParameters captures information related to loading optimization scenarios
 */
export class TelemetryLoadingOptimizationScenariosParameters {
    loadedOptimizationScenario: OptimizationScenarioDetailsParameters;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize.
     */
    protected deserialize(data: any): void {
        // Get out of here if there is no data.
        if (!data) {
            return;
        }
        this.loadedOptimizationScenario = data.loadedOptimizationScenario;
    }
}
