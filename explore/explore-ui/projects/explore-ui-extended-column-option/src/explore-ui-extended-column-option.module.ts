import { NgModule } from '@angular/core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {CommonModule} from '@angular/common';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';
import {ExploreUiRiskModule} from '@blk/explore-ui-risk';
import {ExploreUiColumnOptionModule} from '@blk/explore-ui-column-option';
import {ExploreUiBreakdownModule} from '@blk/explore-ui-breakdown';
import {columnOptionComponentList} from './components/column-option/column-option-component-list';
import { RestrictImpliedShockComponent } from './components/restrict-implied-shock/restrict-implied-shock.component';
import {StressScenarioColumnOptionComponent} from './components/column-option/stress-scenario-column-option/stress-scenario-column-option.component';
import {StressScenarioComponent} from './components/column-option/stress-scenario-column-option/stress-scenario/stress-scenario.component';
import {AddStressScenariosModalComponent} from './components/column-option/stress-scenario-column-option/stress-scenario/add-stress-scenarios-modal/add-stress-scenarios-modal.component';
import {ManageScenarioComponent} from './components/column-option/stress-scenario-column-option/stress-scenario/add-stress-scenarios-modal/manage-scenario/manage-scenario.component';
import {StressScenarioService} from './services/stress-scenario.service';
import {FactorDataColumnModalComponent} from './components/factor-data-column-modal/factor-data-column-modal.component';
import {FactorColumnSetSettingsComponent} from './components/factor-data-column-modal/factor-column-set-settings/factor-column-set-settings.component';
import {FactorColumnSelectorComponent} from './components/factor-data-column-modal/factor-column-set-settings/factor-column-selector/factor-column-selector.component';
import {FactorDefinitionsService} from './services/factor-definitions.service';
import {CreateEditScenarioModalComponent} from './components/column-option/stress-scenario-column-option/stress-scenario/create-edit-scenario-modal/create-edit-scenario-modal.component';
import {DxsFactorUnitComponent} from './components/column-option/stress-scenario-column-option/stress-scenario/create-edit-scenario-modal/dxs-factor-unit/dxs-factor-unit.component';
import {ImpliedShockScenarioComponent} from './components/column-option/stress-scenario-column-option/stress-scenario/create-edit-scenario-modal/implied-shock-scenario/implied-shock-scenario.component';
import {SaveScenarioModalComponent} from './components/column-option/stress-scenario-column-option/stress-scenario/create-edit-scenario-modal/save-scenario-modal/save-scenario-modal.component';
import { DateRangeScenarioComponent } from './components/column-option/stress-scenario-column-option/stress-scenario/create-edit-scenario-modal/date-range-scenario/date-range-scenario.component';
import {SCENARIO_CREATION_ENABLED_TOKEN} from './tokens';
import {SpecifiedShockScenarioComponent} from './components/column-option/stress-scenario-column-option/stress-scenario/create-edit-scenario-modal/specified-shock-scenario/specified-shock-scenario.component';
import { ImpliedShockSummaryComponent } from './components/column-option/stress-scenario-column-option/stress-scenario/create-edit-scenario-modal/implied-shock-scenario/implied-shock-summary/implied-shock-summary.component';
import { RestrictImpliedShocksCellEditorComponent } from './components/column-option/stress-scenario-column-option/stress-scenario/create-edit-scenario-modal/implied-shock-scenario/implied-shock-summary/restrict-implied-shocks-cell-editor/restrict-implied-shocks-cell-editor.component';
import { FactorDataWidgetColumnSetSettingsComponent } from './components/factor-data-column-modal/factor-column-set-settings/factor-data-widget-column-set-settings.component';


@NgModule({
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        ExploreUiCoreModule,
        ExploreUiColumnOptionModule,
        ExploreUiRiskModule,
        ExploreUiBreakdownModule,
    ],
    declarations: [
        ...columnOptionComponentList,
        StressScenarioColumnOptionComponent,
        RestrictImpliedShockComponent,
        StressScenarioComponent,
        AddStressScenariosModalComponent,
        ManageScenarioComponent,
        CreateEditScenarioModalComponent,
        DxsFactorUnitComponent,
        ImpliedShockScenarioComponent,
        FactorDataColumnModalComponent,
        FactorColumnSelectorComponent,
        FactorColumnSetSettingsComponent,
        SaveScenarioModalComponent,
        DateRangeScenarioComponent,
        SpecifiedShockScenarioComponent,
        ImpliedShockSummaryComponent,
        RestrictImpliedShocksCellEditorComponent,
        FactorDataWidgetColumnSetSettingsComponent,
    ],
    exports: [
        ...columnOptionComponentList,
        FactorDataWidgetColumnSetSettingsComponent,
        FactorDataColumnModalComponent,
        DateRangeScenarioComponent,
        StressScenarioColumnOptionComponent
    ],
    providers: [
        StressScenarioService,
        FactorDefinitionsService,
        {provide: SCENARIO_CREATION_ENABLED_TOKEN, useValue: false},
    ]
})
export class ExploreUiExtendedColumnOptionModule { }
