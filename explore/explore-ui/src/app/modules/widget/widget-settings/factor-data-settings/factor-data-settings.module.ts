import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';
import {ExploreUiRiskModule} from '@blk/explore-ui-risk';
import {ExploreUiBreakdownModule} from '@blk/explore-ui-breakdown';
import {ColumnOptionService, ExploreUiColumnOptionModule} from '@blk/explore-ui-column-option';
import {FactorDataChartSettingsComponent} from './factor-data-chart-settings/factor-data-chart-settings.component';
import {FactorDataRiskSettingsComponent} from './factor-data-risk-settings/factor-data-risk-settings.component';
import {FactorDataAddFactorsComponent} from './factor-data-chart-settings/factor-data-add-factors/factor-data-add-factors.component';
import {FactorDataSummaryTableComponent} from './factor-data-chart-settings/factor-data-summary-table/factor-data-summary-table.component';
import {FactorDataSummaryGridComponent} from './factor-data-chart-settings/factor-data-summary-table/factor-data-summary-grid/factor-data-summary-grid.component';
import {EditFactorSettingsModalComponent} from './factor-data-chart-settings/factor-data-summary-table/edit-factor-settings-modal/edit-factor-settings-modal.component';
import {FactorDataRiskMatrixSettingsComponent} from './factor-data-chart-settings/factor-data-risk-matrix-settings/factor-data-risk-matrix-settings.component';
import {FactorDataConditionalFormattingComponent} from './factor-data-chart-settings/factor-data-risk-matrix-settings/factor-data-conditional-formatting/factor-data-conditional-formatting.component';
import {ChartSettingsModule} from '../chart-settings/chart-settings.module';
import {ExploreUiExtendedColumnOptionModule} from '@blk/explore-ui-extended-column-option';
import { FactorDataWidgetColumnModalComponent } from './factor-data-chart-settings/factor-data-add-factors/factor-data-widget-column-modal/factor-data-widget-column-modal.component';

@NgModule({
    declarations: [
        FactorDataRiskSettingsComponent,
        FactorDataChartSettingsComponent,
        FactorDataAddFactorsComponent,
        FactorDataSummaryTableComponent,
        FactorDataSummaryGridComponent,
        EditFactorSettingsModalComponent,
        FactorDataRiskMatrixSettingsComponent,
        FactorDataConditionalFormattingComponent,
        FactorDataWidgetColumnModalComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        ExploreUiColumnOptionModule,
        ExploreUiCoreModule,
        ExploreUiRiskModule,
        ExploreUiBreakdownModule,
        ChartSettingsModule,
        ExploreUiExtendedColumnOptionModule,
    ],
    exports: [
        FactorDataChartSettingsComponent,
        FactorDataRiskSettingsComponent,
    ],
    providers: [
        ColumnOptionService,
    ]
})
export class FactorDataSettingsModule {
}

