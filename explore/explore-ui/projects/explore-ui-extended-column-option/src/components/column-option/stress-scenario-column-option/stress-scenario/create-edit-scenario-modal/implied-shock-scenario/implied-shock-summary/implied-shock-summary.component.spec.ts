import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ImpliedShockSummaryComponent} from './implied-shock-summary.component';
import {of, throwError} from 'rxjs';
import {ColumnConfig, NOTIFICATION_SERVICE_TOKEN} from '@blk/explore-ui-core';
import {FactorDefinitionsService} from '../../../../../../../services/factor-definitions.service';
import {StressScenario} from '../../../../../../../models/stress-scenario.model';
import {ShockSettingColumnOption} from '../../../../../../../models/column-option/shock-setting-column-option.model';
import {GridApi} from 'ag-grid-community';
import {ImpliedShockUnitEnum} from '../../../../../../../enums/implied-shock-unit.enum';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('ImpliedShockSummaryComponent', () => {
    let component: ImpliedShockSummaryComponent;
    let fixture: ComponentFixture<ImpliedShockSummaryComponent>;

    const factorDefinitionsServiceMock = {
        fetchFactorDefinitionsForFactorShocks$: jest.fn(() => of([{
            columnTag: 'abc',
            shockUnit: 'pct/yr',
        }]))
    };

    const notificationServiceStub = {
        error: jest.fn(),
    };

    let column: ColumnConfig;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ ImpliedShockSummaryComponent ],
            providers: [
                {provide: FactorDefinitionsService, useValue: factorDefinitionsServiceMock},
                {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceStub},
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ImpliedShockSummaryComponent);
        component = fixture.componentInstance;

        const shockSettingColumnOption = new ShockSettingColumnOption();
        shockSettingColumnOption.shock = 1.567;

        const col = new ColumnConfig();
        col.columnKey = 'abc1';
        col.columnTag = 'abc';
        col.columnTitle = 'ABC';
        col.optionValues.push(shockSettingColumnOption);

        column = col;

        component.scenario = new StressScenario();
        component.scenario.impliedShockScenario.columns.columns = [col];

        component.gridApi = {} as GridApi;
        component.gridApi['updateGridOptions'] = jest.fn();
        component.gridApi['applyTransactionAsync'] = jest.fn();
        component.gridApi.applyTransaction = jest.fn();

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have ngOnInit method', () => {
        expect(component.ngOnInit).toBeDefined();
        component.ngOnInit();
        expect(component.gridOptions).toBeDefined();
    });

    describe('test method setFactorsDataInGrid', () => {

        it('test for no columns', () => {
            const spy = jest.spyOn(component.gridApi, 'updateGridOptions').mockImplementationOnce(jest.fn());

            component.scenario.impliedShockScenario.columns.columns = [];

            component['setFactorsDataInGrid']();

            // not called for ngOnInit
            expect(spy).toHaveBeenCalledTimes(0);
        });

        it('test for columns', () => {
            const expectedRowData = [
                {
                    'factorKey': 'abc1',
                    'factorTag': 'abc',
                    'factorName': 'ABC',
                    'shock': 1.567,
                    'shockUnit': undefined,
                    'restrictImpliedShocks': '',
                    actionCol: undefined,
                }
            ];

            const spy = jest.spyOn(component.gridApi, 'updateGridOptions').mockImplementationOnce((rowDataObj) => {
                expect(rowDataObj.rowData.length).toEqual(1);
                rowDataObj.rowData[0].actionCol = undefined;
                expect(rowDataObj.rowData).toEqual(expectedRowData);
            });

            spy.mockClear();

            component['setFactorsDataInGrid']();


            expect(spy).toHaveBeenCalledTimes(1);
        });

    });

    describe('test method updateShockUnitsInGrid', () => {

        it('test for no columns', () => {
            const spy = jest.spyOn(component.gridApi, 'applyTransactionAsync').mockImplementationOnce(jest.fn());

            component.scenario.impliedShockScenario.impliedShockUnit = ImpliedShockUnitEnum.NUMBER_OF_STD_DEVS;
            component.scenario.impliedShockScenario.columns.columns = [];

            component['updateShockUnitsInGrid']();

            expect(spy).not.toHaveBeenCalled();
        });

        it('test for error while fetching shock units', () => {
            const spy = jest.spyOn(component.gridApi, 'applyTransactionAsync').mockImplementationOnce(jest.fn());
            const notifyErrorSpy = jest.spyOn(component['notificationService'], 'error').mockImplementationOnce(jest.fn());

            const factorShockSpy = jest.spyOn(component['factorDefinitionsService'], 'fetchFactorDefinitionsForFactorShocks$').mockImplementationOnce(() => throwError(() => ''));

            component.scenario.impliedShockScenario.impliedShockUnit = ImpliedShockUnitEnum.FACTOR_LEVELS;

            factorShockSpy.mockClear();

            component['updateShockUnitsInGrid']();

            expect(spy).not.toHaveBeenCalled();
            expect(notifyErrorSpy).toHaveBeenCalled();
        });

        it('test for impliedShockUnit === NUMBER_OF_STD_DEVS ', () => {
            const expectedRowData = [
                {
                    'factorKey': 'abc1',
                    'factorName': 'ABC',
                    'factorTag': 'abc',
                    'shock': 1.567,
                    'shockUnit': 'std',
                    'restrictImpliedShocks': '',
                    actionCol: undefined,
                }
            ];
            component.scenario.impliedShockScenario.impliedShockUnit = ImpliedShockUnitEnum.NUMBER_OF_STD_DEVS;

            const factorShockSpy = jest.spyOn(component['factorDefinitionsService'], 'fetchFactorDefinitionsForFactorShocks$');

            const spy = jest.spyOn(component.gridApi, 'applyTransactionAsync').mockImplementationOnce((rowDataObj) => {
                expect(rowDataObj.update.length).toEqual(1);
                rowDataObj.update[0].actionCol = undefined;
                expect(rowDataObj.update).toEqual(expectedRowData);
            });

            factorShockSpy.mockClear();
            spy.mockClear();

            component['updateShockUnitsInGrid']();

            expect(spy).toHaveBeenCalled();

            expect(factorShockSpy).toHaveBeenCalledTimes(0);
        });

        it('test for impliedShockUnit !== NUMBER_OF_STD_DEVS', () => {
            const expectedRowData = [
                {
                    'factorKey': 'abc1',
                    'factorName': 'ABC',
                    'shock': 1.567,
                    'shockUnit': 'pct/yr',
                    'restrictImpliedShocks': '',
                    actionCol: undefined,
                }
            ];
            // @ts-ignore
            const factorShockSpy = jest.spyOn(component['factorDefinitionsService'], 'fetchFactorDefinitionsForFactorShocks$');

            const spy = jest.spyOn(component.gridApi, 'applyTransactionAsync').mockImplementationOnce((rowDataObj) => {
                expect(rowDataObj.update.length).toEqual(1);
                rowDataObj.update[0].actionCol = undefined;
                expect(rowDataObj.update).toEqual(expectedRowData);
            });

            factorShockSpy.mockClear();
            spy.mockClear();

            component.scenario.impliedShockScenario.impliedShockUnit = ImpliedShockUnitEnum.FACTOR_LEVELS;
            component.scenario.impliedShockScenario.columns.columns[0].optionValues[0].shockUnit = undefined;

            component['updateShockUnitsInGrid']();

            expect(factorShockSpy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalled();
        });

    });

    it('test factorsUpdated$', () => {
        // @ts-ignore
        const spy = jest.spyOn(component, 'setFactorsDataInGrid').mockImplementationOnce(jest.fn());
        spy.mockClear();
        component.scenario.impliedShockScenario.factorsUpdated$.next();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('test globalSettingsUpdated$', () => {
        // @ts-ignore
        const spy = jest.spyOn(component, 'updateShockUnitsInGrid').mockImplementationOnce(jest.fn());
        spy.mockClear();
        component.scenario.impliedShockScenario.globalSettingsUpdated$.next();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should have deleteRow method', () => {
        const spy = jest.spyOn(component.gridApi, 'applyTransaction');

        const expectedRowsToRemove = {
            remove: [
                {
                    'factorKey': 'abc1',
                }
            ]
        };

        component['deleteRow']('abc1');

        expect(component['getColumns']().length).toEqual(0);
        expect(spy).toHaveBeenCalledWith(expectedRowsToRemove);
    });

    it('should have getShockColumnOption method', () => {
        const params = {
            data: {
                'factorKey': 'abc1',
            }
        };
        const shockColumnOption = component['getShockColumnOption'](params);
        expect(shockColumnOption.shock).toEqual(1.567);
    });

    it('test updateColumnShockUnit method', () => {
        const col = component.scenario.impliedShockScenario.columns.columns[0];
        col.optionValues = [ new ShockSettingColumnOption()];
        component['updateColumnShockUnit'](col, 'pct/yr');
        expect(col.optionValues.length).toEqual(1);
        expect((col.optionValues[0] as ShockSettingColumnOption).shockUnit).toEqual('pct/yr');
    });

    it('test editable column defs', () => {
        const colDefs = component['getColumnDefs']();
        const factorTagColDef = colDefs[3];
        const shockValueColDef = colDefs[4];
        const restrictImpliedShocksColDef = colDefs[6];

        const params: any = {
            newValue: 45.5678,
            data: {
                'factorKey': 'abc1',
            }
        };

        // @ts-ignore
        expect(shockValueColDef.valueSetter(params)).toEqual(true);
        expect(params.data.shock).toEqual(45.5678);
        expect((column.optionValues[0] as ShockSettingColumnOption).shock).toEqual(45.5678);
        // @ts-ignore
        expect(shockValueColDef.valueFormatter({value: 45.5678})).toEqual('45.57');

        params.newValue = 'a,b';
        // @ts-ignore
        expect(restrictImpliedShocksColDef.valueSetter(params)).toEqual(true);
        expect(params.data.restrictImpliedShocks).toEqual('a,b');
        expect((column.optionValues[0] as ShockSettingColumnOption).restrictImpliedShocks).toEqual(['a', 'b']);

        params.value = 'a,b';

        expect(restrictImpliedShocksColDef.tooltipValueGetter(params)).toEqual('a,b');

        // Test for custom factor tag update
        params.newValue = 'abc';
        params.data.factorKey = 'custom_factor_tag_123';
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
