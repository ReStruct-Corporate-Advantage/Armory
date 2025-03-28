import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {EsmaLiquidationFooterLiquiditySettingsComponent} from './components/esma-liquidity-settings/esma-liquidation-footer-liquidity-settings/esma-liquidation-footer-liquidity-settings.component';
import {EsmaLiquidationFundLiquiditySettingsComponent} from './components/esma-liquidity-settings/esma-liquidation-fund-liquidity-settings/esma-liquidation-fund-liquidity-settings.component';
import {EsmaLiquidationHeaderLiquiditySettingsComponent} from './components/esma-liquidity-settings/esma-liquidation-header-liquidity-settings/esma-liquidation-header-liquidity-settings.component';
import {EsmaPartialLiquiditySettingsComponent} from './components/esma-liquidity-settings/esma-partial-liquidity-settings/esma-partial-liquidity-settings.component';
import {EsmaRedemptionLiquiditySettingsComponent} from './components/esma-liquidity-settings/esma-redemption-liquidity-settings/esma-redemption-liquidity-settings.component';
import {EsmaUnitLiquiditySettingsComponent} from './components/esma-liquidity-settings/esma-unit-liquidity-settings/esma-unit-liquidity-settings.component';
import {GeneralLiquiditySettingsComponent} from './components/general-liquidity-settings/general-liquidity-settings.component';
import {HorizonLiquiditySettingsComponent} from './components/horizon-liquidity-settings/horizon-liquidity-settings.component';
import {PartialLiquiditySettingsComponent} from './components/partial-liquidity-settings/partial-liquidity-settings.component';
import {QuantitativeTieringLiquiditySettingsComponent} from './components/quantitative-tiering-liquidity-settings/quantitative-tiering-liquidity-settings.component';
import {SecLiquiditySettingsComponent} from './components/sec-liquidity-settings/sec-liquidity-settings.component';
import {StressLiquiditySettingsComponent} from './components/stress-liquidity-settings/stress-liquidity-settings.component';
import {UnitLiquiditySettingsComponent} from './components/unit-liquidity-settings/unit-liquidity-settings.component';
import {JITALiquiditySettingsComponent} from './components/jita-liquidity-settings/jita-liquidity-settings.component';
import {AdvancedLiquiditySettingsModalComponent} from './components/advanced-liquidity-settings-modal/advanced-liquidity-settings-modal.component';
import {PrecannedStressScenariosLiquiditySettingsComponent} from './components/precanned-scenarios-liquidity-settings/precanned-stress-scenarios-liquidity-settings.component';
import {AssetStressScenarioComponent} from './components/asset-stress-scenario/asset-stress-scenario.component';

@NgModule({
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
    ],
    declarations: [
        HorizonLiquiditySettingsComponent,
        PartialLiquiditySettingsComponent,
        GeneralLiquiditySettingsComponent,
        QuantitativeTieringLiquiditySettingsComponent,
        SecLiquiditySettingsComponent,
        StressLiquiditySettingsComponent,
        UnitLiquiditySettingsComponent,
        EsmaUnitLiquiditySettingsComponent,
        EsmaRedemptionLiquiditySettingsComponent,
        EsmaPartialLiquiditySettingsComponent,
        EsmaLiquidationFooterLiquiditySettingsComponent,
        EsmaLiquidationHeaderLiquiditySettingsComponent,
        EsmaLiquidationFundLiquiditySettingsComponent,
        JITALiquiditySettingsComponent,
        AdvancedLiquiditySettingsModalComponent,
        PrecannedStressScenariosLiquiditySettingsComponent,
        AssetStressScenarioComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
        HorizonLiquiditySettingsComponent,
        PartialLiquiditySettingsComponent,
        GeneralLiquiditySettingsComponent,
        QuantitativeTieringLiquiditySettingsComponent,
        SecLiquiditySettingsComponent,
        StressLiquiditySettingsComponent,
        UnitLiquiditySettingsComponent,
        EsmaUnitLiquiditySettingsComponent,
        EsmaRedemptionLiquiditySettingsComponent,
        EsmaPartialLiquiditySettingsComponent,
        EsmaLiquidationFooterLiquiditySettingsComponent,
        EsmaLiquidationHeaderLiquiditySettingsComponent,
        EsmaLiquidationFundLiquiditySettingsComponent,
        JITALiquiditySettingsComponent,
        AdvancedLiquiditySettingsModalComponent,
        PrecannedStressScenariosLiquiditySettingsComponent
    ],
})
export class LiquidityModule {
}
