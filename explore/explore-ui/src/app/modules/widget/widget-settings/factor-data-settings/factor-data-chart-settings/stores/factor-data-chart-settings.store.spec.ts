import {ColumnType} from '@blk/explore-ui-core';
import {FactorDataChartSettingsStore} from './factor-data-chart-settings.store';

describe('FactorDataChartSettingsStore', () => {

    beforeAll(() => {
        FactorDataChartSettingsStore.init();
        FactorDataChartSettingsStore.columnsWidgetConfigInput = {
            inputConfigType: 'columns',
            inputTitle: 'columns',
            inputName: ColumnType.COLUMNS,
        };
        FactorDataChartSettingsStore.comparisonColumnsWidgetConfigInput = {
            inputConfigType: 'columns',
            inputTitle: 'columns',
            inputName: ColumnType.FACTOR_COMPARISON_COLUMNS,
        };
        FactorDataChartSettingsStore.restrictedColumnOptions = { sections: [] };
        FactorDataChartSettingsStore.restrictedColumnOptionsForComparisonColumns = { sections: [ 'abc' ] };
    });

    describe('init Test', () => {
        it('should initialize the object states', () => {
            expect(FactorDataChartSettingsStore.isApplyButtonDisabled$).toBeDefined();
            expect(FactorDataChartSettingsStore.isApplyButtonDisabled$.getValue()).toBeFalsy();
            expect(FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(ColumnType.COLUMNS)).toBeDefined();
            expect(FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(ColumnType.FACTOR_COMPARISON_COLUMNS)).toBeDefined();
            expect(FactorDataChartSettingsStore.getHideFactorColumnRiskSettings$(ColumnType.COLUMNS)).toBeDefined();
            expect(FactorDataChartSettingsStore.getHideFactorColumnRiskSettings$(ColumnType.FACTOR_COMPARISON_COLUMNS)).toBeDefined();
        });
    });

    describe('test method getRefreshFactorSummaryGrid$', () => {
        it('test for columnType = ColumnType.COLUMNS', () => {
            expect(FactorDataChartSettingsStore['refreshFactorSummaryGrid$'].getValue()).not.toBeTruthy();

            FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(ColumnType.COLUMNS).next(true);
            expect(FactorDataChartSettingsStore['refreshFactorSummaryGrid$'].getValue()).toBeTruthy();
        });

        it('test for columnType = ColumnType.FACTOR_COMPARISON_COLUMNS', () => {
            expect(FactorDataChartSettingsStore['refreshComparisonFactorSummaryGrid$'].getValue()).not.toBeTruthy();

            FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(ColumnType.FACTOR_COMPARISON_COLUMNS).next(true);
            expect(FactorDataChartSettingsStore['refreshComparisonFactorSummaryGrid$'].getValue()).toBeTruthy();
        });
    });

    describe('test method getHideFactorColumnRiskSettings$', () => {
        it('test for columnType = ColumnType.COLUMNS', () => {
            expect(FactorDataChartSettingsStore['hideFactorColumnRiskSettings$'].getValue()).not.toBeTruthy();

            FactorDataChartSettingsStore.getHideFactorColumnRiskSettings$(ColumnType.COLUMNS).next(true);
            expect(FactorDataChartSettingsStore['hideFactorColumnRiskSettings$'].getValue()).toBeTruthy();
        });

        it('test for columnType = ColumnType.FACTOR_COMPARISON_COLUMNS', () => {
            expect(FactorDataChartSettingsStore['hideComparisonFactorColumnRiskSettings$'].getValue()).toBeTruthy();

            FactorDataChartSettingsStore.getHideFactorColumnRiskSettings$(ColumnType.FACTOR_COMPARISON_COLUMNS).next(false);
            expect(FactorDataChartSettingsStore['hideComparisonFactorColumnRiskSettings$'].getValue()).not.toBeTruthy();
        });
    });

    describe('test method getColumnsWidgetConfigInput', () => {
        it('test for columnType = ColumnType.COLUMNS', () => {
            const columnWidgetInput = FactorDataChartSettingsStore.getColumnsWidgetConfigInput(ColumnType.COLUMNS);
            expect(columnWidgetInput).toBe(FactorDataChartSettingsStore.columnsWidgetConfigInput);
        });

        it('test for columnType = ColumnType.FACTOR_COMPARISON_COLUMNS', () => {
            const columnWidgetInput = FactorDataChartSettingsStore.getColumnsWidgetConfigInput(ColumnType.FACTOR_COMPARISON_COLUMNS);
            expect(columnWidgetInput).toBe(FactorDataChartSettingsStore.comparisonColumnsWidgetConfigInput);
        });
    });

    describe('test method getRestrictedColumnOptions', () => {
        it('test for columnType = ColumnType.COLUMNS', () => {
            const restrictedColumnOptions = FactorDataChartSettingsStore.getRestrictedColumnOptions(ColumnType.COLUMNS);
            expect(restrictedColumnOptions).toBe(FactorDataChartSettingsStore.restrictedColumnOptions);
        });

        it('test for columnType = ColumnType.FACTOR_COMPARISON_COLUMNS', () => {
            const restrictedColumnOptions = FactorDataChartSettingsStore.getRestrictedColumnOptions(ColumnType.FACTOR_COMPARISON_COLUMNS);
            expect(restrictedColumnOptions).toBe(FactorDataChartSettingsStore.restrictedColumnOptionsForComparisonColumns);
        });
    });

});
