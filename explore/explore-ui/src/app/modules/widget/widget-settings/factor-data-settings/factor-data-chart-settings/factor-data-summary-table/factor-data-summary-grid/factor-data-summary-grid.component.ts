import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuxGridColumnType, AuxGridOptions} from '@blk/aladdin-angular-components';
import {
    CellClickedEvent,
    ColDef,
    GridApi,
    GridReadyEvent,
    ICellRendererParams,
    GetRowIdParams,
    EditableCallbackParams, ValueSetterParams
} from 'ag-grid-community';
import {ColumnConfig, ColumnConstants, ColumnType, SubscribableComponent} from '@blk/explore-ui-core';
import {ColumnOptionUtils, ColumnSet} from '@blk/explore-ui-column-option';
import {CoreRiskConstants, EconomySettings, RiskSettings} from '@blk/explore-ui-risk';
import {isEmpty, isNil} from 'lodash';
import {FactorDataChartSettingsStore} from '../../stores/factor-data-chart-settings.store';
import {takeUntil} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {ScenarioConstants, ScenarioUtils} from '@blk/explore-ui-extended-column-option';
import {FactorDataSummaryRowInterface} from './factor-data-summary-grid-row.interface';
import {ColumnUtils} from '@utils/column.utils';

/**
 *  Factor Summary Table Grid Component
 */
@Component({
    selector: 'app-factor-data-summary-grid',
    templateUrl: './factor-data-summary-grid.component.html',
    styleUrls: ['./factor-data-summary-grid.component.scss']
})
export class FactorDataSummaryGridComponent extends SubscribableComponent implements OnInit {

    readonly FACTOR_KEY = 'factorKey';
    readonly FACTOR_PERM = 'factorPerm';

    @Input()
    columnType: ColumnType;
    @Input()
    showGridLoadingOverlay$: BehaviorSubject<boolean>;
    @Output()
    editFactorSettingsModalOpened = new EventEmitter<string>();

    gridOptions: AuxGridOptions;
    gridApi: GridApi;
    selectedRowId: string = null;

    ngOnInit(): void {
        this.initializeGridOptions();
        FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(this.columnType)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((reDraw: boolean) => {
                if (reDraw && this.gridApi) {
                    if (!isNil(this.selectedRowId)) {
                        // This if condition will work when the factor is updated when Done button is clicked on EditFactorSettingsModal.
                        // Update the column in the grid
                        const column = this.getColumns().find(col => col.columnKey === this.selectedRowId);
                        this.gridApi.applyTransaction({ update: [ this.getRow(column) ] });
                        this.selectedRowId = null;
                    } else {
                        this.resetGrid();
                    }
                } else {
                    // Reset selectedRowId when Cancel button is clicked on EditFactorSettingsModal.
                    this.selectedRowId = null;
                }
            });
        this.showGridLoadingOverlay$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((showOverlay: boolean) => {
                if (this.gridApi) {
                    showOverlay ? this.gridApi.showLoadingOverlay() : this.gridApi.hideOverlay();
                }
            });
    }

    private resetGrid(): void {
        this.hideColumns();
        this.hideFactorPermColumn();
        const rowData = this.getRowData() ?? [];
        this.gridApi.updateGridOptions({rowData});

        // isApplyButtonDisabled$ handles the condition if no columns present, disable the Done button on widget-settings-modal
        FactorDataChartSettingsStore.isApplyButtonDisabled$.next(true);
    }

    private initializeGridOptions(): void {
        this.gridOptions = {
            onGridReady: this.onGridReady,
            defaultColDef: {
                filter: true,
                sortable: false,
                resizable: true,
                suppressHeaderMenuButton: true,
                floatingFilter: false,
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                filterParams: {
                    maxNumConditions: 1,
                    suppressAndOrCondition: true
                },
                menuTabs: ['filterMenuTab'],
            },
            suppressContextMenu: true,
            ensureDomOrder: true,
            singleClickEdit: true,
            columnDefs: this.getColumnDefs(),
            getRowId: this.getRowId,
        } as any;
    }

