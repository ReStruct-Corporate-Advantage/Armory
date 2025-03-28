import {Directive, Inject, Optional} from '@angular/core';
import {
    ColumnConfig, ColumnConstants,
    NOTIFICATION_SERVICE_TOKEN,
    NotificationServiceInterface,
    SubscribableComponent
} from '@blk/explore-ui-core';
import {AuxGridColumnType, AuxGridOptions} from '@blk/aladdin-angular-components';
import {
    ColDef,
    EditableCallbackParams,
    GetRowIdParams,
    GridApi,
    GridReadyEvent,
    ValueSetterParams
} from 'ag-grid-community';
import {FactorDefinitionsService} from '../../services/factor-definitions.service';
import {ShockSettingColumnOption} from '../../models/column-option/shock-setting-column-option.model';
import {ScenarioUtils} from '../../utils/scenario.utils';
import {isEmpty} from 'lodash';
import {FactorDataUtils} from '../../utils/factor-data.utils';

@Directive()
export abstract class BaseFactorShockSummaryComponent extends SubscribableComponent {

    readonly FACTOR_KEY = 'factorKey';
    readonly FACTOR_TAG = 'factorTag';

    gridOptions: AuxGridOptions;
    gridApi: GridApi;
    isLoading = false;

    constructor(protected factorDefinitionsService: FactorDefinitionsService, @Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) protected notificationService: NotificationServiceInterface) {
        super();
    }

    protected initializeGridOptions(): void {
        this.gridOptions = {
            onGridReady: this.onGridReady.bind(this),
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
            columnDefs: this.getColumnDefs(),
            getRowId: this.getRowId,
            singleClickEdit: true,
            rowData: [],
        };
    }

    protected getColumnDefs(): ColDef[] {
        return [
            {
                field: this.FACTOR_KEY,
                hide: true,
                filter: false,
            },
            {
                headerName: 'Factor',
                field: 'factorName',
                flex: 4,
                filter: 'agTextColumnFilter',
                suppressHeaderMenuButton: false,
            },
            {
                headerName: 'Factor Tag',
                field: this.FACTOR_TAG,
                flex: 4,
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
            }];
    }

    /**
     * Callback to initialize the grid APIs
     */
    private onGridReady(event: GridReadyEvent): void {
        this.gridApi = event.api;
        this.doOnGridReady();
    }

    protected abstract doOnGridReady(): void;

    protected abstract getColumns(): ColumnConfig[];

    protected setFactorsDataInGrid(): void {
        const columns = this.getColumns();

        if (columns.length === 0) {
            return;
        }
        this.addShockColumnOptionToColumns(columns);

        const rowData = this.getRowData(columns);
        this.gridApi?.updateGridOptions({rowData});
    }

    protected updateRowDataForSelectedFactors(columns: ColumnConfig[]): void {
        const rows = this.getRowData(columns);
        this.gridApi.applyTransactionAsync({ update: rows });
    }

    protected getRowData(columns: ColumnConfig[]): any[] {
        return columns.map((column: ColumnConfig) => {
            return this.getSingleRowData(column);
        });
    }

    protected getSingleRowData(column: ColumnConfig): any {
        const shockColumnOption = column.optionValues.find(optionValue => optionValue.configType === ShockSettingColumnOption.CONFIG_TYPE) as ShockSettingColumnOption;
        return {
            factorKey: column.columnKey,
            factorName: FactorDataUtils.getFactorName(column),
            factorTag: ScenarioUtils.getColumnFactorTag(column),
            shock: shockColumnOption.shock,
            shockUnit: shockColumnOption.shockUnit,
        };
    }

    protected updateColumnShockUnit(column: ColumnConfig, shockUnit: string): void {
        const shockColumnOption = column.optionValues.find(optionValue => optionValue.configType === ShockSettingColumnOption.CONFIG_TYPE) as ShockSettingColumnOption;
        shockColumnOption.shockUnit = shockUnit;
    }

    /**
     * Sets the rowId to FactorKey
     */
    protected getRowId = (params: GetRowIdParams): string => {
        return params.data[this.FACTOR_KEY];
    }

    protected getShockColumnOption(params: any): ShockSettingColumnOption {
        const column = this.getColumnForRow(params);
        return column.optionValues.find(optionValue => optionValue.configType === ShockSettingColumnOption.CONFIG_TYPE) as ShockSettingColumnOption;
    }

    /**
     * Delete the factor row from the grid and from the columnSet
     */
    protected deleteRow(columnKey: string): void {
        // delete from grid
        const node: any = {};
        node[this.FACTOR_KEY] = columnKey;
        this.gridApi.applyTransaction({ remove: [ node ] });

        // delete from columnSet
        const columnIdx = this.getColumns().findIndex(col => col.columnKey === columnKey);
        if (columnIdx !== -1) {
            this.getColumns().splice(columnIdx, 1);
        }
    }

    private getColumnForRow(params: any): ColumnConfig {
        const rowId = this.getRowId(params);
        return this.getColumns().find(column => column.columnKey === rowId);
    }

    private isCustomFactorRow(data: any): boolean {
        return ScenarioUtils.isCustomFactorColumn(data?.[this.FACTOR_KEY]);
    }

    protected addShockColumnOptionToColumns(columns: ColumnConfig[]): void {
        columns.filter(column => column.optionValues.findIndex(optionValue => optionValue.configType === ShockSettingColumnOption.CONFIG_TYPE) === -1)
            .forEach(column => column.optionValues.push(new ShockSettingColumnOption()));
    }
}
