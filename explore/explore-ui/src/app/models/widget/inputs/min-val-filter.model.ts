import {isObject} from 'lodash';
import {
    AbstractConfig,
    RequestParamsCreator,
    SerializeFavoriteType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';

export class MinValFilter extends AbstractConfig implements WidgetInput, RequestParamsCreator {
    static readonly CONFIG_TYPE = 'minValFilter';

    /**
     * Min-Val-Filter model field
     */
    value: number;
    useAbsolute: boolean;
    columnTag: string;
    columnKey: string;
    title: string;
    positionColumnType: string;

    /**
     * Checks if the min val filter is valid or not
     */
    static isValidMinValFilter(filter: MinValFilter): boolean {
        return filter && filter.value && !!filter.columnTag;
    }

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
     * Return config value
     */
    static get configType(): string {
        return MinValFilter.CONFIG_TYPE;
    }

    /**
     * Equals method to test whether two object are equal or not
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof MinValFilter)) {
            return false;
        }
        if (this.value !== widgetInput.value) {
            return false;
        }
        if (this.columnKey !== widgetInput.columnKey) {
            return false;
        }
        if (this.columnTag !== widgetInput.columnTag) {
            return false;
        }
        if (this.useAbsolute !== widgetInput.useAbsolute) {
            return false;
        }
        if (this.title !== widgetInput.title) {
            return false;
        }
        return this.positionColumnType === widgetInput.positionColumnType;
    }

    isDataStoreInput(): boolean {
        return true;
    }

    addRequestParams(requestParams: any, paramName?: string): void {
        requestParams[paramName ? paramName : WidgetInputType.MIN_VAL_FILTER] = this.serialize();
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            value: this.value,
            columnTag: this.columnTag,
            columnKey: this.columnKey,
            positionColumnType: this.positionColumnType,
            useAbsolute: this.useAbsolute
        };
    }

    deserialize(data: any): void {
        // If minValFilter data is not set inside 'data' then check data.data
        if (data && !data.columnTag) {
            data = data.data;
        }
        if (data) {
            this.value = data.value;
            this.positionColumnType = data.positionColumnType;
            this.columnTag = data.columnTag;
            this.columnKey = data.columnKey;
            this.useAbsolute = data.useAbsolute;
        }
    }
}