    private getColumns(): ColumnConfig[] {
        return (FactorDataChartSettingsStore.inputs.get(this.columnType) as ColumnSet).columns;
    }

    /**
     * Hide riskSettings columns in the grid
     */
    private hideColumns(): void {
        const hide = FactorDataChartSettingsStore.getHideFactorColumnRiskSettings$(this.columnType).getValue();
        this.gridApi.setColumnsVisible([ CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME, CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.PERIOD, CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DECAY_FACTOR ], !hide);
    }

    private hideFactorPermColumn(): void {
        // Hide Factor Permission column in the grid
        const showFactorPerm = ColumnUtils.checkToShowFactorLevelPermissionColumn(FactorDataChartSettingsStore.factorTimeSeriesSelectedOption.getValue());
        this.gridApi.setColumnsVisible([ this.FACTOR_PERM ], showFactorPerm);
    }

    /**
     * Callback to initialize the grid APIs
     */
    protected onGridReady = (event: GridReadyEvent): void => {
        this.gridApi = event.api;
        this.resetGrid();
    };

    /**
     * Emit event editFactorSettingsModalOpened to open the EditFactorSettingsModal
     * @param event CellClickedEvent
     */
    onCellClicked = (event: CellClickedEvent): void => {
        this.selectedRowId = event.data[this.FACTOR_KEY];
        this.editFactorSettingsModalOpened.emit(this.selectedRowId);
    }

    /**
     * Delete the factor row from the grid and from the columnSet
     */
    deleteRow(params: ICellRendererParams): void {
        const columnIdx = this.getColumns().findIndex(col => col.columnKey === params.data[this.FACTOR_KEY]);
        if (columnIdx > -1) {
            // delete from columnSet
            this.getColumns().splice(columnIdx, 1);
            // delete from grid
            this.gridApi.applyTransaction({ remove: [{ factorKey: params.data[this.FACTOR_KEY] }] });

            // isApplyButtonDisabled$ handles the condition if no columns present, disable the Done button on widget-settings-modal
            if (this.getColumns().length === 0) {
                FactorDataChartSettingsStore.isApplyButtonDisabled$.next(true);
            }
        }
    }

    /**
     * Sets the rowId to FactorKey
     */
    getRowId = (params: GetRowIdParams): string => {
        return params.data[this.FACTOR_KEY];
    }

    private getRowData(): FactorDataSummaryRowInterface[] {
        return this.getColumns().map((col: ColumnConfig) => this.getRow(col));
    }

    private getRow(col: ColumnConfig): FactorDataSummaryRowInterface {
        const riskSettingsProps = this.getEconomyProperties(col);
        const factorName = this.getFactorName(col);
        return {
            factorKey: col.columnKey,
            factorName,
            factorTag: ScenarioUtils.getColumnFactorTag(col),
            weightingScheme: riskSettingsProps.weightingScheme,
            period: riskSettingsProps.period,
            decayFactor: riskSettingsProps.decayFactor,
            factorPerm: this.getFactorPerm(col, factorName),
        };
    }

    private getFactorName(col: ColumnConfig): string {
        return ColumnOptionUtils.getCustomTitle(col) || col.columnTitle;
    }

    private getFactorPerm(col: ColumnConfig, factorName: string): string {
        return (factorName.includes(ScenarioConstants.NO_PERMISSION_TITLE, 0) || FactorDataChartSettingsStore.factorTagToPermissionMap.get(col.columnTag)) ? 'No' : 'Yes';
    }

    /**
     * Gets EconomyRiskSettings properties for showing in grid
     */
    private getEconomyProperties(col: ColumnConfig): { weightingScheme: string, period: number, decayFactor: number } {
        const riskSettings = col.optionValues.find(optionValue => optionValue.configType === RiskSettings.CONFIG_TYPE);
        if (isNil(riskSettings)) {
            return { weightingScheme: undefined, period: undefined, decayFactor: undefined };
        }
        const economyRiskSettings = (riskSettings as RiskSettings).economyRiskSettings;
        return {
            weightingScheme: this.getPropertyValue(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME, economyRiskSettings) as string,
            period: this.getPropertyValue(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.PERIOD, economyRiskSettings) as number,
            decayFactor: this.getPropertyValue(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DECAY_FACTOR, economyRiskSettings) as number,
        };
    }

