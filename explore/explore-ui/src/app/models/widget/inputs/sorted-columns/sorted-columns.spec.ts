import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {SortedColumns} from './sorted-columns';
import {SortedColumn} from './sorted-column';
import {ConfigInitializer} from '../../../../initializers/config.initializer';

/**
 * Sorted Columns tests
 */
describe('Sorted Columns test', function () {

    beforeAll((function () {
        ConfigInitializer.registerWidgetInputTypes();
    }));

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function () {
        const sortedColumns: SortedColumns = new SortedColumns();
        const sortedcolumn1 = new SortedColumn({colId: '', sort: 'ASC'});
        const sortedcolumn2 = new SortedColumn({colId: 'PORT', sort: 'DESC'});
        sortedColumns.sortedColumns = [sortedcolumn1, sortedcolumn2];

        // Convert the object to string and then back to json again.
        const serializedData: any = sortedColumns.serialize();

        const newSortedColumns: SortedColumns = ConfigTypeFactory.createConfig(serializedData, SortedColumns.configType, false);
        // Validate that the before and after are the same.
        expect(newSortedColumns.sortedColumns[0].colId).toBe('');
        expect(newSortedColumns.sortedColumns[0].sort).toBe('ASC');
        expect(newSortedColumns.sortedColumns[1].colId).toBe('PORT');
        expect(newSortedColumns.sortedColumns[1].sort).toBe('DESC');

    });

    /**
     * Test case for deserialize. In case the required fields are present in data
     */
    it('Test deserialize - data is present in data', function () {
        const sortedcolumn1 = new SortedColumn({colId: '', sort: 'ASC'});
        const sortedcolumn2 = new SortedColumn({colId: 'PORT', sort: 'DESC'});
        let dataSortedColumns: SortedColumn[];
        dataSortedColumns = [sortedcolumn1, sortedcolumn2];
        const data: any = {
            'sortedColumns': dataSortedColumns,
        };

        let sortedColumns: SortedColumns = new SortedColumns(data);
        // Validate
        expect(sortedColumns).not.toBeUndefined();
        expect(sortedColumns).not.toBeNull();
        expect(sortedColumns.sortedColumns.length).toBe(2);
        expect(sortedColumns.sortedColumns[0].colId).toBe('');
        expect(sortedColumns.sortedColumns[0].sort).toBe('ASC');
        expect(sortedColumns.sortedColumns[1].colId).toBe('PORT');
        expect(sortedColumns.sortedColumns[1].sort).toBe('DESC');

        const dataForOldFav = [{colId: 'pct_notional_val_0', sort: 'ASC'}];
        sortedColumns = new SortedColumns(dataForOldFav);
        expect(sortedColumns.sortedColumns.length).toBe(1);
        expect(sortedColumns.sortedColumns[0].sort).toBe('ASC');
        expect(sortedColumns.sortedColumns[0].colId).toBe('pct_notional_val_0');

        // Test with empty object
        sortedColumns = new SortedColumns({});
        expect(sortedColumns.sortedColumns).toEqual([]);
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const model1: SortedColumns = new SortedColumns();
        const model2: SortedColumns = new SortedColumns();
        expect(model1.equals(model2)).toBeTruthy();

        const sortedcolumn1 = new SortedColumn({colId: '', sort: 'ASC'});
        const sortedcolumn2 = new SortedColumn({colId: 'PORT', sort: 'DESC'});
        // Different arrangement of values
        model1.sortedColumns = [sortedcolumn1, sortedcolumn2];
        model2.sortedColumns = [sortedcolumn2, sortedcolumn1];

        expect(model1.equals(model2)).toBeFalsy();

        // Everything same now
        model1.sortedColumns = [sortedcolumn1, sortedcolumn2];
        model2.sortedColumns = [sortedcolumn1, sortedcolumn2];
        expect(model1.equals(model2)).toBeTruthy();
    });
});

