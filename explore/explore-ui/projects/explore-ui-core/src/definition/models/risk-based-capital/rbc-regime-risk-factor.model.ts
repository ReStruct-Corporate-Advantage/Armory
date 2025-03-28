import {isObject} from 'lodash';
import {AbstractConfig} from '../../../core/models/abstract-config.model';
import {SerializeFavoriteType} from '../../../favorite/enums';

/**
 * Risk Based Capital Regime Risk Factor
 */
export class RbcRegimeRiskFactor extends AbstractConfig {
    riskFactorName: string;
    riskFactorId: string;

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    deserialize(data: any): void {
        this.riskFactorName = data.riskFactorName;
        this.riskFactorId = data.riskFactorId;
    }

    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            riskFactorName: this.riskFactorName,
            riskFactorId: this.riskFactorId
        };
    }

    equals(other: RbcRegimeRiskFactor): boolean {
        if (!(other instanceof RbcRegimeRiskFactor)) {
            return false;
        }
        if (this.riskFactorName !== other.riskFactorName) {
            return false;
        }
        return this.riskFactorId === other.riskFactorId;
    }
}
