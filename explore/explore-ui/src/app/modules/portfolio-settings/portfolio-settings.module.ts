import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';
import {PortfolioSearchModule} from '@blk/explore-ui-portfolio-search';
import {ExploreUiRiskModule} from '@blk/explore-ui-risk';
import {SharedModule} from '../../shared/shared.module';
import {CustomSectorModule} from '../custom-sector/custom-sector.module';
import {PerformanceSettingsModule} from '../performance-settings/performance-settings.module';
import {EpnlSettingsComponent} from './epnl-settings/epnl-settings.component';
import {LookthroughRuleBuilderModalComponent} from './lookthrough-settings/components/lookthrough-rule-builder-modal/lookthrough-rule-builder-modal.component';
import {LookthroughRuleTableComponent} from './lookthrough-settings/components/lookthrough-rule-builder-modal/lookthrough-rule-table/lookthrough-rule-table.component';
import {LookthroughSettingsComponent} from './lookthrough-settings/components/lookthrough-settings/lookthrough-settings.component';
import {PortfolioSettingsModalComponent} from './portfolio-settings-modal.component';
import {SplitSettingComponent} from './split-settings/split-setting.component';
import {ExploreUiBreakdownModule} from '@blk/explore-ui-breakdown';
import {ExploreTableModule} from '../../vizualizations/table';
import {
    LookthroughTableWrapperComponent
} from './lookthrough-settings/components/lookthrough-rule-builder-modal/lookthrough-table-wrapper.component';
import {LoadingModule} from '../loading/loading.module';
import {ExploreLookThroughSettingsModule} from '@blk/explore-ui-look-through-settings';
import {MultiManagerConfigModule} from "../multi-manager-config/multi-manager-config.module";
import {FavoriteVersionModule} from '../favorite-version/favorite-version.module';

@NgModule({
    declarations: [
        PortfolioSettingsModalComponent,
        SplitSettingComponent,
        LookthroughSettingsComponent,
        LookthroughRuleBuilderModalComponent,
        LookthroughRuleTableComponent,
        EpnlSettingsComponent,
        LookthroughTableWrapperComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        ExploreUiCoreModule,
        PerformanceSettingsModule,
        PortfolioSearchModule,
        CustomSectorModule,
        SharedModule,
        ExploreUiRiskModule,
        ExploreUiBreakdownModule,
        ExploreTableModule,
        LoadingModule,
        ExploreLookThroughSettingsModule,
        MultiManagerConfigModule,
        FavoriteVersionModule
    ],
    exports: [
        PortfolioSettingsModalComponent,
        ExploreUiRiskModule,
        LookthroughTableWrapperComponent
    ]
})
export class PortfolioSettingsModule {
}
