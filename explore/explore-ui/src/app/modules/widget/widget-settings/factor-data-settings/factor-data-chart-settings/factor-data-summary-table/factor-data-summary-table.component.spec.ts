import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FactorDataSummaryTableComponent} from './factor-data-summary-table.component';
import {of, throwError} from 'rxjs';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ColumnOptionService, ColumnSet, CustomTitleColumnOption} from '@blk/explore-ui-column-option';
import {HttpClient} from '@angular/common/http';
import {ColumnConfig, ColumnConstants, ColumnType} from '@blk/explore-ui-core';
import {FactorDataChartSettingsStore} from '../stores/factor-data-chart-settings.store';

describe('FactorDataSummaryTableComponent', () => {
    let component: FactorDataSummaryTableComponent;
    let fixture: ComponentFixture<FactorDataSummaryTableComponent>;

    const col = {
        columnTag: 'factor1',
        columnKey: 'factor1145a',
        title: 'factor 1',
        positionColumnType: ColumnConstants.FACTOR_MODEL,
        optionValues: [],
    };

    const columnOptionsServiceMock = {
        fetchColumnOptions$: jest.fn(() => of([{
            colTag: 'factor1',
            use: ColumnConstants.FACTOR_MODEL,
            options: [],
            columnOptionType: 'ColumnOption'
        }])),
    };

    const httpMock = {
        get: jest.fn(),
        post: jest.fn()
    };

    let customTitleOption;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FactorDataSummaryTableComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ColumnOptionService, useValue: columnOptionsServiceMock},
                {provide: HttpClient, useValue: httpMock}
            ]
        });

        fixture = TestBed.createComponent(FactorDataSummaryTableComponent);
        component = fixture.componentInstance;

        FactorDataChartSettingsStore.init();

        const inputs = new Map();

        const columnSet = new ColumnSet();
        columnSet.columns = [ new ColumnConfig(col) ];
        inputs.set(ColumnType.COLUMNS, columnSet);

        FactorDataChartSettingsStore.inputs = inputs;
        component.columnType = ColumnType.COLUMNS;

        customTitleOption = new CustomTitleColumnOption({ customTitle: 'factor'});
        component.column = new ColumnConfig(col);
        component.column.optionValues.push(customTitleOption);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test onEditFactorSettingsModalOpened with valid factorKey', () => {
        const column = new ColumnConfig(col);
        component.isEditFactorSettingsModalOpen = false;
        component.onEditFactorSettingsModalOpened(column.columnKey);
        expect(component.factorColumnOptions).toStrictEqual([]);
        expect(component.isEditFactorSettingsModalOpen).toBeTruthy();
        expect(component.column).toStrictEqual(column);
    });

    it('test onEditFactorSettingsModalOpened with valid factorKey for Error', () => {
        const column = new ColumnConfig(col);
        component.isEditFactorSettingsModalOpen = false;
        jest.spyOn(component['columnOptionService'], 'fetchColumnOptions$').mockReturnValue(throwError(''));

        component.onEditFactorSettingsModalOpened(column.columnKey);

        expect(component.factorColumnOptions).toBeUndefined();
        expect(component.isEditFactorSettingsModalOpen).not.toBeTruthy();
        expect(component.column).toStrictEqual(column);
    });

    it('test onEditFactorSettingsModalOpened with invalid factorKey', () => {
        // const column = new ColumnConfig(col);
        component.isEditFactorSettingsModalOpen = false;
        component.onEditFactorSettingsModalOpened('invalid');
        expect(component.factorColumnOptions).toBeUndefined();
        expect(component.isEditFactorSettingsModalOpen).not.toBeTruthy();
        expect(component.column).toBeUndefined();
    });

    it('test onEditFactorSettingsModalClosed', () => {
        component.isEditFactorSettingsModalOpen = true;
        component.onEditFactorSettingsModalClosed(true);
        expect(component.isEditFactorSettingsModalOpen).toBeFalsy();
        expect(FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(ColumnType.COLUMNS).getValue()).toBeTruthy();
    });
});
