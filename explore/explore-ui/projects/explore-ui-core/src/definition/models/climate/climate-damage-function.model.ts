import {isNil, isObject, isEqual} from 'lodash';
import {AbstractConfig} from '../../../core/models/abstract-config.model';
import {SerializeFavoriteType} from '../../../favorite/enums';

/**
 * Model for a climate damage function selection within the column option.
 */
export class ClimateDamageFunction extends AbstractConfig {

    damageFunctionField: string;
    damageFunctionDisplayName: string;

    /**
     * Constructor to create a new damage function option
     * @param data
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize saved damage function option from data to object
     * @param data in JSON form
     */
    deserialize(data: any): void {
        this.damageFunctionField = data.damageFunctionField;
        this.damageFunctionDisplayName = data.damageFunctionDisplayName;
    }

    /**
     * Serialize damage function option to JSON format
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        return {
            damageFunctionField: this.damageFunctionField,
            damageFunctionDisplayName: this.damageFunctionDisplayName
        };
    }
    /**
     * Checks if damage function option is valid
     */
    isValid(): boolean {
        if (isNil(this.damageFunctionField)) {
            return false;
        }
        if (isNil(this.damageFunctionDisplayName)) {
            return false;
        }
        return true;
    }

    /**
     * Returns true if other is equal to this
     */
    equals(other: ClimateDamageFunction): boolean {
        if (isNil(other) || !(other instanceof ClimateDamageFunction)) {
            return false;
        }
        if (!isEqual(this.damageFunctionField, other.damageFunctionField)) {
            return false;
        }
        if (!isEqual(this.damageFunctionDisplayName, other.damageFunctionDisplayName)) {
            return false;
        }
        return true;
    }
}
