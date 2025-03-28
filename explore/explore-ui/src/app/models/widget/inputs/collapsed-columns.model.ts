import {
    RequestParamsCreator,
    SerializeFavoriteType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';

/**
 * WidgetInput model for collapsed columns
 */
export class CollapsedColumns implements WidgetInput, RequestParamsCreator {
    static readonly CONFIG_TYPE = 'collapsedColumns';

    collapsedColumns: Set<string>;

    /**
     * Constructor.
     */
    constructor(collapsedColumns?: Set<string>) {
        this.collapsedColumns = new Set<string>(collapsedColumns);
    }

    getConfigType() {
        return WidgetInputType.COLLAPSED_COLUMNS;
    }

    /**
     * Equals method to test whether two object are equal or not
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof CollapsedColumns)) {
            return false;
        }
        return this.collapsedColumns === widgetInput.collapsedColumns;
    }

    isDataStoreInput(): boolean {
        return true;
    }

    addRequestParams(requestParams: any, paramName?: string, isExportRequest?: boolean, isBatchExport?: boolean): void {
        if (isBatchExport) {
            return;
        }
        if (isExportRequest) {
            requestParams[paramName ? paramName : WidgetInputType.COLLAPSED_COLUMNS] = [...this.collapsedColumns];
        }
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    serialize(_isNested?: boolean | SerializeFavoriteType): any {
    }

    deserialize(data: any): void {
    }

    removeFieldsForFavoriteChangeDetection(_serializedObject: any): void {
        // no implementation
    }
}
