import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OptimizationComponent} from './components/optimization/optimization.component';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {OptimizationSummaryComponent} from './components/optimization-summary/optimization-summary.component';
import {OptimizationSummaryGridComponent} from './components/optimization-summary-grid/optimization-summary-grid.component';
import {OptimizationSettingsConfigurationModule} from '@optimization-settings-configuration/optimization-settings-configuration.module';
import {SharedModule} from '../../shared/shared.module';
import {EfficientFrontierTableComponent} from './components/efficient-frontier-table/efficient-frontier-table.component';
import {ExploreUiRiskModule} from '@blk/explore-ui-risk';
import { RiskParityMainComponent } from './components/risk-parity-main/risk-parity-main.component';
import {OptimizationSettingsModule} from '@optimization-settings/optimization-settings.module';
import {LoadingModule} from '../loading/loading.module';

/**
 * Module for what-if optimization
 */
@NgModule({
    declarations: [OptimizationComponent, OptimizationSummaryComponent, OptimizationSummaryGridComponent, EfficientFrontierTableComponent, RiskParityMainComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        OptimizationSettingsConfigurationModule,
        SharedModule,
        ExploreUiRiskModule,
        OptimizationSettingsModule,
        LoadingModule
    ],
    exports: [OptimizationComponent, OptimizationSummaryGridComponent, EfficientFrontierTableComponent, RiskParityMainComponent]
})
export class OptimizationConfigurationModule {}
