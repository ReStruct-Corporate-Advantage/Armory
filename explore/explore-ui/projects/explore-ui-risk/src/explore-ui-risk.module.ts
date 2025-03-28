import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';
import {PortfolioSearchModule} from '@blk/explore-ui-portfolio-search';
import {AdvancedRiskSettingsModalComponent} from './components/advanced-risk-settings-modal/advanced-risk-settings-modal.component';
import {EconomyRiskSettingsComponent} from './components/economy-risk-settings/economy-risk-settings.component';
import {ExposureRiskSettingsComponent} from './components/exposure-risk-settings/exposure-risk-settings.component';
import {RevertRiskSettingComponent} from './components/revert-risk-setting/revert-risk-setting.component';
import {RiskSettingsComponent} from './components/risk-settings/risk-settings.component';
import { HvarRiskSettingsComponentComponent } from './components/hva-rrisk-settings-component/hvar-risk-settings-component.component';
import {PositionModeSettingsComponent} from './components/position-mode-settings/position-mode-settings.component';
import {FactorDataWidgetEconomyRiskSettingsComponent} from './components/risk-settings/factor-data-widget-economy-risk-settings/factor-data-widget-economy-risk-settings.component';
import {HvarRiskSettingsTrimmedComponentComponent} from './components/hva-rrisk-settings-component/hvar-risk-settings-trimmed-component.component';
import { McvarRiskSettingsComponent } from './components/mcvar-risk-settings/mcvar-risk-settings.component';

@NgModule({
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        ExploreUiCoreModule,
        PortfolioSearchModule
    ],
    declarations: [
        AdvancedRiskSettingsModalComponent,
        EconomyRiskSettingsComponent,
        ExposureRiskSettingsComponent,
        RevertRiskSettingComponent,
        RiskSettingsComponent,
        HvarRiskSettingsComponentComponent,
        HvarRiskSettingsTrimmedComponentComponent,
        PositionModeSettingsComponent,
        FactorDataWidgetEconomyRiskSettingsComponent,
        McvarRiskSettingsComponent
    ],
    exports: [
        AdvancedRiskSettingsModalComponent,
        EconomyRiskSettingsComponent,
        ExposureRiskSettingsComponent,
        RevertRiskSettingComponent,
        RiskSettingsComponent,
        PositionModeSettingsComponent,
        FactorDataWidgetEconomyRiskSettingsComponent
    ]
})
export class ExploreUiRiskModule {
}

