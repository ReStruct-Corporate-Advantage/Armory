import {ColumnOptionMetaDataInterface} from '@blk/explore-ui-core';
import {ColumnConfig} from '@blk/explore-ui-core';

/**
 * Model representing the selected column item in the column selector
 */
export class SelectedColumnSelectorOption {
    column: ColumnConfig;
    columnOptions: ColumnOptionMetaDataInterface[];

    constructor(column: ColumnConfig, columnOptions: ColumnOptionMetaDataInterface[]) {
        this.column = column;
        this.columnOptions = columnOptions;
    }

    /**
     * A light equality check disregarding columnOptions
     * @param otherOption - other SelectedColumnSelectorOption to check against
     */
    isEqualWithoutColumnOptions(otherOption: SelectedColumnSelectorOption): boolean {
        if (this.column.columnTag !== otherOption.column.columnTag) {
            return false;
        }
        if (this.column.positionColumnType !== otherOption.column.positionColumnType) {
            return false;
        }
        if (this.column.columnKey !== otherOption.column.columnKey) {
            return false;
        }
        return true;
    }
}
