import {ChangeDetectorRef, Component, Inject, Optional} from '@angular/core';
import {AuxGridColumnType, AuxGridOptions} from '@blk/aladdin-angular-components';
import {ColDef, EditableCallbackParams, GetRowIdParams, GridApi, GridReadyEvent, RowNode} from 'ag-grid-community';
import {takeUntil} from 'rxjs/operators';
import {ColumnConfig, ColumnConstants, CoreColumnUtils, NotificationServiceInterface, NOTIFICATION_SERVICE_TOKEN, ResponseData, WidgetInputType, CoreDefinitionStore, RiskModel} from '@blk/explore-ui-core';
import {cloneDeep, isNil} from 'lodash';
import {ColumnSet, LibColumnUtils} from '@blk/explore-ui-column-option';
import {StressScenarioService} from '../../../../../../services/stress-scenario.service';
import { ShockSettingColumnOption } from '../../../../../../models/column-option/shock-setting-column-option.model';
import {FACTOR_COLUMN_SET_SETTINGS_SERVICE_TOKEN} from '../../../../../../tokens';
import {FactorColumnSetSettingsServiceInterface} from '../../../../../../service-interfaces/factor-column-set-settings-service.interface';
import {BaseScenarioTypeDirective} from '../base-scenario-type.directive';
import {ScenarioConstants} from '../../../../../../constants/scenario.constant';
import { RiskSettings } from '@blk/explore-ui-risk';
import {finalize} from 'rxjs';



@Component({
    selector: 'explore-extended-column-option-specified-shock-scenario',
    templateUrl: './specified-shock-scenario.component.html',
    styleUrls: ['./specified-shock-scenario.component.scss']
})
export class SpecifiedShockScenarioComponent extends BaseScenarioTypeDirective {

    private readonly ROW_ID_COLUMN_NAME = 'rowId';

    requestColumns: ColumnSet;
    isLoading = false;
    gridOptions: AuxGridOptions;
    private gridApi: GridApi;
    private isCreateNewScenarioFlow = false;
    errorMessage = '';

