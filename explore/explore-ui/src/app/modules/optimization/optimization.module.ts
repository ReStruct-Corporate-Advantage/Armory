import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OPTIMIZATION_SERVICE} from '@optimization-configuration/tokens/optimization-service.token';
import {ExploreOptimizationService} from './services/explore-optimization.service';
import {OptimizationConfigurationModule} from '@optimization-configuration/optimization-configuration.module';
import {OptimizationSettingsModule} from '@optimization-settings/optimization-settings.module';
import {OptimizationMainComponent} from './components/optimization-main/optimization-main.component';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {SharedModule} from '../../shared/shared.module';
import {LoadingModule} from '../loading/loading.module';

@NgModule({
    declarations: [OptimizationMainComponent],
    imports: [CommonModule, OptimizationConfigurationModule, OptimizationSettingsModule, AladdinAngularComponentsModule, SharedModule, LoadingModule],
    exports: [OptimizationConfigurationModule, OptimizationMainComponent],
    providers: [
        {
            provide: OPTIMIZATION_SERVICE,
            useClass: ExploreOptimizationService
        }
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OptimizationModule {}
