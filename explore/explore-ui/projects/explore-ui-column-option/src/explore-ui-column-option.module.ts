import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';
import {ExploreUiRiskModule} from '@blk/explore-ui-risk';
import {ClimateScenarioComponent} from './components/climate/climate-scenario/climate-scenario.component';
import {columnOptionComponentList} from './components/column-option/column-option-component-list';
import {ColumnOptionComponent} from './components/column-option/column-option.component';
import {ColumnOptionsComponent} from './components/column-option/column-options.component';
import {CopyColumnOptionsModalComponent} from './components/column-option/copy-column-options-modal/copy-column-options-modal.component';
import {HighlightRuleComponent} from './components/column-option/highlight/highlight-rule/highlight-rule.component';
import {RiskRatioComponent} from './components/column-option/risk-ratio/risk-ratio.component';
import {ColumnSelectorComponent} from './components/column-selector/column-selector.component';
import {BaseColumnSetSettingsComponent} from './components/column-set-settings/base-column-set-settings.component';
import {ConstraintCustomCalcPromptComponent} from './components/constraint-custom-calc-prompt/constraint-custom-calc-prompt.component';
import {CustomCalculationMeasureComponent} from './components/custom-calculation-measure/custom-calculation-measure.component';
import {CustomCalculationSettingsComponent} from './components/custom-calculation-measure/custom-calculation-settings/custom-calculation-settings.component';
import {DateFormatDropdownComponent} from './components/date-format-dropdown/date-format-dropdown.component';
import {LiquidityModule} from './liquidity/liquidity.module';
import {ColumnOptionService} from './services/column-option.service';
import {ColumnStaticValuesService} from './services/column-static-values.service';
import {UiColumnOptionService} from './services/ui-column-option.service';
import {DateVaryOptionsComponent} from './components/column-option/override-date/date-vary/date-vary-options.component';
import {FbaDateVaryOptionsComponent} from './components/column-option/override-date/date-vary/fba-date-vary-options.component';
import {StyleAnalysisColumnOptionComponent} from './components/column-option/style-analysis/style-analysis-column-option.component';
import {RbcRegimeSettingsColumnOptionComponent} from './components/column-option/risk-based-capital/rbc-regime-settings-column-option.component';
import { ExploreADSWrapperModule } from '@blk/explore-ads-wrapper';
import { CoverageMeasureSelectionComponent } from './components/column-option/coverage-measure-column-option/coverage-measure-selection/coverage-measure-selection.component';
import { FactorSettingsComponent } from './components/column-option/factor-settings/factor-settings.component';


/**
 * Cannot separate CustomCalculation, ColumnSet, ColumnOption in different module
 * because of the circular dependency injection issue.
 * i.e. ColumnSetSettings > ColumnOption > CustomCalculation > ColumnSetSettings > ColumnOption
 */
@NgModule({
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        ExploreUiCoreModule,
        ExploreUiRiskModule,
        LiquidityModule,
        ExploreADSWrapperModule,
    ],
    declarations: [
        ColumnOptionsComponent,
        ColumnOptionComponent,
        ...columnOptionComponentList,
        HighlightRuleComponent,
        DateFormatDropdownComponent,
        ClimateScenarioComponent,
        ColumnSelectorComponent,
        BaseColumnSetSettingsComponent,
        CustomCalculationSettingsComponent,
        ConstraintCustomCalcPromptComponent,
        CustomCalculationMeasureComponent,
        RiskRatioComponent,
        CopyColumnOptionsModalComponent,
        DateVaryOptionsComponent,
        FbaDateVaryOptionsComponent,
        StyleAnalysisColumnOptionComponent,
        RbcRegimeSettingsColumnOptionComponent,
        CoverageMeasureSelectionComponent,
        FactorSettingsComponent
    ],
    exports: [
        LiquidityModule,
        ColumnOptionsComponent,
        ColumnOptionComponent,
        ...columnOptionComponentList,
        HighlightRuleComponent,
        DateFormatDropdownComponent,
        ColumnSelectorComponent,
        BaseColumnSetSettingsComponent,
        CustomCalculationSettingsComponent,
        ConstraintCustomCalcPromptComponent,
        CustomCalculationMeasureComponent,
        CopyColumnOptionsModalComponent,
        StyleAnalysisColumnOptionComponent,
        RbcRegimeSettingsColumnOptionComponent
    ],
    providers: [
        ColumnOptionService,
        ColumnStaticValuesService,
        UiColumnOptionService,
    ]
})
export class ExploreUiColumnOptionModule {
}
