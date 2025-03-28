import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {ExploreUiColumnOptionModule} from '@blk/explore-ui-column-option';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';
import {ExploreUiRiskModule} from '@blk/explore-ui-risk';
import {CommonModule} from '@angular/common';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {FactorDataSettingsModule} from './factor-data-settings/factor-data-settings.module';
import {ChartSettingsModule} from './chart-settings/chart-settings.module';
import {CommitmentRiskGroupingComponent} from './commitment-risk/commitment-risk-grouping/commitment-risk-grouping.component';
import {CommitmentHorizonComponent} from './commitment-risk/commitment-horizon/commitment-horizon.component';
import { CommitmentRiskScenarioComponent } from './commitment-risk/commitment-risk-scenario/commitment-risk-scenario.component';
import {
    MultiManagerColumnBreakdownComponent
} from './column-options/multi-manager-column-breakdown/multi-manager-column-breakdown.component';
import { DiversificationScoreFactorSettingsComponent } from './diversification-score-factor-settings/diversification-score-factor-settings.component';

@NgModule({
    declarations: [
        // components would be declared later
        CommitmentRiskGroupingComponent,
        CommitmentHorizonComponent,
        CommitmentRiskScenarioComponent,
        MultiManagerColumnBreakdownComponent,
        DiversificationScoreFactorSettingsComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        ExploreUiColumnOptionModule,
        ExploreUiCoreModule,
        ExploreUiRiskModule,
        FactorDataSettingsModule,
        ChartSettingsModule
    ],
    exports: [
        FactorDataSettingsModule,
        ChartSettingsModule,
        CommitmentRiskGroupingComponent,
        CommitmentHorizonComponent,
        CommitmentRiskScenarioComponent,
        MultiManagerColumnBreakdownComponent,
        DiversificationScoreFactorSettingsComponent
    ]
})
export class WidgetSettingsModule {
}
