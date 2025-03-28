import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MainComponent} from './main.component';
import {PortfolioHeaderComponent} from './portfolio-header/portfolio-header.component';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {PortfolioSearchModule} from '@blk/explore-ui-portfolio-search';
import {PortfolioInputPanelComponent} from './portfolio-input-panel/portfolio-input-panel.component';
import {WidgetModule} from '../widget/widget.module';
import {ReportBarComponent} from './report-container/report-bar/report-bar.component';
import {PortfolioSettingsModule} from '../portfolio-settings/portfolio-settings.module';
import {FavoriteModule} from '../favorite/favorite.module';
import {ReportContainerComponent} from './report-container/report-container.component';
import {ReportPresenterComponent} from './report-container/report-presenter/report-presenter.component';
import {GridsterModule} from 'explore-angular-gridster2';
import {CompareModalComponent} from './compare-modal/compare-modal.component';
import {PublishStateComponent} from './portfolio-input-panel/publish-state/publish-state.component';
import {DialogModule} from '@blk/explore-ui-core';
import {ExportModule} from '../export/export.module';
import {SharedModule} from '../../shared/shared.module';
import {CompositionModellingComponent} from './composition-modelling/composition-modelling.component';
import {ModellingTableComponent} from './composition-modelling/modelling-table/modelling-table.component';
import {SetWorkspaceDateModalComponent} from '../set-workspace-date-modal/set-workspace-date-modal.component';
import {PasteWidgetModalComponent} from './report-container/paste-widget-modal/paste-widget-modal.component';
import {BatchReportingModule} from '../batch-reporting/batch-reporting.module';
import {ExploreTableModule} from '../../vizualizations/table';
import {OptimizationModule} from '../optimization/optimization.module';
import {ModellingDetailsComponent} from './composition-modelling/modelling-table/modelling-details/modelling-details.component';
import {RuleMonitorComponent} from './composition-modelling/modelling-table/modelling-details/rule-monitor/rule-monitor.component';
import {RuleTableComponent} from './composition-modelling/modelling-table/modelling-details/rule-table/rule-table.component';
import {AddCashComponent} from './composition-modelling/add-cash/add-cash.component';
import {BatchContainerComponent} from './batch-container/batch-container.component';
import {BreakdownSettingsModule} from '../breakdown-settings/breakdown-settings.module';
import {SetReportGroupDateModalComponent} from './set-report-group-date-modal/set-report-group-date-modal.component';
import {ExploreEfficientFrontierModule} from '@blk/explore-efficient-frontier';
import {WidgetGalleryModalComponent} from '../widget-gallery-modal/widget-gallery-modal.component';
import {WidgetGalleryMoreComponent} from '../widget-gallery-modal/widget-gallery-more/widget-gallery-more.component';
import {WidgetGalleryCardsComponent} from '../widget-gallery-modal/widget-gallery-cards/widget-gallery-cards.component';
import {LoadingModule} from '../loading/loading.module';
import {SemanticSearchModalComponent} from './semantic-search-modal/semantic-search-modal.component';
import {LocaleSettingModalComponent} from './locale-setting/locale-setting-modal.component';
import {NewReportComponent} from './report-container/new-report/new-report.component';

@NgModule({
    declarations: [
        MainComponent,
        PortfolioHeaderComponent,
        PortfolioInputPanelComponent,
        ReportBarComponent,
        ReportContainerComponent,
        ReportPresenterComponent,
        CompareModalComponent,
        PublishStateComponent,
        CompositionModellingComponent,
        ModellingTableComponent,
        PasteWidgetModalComponent,
        SetWorkspaceDateModalComponent,
        ModellingDetailsComponent,
        AddCashComponent,
        RuleMonitorComponent,
        RuleTableComponent,
        BatchContainerComponent,
        SetReportGroupDateModalComponent,
        WidgetGalleryModalComponent,
        WidgetGalleryMoreComponent,
        WidgetGalleryCardsComponent,
        SemanticSearchModalComponent,
        LocaleSettingModalComponent,
        NewReportComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        PortfolioSearchModule,
        AladdinAngularComponentsModule,
        PortfolioSettingsModule,
        WidgetModule,
        DialogModule,
        FavoriteModule,
        GridsterModule,
        ExportModule,
        BatchReportingModule,
        SharedModule,
        ExploreTableModule,
        OptimizationModule,
        BreakdownSettingsModule,
        ExploreEfficientFrontierModule,
        LoadingModule
    ],
    exports: [MainComponent, BatchContainerComponent, SemanticSearchModalComponent, LocaleSettingModalComponent]
})
export class MainModule {}
