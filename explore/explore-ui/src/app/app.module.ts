import {HttpClientModule} from '@angular/common/http';
import {APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {CopilotChatModule} from '@blk/aladdin-copilot-angular';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {DERIVED_COLUMN_OPTION_SERVICE_TOKEN} from '@blk/explore-ui-column-option';
import {
    DialogModule,
    HTTP_SERVICE_TOKEN,
    NOTIFICATION_SERVICE_TOKEN,
    PERFORMANCE_ATTRIBUTION_SETTINGS_SERVICE_TOKEN,
    PERFORMANCE_TIME_PERIOD_SETTINGS_SERVICE_TOKEN
} from '@blk/explore-ui-core';
import {PortfolioSearchModule} from '@blk/explore-ui-portfolio-search';
import {PORTFOLIO_SEARCH_SERVICE_TOKEN} from '@blk/explore-ui-risk';
import {StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {Http2BmsService} from '@services/bms';
import {DerivedColumnOptionService} from '@services/column-option/derived-column-option.service';
import {ExplorePortfolioSearchService} from '@services/explore-portfolio-search/explore-portfolio-search.service';
import {NotificationService} from '@services/notification';
import {environment} from '../environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AppInitializer} from './initializers/app.initializer';
import {BatchReportingModule} from './modules/batch-reporting/batch-reporting.module';
import {FavoriteModule} from './modules/favorite/favorite.module';
import {FloatingToolbarModule} from './modules/floating-toolbar/floating-toolbar.module';
import {IntroModule} from './modules/intro/intro.module';
import {LoadingModule} from './modules/loading/loading.module';
import {MainModule} from './modules/main/main.module';
import {MandateSettingsModule} from './modules/mandate-settings/mandate-settings.module';
import {MetadataModule} from './modules/metadata/metadata.module';
import {
    PerformanceAttributionSettingsService
} from './modules/performance-settings/services/performance-attribution-settings.service';
import {
    PerformanceTimePeriodSettingsService
} from './modules/performance-settings/services/performance-time-period-settings.service';
import {PortfolioSettingsModule} from './modules/portfolio-settings/portfolio-settings.module';
import {RequestCancelerModule} from './modules/request-canceler/request-canceler.module';
import {SideBarModule} from './modules/side-bar/side-bar.module';
import {SharedModule} from './shared/shared.module';
import {ExploreChartsModule} from './vizualizations/charts/explore-charts.module';
import {ExploreTableModule} from './vizualizations/table';
import {ExploreUiBreakdownModule, SECTOR_RULE_BUILDER_DIALOG_TOKEN} from '@blk/explore-ui-breakdown';
import {
    SectorRuleBuilderModalComponent
} from './modules/custom-sector/sector-rule-builder-modal-dialog/sector-rule-builder-modal.component';
import {RequestEnablerModule} from './modules/general/request-enabler.module';
import {TelemetryInterceptorModule} from './modules/telemetry-interceptor/telemetry-interceptor.module';
import {
    FACTOR_COLUMN_SET_SETTINGS_SERVICE_TOKEN,
    SCENARIO_CREATION_ENABLED_TOKEN
} from '@blk/explore-ui-extended-column-option';
import {
    FactorColumnSetSettingsService
} from './modules/widget/widget-settings/factor-data-settings/services/factor-column-set-settings.service';
import {AR_EVENT_LOG_CONFIGURATION} from '@blk/ar-event-log-services';
import {AR_APPLICATION_METADATA, AR_HOST_ENVIRONMENT} from '@blk/ar-common';
import {FavoriteVersionModule} from './modules/favorite-version/favorite-version.module';
import {ExportHubModule} from './modules/export-hub/export-hub.module';
import {GrafanaFaroInitializer} from './grafana-faro-initializer';

@NgModule({
    declarations: [
        AppComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        AladdinAngularComponentsModule,
        AppRoutingModule,
        BatchReportingModule,
        BrowserModule,
        DialogModule,
        ExploreChartsModule,
        ExploreTableModule,
        HttpClientModule,
        IntroModule,
        LoadingModule,
        MainModule,
        MandateSettingsModule,
        MetadataModule,
        TelemetryInterceptorModule,
        RequestCancelerModule,
        FavoriteModule,
        FavoriteVersionModule,
        PortfolioSettingsModule,
        PortfolioSearchModule,
        ExploreUiBreakdownModule,
        SideBarModule,
        FloatingToolbarModule,
        SharedModule,
        RequestEnablerModule,
        StoreDevtoolsModule.instrument({logOnly: environment.production}),
        StoreModule.forRoot({}),
        !environment.production ? StoreDevtoolsModule.instrument() : [],
        CopilotChatModule,
        ExportHubModule
    ],
    providers: [
        {provide: APP_INITIALIZER, useFactory: AppInitializer.initialize, multi: true},
        {provide: APP_INITIALIZER, useFactory: GrafanaFaroInitializer.initialize, multi: true},
        {provide: HTTP_SERVICE_TOKEN, useExisting: Http2BmsService},
        {provide: PERFORMANCE_TIME_PERIOD_SETTINGS_SERVICE_TOKEN, useExisting: PerformanceTimePeriodSettingsService},
        {provide: PERFORMANCE_ATTRIBUTION_SETTINGS_SERVICE_TOKEN, useExisting: PerformanceAttributionSettingsService},
        {provide: NOTIFICATION_SERVICE_TOKEN, useExisting: NotificationService},
        {provide: PORTFOLIO_SEARCH_SERVICE_TOKEN, useExisting: ExplorePortfolioSearchService},
        {provide: DERIVED_COLUMN_OPTION_SERVICE_TOKEN, useClass: DerivedColumnOptionService},
        {provide: SECTOR_RULE_BUILDER_DIALOG_TOKEN, useValue: {component: SectorRuleBuilderModalComponent}},
        {provide: FACTOR_COLUMN_SET_SETTINGS_SERVICE_TOKEN, useExisting: FactorColumnSetSettingsService},
        {provide: SCENARIO_CREATION_ENABLED_TOKEN, useValue: true},
        {
            provide: AR_EVENT_LOG_CONFIGURATION,
            useValue: {},
        },
        { provide: AR_HOST_ENVIRONMENT, useValue: environment },
        {
            provide: AR_APPLICATION_METADATA,
            useValue: { name: 'Explore', version: '2.24.2' },
        },
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
