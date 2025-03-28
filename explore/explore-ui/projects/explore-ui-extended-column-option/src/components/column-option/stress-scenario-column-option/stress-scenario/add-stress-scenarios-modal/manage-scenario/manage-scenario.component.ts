import {ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Optional, Output} from '@angular/core';
import {
    AuxGridColumnType,
    AuxGridConstants,
    AuxGridOptions,
    AuxSearchFieldSearchValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {CellClassParams, CellStyle, ColDef, GetRowIdParams, GridApi, GridReadyEvent, ICellRendererParams, IRowNode, RowDataUpdatedEvent, RowNode} from 'ag-grid-community';
import {isEmpty} from 'lodash';
import {takeUntil} from 'rxjs/operators';
import {BehaviorSubject, finalize} from 'rxjs';
import {
    AlertConstants,
    CommonUtils,
    DateValue,
    ExploreDialogParam,
    DateService,
    DateFormatConstants,
    DateStore,
    CalendarDateUtils,
    NOTIFICATION_SERVICE_TOKEN,
    NotificationServiceInterface,
    SubscribableComponent,
} from '@blk/explore-ui-core';
import {ScenarioResponse} from '../../../../../../interfaces/scenario-response.interface';
import {StressScenarioService} from '../../../../../../services/stress-scenario.service';
import {ScenarioUtils} from '../../../../../../utils/scenario.utils';
import {ScenarioConstants} from '../../../../../../constants/scenario.constant';
import {ScenarioCategoryEnum} from '../../../../../../enums/scenario-category.enum';
import {ScenarioColumnOption} from '@blk/explore-ui-column-option';

@Component({
    selector: 'explore-extended-column-option-manage-scenario',
    templateUrl: './manage-scenario.component.html',
    styleUrls: ['./manage-scenario.component.scss']
})
/**
 * This component contains elements to render for managing scenarios
 * It is rendered inside the AddStressScenariosModal
 */
export class ManageScenarioComponent extends SubscribableComponent implements OnInit {

    private readonly ACTION_COL_KEY = 'actionCol';
    private readonly ADD_SCENARIOS_LABEL_DEFAULT = 'Add Scenarios (#)';

    @Input()
    optionValue: ScenarioColumnOption;
    @Input()
    lookBackDate: DateValue;
    @Input()
    showSpinner$: BehaviorSubject<boolean>;
    @Input()
    openCreateScenarioModalEmitter: EventEmitter<ScenarioResponse>;
    @Input()
    allowNamedScenarioSingleSelection: boolean;
    @Input()
    isScenarioCreationDisabled: boolean;
    @Input()
    disableCreateScenarioButton: boolean;
    @Output()
    closeManageScenarioModal = new EventEmitter();

    gridOptions: AuxGridOptions;
    private gridApi: GridApi;
    private searchTerm: string;

    @Input()
    promptDialog$: BehaviorSubject<ExploreDialogParam>;

    newSelectedScenariosCount = 0;
    addScenarioLabel: string;

    private clearPreviousSingleSelectOnRender = false;

    private previousLookBackDate: string;

    constructor(private stressScenarioService: StressScenarioService, private dateService: DateService, @Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) protected notificationService: NotificationServiceInterface, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.updateAddScenariosButtonLabel();
        this.initGridOptions();
    }

    /**
     * Action taken when the look back date is changed
     * @param dateObject has the new date
     */
    onDateChange(dateObject: DateValue): void {
        this.lookBackDate = dateObject;
        this.loadScenarios();
    }

    /**
     * This is called when search value is changed in the aux search field
     * This applies external filter to scenario grid
     */
    onSearchValueChanged(event: CustomEvent<AuxSearchFieldSearchValueChangedDetailInterface>): void {
        this.searchTerm = event.detail.submitValue.searchValue?.toLowerCase();
        if (this.gridApi) {
            if (!isEmpty(this.searchTerm)) {
                this.gridApi.expandAll();
            } else {
                this.defaultExpandNodes();
            }
            this.gridApi.onFilterChanged();
        }
    }

    /**
     * This will be called when create scenario button is clicked
     * It will open new modal to create a scenario
     */
    onCreateScenarioClicked(): void {
        this.openCreateScenarioModalEmitter.emit(undefined);
    }

    /**
     * Clear all selected rows in grid
     * @private
     */
    private clearAllSelection(): void {
        this.gridApi.deselectAll();
    }

    /**
     * On add scenarios button click, opens the prompt dialog for Adding scenarios
     */
    onAddScenariosClicked(): void {
        const scenarioRows: ScenarioResponse[] = this.gridApi.getSelectedRows();
        this.showDialog(
            AlertConstants.TYPE.PROMPT,
            AlertConstants.HEADER.ADD_SCENARIOS,
            AlertConstants.BODY.ADD_SCENARIOS.replace('#', String(this.newSelectedScenariosCount)),
            AlertConstants.BTN.ADD,
            this.addSelectedScenariosToList,
            scenarioRows
        );
    }

    /**
     * Marks the scenario row as selected
     * @param data
     * @private
     */
    private markScenarioAsSelected(data: ScenarioResponse): void {
        // Add option if present is always first element in list
        if (data.actionCol.inlineMenuData[0][0].key === 'add') {
            data.actionCol.inlineMenuData[0][0].isDisabled = true;
        }
        data.scenarioSelected = true;
    }

    /**
     * To identify if it is a scenario row and not the block or scenario category
     * @param data
     * @private
     */
    private isScenarioRow(data: ScenarioResponse): boolean {
        return !isEmpty(data?.scenarioCode);
    }

    private initGridOptions(): void {
        this.gridOptions = {
            rowSelection: this.allowNamedScenarioSingleSelection ? 'single' : 'multiple',
            suppressRowClickSelection: true,
            suppressContextMenu: true,
            suppressGroupRowsSticky: true,
            treeData: true,
            defaultColDef: {
                sortable: false,
                resizable: true,
                suppressHeaderMenuButton: false,
                filter: true,
                floatingFilter: false,
                filterParams: {
                    maxNumConditions: 1,
                    suppressAndOrCondition: true
                },
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                menuTabs: [ 'filterMenuTab' ],
            },
            autoGroupColumnDef: {
                headerName: 'Scenario',
                field: 'scenarioName',
                flex: 2,
                cellRendererParams: {
                    suppressCount: true
                },
                cellStyle: (params: CellClassParams): any => {
                    // To make scenario category text bold
                    return !isEmpty(params.data?.level) && Object.values(ScenarioCategoryEnum).includes(params.data.level) ? { 'font-weight': 'bold' } : null;
                },
                tooltipValueGetter: (params) => {
                    return this.isScenarioRow(params?.node?.data) ? params.value : undefined;
                },
            },
            onGridReady: this.onGridReady,
            columnDefs: this.getColumnDefs(),
            getDataPath: this.getDataPath,
            isExternalFilterPresent: this.isExternalFilterPresent,
            doesExternalFilterPass: this.doesExternalFilterPass,
            getRowId: (params: GetRowIdParams) => this.getRowId(params.data),
            onRowDataUpdated: this.onRowDataUpdated,
            tooltipShowDelay: 2000,
        };
    }

    private updateAddScenariosButtonLabel(): void {
        this.addScenarioLabel = this.newSelectedScenariosCount > 0 ? this.ADD_SCENARIOS_LABEL_DEFAULT.replace('#', String(this.newSelectedScenariosCount)) : this.ADD_SCENARIOS_LABEL_DEFAULT;
    }

    /**
     * Returns unique rowId based on scenarioResponse data for Grid
     */
    private getRowId(params: ScenarioResponse): string {
        if (isEmpty(params)) {
            return CommonUtils.generateUniqueIdAsString(5);
        }
        return isEmpty(params.scenarioCode) ? params.level : params.level + ScenarioConstants.PATH_SEPARATOR + params.scenarioCode;
    }

    private showDialog(type: string, header: string, message: string, primaryButtonLabel?: string, dialogCallBack1?: any, dialogCallBackArgs?: any): void {
        this.promptDialog$.next(
            new ExploreDialogParam(
                type,
                header,
                message,
                primaryButtonLabel,
                AlertConstants.BTN.CANCEL,
                dialogCallBack1,
                undefined,
                dialogCallBackArgs,
            ));
    }

    private getColumnDefs(): ColDef[] {
        const colDefs: any[] = [
            {
                field: 'level',
                hide: true,
            },
            {
                headerName: 'Description',
                field: 'scenarioDesc',
                flex: 2,
                tooltipValueGetter: (params) => {
                    return params.value;
                },
            },
            {
                headerName: 'Creator',
                field: 'scenarioPurpose',
                flex: 1,
                sortable: true,
                sort: 'asc',
            },
            {
                headerName: 'Created Date',
                field: 'scenarioCreatedDate',
                flex: 1,
            },
            {
                headerName: '',
                field: 'checkboxCol',
                filter: false,
                suppressHeaderMenuButton: true,
                suppressSizeToFit: true,
                headerClass: AuxGridConstants.AUX_CENTER_ALIGN_HEADER_NO_LABEL as string,
                cellClass: AuxGridConstants.AUX_CENTER_ALIGN_CELL as string,
                cellStyle: (_cellClassParams: CellClassParams): CellStyle => {
                    return !this.allowNamedScenarioSingleSelection ? undefined : { 'padding': '0 0 1rem 0.5rem' };
                },
                minWidth: 32,
                maxWidth: 32,
                pinned: 'left',
                cellRenderer: (params: ICellRendererParams) => this.checkBoxCellRenderer(params),
            },
        ];
        if (!this.isScenarioCreationDisabled) {
            const actionColDef: ColDef = {
                headerName: '',
                field: this.ACTION_COL_KEY,
                type: AuxGridColumnType. AUX_ACTION_COLUMN,
                minWidth: 33,
                maxWidth: 33,
                filter: false,
                suppressHeaderMenuButton: true,
                suppressSizeToFit: true,
                cellStyle: (params: CellClassParams): CellStyle => {
                    return this.isScenarioRow(params.node.data) ? { 'padding-left': '0.5rem', 'padding-right': '0.5rem'} : { 'content-visibility' : 'hidden' };
                },
                pinned: 'left',
            };
            colDefs.push(actionColDef);
        }
        return colDefs;
    }

    private checkBoxCellRenderer = (params: ICellRendererParams): HTMLElement => {
        // Does not render anything for non-scenario rows
        if (!this.isScenarioRow(params.node.data)) {
            return undefined;
        }

        let elementTagName: string;
        let elementEventMethod: string;
        let isDisabled = false;

        if (!this.allowNamedScenarioSingleSelection) {
            elementTagName = 'aux-checkbox';
            elementEventMethod = 'checkboxChanged';
            // If the scenarioSelected is true, we want to mark the icon as checked and disabled
            isDisabled = params.node.data.scenarioSelected;
        } else {
            elementTagName = 'aux-radio';
            elementEventMethod = 'radioChanged';
            if (params.node.data.scenarioSelected) {
                if (this.clearPreviousSingleSelectOnRender) {
                    this.clearPreviousSingleSelectOnRender = false;
                } else {
                    params.node.setSelected(true);
                }
                // Clear scenarioSelected on render of row nodes so that radio button gets checked only when row is selected since we are using single selection on grid
                params.node.data.scenarioSelected = false;
            }
        }

        // Create the icon for selecting a row in grid
        const icon: any = document.createElement(elementTagName);
        icon.isDisabled = isDisabled;
        icon.isChecked = params.node.isSelected() || params.node.data.scenarioSelected;
        icon.addEventListener(elementEventMethod, (event: CustomEvent) => this.onCheckBoxChanged(event?.detail?.value?.checked, params));

        // must place icon inside wrapper in order to center in cell
        const iconWrapper = document.createElement('div');
        iconWrapper.style.height = '100%';
        iconWrapper.style.display = 'flex';
        iconWrapper.style.alignItems = 'center';
        iconWrapper.style.justifyContent = 'center';
        iconWrapper.appendChild(icon);

        return iconWrapper;
    };

    /**
     * checkbox changed event handler
     * sets the row as selected if checked and updates the count of selected scenarios
     * @param checked
     * @param params
     */
    private onCheckBoxChanged = (checked: boolean, params: ICellRendererParams) => {
        let previousSelectedNodes: IRowNode[];
        if (checked) {
            if (this.allowNamedScenarioSingleSelection) {
                previousSelectedNodes = params.api.getSelectedNodes();
                this.newSelectedScenariosCount -= previousSelectedNodes.length;
                if (this.newSelectedScenariosCount > 0) {
                    // Handle case when some new scenario is checked and the previous selected scenario did not render yet
                    // Set the flag to clear the previous selected scenario since its data.scenarioSelected would have been true
                    this.newSelectedScenariosCount = 0;
                    this.clearPreviousSingleSelectOnRender = true;
                }
            }
            this.newSelectedScenariosCount++;
        } else {
            this.newSelectedScenariosCount--;
        }
        params.node.setSelected(checked);
        if (previousSelectedNodes) {
            // When checked and allowNamedScenarioSingleSelection, refresh the previousSelectedNodes for the radio button to become unchecked
            params.api.refreshCells({ rowNodes: previousSelectedNodes, force: true });
        }
        this.updateAddScenariosButtonLabel();
        this.changeDetectorRef.markForCheck();
    };

    /**
     * Grid uses this method to apply filter only when search field is not empty
     */
    private isExternalFilterPresent = (): boolean => {
        // if searchTerm is not empty, then we are filtering
        return !isEmpty(this.searchTerm);
    };

    /**
     * Applying external filter on scenario rows only for two columns - scenario and creator
     * @param node
     */
    private doesExternalFilterPass = (node: IRowNode<ScenarioResponse>): boolean => {
        // only apply for scenarios not for blocks
        if (this.isScenarioRow(node.data)) {
            const searchTerms = this.searchTerm.split(' ');
            for (const term of searchTerms) {
                let compareString = node.data.scenarioName + ' ' + node.data.scenarioPurpose;
                compareString = compareString.toLowerCase();
                if (compareString.includes(term)) {
                    return true;
                }
            }
        }
        return false;
    };

    private getDataPath = (data: ScenarioResponse): string[] => {
        return !isEmpty(data?.level) ? data.level.split(ScenarioConstants.PATH_SEPARATOR) : [];
    };

    /**
     * When row data is updated calls the method to set the default nodes expand levels
     * @param _event
     */
    private onRowDataUpdated = (_event: RowDataUpdatedEvent): void => {
        this.defaultExpandNodes();
    };


    /**
     * When the Add button is clicked on the prompt dialog and when it was called from Add scenarios button click
     * The selected scenarios are added and the AddStressScenarioModal closes and shows the widget settings page
     * @param scenarioRows
     */
    private addSelectedScenariosToList = (scenarioRows: ScenarioResponse[]): void => {
        if (this.allowNamedScenarioSingleSelection) {
            this.optionValue.nameScenarios = [];
        }
        scenarioRows.forEach(row => this.addSingleScenarioToList(row));
        this.promptDialog$.next(null);
        this.closeManageScenarioModal.emit();
    };

    /**
     * When delete scenario option on AuxActionCol Menu is clicked, a warning dialog opens with options Delete or Cancel
     * For now it does not take any action on Delete clicked inside delete warning dialog
     * @param params
     */
    private onDeleteScenarioClicked = (params: ScenarioResponse): void => {
        this.showDialog(
            AlertConstants.TYPE.ALERT_WITH_OPTIONS,
            AlertConstants.HEADER.DELETE_SCENARIO,
            AlertConstants.BODY.DELETE_SCENARIO.replace('#', params.scenarioName),
            AlertConstants.BTN.DELETE,
        );
    };

    /**
     * When add scenario option on AuxActionCol Menu is clicked, a prompt dialog opens with options to Add or Cancel
     * @param params
     */
    private onAddScenarioClicked = (params: ScenarioResponse): void => {
        this.showDialog(
            AlertConstants.TYPE.PROMPT,
            AlertConstants.HEADER.ADD_SCENARIO,
            AlertConstants.BODY.ADD_SCENARIO.replace('#', params.scenarioName),
            AlertConstants.BTN.ADD,
            this.callbackToAddScenarioClicked,
            params
        );
    }

    /**
     * The callback action taken when Add button is clicked when add option on AuxActionCol Menu was selected
     * Deselects the row if it was selected and mark it as selected to avoid adding duplicates
     * Set the row checkbox as checked and disabled. It also disables the add scenario button on Action Column menu
     * @param params
     */
    private callbackToAddScenarioClicked = (params: ScenarioResponse): void => {
        this.addSingleScenarioToList(params);
        const rowNode: IRowNode = this.gridApi.getRowNode(this.getRowId(params));

        if (rowNode.isSelected()) {
            // This is for the case when checkbox is checked, it is done to avoid adding this scenario further
            rowNode.setSelected(false);
            this.newSelectedScenariosCount--;
            this.updateAddScenariosButtonLabel();
        }
        this.markScenarioAsSelected(rowNode.data);

        // To refresh the row checkbox cell renderer
        this.gridApi.refreshCells({ rowNodes: [rowNode], force: true });
        this.changeDetectorRef.markForCheck();
    };

    /**
     * Helper method to add a single scenario to the scenarios list
     * @param scenarioRow
     */
    private addSingleScenarioToList = (scenarioRow: ScenarioResponse): void => {
        const scenario = ScenarioUtils.createNamedScenarioFromScenarioResponse(scenarioRow);
        this.optionValue.nameScenarios.push(scenario);
    };

    /**
     * When edit scenario option on AuxActionCol Menu is clicked
     * @param params ScenarioResponse
     */
    private onEditScenarioClicked = (params: ScenarioResponse): void => {
        this.openCreateScenarioModalEmitter.emit(params);
    }

    /**
     * Creates the Aux-Inline-Menu data for Action Column
     * Registers the callbacks to each menu option
     */
    private getActionColMenuOptions = (params: ScenarioResponse): void => {
        const addOption = {
            label: 'Add Scenario',
            key: 'add',
            eventData: this.onAddScenarioClicked,
        };
        let optionsData = [];
        if (!this.allowNamedScenarioSingleSelection) {
            optionsData.push(addOption);
        }
        optionsData = [
            ...optionsData,
            {
                label: 'Edit Scenario',
                key: 'edit',
                eventData: this.onEditScenarioClicked,
            },
            // TODO Hide the delete scenario option for now until delete scenario api in integrated
            // {
            //     label: 'Delete Scenario',
            //     key: 'delete',
            //     eventData: this.onDeleteScenarioClicked,
            // },
        ];
        params.actionCol = {
            inlineMenuData: [optionsData],
            inlineMenuItemClicked: (event: any) => {
                if (event?.detail?.element?.eventData) {
                    event.detail.element.eventData(params);
                }
            },
        };
    };

    /**
     * This expands the scenario block rowNodes -
     * Expands the first top Node and its first children node
     */
    private defaultExpandNodes = (): void => {
        this.gridApi.collapseAll();

        const topNode = this.gridApi.getRowNode(ScenarioConstants.ALADDIN_SCENARIOS) as RowNode;
        topNode?.setExpanded(true);
    };

    /**
     * Callback to initialize the grid APIs
     */
    private onGridReady = (event: GridReadyEvent): void => {
        this.gridApi = event.api;
        this.loadScenarios();
    };


    /**
     * This method parses the lookBackDate and loads the scenarios
     */
    private loadScenarios = (): void => {
        if (!this.lookBackDate.dateString) {
            this.loadScenariosHelper(this.lookBackDate.date);
            return;
        }
        this.showSpinner$.next(true);
        this.dateService.parseDateString$(DateStore.getCurrentDate().calCode, this.lookBackDate.dateStringValue)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (response: Date) => {
                    this.showSpinner$.next(false);
                    this.loadScenariosHelper(response);
                },
                error: () => {
                    this.showSpinner$.next(false);
                    this.notificationService?.error(AlertConstants.DATE_SERVICE_ERROR);
                },
            });
    };

    /**
     * This method calls the stress scenario service to load scenarios for lookBackDate
     * @param date the lookBackDate
     */
    private loadScenariosHelper = (date: Date | string) => {
        const lookBackDate = CalendarDateUtils.getDateInFormat(date, DateFormatConstants.MMDDYYYY_SLASH);
        if (this.previousLookBackDate === lookBackDate) {
            return;
        }
        this.showSpinner$.next(true);
        this.previousLookBackDate = lookBackDate;

        this.newSelectedScenariosCount = 0;

        this.stressScenarioService.fetchScenarios$(lookBackDate)
            .pipe(
                takeUntil(this.ngUnsubscribe),
                finalize(() => {
                    this.updateAddScenariosButtonLabel();
                    this.showSpinner$.next(false);
                    this.changeDetectorRef.markForCheck();
                }),
            )
            .subscribe({
                next: (data: ScenarioResponse[]) => {
                    const scenarioCodes = new Set();
                    this.optionValue.nameScenarios.forEach(scenario => scenarioCodes.add(ScenarioUtils.getScenarioCodeForCheckingIfScenarioSelected(scenario.code)));

                    data.forEach(scenario => {
                        if (!this.isScenarioRow(scenario)) {
                            return;
                        }
                        // make level unique
                        scenario.level = scenario.level + ScenarioConstants.SCENARIO_CODE_SEPARATOR + scenario.scenarioCode;

                        scenario.scenarioSelected = false;
                        this.getActionColMenuOptions(scenario);

                        if (ScenarioUtils.getCategoryFromScenarioResponse(scenario) !== ScenarioCategoryEnum.TEAM_SCENARIOS) {
                            scenario.scenarioPurpose = undefined;
                        }
                        // If scenario is already present in scenarios list, mark it as selected to avoid adding it again
                        if (scenarioCodes.has(scenario.scenarioCode)) {
                            if (this.allowNamedScenarioSingleSelection) {
                                this.newSelectedScenariosCount++;
                            }
                            this.markScenarioAsSelected(scenario);
                        }
                    });
                    // Clear all previously selected scenarios as data may be change and user would have to reselect scenarios
                    this.clearAllSelection();
                    this.gridApi.updateGridOptions({rowData: data});
                },
                error: () => {
                    this.notificationService?.error(ScenarioConstants.ERROR_WHILE_LOADING_SCENARIOS);
                }
            });
    }

}
