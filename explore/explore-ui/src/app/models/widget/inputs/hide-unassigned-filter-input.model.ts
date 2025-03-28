import {AppUtils} from '@utils/app.utils';
import {
    AbstractConfig,
    RequestParamsCreator, SerializeFavoriteType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {isNil} from 'lodash';

/**
 * Model for widget's hide unassigned filter input
 * This controls whether to filter out securities bucketed in "Unassigned"
 */
export class HideUnassignedFilterInput extends AbstractConfig implements WidgetInput, RequestParamsCreator {
    hideUnassignedFilter: boolean;

    constructor(data?: any) {
        super();
        if (AppUtils.isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the type of the config object.
     */
    public static get configType(): string {
        return WidgetInputType.HIDE_UNASSIGNED_FILTER;
    }

    getConfigType() {
        return WidgetInputType.HIDE_UNASSIGNED_FILTER;
    }

    /**
     * Adds hideUnassignedFilter request attribute to the given request parameters
     */
    addRequestParams(requestParams: any, paramName?: string): void {
        requestParams[paramName ? paramName : WidgetInputType.HIDE_UNASSIGNED_FILTER] = this.hideUnassignedFilter;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    public serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            hideUnassignedFilter: this.hideUnassignedFilter
        };
    }

    /**
     * Deserialize the data into this object.
     */
    public deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }
        this.hideUnassignedFilter = data.hideUnassignedFilter;
    }

    /**
     * Return true if the passed in hideUnassignedFilter is equal to this hideUnassignedFilter
     */
    equals(otherFilter: AbstractConfig): boolean {
        if (!(otherFilter instanceof HideUnassignedFilterInput)) {
            return false;
        }
        return this.hideUnassignedFilter === otherFilter.hideUnassignedFilter;
    }

    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * Set the flag to false
     */
    reset() {
        this.hideUnassignedFilter = false;
    }
}

