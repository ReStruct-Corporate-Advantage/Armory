import {isObject, isEmpty} from 'lodash';
import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';
import {ActiveType} from '../../enums';

/**
 * Model for the Active Calculation column option.
 */
export class ActiveCalculationColumnOption extends AbstractColumnOption {
    static CONFIG_TYPE = 'activeCalculationColumnOption';

    activeType: string;

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
        return ActiveCalculationColumnOption.CONFIG_TYPE;
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any): void {
        requestParams['activeType'] = this.activeType;

    }

    /**
     * Initialises the column with the default settings.
     */
    initialize(defaultSettings: any): void {
        this.activeType = ActiveType[ActiveType.DIFF_1MINUS2];
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        return {
            activeType: this.activeType,
        };
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        this.activeType = data.activeType;
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof  ActiveCalculationColumnOption)) {
            return false;
        }
        return this.activeType === otherColOption.activeType;
    }

    /**
     * Check if the settings are valid
     */
    isValid(): boolean {
        return !isEmpty(this.activeType);
    }
}


