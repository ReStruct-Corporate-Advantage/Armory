import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';
import {isObject} from 'lodash';

/**
 * Model for Style Measure Column Option.
 */
export class StyleMeasureColumnOptionModel extends AbstractColumnOption {
    static CONFIG_TYPE = 'StyleMeasureMetaData';
    min = 0;
    max = 100;
    weight = 0;
    isNormal = false;

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
        return StyleMeasureColumnOptionModel.CONFIG_TYPE;
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }
        this.min = data.min;
        this.max = data.max;
        this.weight = data.weight;
        this.isNormal = data.isNormal;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            min: this.min,
            max: this.max,
            weight: this.weight,
            isNormal: this.isNormal
        };
    }

    /**
     * Equals method implementation to compare with other column option@param otherColOption
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof StyleMeasureColumnOptionModel)) {
            return false;
        }

        if (this.min !== otherColOption.min) {
            return false;
        }
        if (this.max !== otherColOption.max) {
            return false;
        }
        if (this.weight !== otherColOption.weight) {
            return false;
        }
        return this.isNormal === otherColOption.isNormal;
    }

    /**
     * Check if the column option is valid
     */
    isValid(): boolean {
        return true;
    }
}
