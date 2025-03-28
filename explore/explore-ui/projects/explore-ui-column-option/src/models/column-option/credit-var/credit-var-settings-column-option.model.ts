import {isNil, isObject} from 'lodash';
import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Model class for date column format column option
 */
export class CreditVarSettingsColumnOption extends AbstractColumnOption {

    static CONFIG_TYPE = 'creditVarSettings';

    static readonly DEFAULT_CONFIDENCE_LEVEL_PERCENTAGE = 84.0;

    // number stored as string
    confidenceLevelPercentage = CreditVarSettingsColumnOption.DEFAULT_CONFIDENCE_LEVEL_PERCENTAGE;

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return CreditVarSettingsColumnOption.CONFIG_TYPE;
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
        if (data.confidenceLevelPercentage) {
            this.confidenceLevelPercentage = data.confidenceLevelPercentage;
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
            confidenceLevelPercentage: this.confidenceLevelPercentage
        };
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof CreditVarSettingsColumnOption)) {
            return false;
        }
        return this.confidenceLevelPercentage === otherColOption.confidenceLevelPercentage;
    }

    /**
     * Method that validates if the column option settinsg are valid to be serialized or to be added on to the request
     */
    isValid(): boolean {
        return this.isValidConfidenceLevelPercentage();
    }

    private isValidConfidenceLevelPercentage(): boolean {
        return !isNil(this.confidenceLevelPercentage);
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any) {
        const params: any = {};
        if (this.isValidConfidenceLevelPercentage()) {
            params.confidenceLevelPercentage = this.confidenceLevelPercentage;
        }
        requestParams[this.configType] = params;
    }

}
