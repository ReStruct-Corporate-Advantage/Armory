import {SortedColumn} from '@models/widget/inputs/sorted-columns/sorted-column';

describe('SortedColumn tests', () => {
    it('Test equals', () => {
        const sortedColumn = new SortedColumn({colId: 'pct_mv', sort: 'desc'});
        const diffColId = new SortedColumn({colId: 'pct_mv', sort: 'asc'});
        const diffSort = new SortedColumn({colId: 'pct_mv', sort: 'asc'});
        const equalSortedColumn = new SortedColumn({colId: 'pct_mv', sort: 'desc'});

        expect(sortedColumn.equals(null)).toBeFalsy();
        expect(sortedColumn.equals(diffColId)).toBeFalsy();
        expect(sortedColumn.equals(diffSort)).toBeFalsy();
        expect(sortedColumn.equals(equalSortedColumn)).toBeTruthy();
    });
});
