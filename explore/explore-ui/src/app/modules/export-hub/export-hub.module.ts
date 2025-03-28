import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {JobSchedulerModalComponent} from './components/job-scheduler-modal/job-scheduler-modal.component';
import {MainTabsComponent} from './components/job-scheduler-modal/main-tabs/main-tabs.component';
import {JobManagementComponent} from './components/job-scheduler-modal/job-management/job-management.component';
import {ExportHubTableComponent} from './components/job-scheduler-modal/shared/export-hub-table.component';
import {JobTableComponent} from './components/job-scheduler-modal/job-management/job-table/job-table.component';
import {ScheduleJobModalComponent} from './components/schedule-job-modal/schedule-job-modal.component';
import {JobPortfoliosComponent} from './components/schedule-job-modal/job-portfolios/job-portfolios.component';
import {ScheduleSettingsComponent} from './components/schedule-job-modal/job-schedule/schedule-settings.component';
import {SharedModule} from '../../shared/shared.module';
import {LoadingModule} from '../loading/loading.module';
import {JobExportSettingsComponent} from './components/schedule-job-modal/job-settings/job-export-settings.component';
import {PortfolioSettingsModule} from '../portfolio-settings/portfolio-settings.module';
import {JobReviewSettingsComponent} from './components/job-review-settings/job-review-settings.component';
import {JobWidgetsComponent} from './components/schedule-job-modal/job-widgets/job-widgets.component';
import { JobExecutionHistoriesComponent } from './components/job-scheduler-modal/job-management/job-table/job-execution-histories/job-execution-histories.component';

@NgModule({
    declarations: [JobSchedulerModalComponent, MainTabsComponent, JobManagementComponent, ExportHubTableComponent, JobTableComponent, ScheduleJobModalComponent, JobPortfoliosComponent, ScheduleSettingsComponent, JobExportSettingsComponent, JobReviewSettingsComponent, JobWidgetsComponent, JobExecutionHistoriesComponent],
    exports: [JobSchedulerModalComponent, MainTabsComponent, JobManagementComponent, ExportHubTableComponent, JobTableComponent, ScheduleJobModalComponent, JobExecutionHistoriesComponent],
    imports: [CommonModule, AladdinAngularComponentsModule, SharedModule, PortfolioSettingsModule, LoadingModule]
})
export class ExportHubModule {}
