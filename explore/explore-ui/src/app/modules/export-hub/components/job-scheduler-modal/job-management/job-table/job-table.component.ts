import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import {
    AuxDynamicPositionEnum,
    AuxGridColumnType,
    AuxGridConstants,
    AuxGridOptions,
    AuxInlineMenuInterface
} from '@blk/aladdin-angular-components';
import {ColDef} from 'ag-grid-community';
import {JobService} from '../../../../services/job.service';
import {ExportHubStore} from '@stores/export-hub.store';
import {NotificationService} from '@services/notification';
import {ExportHubUtils} from '../../../../utils/export-hub.utils';
import {ScheduledJobExecutionParamsInterface} from '../../../../types/scheduled-job-execution-params.interface';
import {
    ExportHubJob,
    ExportHubJobExecutionHistory
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {FREQUENCY_LABEL_MAP} from '../../../../enums/frequency.constants';
import {
    CONTEXT_MENU_NOTIFICATION_MESSAGES,
    CONTEXT_MENU_OPTIONS,
    JobState, JobStateLabel,
    PORTFOLIOS,
    WIDGETS
} from '../../../../constants/export-hub.constants';
import {CommonConstants} from '@constants/common.constants';
import {isEmpty} from 'lodash';
import { DateUtils } from '@utils/date.utils';

@Component({
    selector: 'app-job-table',
    templateUrl: './job-table.component.html',
    styleUrls: ['./job-table.component.scss']
})
export class JobTableComponent implements OnInit, OnChanges {

    @Input() scheduledJobs: ExportHubJob[] = [];
    @Input() isActiveJobsTable: boolean;
    @Output() updateFilterOnDeletion = new EventEmitter<string>();


    gridOptions: AuxGridOptions;
    rowData: any[] = [];
    loadingLabel: string;
    actionInProgress: boolean = false;

    inlineMenuData: Array<Array<AuxInlineMenuInterface>> = [
        [
            {label: CONTEXT_MENU_OPTIONS.VIEW_EDIT},
            {label: CONTEXT_MENU_OPTIONS.VIEW_JOB_HISTORY},
            {label: CONTEXT_MENU_OPTIONS.DELETE}
        ]
    ];

    actionRowData = {
        ac: {
            assistiveLabel: 'menu items',
            inlineMenuData: this.inlineMenuData,
            onClick: (event) => {

            },
            inlineMenuItemClicked: (event: CustomEvent) => {
                const label = event.detail.element.label;
                const rowId = event.detail.element.rowId;
                const job: ExportHubJob = this.scheduledJobs.find(row => row.getId() === rowId);
                switch (label) {
                    case CONTEXT_MENU_OPTIONS.VIEW_EDIT:
                        this.editJob(job);
                        break;
                    case CONTEXT_MENU_OPTIONS.DELETE:
                        this.deleteJob(job);
                        break;
                    case CONTEXT_MENU_OPTIONS.VIEW_JOB_HISTORY:
                        this.viewJobHistory(job);
                        break;
                }
            },
            menuClosed: (event) => {
            },
            menuOpened: (event) => {
            }
        }
    };


    constructor(private jobService: JobService, private exportHubStore: ExportHubStore, private notificationService: NotificationService, private  cdr: ChangeDetectorRef) {
    }

    /**
     * OnInit hook
     */
    ngOnInit(): void {
        this.rowData = this.getRowData();

        this.gridOptions = {
            columnDefs: this.getColDefs()
        };
    }

    /**
     * OnChanges hook
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.scheduledJobs) {
            this.rowData = this.getRowData();
        }
    }

    /**
     * Ag grid rowData initialization
     */
    getRowData(): any {
       this.scheduledJobs = this.scheduledJobs.filter(job => job.getJobSchedulesList()[0] != null);
        return this.scheduledJobs.map((item : ExportHubJob) => {
            const row = this.createRow(item);

            if (item.getJobPortfoliosList().length) {
                const portfolioContent = this.createPopoverContent(CommonConstants.PORTFOLIOS,  item.getJobPortfoliosList().map(portfolio => portfolio.getJobPortfolioName()));
                row[PORTFOLIOS] = this.createPopupObject(item.getJobPortfoliosList().length + CommonConstants.SINGLE_SPACE + PORTFOLIOS, portfolioContent);
            }

            if (item.getJobWidgetsList().length) {
                const widgetContent = this.createPopoverContent(CommonConstants.WIDGETS, item.getJobWidgetsList().map(widget => widget.getTitle()));
                row[WIDGETS] = this.createPopupObject(item.getJobWidgetsList().length + CommonConstants.SINGLE_SPACE + WIDGETS, widgetContent);
            }

            if(this.isActiveJobsTable){
                row['ac'] = {
                    ...this.actionRowData.ac,
                    inlineMenuData: this.actionRowData.ac.inlineMenuData.map(menuGroup =>
                        menuGroup.map(menuItem => ({
                            ...menuItem,
                            rowId: row.id
                        }))
                    )
                };
            }

            return row;
        });
    }

    private createRow(exportHubJob : ExportHubJob){
        const scheduleSettings = exportHubJob.getJobSchedulesList()[0];
        const row = {
                id: exportHubJob.getId(),
                name: exportHubJob.getName(),
                frequency: FREQUENCY_LABEL_MAP.get(scheduleSettings.getJobFrequency()),
                runStartTime: ExportHubUtils.convertProtobufDateToString(scheduleSettings.getJobStartDate()),
                runCompleteTime: scheduleSettings.getJobEndDate() ? ExportHubUtils.convertProtobufDateToString(scheduleSettings.getJobEndDate()) : '',
                exportType: exportHubJob.getExportType().toUpperCase()
        } as any;

        if(this.isActiveJobsTable){
            if(scheduleSettings.getNextRunDate()){
                row['nextRunDate'] = ExportHubUtils.convertProtobufDateToString(scheduleSettings.getNextRunDate());
            }
        }else if (exportHubJob.getState() === JobState.INACTIVE) {
            //job is inactive with state as deleted
            row['status'] = JobStateLabel.DELETED + CommonConstants.SINGLE_SPACE + CommonConstants.DASH + CommonConstants.SINGLE_SPACE + DateUtils.convertProtobufTimestampToString(exportHubJob.getChangeTime(), false);
        } else {
            row['status'] = JobStateLabel.EXPIRED;
        }

        return row;
    }

    /**
     * create popover content
     * @param label
     * @param items
     * @private
     */
    private createPopoverContent(label: string, items: string[]): string {
        let content = `<div style="width: 120px; margin-top: -24px; display: flex; flex-direction: column;"><label style="font-size: 13px; margin-bottom: 5px; font-weight: bold">${label}</label>`;
        items.forEach(item => content += `<span>${item}</span>`);
        content += '</div>';
        return content;
    }

    /**
     * create popup object
     * @param label
     * @param content
     * @private
     */
    private createPopupObject(label: string, content: string): any {
        return {
            label,
            popupContent: content,
            isHover: false,
            overridePlacement: AuxDynamicPositionEnum.LEFT_CENTER
        };
    }

    activeJobTableSpecificColDefs(): ColDef[] {
        return [
            {
                headerName: '',
                field: 'ac',
                type: AuxGridColumnType.AUX_ACTION_COLUMN,
                cellClass: AuxGridConstants.AUX_CENTER_ALIGN_CELL as string,
                headerClass: AuxGridConstants.AUX_CENTER_ALIGN_HEADER_NO_LABEL as string,
                width: 32,
                maxWidth: 42,
                sortable: false,
                pinned: 'left'
            },
            {
                field: 'name',
                headerName: 'Job Name',
                suppressSizeToFit: true,
                minWidth: 150,
                width: 150,
                maxWidth: 200
            },
            {
                field: 'frequency',
                headerName: 'Frequency',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                suppressSizeToFit: true,
                minWidth: 150,
                width: 150,
                maxWidth: 200
            },
            {
                field: 'nextRunDate',
                headerName: 'Next Run Date',
                type: AuxGridColumnType.AUX_DATE_TIME_COLUMN,
                cellClass: AuxGridConstants.AUX_RIGHT_ALIGN_CELL as string,
                width: 150,
                maxWidth: 400
            },
        ];
    }

    inactiveJobsTableSpecificColDefs(): ColDef[] {
        return [
            {
                field: 'name',
                headerName: 'Job Name',
                suppressSizeToFit: true,
                minWidth: 150,
                width: 150,
                maxWidth: 200
            },
            {
                field: 'status',
                headerName: 'Status',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                suppressSizeToFit: true,
                minWidth: 150,
                width: 150,
                maxWidth: 200
            },
            {
                field: 'frequency',
                headerName: 'Frequency',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                suppressSizeToFit: true,
                minWidth: 150,
                width: 150,
                maxWidth: 200
            }
        ];
    }


    /**
     * table column defintions
     */
    getColDefs() {
        const columnDefinitions: (ColDef)[] = [
            ...(this.isActiveJobsTable ? this.activeJobTableSpecificColDefs() : this.inactiveJobsTableSpecificColDefs()),
            {
                field: 'runStartTime',
                headerName: 'From Date',
                type: AuxGridColumnType.AUX_DATE_TIME_COLUMN,
                cellClass: AuxGridConstants.AUX_RIGHT_ALIGN_CELL as string,
                width: 150,
                maxWidth: 400
            },
            {
                field: 'runCompleteTime',
                headerName: 'End Date',
                type: AuxGridColumnType.AUX_DATE_TIME_COLUMN,
                cellClass: AuxGridConstants.AUX_RIGHT_ALIGN_CELL as string,
                width: 150,
                maxWidth: 400
            },
            {
                field: 'portfolios',
                headerName: 'Portfolios',
                type: AuxGridColumnType.AUX_POPUP_COLUMN,
                width: 150
            },
            {
                field: 'widgets',
                headerName: 'Widgets',
                type: AuxGridColumnType.AUX_POPUP_COLUMN,
                width: 150
            },
            {
                field: 'exportType',
                headerName: 'Export Type',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                width: 124
            }
        ];
        return columnDefinitions;
    }

    /**
     * View/Edit the job
     * @param jobToEdit
     * @private
     */
    private editJob(jobToEdit: ExportHubJob) {
        this.jobService.getScheduledJobById$(jobToEdit.getId()).subscribe({
            next : (job: ExportHubJob)=>{
                //We pass the job to be edited to the scheduled job pop up, after editing we will replace the scheduled job in the export hub store
                this.exportHubStore.openScheduleJobModal(job);
            },
            error : () => {
                this.notificationService.error('Failed to fetch job details for ' + jobToEdit.getName());
            }
        });

    }


    /**
     * Delete the job
     * @param jobToDelete.id
     * @private
     */
    private deleteJob(jobToDelete: ExportHubJob) {
        this.actionInProgress = true;
        this.loadingLabel = 'Deleting job ' + jobToDelete.getName();

        // Get scheduled jobs when popup is opened
        this.jobService.delete$(jobToDelete.getId()).subscribe({
        next: (deleteStatus: ScheduledJobExecutionParamsInterface) => {
            this.actionInProgress = false;

            if (!deleteStatus.isSuccessful) {
                this.notificationService.error(CONTEXT_MENU_NOTIFICATION_MESSAGES.DELETE_FAILURE + jobToDelete.getName());
                return;
            }
            this.notificationService.success(CONTEXT_MENU_NOTIFICATION_MESSAGES.DELETE_SUCCESS + jobToDelete.getName());

            //recreate the table and update the filter data
            this.updateFilterOnDeletion.emit(jobToDelete.getId());
            this.cdr.markForCheck();

        },
        error: () => {
            this.actionInProgress = false;
            this.notificationService.error(CONTEXT_MENU_NOTIFICATION_MESSAGES.DELETE_FAILURE + jobToDelete.getName());
            this.cdr.markForCheck()

        }});
    }

    private viewJobHistory(job: ExportHubJob) {
        this.jobService.getJobExecutionHistoryById$(job.getId()).subscribe({
            next: (jobExecutionHistory: ExportHubJobExecutionHistory[]) => {
               if(isEmpty(jobExecutionHistory)){
                    this.notificationService.error('No job execution history found for ' + job.getName());
                    return;
                }
                this.exportHubStore.jobExecutionHistoriesModalOpen$.next({isOpen: true, jobHistory: jobExecutionHistory});
            },
            error: () => {
                this.notificationService.error('Failed to fetch job execution history for ' + job.getName());
            }
        });

    }
}
