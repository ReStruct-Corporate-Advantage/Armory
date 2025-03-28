import {isObject} from 'lodash';
import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Model class for date column format column option
 */
export class MissingDataHandlingColumnOptionModel extends AbstractColumnOption {

    static CONFIG_TYPE = 'ConstraintMissingDataHandling';

    missingDataHandling: string;
    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return MissingDataHandlingColumnOptionModel.CONFIG_TYPE;
    }

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
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (data.missingDataHandling) {
            this.missingDataHandling = data.missingDataHandling;
        }
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        return {
            missingDataHandling: this.missingDataHandling
        };
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof MissingDataHandlingColumnOptionModel)) {
            return false;
        }
        return this.missingDataHandling === otherColOption.missingDataHandling;
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any): void {
        requestParams['missingDataHandling'] = this.missingDataHandling;

    }

    /**
     * Check if the settings are valid
     */
    isValid(): boolean {
        return true;
    }

}
