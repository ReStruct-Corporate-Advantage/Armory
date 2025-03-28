import {cloneDeep, isEmpty, isEqual, isNil, isObject} from 'lodash';
import {CavContributor} from './cav-contributor.model';
import {AbstractConfig} from '../../../core/models/abstract-config.model';
import {SerializeFavoriteType} from '../../../favorite/enums';

export class CavContributorGroup extends AbstractConfig {
    /** The asset type used as the group for the CAV contributors */
    assetType: string;
    /** The CAV contributors */
    cavContributors: CavContributor[] = [];

    /**
     * Constructor to create a new CavContributorGroup
     * @param data
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize saved CavContributorGroup from data to object
     * @param data in JSON form
     */
    deserialize(data: any): void {
        this.assetType = data.assetType;
        this.cavContributors = data.cavContributors;
    }

    /**
     * Serialize CavContributorGroup to JSON format
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        return {
            assetType: this.assetType,
            cavContributors: cloneDeep(this.cavContributors)
        };
    }
    /**
     * Checks if CavContributorGroup is valid
     */
    isValid(): boolean {
        if (isNil(this.assetType)) {
            return false;
        }
        if (isEmpty(this.cavContributors)) {
            return false;
        }
        return true;
    }

    /**
     * Returns true if other is equal to this
     */
    equals(other: CavContributorGroup): boolean {
        if (isNil(other) || !(other instanceof CavContributorGroup)) {
            return false;
        }
        if (!isEqual(this.assetType, other.assetType)) {
            return false;
        }
        if (!isEqual(this.cavContributors, other.cavContributors)) {
            return false;
        }
        return true;
    }
}
