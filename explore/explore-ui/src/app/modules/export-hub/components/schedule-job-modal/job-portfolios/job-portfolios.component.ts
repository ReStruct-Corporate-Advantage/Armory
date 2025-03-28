import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ColDef, GridApi, ICellEditorParams} from 'ag-grid-community';
import {
    AuxButtonSizeEnum,
    AuxGridColumnType,
    AuxGridConstants,
    AuxGridOptions,
    AuxIconCellRendererClickParams,
    AuxIconStateEnum,
    AuxIconTypeEnum
} from '@blk/aladdin-angular-components';
import {PortfolioType} from '../../../../../shared/components/add-portfolio-modal/portfolio-type.enum';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {IndexSearchTreeItem} from '@models/portfolio/index-search-tree-item.model';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {PortfolioService} from '@services/portfolio';
import {JobPortfolioConfig} from '../../../models/job-portfolio-config.model';
import {BatchExportRunAs} from '@enums/batch-reporting/batch-export-run-as.enum';
import {forkJoin, Observable} from 'rxjs';
import {
    DatePickerWithCalendarComponent
} from '../../../../../shared/components/date-picker-with-calendar/date-picker-with-calendar.component';
import {DefinitionsStore} from '@stores/definitions.store';
import {BenchmarkSelectorComponent} from '../../../../../shared/components';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ExplorePortfolioSearchService} from '@services/explore-portfolio-search/explore-portfolio-search.service';
import {map} from 'rxjs/operators';
import {NotificationService} from '@services/notification';
import {JobPortRowData} from '../../../interfaces/job-port-row-data.interface';
import {DateValue, OverrideDateConstants} from '@blk/explore-ui-core';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {isAdhocPort} from '@interfaces/base-adhoc-portfolio.interface';
import {JobPortRowOp} from '../../../enums/job-port-row-op.enum';
import {JobPortConfigCallbackParams} from '../../../interfaces/job-port-config-callback-params.interface';
import {ReportGroup} from '@models/workspace/report-group.model';
import {UploadService} from '@services/upload/upload.service';
import {
    ExportHubJobPortfolio
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {PortfolioUtils} from '@utils/portfolio.utils';
import {PORTFOLIOS_RUN_AS_TYPE} from '../../../constants/export-hub.constants';

@Component({
    selector: 'app-job-portfolios',
    templateUrl: './job-portfolios.component.html',
    styleUrls: ['./job-portfolios.component.scss']
})
export class JobPortfoliosComponent implements OnInit {

    readonly AuxButtonSizeEnum = AuxButtonSizeEnum;

    isAddPortfolioModalOpen = false;
    gridOptions: AuxGridOptions;
    rowData: JobPortRowData[];
    gridApi: GridApi;
    dateShortcuts = OverrideDateConstants.DATE_SHORTCUTS;

    isPortfolioSettingsModalOpen = false;
    selectedJobPortConfig: JobPortfolioConfig;
    readonly dummyReportGroup = new ReportGroup();

    private localPortfolioConfigs: JobPortfolioConfig[];

    constructor(
        private portfolioService: PortfolioService,
        public portfolioSearchService: ExplorePortfolioSearchService,
        private notificationService: NotificationService,
        protected uploadService: UploadService,
        private cdRef: ChangeDetectorRef
    ) {
    }

    @Input() portfolioType = PortfolioType.PORTFOLIO;
    @Input() portfolioConfigs: ExportHubJobPortfolio[] = [];
    @Output() portfolioConfigsChange = new EventEmitter<ExportHubJobPortfolio[]>();

    ngOnInit(): void {
        this.localPortfolioConfigs = [...this.portfolioConfigs.map(portfolioConfig => {
            return this.convertToExploreHubJobPortfolio(portfolioConfig);
        })] ;

        this.gridOptions = {
            columnDefs: this.getColDefs(),
            rowData: this.localPortfolioConfigs.map(this.convertToRowData.bind(this)),
            dataTypeDefinitions: {
                dateValue: {
                    extendsDataType: 'text',
                    baseDataType: 'text',
                    dataTypeMatcher: params => params instanceof DateValue
                },
                benchmark: {
                    extendsDataType: 'text',
                    baseDataType: 'text',
                    dataTypeMatcher: params => params instanceof Benchmark
                }
            },
            stopEditingWhenCellsLoseFocus: false,
            onGridReady: event => {
                this.gridApi = event.api;
                this.gridApi.sizeColumnsToFit({
                    columnLimits: [
                        {key: 'portfolio', minWidth: 100},
                        {key: 'runAs', minWidth: 90},
                        {key: 'date', minWidth: 135},
                        {key: 'benchmark', minWidth: 410},
                        {key: 'actionButton', maxWidth: 40},
                        {key: 'portfolio_settings', maxWidth: 40}
                    ]
                });
                this.initPortsInGrid(this.localPortfolioConfigs);
            },
            suppressLoadingOverlay: true
        };
    }

    /**
     * table column definition
     */
    getColDefs() {
        const columnDefinitions: ColDef[] = [
            {
                field: 'portfolio',
                headerName: 'Portfolio',
                type: AuxGridColumnType.AUX_TEXT_COLUMN
            },
            {
                field: 'runAs',
                headerName: 'Run As',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                editable: true,
                singleClickEdit: true,
                cellEditor: 'agSelectCellEditor',
                onCellValueChanged: params => {
                    if (params.newValue === params.oldValue) {
                        return;
                    }

                    this.localPortfolioConfigs[params.node.rowIndex].runAs = params.newValue === 'Portfolios' ? BatchExportRunAs.PORTFOLIOS : BatchExportRunAs.PORTGROUP;
                    this.getPortObjectsAndUpdateGrid([this.localPortfolioConfigs[params.node.rowIndex]], this.updateJobPortConfig.bind(this), {
                        rowOp: JobPortRowOp.REPLACE,
                        rowIndex: params.node.rowIndex
                    });
                },
                cellEditorParams: {
                    values: ['Portfolios', 'PortGroup']
                },
                sortable: false
            },
            {
                field: 'date',
                headerName: 'Date',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                cellDataType: 'dateValue',
                cellClass: AuxGridConstants.AUX_RIGHT_ALIGN_CELL as string,
                editable: true,
                singleClickEdit: true,
                cellEditor: DatePickerWithCalendarComponent,
                onCellValueChanged: params => {
                    if ((params.newValue as DateValue).equals(params.oldValue)) {
                        return;
                    }

                    this.localPortfolioConfigs[params.node.rowIndex].portfolio.datePicker = params.newValue;
                    this.getPortObjectsAndUpdateGrid([this.localPortfolioConfigs[params.node.rowIndex]], this.updateJobPortConfig.bind(this), {
                        rowOp: JobPortRowOp.REPLACE,
                        rowIndex: params.node.rowIndex
                    });
                },
                cellEditorParams: (params: ICellEditorParams) => ({portfolio: this.localPortfolioConfigs[params.node.rowIndex].portfolio}),
                suppressKeyboardEvent: params => params.editing,
                valueFormatter: (params) => params.value.getDateAsText(),
                sortable: false
            },
            {
                field: 'currency',
                headerName: 'Currency',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                editable: true,
                singleClickEdit: true,
                cellEditor: 'agSelectCellEditor',
                onCellValueChanged: params => {
                    if (params.newValue === params.oldValue) {
                        return;
                    }

                    this.localPortfolioConfigs[params.node.rowIndex].portfolio.currency = params.newValue;
                },
                cellEditorParams: {
                    values: ['Portfolio group currency', 'Portfolio currency', ...DefinitionsStore.currency],
                    valueListMaxHeight: 120
                },
                sortable: false
            },
            {
                field: 'benchmark',
                headerName: 'Benchmark',
                cellDataType: 'benchmark',
                editable: true,
                singleClickEdit: true,
                cellEditor: BenchmarkSelectorComponent,
                onCellValueChanged: params => {
                    if ((params.newValue as Benchmark).equals(params.oldValue)) {
                        return;
                    }

                    this.localPortfolioConfigs[params.node.rowIndex].portfolio.benchmark = params.newValue;
                },
                cellEditorParams: (params: ICellEditorParams) => ({
                    portfolio: this.localPortfolioConfigs[params.node.rowIndex].portfolio,
                    batchRunAs: this.localPortfolioConfigs[params.node.rowIndex].runAs,
                    disablePopover: true,
                    allowOther: true,
                    isDisabled: false,
                    showLabel: false,
                    triggerWidgetReloadEvents: false
                }),
                suppressKeyboardEvent: params => params.editing,
                valueFormatter: params => params.value.name,
                sortable: false
            },
            {
                field: 'portfolio_settings',
                type: AuxGridColumnType.AUX_ICON_COLUMN_V2,
                cellClass: AuxGridConstants.AUX_CENTER_ALIGN_CELL as string,
                headerClass: AuxGridConstants.AUX_CENTER_ALIGN_HEADER_NO_LABEL as string,
                sortable: false
            },
            {
                field: 'actionButton',
                type: AuxGridColumnType.AUX_ICON_COLUMN_V2,
                cellClass: AuxGridConstants.AUX_CENTER_ALIGN_CELL as string,
                headerClass: AuxGridConstants.AUX_CENTER_ALIGN_HEADER_NO_LABEL as string,
                sortable: false
            }
        ];
        return columnDefinitions;
    }

    loadFavoriteActionCallback(): void {
        // not needed as of now
    }

    /**
     * add all searched/selected portfolio items to grid
     */
    addAllPortItemsToGrid(searchItems: Set<PortfolioSearchItem | IndexSearchTreeItem | AdhocPortParams>): void {
        const existingPortTickers: string[] = this.localPortfolioConfigs.map(config => config.portfolio?.portName).filter(Boolean);
        let searchItemList: PortfolioSearchItem[] = ([...searchItems] as PortfolioSearchItem[]);
        // filter out the search items which are already present in the grid
        const duplicateTickers: PortfolioSearchItem[] = searchItemList.filter(searchItem => existingPortTickers.includes(searchItem.ticker));
        if (!!duplicateTickers.length) {
            this.notificationService.warning(`The following portfolios are already added: ${duplicateTickers.map((item: PortfolioSearchItem) => item.ticker).join(', ')}`, 'Duplicate Portfolios', null, true);
        }
        searchItemList = searchItemList.filter(searchItem => !existingPortTickers.includes(searchItem.ticker));
        // make a port search call for all search items to check if there are any invalid ones.
        const prodPortObs$ = this.portfolioSearchService.searchPortfolio$(searchItemList.map(searchItem => searchItem.ticker).join(' '), true, false, 'Loading Portfolios', true);
        prodPortObs$
            .pipe(map(ports => new Map(ports.searchResults.map(port => [port.ticker, port]))))
            .subscribe(validPorts => {
                const validItems = searchItemList.filter((item: PortfolioSearchItem) => validPorts.has(item.ticker));
                const invalidItems = searchItemList.filter((item: PortfolioSearchItem) => !validPorts.has(item.ticker));
                if (!validItems.length && !!invalidItems.length) {
                    this.addJobPortConfigsAndUpdateGrid([], {rowOp: JobPortRowOp.ADD, invalidItems});
                } else {
                    this.getPortObjectsAndUpdateGrid(
                        validItems.map(item => {
                            const jobPortConfig: JobPortfolioConfig = new JobPortfolioConfig();
                            jobPortConfig.portfolio = PortfolioService.getPortfolioObject(item);
                            return jobPortConfig;
                        }),
                        this.addJobPortConfigsAndUpdateGrid.bind(this),
                        {rowOp: JobPortRowOp.ADD, invalidItems}
                    );
                }
            });
    }

    /**
     * Initialize the grid with the given portfolios
     */
    initPortsInGrid(jobPortfolioConfigs: JobPortfolioConfig[]): void {
        this.getPortObjectsAndUpdateGrid(
            jobPortfolioConfigs,
            this.addJobPortConfigsAndUpdateGrid.bind(this),
            {rowOp: JobPortRowOp.INIT}
        );
    }

    /**
     * get portfolio info and execute the provided callback for it with the fetched data
     */
    getPortObjectsAndUpdateGrid(
        jobPortfolioConfigs: JobPortfolioConfig[],
        callback?: (portInfos: Portfolio[], callbackParams: JobPortConfigCallbackParams) => void,
        callbackParams?: JobPortConfigCallbackParams
    ): void {
        // add all portfolio items to grid logic
        const portInfoObsList: Observable<Portfolio>[] = jobPortfolioConfigs.map(jobPortfolioConfig => this.portfolioService.fetchPortfolioInformation$(
            jobPortfolioConfig.portfolio,
            {
                isLightVersion: jobPortfolioConfig.runAs === BatchExportRunAs.PORTGROUP,
                includeMandate: true
            },
            false,
            isAdhocPort(jobPortfolioConfig.portfolio) ? jobPortfolioConfig.portfolio.adhocParams : null,
            null,
            true
        ));
        forkJoin(portInfoObsList)
            .subscribe({
                next: portInfos => callback?.(portInfos, callbackParams),
                error: err => this.notificationService.error('Error fetching portfolio information: ' + err, 'Error', null, true)
            });
    }

    /**
     * callback method to add the job portfolio configs to the grid
     */
    private addJobPortConfigsAndUpdateGrid(portInfos: Portfolio[], callbackParams: JobPortConfigCallbackParams): void {
        // add the new job portfolio configs to the existing ones
        this.localPortfolioConfigs = [...(callbackParams.rowOp === JobPortRowOp.INIT ? [] : this.portfolioConfigs.map(portfolioConfig => {
            return this.convertToExploreHubJobPortfolio(portfolioConfig);
        })), ...portInfos.map(portInfo => {
            const jobPortfolioConfig: JobPortfolioConfig = new JobPortfolioConfig();
            jobPortfolioConfig.portfolio = portInfo;
            return jobPortfolioConfig;
        })];

        // update grid after adding to job portfolio configs
        this.gridApi.updateGridOptions({rowData: this.localPortfolioConfigs.map(this.convertToRowData.bind(this))});
        this.convertAndEmitPortfolioConfigs();

        // handle for invalid portfolio items
        const inValidItems: PortfolioSearchItem[] = callbackParams.invalidItems;
        if (inValidItems?.length) {
            this.notificationService.error(`The following portfolios are invalid: ${inValidItems.map((item: PortfolioSearchItem) => item.ticker).join(', ')}`, 'Invalid Portfolios', null, true);
        }
    }

    private convertToExploreHubJobPortfolio(portfolioConfig: ExportHubJobPortfolio) {
        const jobPortfolioConfig = new JobPortfolioConfig();
        jobPortfolioConfig.portfolio = PortfolioUtils.decodePortfolio(portfolioConfig.getPortfolioSetting_asB64());
        jobPortfolioConfig.runAs = (portfolioConfig.getRunAsType() === PORTFOLIOS_RUN_AS_TYPE) ? BatchExportRunAs.PORTFOLIOS : BatchExportRunAs.PORTGROUP;
        return jobPortfolioConfig;
    }

    /**
     * callback method to update the changed job portfolio config in the grid
     */
    private updateJobPortConfig(portInfos: Portfolio[], callbackParams: JobPortConfigCallbackParams): void {
        this.localPortfolioConfigs[callbackParams.rowIndex].portfolio = portInfos[0];
        this.convertAndEmitPortfolioConfigs();
    }

    private convertToRowData(jobPortfolioConfig: JobPortfolioConfig): JobPortRowData {
        return {
            portfolio: jobPortfolioConfig.portfolio.portName,
            runAs: jobPortfolioConfig.runAs === BatchExportRunAs.PORTFOLIOS ? 'Portfolios' : 'PortGroup',
            date: jobPortfolioConfig.portfolio.datePicker,
            currency: jobPortfolioConfig.portfolio.currency,
            benchmark: jobPortfolioConfig.portfolio.benchmark,
            portfolio_settings: {
                type: AuxIconTypeEnum['settings'],
                state: AuxIconStateEnum['tertiary-button'],
                isDisabled: false,
                onClick: this.openPortSettingsModal.bind(this)
            },
            actionButton: {
                type: AuxIconTypeEnum['delete'],
                state: AuxIconStateEnum['non-action'],
                isDisabled: false,
                onClick: this.deleteJobPortfolio.bind(this)
            }
        };
    }

    /**
     * Open the portfolio settings modal
     */
    private openPortSettingsModal(event: AuxIconCellRendererClickParams): void {
        this.selectedJobPortConfig = this.localPortfolioConfigs[event.node.rowIndex];
        this.isPortfolioSettingsModalOpen = true;
        this.cdRef.markForCheck();
    }

    /**
     * Close the portfolio settings modal
     */
    closePortSettingsModal(): void {
        this.isPortfolioSettingsModalOpen = false;
        this.selectedJobPortConfig = null;
        this.cdRef.markForCheck();
    }

    /**
     * Delete the job portfolio config from the grid
     */
    private deleteJobPortfolio(event: AuxIconCellRendererClickParams): void {
        // update grid after adding to job portfolio configs
        this.localPortfolioConfigs = this.localPortfolioConfigs.filter(portConfig => portConfig !== this.localPortfolioConfigs[event.node.rowIndex]);
        this.gridApi.updateGridOptions({rowData: this.localPortfolioConfigs.map(this.convertToRowData.bind(this))});
        this.convertAndEmitPortfolioConfigs();
    }

    /**
     * convert the local portfolio configs to ExportHubJobPortfolio and emit the same
     * @private
     */
    private convertAndEmitPortfolioConfigs(): void {
        this.portfolioConfigsChange.emit(this.localPortfolioConfigs.map(portfolioConfig => {
            const exportHubJobPortfolio = new ExportHubJobPortfolio();
            exportHubJobPortfolio.setJobPortfolioCode(portfolioConfig.portfolio.portCode);
            exportHubJobPortfolio.setJobPortfolioName(portfolioConfig.portfolio.portName);
            exportHubJobPortfolio.setPortfolioSetting(PortfolioUtils.encodePortfolio(portfolioConfig.portfolio));
            exportHubJobPortfolio.setRunAsType(BatchExportRunAs[portfolioConfig.runAs]);
            return exportHubJobPortfolio;
        }));
    }

    /**
     * can be called from parent component to validate the port record attributes
     */
    validatePortRecordAttributes(): string | null {
        const activeCellEditors = this.gridApi?.getCellEditorInstances();
        if (!activeCellEditors?.length) {
            return null;
        }

        if (activeCellEditors
            .filter(cellEditor => cellEditor instanceof DatePickerWithCalendarComponent)
            .map(cellEditor => cellEditor as DatePickerWithCalendarComponent)
            .some(dateCellEditor => !dateCellEditor.isValid)) {
            return 'Please complete the editing before proceeding to the next step.';
        }

        return null;
    }
}
