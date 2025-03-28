import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {
    ExportHubJobExecutionHistory
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {
    AuxBadgeSizeEnum,
    AuxBadgeTypeEnum,
    AuxButtonTypeEnum,
    AuxGridColumnType,
    AuxGridConstants,
    AuxGridFontSize,
    AuxGridOptions,
    AuxGridPaddingSize
} from '@blk/aladdin-angular-components';
import {ColDef, ICellRendererParams} from 'ag-grid-community';
import {badgeStyles, ExportHubUtils} from '../../../../../utils/export-hub.utils';
import {EXPORT_HUB_JOB_STATES_REVERSED} from '../../../../../constants/export-hub.constants';
import {CommonConstants} from '@constants/common.constants';
import {isEmpty} from 'lodash';
import {JobService} from '../../../../../services/job.service';
import {NotificationService} from '@services/notification';

@Component({
  selector: 'app-job-execution-histories',
  templateUrl: './job-execution-histories.component.html',
  styleUrls: ['./job-execution-histories.component.scss']
})
export class JobExecutionHistoriesComponent implements OnInit, OnChanges {

    @Input() isOpen: boolean;
    @Input() jobExecutionHistory : ExportHubJobExecutionHistory[];
    @Output() modalClosed = new EventEmitter<void>();

    fontSize : AuxGridFontSize = 'small';
    paddingSize : AuxGridPaddingSize = 'normal';

    gridOptions : AuxGridOptions;
    rowData : any[];

    constructor(private jobService : JobService, private notificationService : NotificationService){}

    ngOnInit(): void {
        this.rowData = this.createRowData();
        this.gridOptions = {
            columnDefs : this.createColumnDefs(),
            treeData: true,
            autoGroupColumnDef: {
                headerName: 'Scheduled Date/Time',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                suppressSizeToFit: true,
                minWidth: 150,
                width: 150
            } as ColDef,
            getDataPath: data => data.name
        };
    }


    ngOnChanges(changes: SimpleChanges): void {
        if (changes.jobExecutionHistory && changes.jobExecutionHistory.previousValue[0].getJobId() !== changes.jobExecutionHistory.currentValue[0].getJobId()) {
            this.rowData = this.createRowData();
        }
    }

    closeModal() {
        this.isOpen = false;
        this.modalClosed.emit();
    }

    /**
     * Create column definitions for the grid
     * @private
     */
    private createColumnDefs() : ColDef[] {
        return [
            {
                field: 'status',
                headerName: 'Status',
                suppressSizeToFit: true,
                headerClass: AuxGridConstants.AUX_CENTER_ALIGN_HEADER as string,
                cellRenderer: (params) => {
                    if (params.node.level === 0) {
                        return this.statusCellRenderer(params);
                    } else {
                        return this.hierarchicalStatusCellRenderer(params);
                    }
                },
                minWidth: 150,
                width: 150,
                maxWidth: 200
            },
            {
                field: 'startDateTime',
                headerName: 'Start Date/Time',
                type: AuxGridColumnType.AUX_DATE_TIME_COLUMN,
                cellClass: AuxGridConstants.AUX_RIGHT_ALIGN_CELL as string,
                minWidth: 80,
                width: 100
            },
            {
                field: 'statusDateTime',
                headerName: 'Status Date/Time',
                type: AuxGridColumnType.AUX_DATE_TIME_COLUMN,
                cellClass: AuxGridConstants.AUX_RIGHT_ALIGN_CELL as string,
                minWidth: 80,
                width: 100
            },
            {
                field: 'info',
                headerName: 'Status Information',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                minWidth: 150,
                width: 170
            },
            {
                field: 'note',
                headerName: 'Widget Note',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                minWidth: 150,
                width: 170
            }
        ];
    }

    /**
     * render badge inside table
     */
    private statusCellRenderer(params: ICellRendererParams): string {
        const value = params.data.status;
        const badgeStyle: string = badgeStyles[params.data.status]
        return `<div style="height: 70%; display: flex; align-items: center; justify-content: center"><aux-badge type="${AuxBadgeTypeEnum.TEXT}" size="${AuxBadgeSizeEnum.SMALL}" badge-style="${badgeStyle}" value="${value}"></aux-badge></div>`;
    }

    private hierarchicalStatusCellRenderer(params: ICellRendererParams): string {
        const value = params.data.status;
        const badgeStyle: string = badgeStyles[params.data.status];
        return `<div style="height: 70%; display: flex; align-items: center; justify-content: center;"><aux-badge type="${AuxBadgeTypeEnum.TEXT}" size="${AuxBadgeSizeEnum.PINPOINT}" badge-style="${badgeStyle}" value="${value}" [hasAssistiveText]="false"></aux-badge></div>`;
    }

    private createRowData(){
        const rowData = [];
        for (const history of this.jobExecutionHistory) {
            const parentRowName = ExportHubUtils.convertProtobufDateToString(history.getExecutionDate()) + CommonConstants.SINGLE_SPACE + CommonConstants.DASH + CommonConstants.SINGLE_SPACE + history.getJobTime();
            //create parent row
            rowData.push({
                name: [parentRowName],
                status: EXPORT_HUB_JOB_STATES_REVERSED.get(history.getState()),
                startDateTime: ExportHubUtils.formatDateTime(history.getExecutionStartTime()),
                statusDateTime: ExportHubUtils.formatDateTime(history.getExecutionEndTime()),
                info: history.getExecutionLog(),
                note: CommonConstants.EMPTY_STRING
            });

            //create child rows
            for(const child of history.getTaskExecutionHistoriesList()) {
                rowData.push({
                    name: [parentRowName, child.getJobPortfolioName() + CommonConstants.SINGLE_SPACE + CommonConstants.SLASH + CommonConstants.SINGLE_SPACE + child.getWidgetType()],
                    status: EXPORT_HUB_JOB_STATES_REVERSED.get(child.getState()),
                    startDateTime: ExportHubUtils.formatDateTime(child.getExecutionStartTime()),
                    statusDateTime: ExportHubUtils.formatDateTime(child.getExecutionEndTime()),
                    info: child.getExecutionLog(),
                    note: child.getWidgetDescription()
                });
            }
        }

      return rowData;
    }

    refreshHistory() {
        this.jobService.getJobExecutionHistoryById$(this.jobExecutionHistory[0].getJobId()).subscribe({
            next: (jobExecutionHistory: ExportHubJobExecutionHistory[]) => {
                if(isEmpty(jobExecutionHistory)){
                    this.notificationService.error('No job execution history found for ' + this.jobExecutionHistory[0].getJobName());
                    return;
                }
                this.jobExecutionHistory = jobExecutionHistory;
                this.rowData = this.createRowData();
            },
            error: () => {
                this.notificationService.error('Failed to fetch job execution history for ' + this.jobExecutionHistory[0].getJobName());
            }
        });

    }

    protected readonly AuxButtonTypeEnum = AuxButtonTypeEnum;



}
