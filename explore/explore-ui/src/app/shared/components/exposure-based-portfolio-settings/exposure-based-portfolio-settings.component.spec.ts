import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExposureBasedPortfolioSettingsComponent } from './exposure-based-portfolio-settings.component';
import {
    FactorDefinitionsService,
    ShockSettingColumnOption,
} from '@blk/explore-ui-extended-column-option';
import {GridApi} from 'ag-grid-community';
import {of, throwError} from 'rxjs';
import {ColumnConfig, ColumnConstants, NOTIFICATION_SERVICE_TOKEN} from '@blk/explore-ui-core';
import {FactorExposureChange} from '@models/portfolio/composition/factor-exposure-change.model';

describe('ExposureBasedPortfolioSettingsComponent', () => {
    let component: ExposureBasedPortfolioSettingsComponent;
    let fixture: ComponentFixture<ExposureBasedPortfolioSettingsComponent>;

    const factorDefinitionsServiceMock = {
        fetchFactorDefinitionsForExposure$: jest.fn(() => of([{
            colTag: 'factor1',
            shockUnit: 'pct/yr',
        }]))
    };

    const notificationServiceStub = {
        error: jest.fn(),
    };

    let column: ColumnConfig;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExposureBasedPortfolioSettingsComponent],
            providers: [
                { provide: FactorDefinitionsService, useValue: factorDefinitionsServiceMock },
                { provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceStub },
            ]
        });
        fixture = TestBed.createComponent(ExposureBasedPortfolioSettingsComponent);
        component = fixture.componentInstance;
        component.selectedFactorExposures = new Map<string, any>;

        column = new ColumnConfig({
            columnTag: 'factor1',
            columnKey: 'factor1145a',
            columnTitle: 'factor 1',
            positionColumnType: ColumnConstants.FACTOR_MODEL,
        });
        const shockSettingColumnOption = new ShockSettingColumnOption();
        shockSettingColumnOption.shock = 20.56;
        column.optionValues.push(shockSettingColumnOption);

        component.gridApi = {} as GridApi;
        component.gridApi['updateGridOptions'] = jest.fn();
        component.gridApi['applyTransactionAsync'] = jest.fn();
        component.gridApi['applyTransaction'] = jest.fn();

        fixture.detectChanges();

        const columns = component['getColumns']();
        columns.push(column);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });


    it('should initialize grid options on init', () => {
        component.ngOnInit();
        expect(component.gridOptions).toBeDefined();
    });

    it('should set factors data in grid on grid ready and set shock units', () => {
        const setFactorsDataInGridSpy = jest.spyOn(component, 'setFactorsDataInGrid');
        const updateShockUnitsInGridSpy = jest.spyOn(component, 'updateShockUnitsInGrid');
        component['doOnGridReady']();
        expect(setFactorsDataInGridSpy).toHaveBeenCalled();
        expect(updateShockUnitsInGridSpy).toHaveBeenCalled();
    });

    describe('test method updateShockUnitsInGrid', () => {

        it('test for no columns', () => {
            const spy = jest.spyOn(component.gridApi, 'applyTransactionAsync').mockImplementationOnce(jest.fn());

            const columns = component['getColumns']();
            const shockColumnOption = columns[0].optionValues.find(optionValue => optionValue.configType === ShockSettingColumnOption.CONFIG_TYPE) as ShockSettingColumnOption;
            shockColumnOption.shockUnit = 'std';

            component['updateShockUnitsInGrid']();

            expect(spy).not.toHaveBeenCalled();
        });

        it('test for error while fetching shock units', () => {
            const spy = jest.spyOn(component.gridApi, 'applyTransactionAsync').mockImplementationOnce(jest.fn());
            const notifyErrorSpy = jest.spyOn(component['notificationService'], 'error').mockImplementationOnce(jest.fn());
            jest.spyOn(component['factorDefinitionsService'], 'fetchFactorDefinitionsForExposure$').mockImplementationOnce(() => throwError(() => ''));

            component['updateShockUnitsInGrid']();

            expect(spy).not.toHaveBeenCalled();
            expect(notifyErrorSpy).toHaveBeenCalled();
        });

        it('test for fetchFactorDefinitionsForExposure$', () => {
            const expectedRowData = [
                {
                    'factorKey': 'factor1145a',
                    'factorName': 'factor 1',
                    'factorTag': 'factor1',
                    'shock': 20.56,
                    'shockUnit': 'pct/yr',
                }
            ];
            // @ts-ignore
            const factorShockSpy = jest.spyOn(component['factorDefinitionsService'], 'fetchFactorDefinitionsForExposure$');

            const spy = jest.spyOn(component.gridApi, 'applyTransactionAsync').mockImplementationOnce((rowDataObj) => {
                expect(rowDataObj.update.length).toEqual(1);
                expect(rowDataObj.update).toEqual(expectedRowData);
            });

            component['updateShockUnitsInGrid']();

            expect(factorShockSpy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalled();
        });

    });

    //
    // it('should update selected factor exposures', () => {
    //     const columns = [new ColumnConfig({ columnTag: 'factor1', columnKey: 'factor1145a', title: 'factor 1', positionColumnType: ColumnConstants.FACTOR_MODEL })];
    //     jest.spyOn(component, 'getColumns').mockReturnValue(columns);
    //
    //     component.updateSelectedFactorExposures();
    //
    //     expect(component.selectedFactorExposures.size).toBe(1);
    //     expect(component.selectedFactorExposures.get('factor1')).toBeDefined();
    // });
    //
    it('should delete row and update selected factor exposures', () => {
        const spy = jest.spyOn(component.gridApi, 'applyTransaction');

        component.selectedFactorExposures.set('factor1', new FactorExposureChange());

        const expectedRowsToRemove = {
            remove: [
                {
                    'factorKey': 'factor1145a',
                }
            ]
        };

        component['deleteRow']({ 'factorKey': 'factor1145a', 'factorTag': 'factor1' });

        expect(component['getColumns']().length).toEqual(0);
        expect(spy).toHaveBeenCalledWith(expectedRowsToRemove);
        expect(component.selectedFactorExposures.size).toBe(0);
    });


    it('test editable column defs', () => {
        const colDefs = component['getColumnDefs']();
        const shockValueColDef = colDefs[3];

        const params: any = {
            newValue: 45.5678,
            data: {
                'factorKey': 'factor1145a',
                'factorTag': 'factor1',
                shock: 25,
            }
        };

        // @ts-ignore
        expect(shockValueColDef.valueSetter(params)).toEqual(true);
        expect(params.data.shock).toEqual(45.5678);
        expect((column.optionValues[0] as ShockSettingColumnOption).shock).toEqual(45.5678);
        // @ts-ignore
        expect(shockValueColDef.valueFormatter({value: 45.5678})).toEqual('45.57');
        expect(component.selectedFactorExposures.get('factor1').exposureValue).toEqual(45.5678);
        expect(component.selectedFactorExposures.get('factor1').newExposureValue).toEqual(45.5678);

    });

    it('test method onFactorsUpdated', () => {
        const setFactorsDataInGridSpy = jest.spyOn(component, 'setFactorsDataInGrid');
        const updateShockUnitsInGridSpy = jest.spyOn(component, 'updateShockUnitsInGrid');
        const updateSelectedFactorExposuresSpy = jest.spyOn(component, 'updateSelectedFactorExposures');
        component['onFactorsUpdated']();
        expect(setFactorsDataInGridSpy).toHaveBeenCalled();
        expect(updateShockUnitsInGridSpy).toHaveBeenCalled();
        expect(updateSelectedFactorExposuresSpy).toHaveBeenCalled();
    });

    it('should update all selected factor exposures', () => {
        component['updateSelectedFactorExposures']();
        expect(component.selectedFactorExposures.size).toBe(1);
        expect(component.selectedFactorExposures.get('factor1')).toBeDefined();
        expect(component.selectedFactorExposures.get('factor1').exposureValue).toEqual(20.56);
        expect(component.selectedFactorExposures.get('factor1').newExposureValue).toEqual(20.56);
    });

    it('should create delete icon and handle click event', () => {
        const params: any = {
            data: { factorKey: 'factor1145a', factorTag: 'factor1' }
        };

        const deleteRowSpy = jest.spyOn(component, 'deleteRow');
        const deleteIconWrapper = component['deleteCellRenderer'](params);

        expect(deleteIconWrapper).toBeDefined();
        expect(deleteIconWrapper.querySelector('aux-icon')).toBeDefined();

        // Simulate click event
        deleteIconWrapper.querySelector('aux-icon')?.dispatchEvent(new Event('click'));

        expect(deleteRowSpy).toHaveBeenCalledWith(params.data);
    });
});
