import {AbstractConfig, RequestParamsCreator, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isNil, isObject} from 'lodash';

/**
 * WidgetInput model for override date sorting by oldest
 */
export class OverrideDateSortByOldest extends AbstractConfig implements WidgetInput, RequestParamsCreator {
    static readonly CONFIG_TYPE = 'overrideDateSortByOldest';

    sortByOldest: boolean;

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
        return OverrideDateSortByOldest.CONFIG_TYPE;
    }

    getConfigType() {
        return OverrideDateSortByOldest.CONFIG_TYPE;
    }

    /**
     * Equals method to test whether two object are equal or not
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof OverrideDateSortByOldest)) {
            return false;
        }
        return this.sortByOldest === widgetInput.sortByOldest;
    }

    isDataStoreInput(): boolean {
        return true;
    }

    addRequestParams(requestParams: any, paramName?: string): void {
        requestParams[paramName ? paramName : OverrideDateSortByOldest.CONFIG_TYPE] = this.sortByOldest;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            sortByOldest: this.sortByOldest
        };
    }

    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }
        this.sortByOldest = data.sortByOldest;
    }
}
