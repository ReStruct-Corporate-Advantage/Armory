import {isArray, isNil, isObject, isUndefined} from 'lodash';
import {AbstractConfig} from '../../core/models/abstract-config.model';
import {CoreColumnUtils} from '../../column/core-column.utils';
import {WidgetInput} from '../interfaces';
import {SerializeFavoriteType} from '../../favorite/enums';
import {ConfigState} from '../../core/enums';
import {CoreFavoriteUtils} from '../../favorite/utils';

/**
 * Grid state model
 */
export class ColumnState extends AbstractConfig implements WidgetInput {
    static readonly CONFIG_TYPE = 'columnState';
    static readonly configType = ColumnState.CONFIG_TYPE;

    changeState: ConfigState = ConfigState.EXISTING;

    columns: TableColumnState[] = [];

    /**
     * constructor
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * This function is to create the column state based off the legacy columnSet object that had the width on the column itself.
     */
    static createFromLegacyColumnData(data: any): ColumnState {
        const columnState = new ColumnState();

        if (data.columns && isArray(data.columns)) {
            for (const column of data.columns) {
                if (!isNil(column.columnKey)) {
                    columnState.columns.push(new TableColumnState(column.columnKey, column.displayWidth));
                }
            }
        }

        return columnState;
    }

    getConfigType() {
        return ColumnState.CONFIG_TYPE;
    }

    /**
     * Deserialize the passed in data into properties of this object
     */
    deserialize(data: any): void {
        if (isUndefined(data) || isUndefined(data.columns)) {
            return;
        }

        // if passed in data is column state, then update the columns
        for (const column of data.columns) {
            // if the data is passed from agGrid event columnApi.getColumnState()
            // we want to change what it passed as colId to columnKey to be consistent
            if (column.colId) {
                column.columnKey = column.colId;
            }
            this.columns.push(new TableColumnState(column.columnKey, column.width, column.pinned));
        }
    }

    /**
     * In old explore the column widths was stored in the widget inputs.  this is used to convert the legacy favorites over.
     */
    addLegacyColumnWidths(data: any) {
        // If the object is not there then get out of here.
        if (!data || !data.inputs || !data.inputs.columnWidths) {
            return;
        }
        const columnWidths: any = data.inputs.columnWidths;

        // Get the column widths.
        if (columnWidths.columnWidths && columnWidths.columnWidths.length > 0) {
            for (const column of columnWidths.columnWidths) {
                if (!isNil(column.displayWidth)) {
                    this.columns.push(new TableColumnState(column.columnKey, column.displayWidth));
                }
                // In old explore the pivot widget saved with _ in the variables, so cater for both.
                if (!isNil(column._displayWidth)) {
                    this.columns.push(new TableColumnState(column._columnKey, column._displayWidth));
                }
            }
        }

        // In old explore the pivot widget saved with _ in the variables, so cater for both.
        if (columnWidths._columnWidths && columnWidths._columnWidths.length > 0) {
            for (const column of columnWidths._columnWidths) {
                if (!isNil(column._displayWidth)) {
                    this.columns.push(new TableColumnState(column._columnKey, column._displayWidth));
                }
            }
        }
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize this object properties into a plain javascript style object to be saved in favorites
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        const data = {columns: []};

        // If we are serializing for favorite change detection and column state has not been explicitly modified, do not serialize.
        // Want to ignore because column state may change the first time the widget is loaded due to legacy models + auto-sizing
        if (CoreFavoriteUtils.isFavoriteChangeDetection(isNested) && this.changeState !== ConfigState.MODIFIED) {
            return data;
        }

        for (const column of this.columns) {
            data.columns.push({
                'columnKey': column.columnKey,
                'width': column.width,
                'pinned': column.pinned
            });
        }

        return data;
    }

    /**
     * comparing items of Gridlines
     */
    equals(data: any): boolean {
        if (isNil(data)) {
            return false;
        }

        if (data.columns.length !== this.columns.length) {
            return false;
        }

        for (let i = 0; i < data.columns.length; i++) {
            if (this.columns[i].columnKey !== data.columns[i].columnKey || this.columns[i].width !== data.columns[i].width || this.columns[i].pinned !== data.columns[i].pinned) {
                return false;
            }
        }

        return true;
    }

    /**
     * @return false as it's not data store input
     */
    isDataStoreInput(): boolean {
        return false;
    }

    /**
     * When we serialize the favorite we want to have the opportunity to remove columns that are no longer included.
     */
    removeExcessColumns(columnKeys: string[]): void {
        this.columns = this.columns.filter((colState: TableColumnState) => {
            return columnKeys.indexOf(CoreColumnUtils.rootColumnKey(colState.columnKey)) >= 0;
        });
    }

    /**
     * remove the column state of column and its child columns
     * @param columnKey
     * @param excludeParent
     */
    removeColumnState(columnKey: string, excludeParent = false) {
        this.columns = this.columns.filter((colState: TableColumnState) => {
            const rootColumnKey = CoreColumnUtils.rootColumnKey(colState.columnKey);
            return rootColumnKey !== columnKey || (columnKey === colState.columnKey && excludeParent);
        });
    }

    mergeColumnState(columnState: ColumnState) {
        if (!columnState.columns.length) {
            return;
        }
        columnState.columns.forEach(state => {
            if (!this.columns.some(value => {
                return value.columnKey === state.columnKey;
            })) {
                this.columns.push(state);
            }
        });
    }
}

/**
 * Table column state model
 */
export class TableColumnState {
    /**
     * @param columnKey - column key
     * @param width - column width
     * @param pinned - if column is pinned
     */
    constructor(public columnKey: string, public width?: number, public pinned?: PinnedState) {}
}


type PinnedState = boolean | string | 'left' | 'right';
