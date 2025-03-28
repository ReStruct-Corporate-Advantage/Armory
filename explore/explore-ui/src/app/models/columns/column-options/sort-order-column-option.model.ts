import {isEmpty, isObject, isUndefined} from 'lodash';
import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Sort Order Column Option Model
 */
export class SortOrderColumnOptionModel extends AbstractColumnOption {

    static CONFIG_TYPE = 'sortOrderColumnOption';

    sortOrder: string;

    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return SortOrderColumnOptionModel.CONFIG_TYPE;
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any): void {
        requestParams['columnSorting'] = this.doSerialize();
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        const data: any = {};
        data.sortOrder = this.sortOrder;
        return data;
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (!isUndefined(data.sortOrder)) {
            this.sortOrder = data.sortOrder;
        }
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof  SortOrderColumnOptionModel)) {
            return false;
        }
        return this.sortOrder === otherColOption.sortOrder;
    }

    /**
     * Check if the settings are valid
     */
    isValid(): boolean {
        return !isEmpty(this.sortOrder);
    }
}
