import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {spriteletLauncherServiceProviderList, widgetServiceProviderList} from '@services/widget/widget-service-provider-list';
import {WidgetComponent} from './widget.component';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {TopBottomFilterSettingsComponent} from './widget-settings/top-bottom-filter-settings';
import {WidgetSettingComponent} from './widget-settings/widget-setting.component';
import {RiskAndExposureSettingsComponent} from './widget-settings/risk-and-exposure-settings';
import {columnOptionComponentList} from './widget-settings/column-options/factory/column-option-component-list';
import {Cubes} from '@qbstr/data-cube-reactive';
import {WidgetServiceRegistry} from '@services/widget/widget-service-registry';
import {CustomSectorModule} from '../custom-sector/custom-sector.module';
import {ExploreTableModule} from '../../vizualizations/table';
import {SharedModule} from '../../shared/shared.module';
import {ExportModule} from '../export/export.module';
import {PerformanceSettingsModule} from '../performance-settings/performance-settings.module';
import {WidgetSettingsModalComponent} from './widget-settings';
import {PortfolioSettingsModule} from '../portfolio-settings/portfolio-settings.module';
import {BreakdownModule} from '../breakdown/breakdown.module';
import {WidgetLevelBreakdownSettingsComponent} from './widget-settings/widget-level-breakdown-settings/widget-level-breakdown-settings.component';
import {ExploreChartsModule} from '../../vizualizations/charts/explore-charts.module';
import {ExpostModule} from '../expost/expost.module';
import {ReportColumnService} from '@services/report-column/report-column.service';
import {SpriteletLauncherServiceRegistry} from '@services/spritelet-launcher/spritelet-launcher-service.registry';
import {FavoriteModule} from '../favorite/favorite.module';
import {MandateMappingService} from '@services/mandate/mandate-mapping.service';
import {ColumnDefinitionModalComponent} from '../../shared/components/column-definition-modal/column-definition-modal.component';
import {PivotSettingsComponent} from './widget-settings/pivot-settings/pivot-settings.component';
import {FactorBasedWidgetQuickColumnsetComponent} from './widget-settings/factor-based-widget-quick-columnset/factor-based-widget-quick-columnset.component';
import {EquityStockPriceChartModule} from '@blk/equity-stock-price-chart';
import {MinValFilterComponent} from './widget-settings/min-val-filter/min-val-filter.component';
import {RiskSettingsSummaryComponent} from './foot-notes/risk-settings-summary/risk-settings-summary.component';
import {ProxySummaryComponent} from './foot-notes/proxy-summary/proxy-summary.component';
import {FactorAttributionDetailsSummaryComponent} from './foot-notes/factor-attribution-details/factor-attribution-details-summary/factor-attribution-details-summary.component';
import {FactorAttributionDetailsFactorProxyingComponent} from './foot-notes/factor-attribution-details/factor-attribution-details-factor-proxying/factor-attribution-details-factor-proxying.component';
import {FootNotesComponent} from './foot-notes/foot-notes.component';
import {WidgetCustomFilterComponent} from './widget-settings/widget-custom-filter/widget-custom-filter.component';
import {LightLookthroughSettingsComponent} from './widget-settings/light-lookthrough-settings/light-lookthrough-settings.component';
import {FactorAttributionDetailsComponent} from './foot-notes/factor-attribution-details/factor-attribution-details.component';
import {FactorAttributionDetailsMissingInfoComponent} from './foot-notes/factor-attribution-details/factor-attribution-details-missing-info/factor-attribution-details-missing-info.component';
import {WidgetPreviewComponent} from './widget-preview/widget-preview.component';
import {DateOverrideSummaryComponent} from './foot-notes/date-override-summary/date-override-summary.component';
import {ScenarioSummaryComponent} from './foot-notes/scenario-summary/scenario-summary.component';
import {ExposureSummaryComponent} from './foot-notes/exposure-summary/exposure-summary.component';
import {ColumnSettingsOverrideSummaryComponent} from './foot-notes/column-settings-override-summary/column-settings-override-summary.component';
import {WidgetSettingsStore} from './widget-settings/widget-settings.store';
import {ColumnOptionComponentFactory, columnOptionComponentList as libColumnOptionComponentList, ExploreUiColumnOptionModule} from '@blk/explore-ui-column-option';
import {columnOptionComponentList as libExtendedColumnOptionComponentList, ExploreUiExtendedColumnOptionModule} from '@blk/explore-ui-extended-column-option';
import {ExploreUiCoreModule, DialogModule} from '@blk/explore-ui-core';
import {CommitmentRiskContainerComponent} from './widget-container/commitment-risk-container/commitment-risk-container.component';
import {FetchSecuritiesDataService} from '@services/widget/fetch-securities-data-service';
import {SuppressRootNodeSettingsComponent} from './widget-settings/suppress-root-node-settings/suppress-root-node-settings.component';
import {ExploreForceReloadComponent} from './force-reloader/explore-force-reload.component';
import {CollapsedLookthroughColumnOptionComponent} from './widget-settings/column-options/collapsed-lookthrough/collapsed-lookthrough-column-option.component';
import {MarginAnalyticsCassiniSettingsComponent} from './widget-settings/margin-analytics-cassini-settings/margin-analytics-cassini-settings.component';
import {OverrideDateSortByOldestSettingsComponent} from './widget-settings/override-date-sort-by-oldest-settings/override-date-sort-by-oldest-settings.component';
import {PricePopupChartComponent} from '../../shared/components/price-popup-chart/price-popup-chart.component';
import {MissingUnitValuesComponent} from './foot-notes/missing-unit-values/missing-unit-values.component';
import {TopBottomSectoringComponent} from './widget-settings/top-bottom-sectoring/top-bottom-sectoring.component';
import {HideUnassignedFilterSettingsComponent} from './widget-settings/hide-unassigned-filter-settings/hide-unassigned-filter-settings.component';
import {WidgetSettingsModule} from './widget-settings/widget-settings.module';
import {LoadingModule} from '../loading/loading.module';
import {CommitmentRiskContainerLegacyComponent} from './widget-container/commitment-risk-container-legacy/commitment-risk-container-legacy.component';
import {CommitmentRiskWarningBannerComponent} from './widget-container/commitment-risk-container/commitment-risk-warning-banner/commitment-risk-warning-banner.component';
import {PgsChartKeyGeneratorService} from '@services/widget/pgs-chart-key-generator.service';
import { DecarbonizationChartSettingsComponent } from './widget-settings/chart-settings/decarbonization-chart-settings/decarbonization-chart-settings.component';
import {CommitmentRiskExcludedFundsComponent} from './widget-container/commitment-risk-excluded-funds/commitment-risk-excluded-funds.component';
import {
    ShowSectorLevelDataOnlySettingsComponent
} from './widget-settings/show-sector-level-data-only-settings/show-sector-level-data-only-settings.component';

