import {AbstractConfig} from '../../../core/models/abstract-config.model';
import {isEqual, isNil, isObject} from 'lodash';
import {SerializeFavoriteType} from '../../../favorite/enums';

export class CavContributor extends AbstractConfig {
    /** The CAV contributor field name */
    field: string;
    /** The CAV contributor display name */
    name: string

    /**
     * Constructor to create a new CavContributor
     * @param data
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize saved CavContributor from data to object
     * @param data in JSON form
     */
    deserialize(data: any): void {
        this.field = data.field;
        this.name = data.name;
    }

    /**
     * Serialize CavContributor to JSON format
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        return {
            field: this.field,
            name: this.name
        };
    }
    /**
     * Checks if CavContributor is valid
     */
    isValid(): boolean {
        if (isNil(this.field)) {
            return false;
        }
        if (isNil(this.name)) {
            return false;
        }
        return true;
    }

    /**
     * Returns true if other is equal to this
     */
    equals(other: CavContributor): boolean {
        if (isNil(other) || !(other instanceof CavContributor)) {
            return false;
        }
        if (!isEqual(this.field, other.field)) {
            return false;
        }
        if (!isEqual(this.name, other.name)) {
            return false;
        }
        return true;
    }
}
