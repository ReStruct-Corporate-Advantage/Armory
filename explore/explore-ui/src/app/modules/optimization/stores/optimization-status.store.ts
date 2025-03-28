import {Portfolio} from '@models/portfolio/portfolio.model';
import {OptimizationStatus} from '@interfaces/optimization-status.interface';

/**
 * store to retrieve status for optimization on a portfolio
 */
export class OptimizationStatusStore {
    private static optimizationStatusMap: Map<Portfolio, OptimizationStatus> = new Map<Portfolio, OptimizationStatus>();
    private static efficientFrontierStatusMap: Map<Portfolio, OptimizationStatus> = new Map<Portfolio, OptimizationStatus>();

    /**
     * function to get optimizationStatus
     */
    static getOptimizationsStatus(port: Portfolio): OptimizationStatus {
        return OptimizationStatusStore.optimizationStatusMap.get(port);
    }

    /**
     * function to set optimizationStatus
     */
    static setOptimizationsStatus(port: Portfolio, optimizationStatus: OptimizationStatus): void {
        OptimizationStatusStore.optimizationStatusMap.set(port, optimizationStatus);
    }

    /**
     * function to get optimizationStatus
     */
    static getEfficientFrontierStatus(port: Portfolio): OptimizationStatus {
        return OptimizationStatusStore.efficientFrontierStatusMap.get(port);
    }

    /**
     * function to set optimizationStatus
     */
    static setEfficientFrontierStatus(port: Portfolio, efficientFrontierStatus: OptimizationStatus): void {
        OptimizationStatusStore.efficientFrontierStatusMap.set(port, efficientFrontierStatus);
    }
}
