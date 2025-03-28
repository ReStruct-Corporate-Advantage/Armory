import {Inject, Injectable} from '@angular/core';
import {OptimizationDataService} from './optimization-data.service';
import {OptimizationRunService} from './optimization-run.service';
import {OptimizationService} from '@optimization-configuration/services/optimization-service.interface';
import {ExploreOptimizationSettingsService} from '@optimization-settings/service/explore-optimization-settings.service';
import {OPTIMIZATION_SERVICE} from '@optimization-configuration/tokens/optimization-service.token';

@Injectable({
    providedIn: 'root'
})

/**
 * Composite service for optimization
 */
export class OptimizationCompositeService {
    /**
     * constructor
     */
    constructor(
        private optimizationDataService: OptimizationDataService,
        @Inject(OPTIMIZATION_SERVICE) private optimizationService: OptimizationService,
        private optimizationRunService: OptimizationRunService,
        private exploreOptimizationSettingsService: ExploreOptimizationSettingsService
    ) {
    }

    /**
     * gets optimization data service
     */
    getOptimizationDataService(): OptimizationDataService {
        return this.optimizationDataService;
    }

    /**
     * gets optimization run service
     */
    getOptimizationRunService(): OptimizationRunService {
        return this.optimizationRunService;
    }

    /**
     * gets explore optimization settings service
     */
    getExploreOptimizationSettingsService(): ExploreOptimizationSettingsService {
        return this.exploreOptimizationSettingsService;
    }

    /**
     * gets optimization service
     */
    getOptimizationService(): OptimizationService {
        return this.optimizationService;
    }
}
