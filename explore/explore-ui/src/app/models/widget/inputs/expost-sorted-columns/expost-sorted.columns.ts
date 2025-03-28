import {isEmpty, isObject} from 'lodash';
import {AbstractConfig, RequestParamsCreator, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';

export class  ExpostSortedColumns extends AbstractConfig implements WidgetInput, RequestParamsCreator {

    /**
     * Order of the expost statistics column as set by the user
     */
    expostSortedColumns: string[] = [];

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
        return 'expostSortedColumns';
    }


    addRequestParams(requestParams: any, paramName?: string): void {
        if(!isEmpty(this.expostSortedColumns)) {
            requestParams.expostSortedColumns = this.expostSortedColumns;
        }
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if(!data) {
            return;
        }

        if(data.expostSortedColumns) {
            this.expostSortedColumns = data.expostSortedColumns;
        }
    }

    /**
     * Return true if the passed in widgetInput is equal to this expostSortedColumns
     */
    equals(widgetInput: WidgetInput): boolean {
        if(!(widgetInput instanceof ExpostSortedColumns)) {
            return false;
        }

        if(widgetInput.expostSortedColumns == null || this.expostSortedColumns == null) {
            return false;
        }

        if(widgetInput.expostSortedColumns.length !== this.expostSortedColumns.length) {
            return false;
        }

        return widgetInput.expostSortedColumns.every((v, i) => v === this.expostSortedColumns[i])
    }

    getConfigType() {
        return 'expostSortedColumns';
    }

    isDataStoreInput(): boolean {
        return true;
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
            expostSortedColumns: this.expostSortedColumns
        };
        data.configType = ExpostSortedColumns.configType;
        return data;
    }
}