    // tslint:disable-next-line:max-line-length
    constructor(@Inject(FACTOR_COLUMN_SET_SETTINGS_SERVICE_TOKEN) private factorColumnSetSettingsService: FactorColumnSetSettingsServiceInterface, private stressScenarioService: StressScenarioService, private changeDetectorRef: ChangeDetectorRef, @Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) protected notificationService: NotificationServiceInterface) {
        super(notificationService);
    }

    protected initializeComponent(): void {
        this.isCreateNewScenarioFlow = this.scenario.isCreateNewSpecifiedScenarioFlow();

        this.displayNotificationWhenSTORMRiskModelIsSelected();

        this.showSpinner$.next(true);

        this.isLoading = true;
        this.changeDetectorRef.markForCheck();

        this.setRequestColumns();
        this.gridOptions = this.createAuxGridOptions();

        const requestParams: any = this.createRequestParams();
        const url: string = this.factorColumnSetSettingsService.getSpecifiedScenarioDataUrl(this.isCreateNewScenarioFlow);

        this.stressScenarioService.fetchSpecifiedScenarioData$(requestParams, url)
            .pipe(
                takeUntil(this.ngUnsubscribe),
                finalize(() => {
                    this.changeDetectorRef.markForCheck();
                    this.showSpinner$.next(false);
                })
            )
            .subscribe({
                next: (response: any): void => {
                    this.setColumnDefs(response);
                    this.gridOptions.rowData = this.createRowData(response);
                    this.isLoading = false;
                },
                error: (err) => {
                    this.errorMessage = err;
                }
            });
    }

    private getRequestColumnsConstant(): any {
        return !this.isCreateNewScenarioFlow ? ScenarioConstants.SPECIFIED_SCENARIO_CONVERSION_REQUEST_COLUMNS : ScenarioConstants.SPECIFIED_SCENARIO_CREATE_REQUEST_COLUMNS;
    }


    private createRowData(response: any): any[] {
        const rowData: any[] = [];
        const id = { rowId: 0 };
        response.data.columns = response.data.columns.map((col: string) => col.split('|')[0]);
        const titleCol: ColumnConfig = this.getColumn(this.getRequestColumnsConstant().TITLE_COL);
        const factorTagCol: ColumnConfig = this.getColumn(this.getRequestColumnsConstant().FACTOR_TAG);
        response.data.data?.children?.forEach(node => this.processNodeData(rowData, node, [], id, response.data.columns, titleCol.columnKey, factorTagCol.columnKey));
        return rowData;
    }

    private processNodeData(rowData: any[], node: ResponseData, path: string[], id: any, columns: any[], titleColKey: string, factorTagKey): void {
        if (isNil(node)) {
            return;
        }
        id.rowId++;

        const row: any = {};
        node.data.forEach((value, index) => {
            row[columns[index]] = value;
        });
        path.push(row[titleColKey] + '_' + row[factorTagKey]);
        row.level = [ ...path ];
        row.actionCol = this.getActionColMenuOptions(row);
        row.rowId = id.rowId;
        rowData.push(row);
        node.children?.forEach(childNode => this.processNodeData(rowData, childNode, path, id, columns, titleColKey, factorTagKey));
        path.pop();
    }

    private createRequestParams(): any {
        const requestParams: any =  this.factorColumnSetSettingsService.createSpecifiedShocksRequest(this.isCreateNewScenarioFlow);
        const requestCols: ColumnSet = cloneDeep(this.requestColumns);

        // Create from scratch specified scenario ->  request will go to FMS flow, so stress shock column is not sent in request
        if (this.isCreateNewScenarioFlow) {
            requestCols.columns = requestCols.columns.filter(col => col.columnTag !== this.getRequestColumnsConstant().SHOCK_COL);
            requestCols.addRequestParams(requestParams);
        } else {
            requestParams.isSpecifiedScenarioRequest = true;

            // Case when converting to specified shock -> add all risk settings
            if (this.scenario.convertToSpecifiedShock) {
                const riskSettings: RiskSettings = this.column.optionValues.find(optionValue => optionValue.configType === RiskSettings.CONFIG_TYPE) as RiskSettings;
                if (riskSettings) {
                    const allRiskSettings = riskSettings.createAllRiskSettings();
                    allRiskSettings.addRequestParams(requestParams);
                }
            }

            requestCols.addRequestParams(requestParams);

            // add scenario to scenarioList in shock value column option
            const shockCol: any = requestParams[WidgetInputType.COLUMNS].find(col => col.columnTag === this.getRequestColumnsConstant().SHOCK_COL);
            this.scenario.addRequestParamsForSpecifiedRequest(shockCol);
        }

        return requestParams;
    }

    protected gridReady = (params: GridReadyEvent) => {
        this.gridApi = params.api;
    };

    protected getRowId = (params: GetRowIdParams): string => params.data[this.ROW_ID_COLUMN_NAME];

    /**
     * Creates the Aux-Inline-Menu data for Action Column
     */
    private getActionColMenuOptions(params: any): any {
        return {
            inlineMenuData: [[
                {
                    label: 'Remove',
                    eventData: this.removeRow,
                },
            ]],
            inlineMenuItemClicked: (event: any) => {
                if (event?.detail?.element?.eventData) {
                    event.detail.element.eventData(params);
                }
            },
        };
    }

    private removeRow = (params: any): void => {
        const rowId = this.getRowId({ data: params } as any);
        const rowNode: RowNode = this.gridApi.getRowNode(rowId) as RowNode;
        const rows = rowNode.allLeafChildren.map(node => ({ rowId: this.getRowId(node as any) }));
        if (rows) {
            this.gridApi.applyTransaction({ remove : rows });
        }
    };

    private getFactorsForSaveRequest(): ColumnConfig[] {
        const columns: ColumnConfig[] = [];
        const shockCol = this.getColumn(this.getRequestColumnsConstant().SHOCK_COL);
        const factorTagCol = this.getColumn(this.getRequestColumnsConstant().FACTOR_TAG);

        this.gridApi.forEachLeafNode(node => {
            const shockValue = node.data[shockCol.columnKey];
            if (isNil(shockValue) || shockValue === 0) {
                return;
            }
            const col = new ColumnConfig();
            col.columnTag = node.data[factorTagCol.columnKey];
            col.columnKey = ColumnConfig.generateColumnKey(col.columnTag);
            col.optionValues = [new ShockSettingColumnOption({ shock: shockValue })];
            col.positionColumnType = ColumnConstants.FACTOR_MODEL;
            columns.push(col);
        });

        return columns;
    }

    private createAuxGridOptions(): AuxGridOptions {
        return {
            suppressContextMenu: true,
            suppressGroupRowsSticky: true,
            onGridReady: this.gridReady,
            rowSelection: 'single',
            getRowId: this.getRowId,
            singleClickEdit: true,
            defaultColDef: {
                sortable: false,
                resizable: false,
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
            treeData: true,
            getDataPath: (data: any): string[] => {
                return data.level;
            },
            tooltipShowDelay: 2000,
        };
    }

    private setRequestColumns(): void {
        this.requestColumns = new ColumnSet();

        Object.values(this.getRequestColumnsConstant()).forEach((colTag: string) => {
            const colDef = CoreColumnUtils.getColumnDefByTag(colTag);
            if (isNil(colDef)) {
                return;
            }
            const col = ColumnConfig.createColumnFromColumnDefinition(colDef);
            this.requestColumns.columns.push(col);
        });

    }

    private getColumn(colTag: string): ColumnConfig {
        return this.requestColumns.columns.find(column => column.columnTag === colTag);
    }

    protected validateStressScenario() {
        this.scenario.specifiedShockScenario.columns.columns = this.getFactorsForSaveRequest();
        let isValid = true;
        if (this.scenario.specifiedShockScenario.columns.columns.length === 0) {
            this.notificationService?.error('No columns selected. Please add some columns.');
            isValid = false;

        }
        this.scenarioValidatedEmitter.emit(isValid);
    }

    private setColumnDefs(response: any): void {
        const colDefs: ColDef[] = this.factorColumnSetSettingsService.createAuxGridColDefs(this.requestColumns.columns, response.data.columnHeaderDetails);

        const shockValueColDef: ColDef = colDefs.find((colDef: any) => colDef.colTag === this.getRequestColumnsConstant().SHOCK_COL);
        if (shockValueColDef) {
            shockValueColDef.editable = (params: EditableCallbackParams) => {
                return !(params.node as RowNode).hasChildren();
            };
            shockValueColDef.cellEditor = 'agNumberCellEditor';
            shockValueColDef.cellEditorParams = {
                precision: 8,
                preventStepping: true,
            };
            shockValueColDef.aggFunc = undefined;
            shockValueColDef.headerValueGetter = (_params) => 'Shock';
        }

        const factorTitleColDef: any = colDefs.find((colDef: any) => colDef.colTag === this.getRequestColumnsConstant().TITLE_COL);
        if (factorTitleColDef) {
            factorTitleColDef.hide = true;
        }

        const factorTagCol: ColumnConfig = this.getColumn(this.getRequestColumnsConstant().FACTOR_TAG);

        const factorTagColDef: ColDef = colDefs.find((colDef: any) => colDef.colTag === factorTagCol.columnTag);
        if (factorTagColDef) {
            factorTagColDef.hide = true;
        }

        const shockUnitColDef: ColDef = colDefs.find((colDef: any) => colDef.colTag === this.getRequestColumnsConstant().SHOCK_UNIT_COL);
        if (shockUnitColDef) {
            shockUnitColDef.headerValueGetter = (_params) => 'Unit';
        }

        this.gridOptions.autoGroupColumnDef = {
            headerName: 'Factor',
            colTag: factorTitleColDef.colTag,
            field: factorTitleColDef.field,
            type: AuxGridColumnType.AUX_TEXT_COLUMN,
            cellClass: 'auto-column-align',
            flex: 1,
            minWidth: 200,
            cellRendererParams: {
                suppressCount: true
            },
            tooltipValueGetter: (params) => {
                if (!(params.node as RowNode).hasChildren() && params.data) {
                    return params.data[factorTagCol.columnKey];
                }
                return undefined;
            },
        } as ColDef;

        this.gridOptions.columnDefs = [ LibColumnUtils.getActionColDef(), ...colDefs ];
    }

    private displayNotificationWhenSTORMRiskModelIsSelected(): void {
        if (!this.isCreateNewScenarioFlow && this.scenario.convertToSpecifiedShock) {
            const riskSettings: RiskSettings = this.column.optionValues.find(optionValue => optionValue.configType === RiskSettings.CONFIG_TYPE) as RiskSettings;
            if (riskSettings) {
                const selectedModel = riskSettings?.exposureRiskSettings?.riskModel;
                const riskModels: RiskModel[] = cloneDeep(CoreDefinitionStore.riskModelList);
                if (riskModels.filter(riskModel => riskModel.label.toUpperCase().includes('STORM')).map(riskModel => riskModel.value).includes(selectedModel)) {
                    this.notificationService.warning(ScenarioConstants.STORM_MODEL_NOT_SUPPORTED);
                }
            }
        }
    }
}
