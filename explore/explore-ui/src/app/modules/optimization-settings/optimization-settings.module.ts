import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {ExploreUiColumnOptionModule} from '@blk/explore-ui-column-option';
import {PortfolioSearchModule} from '@blk/explore-ui-portfolio-search';
import {CONSTRAINT_TRANSFORMER_SERVICE} from '@optimization-settings-configuration/constraints-settings/tokens/constraint-transformer-service.token';
import {CONSTRAINTS_SETTINGS_SERVICE} from '@optimization-settings-configuration/constraints-settings/tokens/constraints-settings-service.token';
import {OptimizationSettingsConfigurationModule} from '@optimization-settings-configuration/optimization-settings-configuration.module';
import {OPTIMIZATION_SETTINGS_SERVICE} from '@optimization-settings-configuration/tokens/optimization-settings-service.token';
import {ConstraintOptionCustomCalculationComponent} from '@optimization-settings/constraints-settings/components/constraint-option-custom-calculation/constraint-option-custom-calculation.component';
import {SharedModule} from '../../shared/shared.module';
import {BreakdownModule} from '../breakdown/breakdown.module';
import {CustomSectorModule} from '../custom-sector/custom-sector.module';
import {ConstraintOptionBreakdownComponent} from './constraints-settings/components/constraint-option-breakdown/constraint-option-breakdown.component';
import {ConstraintOptionFactorTagComponent} from './constraints-settings/components/constraint-option-factor-tag/constraint-option-factor-tag.component';
import {ConstraintOptionFilterModalComponent} from './constraints-settings/components/constraint-option-filter-modal/constraint-option-filter-modal.component';
import {ConstraintOptionFilterComponent} from './constraints-settings/components/constraint-option-filter/constraint-option-filter.component';
import {ConstraintOptionQuickFactorBlockComponent} from './constraints-settings/components/constraint-option-quick-factor-block/constraint-option-quick-factor-block.component';
import {ConstraintOptionSecurityListComponent} from './constraints-settings/components/constraint-option-security-list/constraint-option-security-list.component';
import {ExploreConstraintTransformerService} from './constraints-settings/services/explore-constraint-transformer.service';
import {ExploreConstraintsSettingsService} from './constraints-settings/services/explore-constraints-settings.service';
import {InvestmentUniverseFormComponent} from './investment-universe-settings/components/investment-universe-form.component';
import {SecuritySearchModalComponent} from './investment-universe-settings/components/security-search/security-search-modal.component';
import {InvestmentUniverseSettingsComponent} from './investment-universe-settings/container/investment-universe-settings.component';
import {MaximizeAlphaScoreComponent} from './objectives-settings/components/maximize-alpha-score/maximize-alpha-score.component';
import {ObjectiveSettingsFormComponent} from './objectives-settings/components/objective-settings-form.component';
import {ObjectivesSettingsComponent} from './objectives-settings/container/objectives-settings.component';
import {ExploreOptimizationSettingsService} from './service/explore-optimization-settings.service';
import {ConstraintOptionBoundTypeComponent} from './constraints-settings/components/constraint-option-relative-bounds/constraint-option-bound-type/constraint-option-bound-type.component';
import {ConstraintOptionRelativeComponent} from './constraints-settings/components/constraint-option-relative-bounds/constraint-option-relative/constraint-option-relative.component';
import {ConstraintOptionBoundsRelativeComponent} from './constraints-settings/components/constraint-option-relative-bounds/constraint-option-bounds-relative/constraint-option-bounds-relative.component';
import {ConstraintOptionCustomAggregationComponent} from './constraints-settings/components/constraint-option-custom-calculation-aggregation/constraint-option-custom-aggregation.component';
import {ConstraintOptionEfficientEnabledBoundsRelativeComponent} from './constraints-settings/components/constraint-option-relative-bounds/constraint-option-efficient-enabled-bounds-relative/constraint-option-efficient-enabled-bounds-relative.component';
import {ConstraintOptionCustomTitleComponent} from './constraints-settings/components/constraint-option-custom-title/constraint-option-custom-title.component';
import {UploadAlphaScoreModalComponent} from '@optimization-settings/objectives-settings/components/maximize-alpha-score/upload-alpha/upload-alpha-score-modal.component';
import {ConstraintOptionCollapsedLookThroughComponent} from '@optimization-settings/constraints-settings/components/constraint-option-collapsed-look-through/constraint-option-collapsed-look-through.component';
import {MaximizeStressScenarioCustomDateRangeModalComponent} from '@optimization-settings/objectives-settings/components/maximize-stress-scenario-custom-date-range/maximize-stress-scenario-custom-date-range-modal.component';
import {ScreeningFilterComponent} from '../riskParity/components/screening-filter/screening-filter.component';
import {TierDefinitionComponent} from '../riskParity/components/tier-definition/tier-definition.component';
import {WidgetModule} from '../widget/widget.module';
import {
    MaximizeAlphaStressScenarioComponent
} from '@optimization-settings/objectives-settings/components/maximize-alpha-stress-scenario/maximize-alpha-stress-scenario.component';
import {ExploreUiExtendedColumnOptionModule} from '@blk/explore-ui-extended-column-option';
import { MaximizeAlphaNewStressScenarioModal } from '@optimization-settings/objectives-settings/components/maximize-alpha-new-stress-scenario-modal/maximize-alpha-new-stress-scenario-modal.component';

@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [
        InvestmentUniverseSettingsComponent,
        InvestmentUniverseFormComponent,
        ObjectivesSettingsComponent,
        ObjectiveSettingsFormComponent,
        SecuritySearchModalComponent,
        ConstraintOptionSecurityListComponent,
        ConstraintOptionBreakdownComponent,
        ConstraintOptionFilterComponent,
        ConstraintOptionFilterModalComponent,
        ConstraintOptionQuickFactorBlockComponent,
        ConstraintOptionFactorTagComponent,
        MaximizeAlphaScoreComponent,
        ConstraintOptionCustomCalculationComponent,
        ConstraintOptionBoundTypeComponent,
        ConstraintOptionRelativeComponent,
        ConstraintOptionBoundsRelativeComponent,
        ConstraintOptionCustomAggregationComponent,
        ConstraintOptionEfficientEnabledBoundsRelativeComponent,
        ConstraintOptionCustomTitleComponent,
        UploadAlphaScoreModalComponent,
        MaximizeStressScenarioCustomDateRangeModalComponent,
        ConstraintOptionCollapsedLookThroughComponent,
        ScreeningFilterComponent,
        TierDefinitionComponent,
        MaximizeAlphaStressScenarioComponent,
        MaximizeAlphaNewStressScenarioModal
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AladdinAngularComponentsModule,
        ExploreUiColumnOptionModule,
        ExploreUiExtendedColumnOptionModule,
        PortfolioSearchModule,
        SharedModule,
        OptimizationSettingsConfigurationModule,
        BreakdownModule,
        CustomSectorModule,
        WidgetModule
    ],
    exports: [OptimizationSettingsConfigurationModule, ConstraintOptionFilterComponent, InvestmentUniverseSettingsComponent, ObjectivesSettingsComponent],
    providers: [
        {
            provide: OPTIMIZATION_SETTINGS_SERVICE,
            useClass: ExploreOptimizationSettingsService
        },
        {
            provide: CONSTRAINTS_SETTINGS_SERVICE,
            useClass: ExploreConstraintsSettingsService
        },
        {
            provide: CONSTRAINT_TRANSFORMER_SERVICE,
            useClass: ExploreConstraintTransformerService
        }
    ]
})
export class OptimizationSettingsModule {
}
