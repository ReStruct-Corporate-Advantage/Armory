import {TabularColumnFilters} from './tabular-column-filter.model';

describe('TabularColumnFilters', function () {

    let columnFilters: TabularColumnFilters;
    beforeEach(() => {
        columnFilters = new TabularColumnFilters();
        columnFilters.columnFilters = {pct_mv_1: {filter: 0.02, type: 'greaterThan', filterType: 'number'}};
    });

    /**
     * Test the serialize/deserialize methods for SortedColumns
     */
    it('Test serialize/deserialize', function () {
        columnFilters = new TabularColumnFilters();
        columnFilters.columnFilters = {pct_mv_1: {filter: 0.02, type: 'greaterThan', filterType: 'number'}};

        // Serialize the object to a string and create a new one
        const json: string = JSON.stringify(columnFilters.serialize(false));
        const newColumnFilters: TabularColumnFilters = new TabularColumnFilters(JSON.parse(json));

        // Validate the expected results.
        expect(newColumnFilters.columnFilters).toBeDefined();
        expect(newColumnFilters.columnFilters.pct_mv_1).toEqual({filter: 0.02, type: 'greaterThan', filterType: 'number'});
    });

    /**
     * Test the clearFilters function
     */
    it('Test clearFilters function', function () {
        columnFilters = new TabularColumnFilters();
        columnFilters.columnFilters = {pct_mv_1: {filter: 0.02, type: 'greaterThan', filterType: 'number'}};
        expect(columnFilters.isEmpty()).toBeFalsy();

        columnFilters.clearFilters();
        expect(columnFilters.isEmpty()).toBeTruthy();
    });

    /**
     * Test the add function
     */
    it('Test add function', function () {
        columnFilters = new TabularColumnFilters();
        expect(columnFilters.isEmpty()).toBeTruthy();
        columnFilters.add('pct_mv_1', {filter: 0.02, type: 'greaterThan', filterType: 'number'});
        expect(columnFilters.isEmpty()).toBeFalsy();
        expect(columnFilters.columnFilters['pct_mv_1']).toBeDefined();
    });
});
