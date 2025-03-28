import {AbstractConfig} from '@blk/explore-ui-core';
import {isObject} from 'lodash';

/**
 * This is a representation of an individual sorted column config
 */
export class SortedColumn extends AbstractConfig {
    // We use colId, sort and sortIndex as those are attributes that ag-grid uses for column sorting
    colId: string;
    sort: string | 'ASC' | 'DESC' | 'BREAKDOWN';
    sortIndex: number;

    /**
     * Constructor with parameters
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Return true if the passed in sortedColumn is equal to SortedColumn
     */
    equals(otherSortedColumn: SortedColumn): boolean {
        if (otherSortedColumn === null) {
            return false;
        }

        if (this.colId !== otherSortedColumn.colId) {
            return false;
        }

        if (this.sortIndex !== otherSortedColumn.sortIndex) {
            return false;
        }

        return this.sort === otherSortedColumn.sort;
    }

    /**
     * This function is used to serialize.
     */
    serialize(): any {
        return {
            sort: this.sort,
            colId: this.colId,
            sortIndex: this.sortIndex
        };
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (data) {
            this.colId = data.colId;
            this.sort = data.sort;
            this.sortIndex = data.sortIndex;
        }
    }
}
