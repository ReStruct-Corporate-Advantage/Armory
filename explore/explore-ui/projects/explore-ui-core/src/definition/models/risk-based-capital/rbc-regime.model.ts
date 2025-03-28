import {isObject, isNil} from 'lodash';
import {AbstractConfig} from '../../../core/models/abstract-config.model';
import {SerializeFavoriteType} from '../../../favorite/enums';

/**
 * Risk Based Capital Regime
 */
export class RbcRegime extends AbstractConfig {
    regimeName: string;
    regimeId: string;

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    deserialize(data: any): void {
        this.regimeName = data.regimeName;
        this.regimeId = data.regimeId;
    }

    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            regimeName: this.regimeName,
            regimeId: this.regimeId
        };
    }

    equals(other: RbcRegime): boolean {
        if (!(other instanceof RbcRegime)) {
            return false;
        }
        if (this.regimeName !== other.regimeName) {
            return false;
        }
        return this.regimeId === other.regimeId;
    }

    /**
     * Returns true is RbcRegime is valid
     */
    isValid(): boolean {
        return !isNil(this.regimeName) && !isNil(this.regimeId);
    }
}
