import {Component, Input, OnInit} from '@angular/core';
import {
    AuxGridColumnType,
    AuxGridConstants,
    AuxGridOptions,
    AuxIconCellRendererClickParams,
    AuxIconStateEnum,
    AuxIconTypeEnum
} from '@blk/aladdin-angular-components';
import {ColDef, GridApi} from 'ag-grid-community';
import {
    ExportHubJob,
    ExportHubJobWidget
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {JobWidgetRowData} from '../../../interfaces/job-widget-row-data.interface';

@Component({
    selector: 'app-job-widgets',
    templateUrl: './job-widgets.component.html',
    styleUrls: ['./job-widgets.component.scss']
})
export class JobWidgetsComponent implements OnInit {

    gridOptions: AuxGridOptions;
    rowData: JobWidgetRowData[] = [];
    localWidgetConfigs: ExportHubJobWidget[] = [];

    @Input() scheduledJob: ExportHubJob;
    private gridApi: GridApi;


    ngOnInit(): void {
        this.localWidgetConfigs = [...this.scheduledJob.getJobWidgetsList()];
        this.rowData = this.localWidgetConfigs.map(this.convertToRowData.bind(this));

        this.gridOptions = {
            columnDefs: this.getColDefs(),
            onGridReady: event => {
                this.gridApi = event.api;
                this.gridApi.sizeColumnsToFit({
                    columnLimits: [
                        {key: 'actionButton', maxWidth: 40}
                    ]
                });
            }
        };
    }

    getColDefs() {
        const columnDefinitions: ColDef[] = [{
            field: 'widgetName',
            headerName: 'Widget Name',
            type: AuxGridColumnType.AUX_TEXT_COLUMN,
            editable: true,
            singleClickEdit: true,
            cellEditor: 'agTextCellEditor',
            onCellValueChanged: params => {
                if (params.newValue === params.oldValue) {
                    return;
                }
                this.localWidgetConfigs[params.node.rowIndex].setTitle(params.newValue);
            }
        },
            {
                field: 'notes',
                headerName: 'Notes',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                editable: true,
                singleClickEdit: true,
                cellEditor: 'agTextCellEditor',
                onCellValueChanged: params => {
                    if (params.newValue === params.oldValue) {
                        return;
                    }
                    this.localWidgetConfigs[params.node.rowIndex].setWidgetDescription(params.newValue);
                }
            },
            {
                field: 'widgetInfo',
                headerName: 'Widget Info',
                type: AuxGridColumnType.AUX_TEXT_COLUMN

            },
            {
                field: 'actionButton',
                type: AuxGridColumnType.AUX_ICON_COLUMN_V2,
                cellClass: AuxGridConstants.AUX_CENTER_ALIGN_CELL as string,
                headerClass: AuxGridConstants.AUX_CENTER_ALIGN_HEADER_NO_LABEL as string,
            }];

        return columnDefinitions;
    }

    private convertToRowData(widgetConfig: ExportHubJobWidget): JobWidgetRowData {
        return {
            widgetName: widgetConfig.getTitle(),
            notes: widgetConfig.getWidgetDescription(),
            widgetInfo: widgetConfig.getWidgetType(),
            actionButton: {
                type: AuxIconTypeEnum['delete'],
                state: AuxIconStateEnum['non-action'],
                isDisabled: false,
                onClick: this.deleteJobWidget.bind(this)
            }
        };
    }

    private deleteJobWidget(event: AuxIconCellRendererClickParams) {
        this.localWidgetConfigs = this.localWidgetConfigs.filter(widgetConfig => widgetConfig !== this.localWidgetConfigs[event.node.rowIndex]);
        this.scheduledJob.setJobWidgetsList(this.localWidgetConfigs);
        this.rowData = [...this.localWidgetConfigs.map(widget => this.convertToRowData(widget))];
        this.gridApi.updateGridOptions({rowData: this.rowData});
    }
}