const cubesFactory = () => new Cubes();

const columnOptionComponents = [...columnOptionComponentList, ...libColumnOptionComponentList, ...libExtendedColumnOptionComponentList];

@NgModule({
    declarations: [
        WidgetPreviewComponent,
        TopBottomFilterSettingsComponent,
        HideUnassignedFilterSettingsComponent,
        WidgetSettingsModalComponent,
        WidgetSettingComponent,
        WidgetComponent,
        RiskAndExposureSettingsComponent,
        MinValFilterComponent,
        PivotSettingsComponent,
        FactorBasedWidgetQuickColumnsetComponent,
        CommitmentRiskContainerComponent,
        CommitmentRiskContainerLegacyComponent,
        CommitmentRiskWarningBannerComponent,
        CommitmentRiskExcludedFundsComponent,
        SuppressRootNodeSettingsComponent,
        ShowSectorLevelDataOnlySettingsComponent,

        // Add the column options under here just to keep them all grouped.
        WidgetLevelBreakdownSettingsComponent,
        WidgetCustomFilterComponent,
        ...columnOptionComponentList,

        // FootNotesComponent
        FootNotesComponent,
        FactorAttributionDetailsComponent,
        FactorAttributionDetailsSummaryComponent,
        FactorAttributionDetailsFactorProxyingComponent,
        FactorAttributionDetailsMissingInfoComponent,
        RiskSettingsSummaryComponent,
        ProxySummaryComponent,
        DateOverrideSummaryComponent,
        ScenarioSummaryComponent,
        ExposureSummaryComponent,
        ColumnSettingsOverrideSummaryComponent,

        // Child component of highlight column option
        ColumnDefinitionModalComponent,
        PricePopupChartComponent,
        LightLookthroughSettingsComponent,

        // Utils
        ExploreForceReloadComponent,
        MarginAnalyticsCassiniSettingsComponent,
        OverrideDateSortByOldestSettingsComponent,
        MissingUnitValuesComponent,
        TopBottomSectoringComponent,
        DecarbonizationChartSettingsComponent
    ],
    providers: [
        ReportColumnService,
        MandateMappingService,
        WidgetSettingsStore,
        {provide: ColumnOptionComponentFactory, useValue: new ColumnOptionComponentFactory(columnOptionComponents)},
        {provide: Cubes, useFactory: cubesFactory},

        ...widgetServiceProviderList,
        WidgetServiceRegistry,

        ...spriteletLauncherServiceProviderList,
        SpriteletLauncherServiceRegistry,
        PgsChartKeyGeneratorService,
        FetchSecuritiesDataService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        ExploreUiColumnOptionModule,
        ExploreUiExtendedColumnOptionModule,
        ExploreUiCoreModule,
        CommonModule,
        AladdinAngularComponentsModule,
        DialogModule,
        CustomSectorModule,
        SharedModule,
        FavoriteModule,
        ExploreTableModule,
        ExportModule,
        PerformanceSettingsModule,
        PortfolioSettingsModule,
        BreakdownModule,
        ExploreChartsModule,
        ExpostModule,
        EquityStockPriceChartModule,
        WidgetSettingsModule,
        LoadingModule
    ],
    exports: [
        TopBottomFilterSettingsComponent,
        WidgetComponent,
        RiskAndExposureSettingsComponent,
        WidgetPreviewComponent,
        CollapsedLookthroughColumnOptionComponent,
        ShowSectorLevelDataOnlySettingsComponent
    ]
})
export class WidgetModule {
}
