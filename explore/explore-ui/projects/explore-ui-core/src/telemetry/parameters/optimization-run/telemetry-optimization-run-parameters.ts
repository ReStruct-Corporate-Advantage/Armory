import {isObject} from 'lodash';
import {TelemetryOptimizationTypeEnum} from '../../enums/telemetry-optimization-type.enum';
import {OptimizationScenarioDetailsParameters} from '../optimization-scenario-details/optimization-scenario-details-parameters';

/**
 * TelemetryOptimizationRunParameters captures information related to optimization run by user.
 */
export class TelemetryOptimizationRunParameters {
    objectives: string[];
    constraints: string[];
    columnsAsAlpha: string[];
    isEfficientFrontierRun: boolean;
    iterationsCount: number;
    optimizationType: TelemetryOptimizationTypeEnum;
    requestId: string;
    workspaceId: number;
    loadedOptimizationScenario: OptimizationScenarioDetailsParameters;
    isOptimizationScenarioChanged: boolean;

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
        this.constraints = data.constraints;
        this.objectives = data.objectives;
        this.columnsAsAlpha = data.columnsAsAlpha;
        this.isEfficientFrontierRun = data.isEfficientFrontierRun;
        this.iterationsCount = data.iterationsCount;
        this.optimizationType = data.optimizationType;
        this.requestId = data.requestId;
        this.workspaceId = data.workspaceId;
        this.loadedOptimizationScenario  = data.loadedOptimizationScenario;
        this.isOptimizationScenarioChanged = data.isOptimizationScenarioChanged;
    }
}
