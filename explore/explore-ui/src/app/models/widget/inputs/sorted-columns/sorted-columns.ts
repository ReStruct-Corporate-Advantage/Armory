import {AbstractConfig, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {SortedColumn} from './sorted-column';
import {isArray, isObject} from 'lodash';

export class SortedColumns extends AbstractConfig implements WidgetInput {

    sortedColumns: SortedColumn[] = [];

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return 'sortedColumns';
    }

    getConfigType() {
        return 'sortedColumns';
    }

    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * Return true if the passed in widgetInput is equal to this sorted-columns
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof SortedColumns)) {
            return false;
        }

        if (!widgetInput.sortedColumns && !this.sortedColumns) {
            return true;
        }

        if (widgetInput.sortedColumns.length !== this.sortedColumns.length) {
            return false;
        }

        if (widgetInput.sortedColumns.length === this.sortedColumns.length) {
            let checkEquality = true;
            widgetInput.sortedColumns.forEach((sortedColumn, index) => {
                const sortedcolumn2 = this.sortedColumns[index];
                if (!sortedColumn.equals(sortedcolumn2)) {
                    checkEquality = false
                }
            });
            return checkEquality;
        }

    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        if (data.sortedColumns) {
            this.sortedColumns = data.sortedColumns.map(sortedColumn => new SortedColumn(sortedColumn));
        } else if (isArray(data)) {
            // For old favs we simply have array of SortedColumn
            this.sortedColumns = data.map(sortedColumn => new SortedColumn(sortedColumn));
        }
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {
            sortedColumns: this.sortedColumns.map(sortedColumn => sortedColumn.serialize())
        };
        data.configType = SortedColumns.configType;
        return data;
    }
}