    /**
     * Gets economySettings property value
     */
    private getPropertyValue(key: string, economySettings: EconomySettings): string | number {
        if (isNil(economySettings)) {
            return undefined;
        }
        if (economySettings['_' + key]) {
            return economySettings['_' + key];
        }
        return this.getPropertyValue(key, economySettings.parentRiskSettings as EconomySettings);
    }

    /**
     * Grid cell renderer for delete icon
     */
    deleteCellRenderer(params: ICellRendererParams): HTMLElement {
        // Create the x icon for deleting a row in grid
        const deleteIcon = document.createElement('aux-icon');
        deleteIcon.setAttribute('type', 'delete');
        deleteIcon.setAttribute('state', 'secondary');
        deleteIcon.addEventListener('click', () => this.deleteRow(params));

        // must place icon inside wrapper in order to center in cell
        const iconWrapper = document.createElement('div');
        iconWrapper.style.height = '100%';
        iconWrapper.style.display = 'flex';
        iconWrapper.style.alignItems = 'center';
        iconWrapper.style.justifyContent = 'center';
        iconWrapper.appendChild(deleteIcon);

        return iconWrapper;
    }

    private getColumnDefs(): ColDef[] {
        return [
            {
                field: this.FACTOR_KEY,
                hide: true,
            },
            {
                headerName: ColumnConstants.FACTOR_NAME,
                field: 'factorName',
                flex: 1,
                minWidth: 120,
                onCellClicked: this.onCellClicked,
                suppressHeaderMenuButton: false,
            },
            {
                headerName: 'Factor Tag',
                field: 'factorTag',
                flex: 1,
                minWidth: 120,
                filter: 'agTextColumnFilter',
                suppressHeaderMenuButton: false,
                editable: (params: EditableCallbackParams) => {
                    return this.isCustomFactorRow(params.node.data);
                },
                valueSetter: (params: ValueSetterParams) => {
                    params.data['factorTag'] = params.newValue;
                    const col = this.getColumnForRow(params);
                    col.columnTag = !isEmpty(params.newValue) ? params.newValue : ColumnConstants.CUSTOM_FACTOR_TAG;
                    return true;
                },
            },
            {
                headerName: CoreRiskConstants.LABEL.WEIGHTING_SCHEME,
                field: CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME,
                flex: 1,
                minWidth: 120,
                onCellClicked: this.onCellClicked,
                filter: false,
            },
            {
                headerName: CoreRiskConstants.LABEL.PERIOD,
                field: CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.PERIOD,
                flex: 1,
                minWidth: 120,
                onCellClicked: this.onCellClicked,
                filter: false,
            },
            {
                headerName: CoreRiskConstants.LABEL.HALF_LIFE,
                field: CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DECAY_FACTOR,
                flex: 1,
                minWidth: 120,
                onCellClicked: this.onCellClicked,
                filter: false,
            },
            {
                headerName: 'Factor Permission',
                field: this.FACTOR_PERM,
                flex: 1,
                minWidth: 120,
                suppressHeaderMenuButton: false,
            },
            {
                headerName: '',
                field: 'deleteCol',
                width: 30,
                resizable: false,
                suppressSizeToFit: true,
                filter: false,
                cellRenderer: params => this.deleteCellRenderer(params)
            },
        ];
    }

    private getColumnForRow(params: any): ColumnConfig {
        const rowId = this.getRowId(params);
        return this.getColumns().find(column => column.columnKey === rowId);
    }

    private isCustomFactorRow(data: any): boolean {
        return ScenarioUtils.isCustomFactorColumn(data?.[this.FACTOR_KEY]);
    }

}
