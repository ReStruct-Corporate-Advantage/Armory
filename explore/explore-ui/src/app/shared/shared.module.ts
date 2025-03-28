import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {CommonModule} from '@angular/common';
import {ExploreUiColumnOptionModule} from '@blk/explore-ui-column-option';
import {PortfolioSearchModule} from '@blk/explore-ui-portfolio-search';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';
import {FavoriteModule} from '../modules/favorite/favorite.module';
import {
    BenchmarkSelectorComponent, ResetCompositionComponent,
    SecuritySearchBarComponent,
    SecuritySearchComponent,
    SecurityUploadComponent
} from './components';
import {DatePickerWithCalendarComponent} from './components/date-picker-with-calendar/date-picker-with-calendar.component';
import {CalendarPickerComponent} from './components/date-picker-with-calendar/calendar-picker/calendar-picker.component';
import {QuickImportComponent} from './components/quick-import/quick-import.component';
import {UserSessionInfoComponent} from './components/user-session-info/user-session-info.component';
import {CloneDeepPipe} from './pipes/clone-deep.pipe';
import {ModellingTypesComponent} from './components/modelling-types/modelling-types.component';
import {SecuritySelectionModalComponent} from './components/security-search/security-selection-modal/security-selection-modal.component';
import {PortfolioOrFundSelectorComponent} from './components/commitment-risk/portfolio-or-fund-selector/portfolio-or-fund-selector-component';
import {SecuritySelectorDropdownLegacyComponent} from './components/security-selector-dropdown-legacy/security-selector-dropdown-legacy.component';
import {OverrideDateSortByOldestComponent} from './components/override-date-sort-by-oldest/override-date-sort-by-oldest.component';
import {SecuritySearchWithCustomColDefComponent} from './components/security-search/security-search-with-custom-col-def/security-search-with-custom-col-def.component';
import { AddToPortfolioComponent } from './components/security-search/add-to-portfolio/add-to-portfolio.component';
import {ColumnSetSettingsModule} from './modules/column-set-settings/column-set-settings.module';
import {AddPortfolioService} from './components/add-portfolio-modal/add-portfolio.service';
import {AddPortfolioModalComponent} from './components/add-portfolio-modal/add-portfolio-modal.component';
import {AddPortfolioComponent} from './components/add-portfolio-modal/add-portfolio/add-portfolio.component';
import {
    AddWhatIfPortfolioComponent
} from './components/add-portfolio-modal/add-what-if-portfolio/add-whatif-portfolio.component';
import {
    AddCustomPortfolioComponent
} from './components/add-portfolio-modal/add-custom-portfolio/add-custom-portfolio.component';
import {
    AddIndexResearchComponent
} from './components/add-portfolio-modal/add-index-research/add-index-research.component';
import {
    SelectedPortfolioListComponent
} from './components/add-portfolio-modal/selected-portfolio-list/selected-portfolio-list.component';
import {AddReportGroupComponent} from './components/add-portfolio-modal/add-report-group/add-report-group.component';
import {
    AddGroupButtonComponent
} from './components/add-portfolio-modal/add-report-group/add-group-button/add-group-button.component';
import {LoadingModule} from '../modules/loading/loading.module';
import { CommitmentRiskExcludedFundsModalComponent } from './components/commitment-risk/commitment-risk-excluded-funds-modal/commitment-risk-excluded-funds-modal.component';
import { CreateGroupModalPortfolioMenuComponent } from './components/entry-multi-portfolio/create-group-modal-portfolio-menu/create-group-modal-portfolio-menu.component';
import { MultiPortfolioAnalysisSelectMenuComponent } from './components/entry-multi-portfolio/multi-portfolio-analysis-select-menu/multi-portfolio-analysis-select-menu.component';
import { BasePortfolioSelectorComponent } from './components/entry-multi-portfolio/base-portfolio-selector/base-portfolio-selector.component';
import { CreateMultiPortfolioAnalysisModalComponent } from './components/entry-multi-portfolio/create-multi-portfolio-analysis-modal/create-multi-portfolio-analysis-modal.component';
import { MultiPortfolioAnalysisContentComponent } from './components/entry-multi-portfolio/multi-portfolio-analysis-content/multi-portfolio-analysis-content.component';
import { ExposureBasedPortfolioSettingsComponent } from './components/exposure-based-portfolio-settings/exposure-based-portfolio-settings.component';
import {ExploreUiExtendedColumnOptionModule} from '@blk/explore-ui-extended-column-option';
import { ExposureBasedAddFactorsComponent } from './components/exposure-based-portfolio-settings/exposure-based-add-factors/exposure-based-add-factors.component';
/**
 * Module for Shared components/services
 * Helps for better organization and removing circular dependencies between modules
 */
