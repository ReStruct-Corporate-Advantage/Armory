import {ExpostSortedColumns} from '@models/widget/inputs/expost-sorted-columns/expost-sorted.columns';
import {ConfigTypeFactory} from '@blk/explore-ui-core';

describe('SortedColumn tests', () => {
    it('Test equals', () => {

        const expostSortedColumns = new ExpostSortedColumns({expostSortedColumns:["test", "sample"]});
        const diffOrder = new ExpostSortedColumns({expostSortedColumns:["sample","test"]});
        const diffContent = new ExpostSortedColumns({expostSortedColumns:["test"]});
        const equalExpostSortedColumns = new ExpostSortedColumns({expostSortedColumns:["test", "sample"]});

        expect(expostSortedColumns.equals(null)).toBeFalsy();
        expect(expostSortedColumns.equals(diffOrder)).toBeFalsy();
        expect(expostSortedColumns.equals(diffContent)).toBeFalsy();
        expect(expostSortedColumns.equals(equalExpostSortedColumns)).toBeTruthy();
    });

    it('Test serialize/deserialize', function() {
        const expostSortedColumns = new ExpostSortedColumns();
        expostSortedColumns.expostSortedColumns = ["test1", "test2"]

        // Convert the object to string and then back to json again.
        let serializedData: any = expostSortedColumns.serialize();

        let newExpostSortedColumns: ExpostSortedColumns = ConfigTypeFactory.createConfig(serializedData, expostSortedColumns.getConfigType(), false);
        // Validate that the before and after are the same.
        expect(newExpostSortedColumns.expostSortedColumns).toBe(expostSortedColumns.expostSortedColumns);
    });

    it('Test shouldSkipSerialize', () => {
        const expostSortedColumns = new ExpostSortedColumns();
        expect(expostSortedColumns.shouldSkipSerialize()).toBeFalsy();
    });
});
