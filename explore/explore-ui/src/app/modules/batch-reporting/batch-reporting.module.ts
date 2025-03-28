import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BatchSettingsModalComponent} from './batch-settings-modal/batch-settings-modal.component';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {BatchSettingsComponent} from './batch-settings-modal/batch-settings/batch-settings.component';
import {BatchSettingsRowComponent} from './batch-settings-modal/batch-settings/batch-settings-row/batch-settings-row.component';
import {PortfolioSearchModule} from '@blk/explore-ui-portfolio-search';
import {SharedModule} from '../../shared/shared.module';
import {ExportModule} from '../export/export.module';
import {PortfolioSettingsModule} from '../portfolio-settings/portfolio-settings.module';
import {FavoriteModule} from '../favorite/favorite.module';
import {BatchSchedulerModalComponent} from './batch-scheduler-modal/batch-scheduler-modal.component';
import {ScheduledBatchOverviewModalComponent} from './scheduled-batch-overview-modal/scheduled-batch-overview-modal.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
    declarations: [
        BatchSettingsModalComponent,
        BatchSettingsComponent,
        BatchSettingsRowComponent,
        BatchSchedulerModalComponent,
        ScheduledBatchOverviewModalComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        AladdinAngularComponentsModule,
        CommonModule,
        PortfolioSearchModule,
        SharedModule,
        ExportModule,
        PortfolioSettingsModule,
        FavoriteModule,
        DragDropModule
    ],
    exports: [
        BatchSettingsModalComponent,
        BatchSettingsComponent,
        BatchSettingsRowComponent,
        BatchSchedulerModalComponent,
        ScheduledBatchOverviewModalComponent
    ]
})
export class BatchReportingModule {
}
