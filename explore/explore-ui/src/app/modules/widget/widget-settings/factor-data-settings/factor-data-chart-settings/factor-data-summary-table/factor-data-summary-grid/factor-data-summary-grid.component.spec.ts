import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FactorDataSummaryGridComponent} from './factor-data-summary-grid.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ColumnConfig, ColumnConstants, ColumnType} from '@blk/explore-ui-core';
import {ColumnSet, CustomTitleColumnOption} from '@blk/explore-ui-column-option';
import {RiskSettings} from '@blk/explore-ui-risk';
import {AgGridModule} from 'ag-grid-angular';
import {CellClickedEvent, GetRowIdParams, GridApi, GridReadyEvent, ICellRendererParams} from 'ag-grid-community';
import {FactorDataChartSettingsStore} from '../../stores/factor-data-chart-settings.store';
import { BehaviorSubject } from 'rxjs';

describe('FactorDataSummaryGridComponent', () => {
    let component: FactorDataSummaryGridComponent;
    let fixture: ComponentFixture<FactorDataSummaryGridComponent>;

    let column;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AgGridModule],
            declarations: [FactorDataSummaryGridComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(FactorDataSummaryGridComponent);
        component = fixture.componentInstance;

        FactorDataChartSettingsStore.init();

        const columnSet = new ColumnSet();

        const col1 = {
            columnTag: 'factorX',
            columnKey: 'factor1',
            title: 'factor 1',
            positionColumnType: ColumnConstants.FACTOR_MODEL,
        };
        column = new ColumnConfig(col1);
        columnSet.columns = [ column ];

        const riskSettings = new RiskSettings();
        riskSettings.economyRiskSettings.weightingScheme = 'WKL';
        riskSettings.economyRiskSettings.period = 72;
        riskSettings.economyRiskSettings.decayFactor = 0.6;

        columnSet.columns[0].optionValues = [];
        columnSet.columns[0].optionValues.push(new CustomTitleColumnOption({ customTitle : 'custom factor'}));
        columnSet.columns[0].optionValues.push(riskSettings);

        const inputs = new Map();
        inputs.set(ColumnType.COLUMNS, columnSet);
        FactorDataChartSettingsStore.inputs = inputs;
        component.columnType = ColumnType.COLUMNS;


        component.gridApi = {} as GridApi;
        component.gridApi.sizeColumnsToFit = jest.fn();
        component.gridApi.updateGridOptions = jest.fn();
        component.gridApi.applyTransaction = jest.fn();
        component.gridApi.applyTransactionAsync = jest.fn();
        component.gridApi.setGridAriaProperty = jest.fn();
        component.gridApi.setColumnsVisible = jest.fn();

        component.showGridLoadingOverlay$ = new BehaviorSubject<boolean>(false);

        fixture.detectChanges();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test component init', () => {
        expect(component.selectedRowId).toBeNull();
        expect(component.gridOptions).not.toBeNull();
        expect(component.gridApi).not.toBeUndefined();
        expect(FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(ColumnType.COLUMNS).getValue()).toBeFalsy();
    });

    it('test on column updated - subscribed callback', async () => {
        jest.spyOn(component.gridApi, 'applyTransaction');

        component.selectedRowId = 'factor1';
        FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(ColumnType.COLUMNS).next(true);

        expect(component.gridApi.applyTransaction).toHaveBeenCalledTimes(1);
        expect(component.selectedRowId).toBeNull();
    });

    it('test hideColumns for hiding risk settings columns in grid ', () => {
        const setColumnsVisibleSpy = jest.spyOn(component.gridApi, 'setColumnsVisible');

        FactorDataChartSettingsStore.getHideFactorColumnRiskSettings$(ColumnType.COLUMNS).next(true);
        FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(ColumnType.COLUMNS).next(true);

        expect(setColumnsVisibleSpy).toHaveBeenCalledTimes(2);
    });

    it('test gridReady method ', async () => {
        const updateGridOptionsSpy = jest.spyOn(component.gridApi, 'updateGridOptions');
        const setColumnsVisibleSpy = jest.spyOn(component.gridApi, 'setColumnsVisible');

        const event = {
            api: component.gridApi
        } as GridReadyEvent;

        component['onGridReady'](event);

        expect(setColumnsVisibleSpy).toHaveBeenCalledTimes(2);
        expect(updateGridOptionsSpy).toHaveBeenCalledTimes(1);
    });

    it('test onCellClicked', () => {
        const event = { data: { 'factorKey': 'factor1' } } as CellClickedEvent;
        jest.spyOn(component.editFactorSettingsModalOpened, 'emit');

        component.onCellClicked(event);

        expect(component.selectedRowId).toBe('factor1');
        expect(component.editFactorSettingsModalOpened.emit).toHaveBeenCalledTimes(1);
        expect(component.editFactorSettingsModalOpened.emit).toHaveBeenCalledWith('factor1');
    });

    it('test deleteRow', () => {
        // Currently only 1 column in columnSet
        const params = {
            data: {
                'factorKey': 'factor1'
            }
        } as unknown as ICellRendererParams;
        jest.spyOn(component.gridApi, 'applyTransaction');

        component.deleteRow(params);

        expect(component['getColumns']().length).toBe(0);
        expect(component.gridApi.applyTransaction).toHaveBeenCalledTimes(1);
    });

    it('test getRowId', () => {
        const params = {
            data: {
                'factorKey': 'factor1'
            }
        } as GetRowIdParams;

        const rowId = component.getRowId(params);

        expect(rowId).toBe('factor1');
    });

    it('test getRowData', () => {
        const expectedRowData = [{
            factorKey: 'factor1',
            factorName: 'custom factor',
            factorTag: 'factorX',
            factorPerm: 'Yes',
            weightingScheme: 'WKL',
            period: 72,
            decayFactor: 0.6,
        }];
        const rowData = component['getRowData']();

        expect(rowData).toStrictEqual(expectedRowData);
    });

    it('test deleteCellRenderer', () => {
        // create delete cell icon
        const paramsMock = {
            data: {
                'factorKey': 'factor1'
            }
        } as ICellRendererParams;

        const cell = component.deleteCellRenderer(paramsMock);
        expect(cell).toBeDefined();
    });

    it('test getColumnDefs', () => {
       const colDefs = component['getColumnDefs']();
       expect(colDefs.length).toBe(8);
    });

    describe('tests for factor tag column def', () => {
        it('test for custom factor tag update', () => {
            const colDefs = component['getColumnDefs']();
            const factorTagColDef = colDefs.find(col => col.field === 'factorTag');
            expect(factorTagColDef).toBeDefined();
            const params: any = {
                newValue: 'abc',
                data: {
                    'factorKey': 'custom_factor_tag_123',
                }
            };

            column.columnKey = 'custom_factor_tag_123';
            // @ts-ignore
            expect(factorTagColDef.valueSetter(params)).toEqual(true);
            expect(params.data.factorTag).toEqual('abc');
            expect(column.columnTag).toEqual('abc');
        });

        it('test isCustomFactorTag method', () => {
            expect(component['isCustomFactorRow']({ factorKey: 'custom_factor_tag_123' })).toBeTruthy();
            expect(component['isCustomFactorRow']({ factorKey: 'USD_10yr_1232' })).toBeFalsy();
        });
    });


});