@NgModule({
    declarations: [
        DatePickerWithCalendarComponent,
        CalendarPickerComponent,
        BenchmarkSelectorComponent,
        SecuritySearchComponent,
        SecuritySearchBarComponent,
        SecurityUploadComponent,
        QuickImportComponent,
        UserSessionInfoComponent,
        CloneDeepPipe,
        ModellingTypesComponent,
        SecuritySelectionModalComponent,
        PortfolioOrFundSelectorComponent,
        SecuritySelectorDropdownLegacyComponent,
        OverrideDateSortByOldestComponent,
        SecuritySearchWithCustomColDefComponent,
        AddToPortfolioComponent,
        CreateGroupModalPortfolioMenuComponent,
        MultiPortfolioAnalysisSelectMenuComponent,
        BasePortfolioSelectorComponent,
        AddPortfolioModalComponent,
        AddPortfolioComponent,
        AddWhatIfPortfolioComponent,
        AddCustomPortfolioComponent,
        AddIndexResearchComponent,
        SelectedPortfolioListComponent,
        AddReportGroupComponent,
        AddGroupButtonComponent,
        ResetCompositionComponent,
        CommitmentRiskExcludedFundsModalComponent,
        CreateMultiPortfolioAnalysisModalComponent,
        MultiPortfolioAnalysisContentComponent,
        ExposureBasedPortfolioSettingsComponent,
        ExposureBasedAddFactorsComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        ExploreUiColumnOptionModule,
        ExploreUiCoreModule,
        CommonModule,
        AladdinAngularComponentsModule,
        PortfolioSearchModule,
        FavoriteModule,
        ColumnSetSettingsModule,
        LoadingModule,
        ExploreUiExtendedColumnOptionModule
    ],
    exports: [
        ExploreUiCoreModule,
        ExploreUiColumnOptionModule,
        DatePickerWithCalendarComponent,
        BenchmarkSelectorComponent,
        SecuritySearchComponent,
        QuickImportComponent,
        UserSessionInfoComponent,
        CloneDeepPipe,
        ModellingTypesComponent,
        SecuritySelectionModalComponent,
        PortfolioOrFundSelectorComponent,
        SecuritySelectorDropdownLegacyComponent,
        SecuritySearchWithCustomColDefComponent,
        OverrideDateSortByOldestComponent,
        AddToPortfolioComponent,
        MultiPortfolioAnalysisSelectMenuComponent,
        CreateGroupModalPortfolioMenuComponent,
        BasePortfolioSelectorComponent,
        AddPortfolioModalComponent,
        AddPortfolioComponent,
        AddWhatIfPortfolioComponent,
        AddCustomPortfolioComponent,
        AddIndexResearchComponent,
        ColumnSetSettingsModule,
        SelectedPortfolioListComponent,
        AddReportGroupComponent,
        AddGroupButtonComponent,
        CalendarPickerComponent,
        ResetCompositionComponent,
        CommitmentRiskExcludedFundsModalComponent,
        CreateMultiPortfolioAnalysisModalComponent,
        MultiPortfolioAnalysisContentComponent,
        ExposureBasedAddFactorsComponent
    ],
    providers: [AddPortfolioService]
})
export class SharedModule {
}
