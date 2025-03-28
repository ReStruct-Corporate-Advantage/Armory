import {isObject} from 'lodash';
import {RbcRegime} from './rbc-regime.model';
import {RbcRegimeRiskFactor} from './rbc-regime-risk-factor.model';
import {AbstractConfig} from '../../../core/models/abstract-config.model';
import {SerializeFavoriteType} from '../../../favorite/enums';

/**
 * Config model for Risk Based Capital regime settings
 * Holds the regime and which risk factors selected
 */
export class RbcRegimeSettings extends AbstractConfig {
    regime: RbcRegime = new RbcRegime();
    isRegimeOnly = false;
    riskFactors: RbcRegimeRiskFactor[] = [];

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize saved RBC regime settings from data to object
     */
    deserialize(data: any): void {
        this.regime = new RbcRegime(data.regime);
        this.riskFactors = data.riskFactors.map(factor => new RbcRegimeRiskFactor(factor));
        this.isRegimeOnly = data.isRegimeOnly;
    }

    /**
     * Serialize RBC regime settings to JSON format
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            regime: this.regime.serialize(),
            riskFactors: this.riskFactors.map(factor => factor.serialize()),
            isRegimeOnly: this.isRegimeOnly
        };
    }

    /**
     * Equals method
     */
    equals(other: RbcRegimeSettings): boolean {
        if (!(other instanceof RbcRegimeSettings)) {
            return false;
        }
        if (!this.regime.equals(other.regime)) {
            return false;
        }
        if (this.riskFactors.length !== other.riskFactors.length) {
            return false;
        }

        for (let i = 0; i < this.riskFactors.length; i++) {
            if (!this.riskFactors[i].equals(other.riskFactors[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks if the RbcRegimeSettings is valid
     */
    isValid(): boolean {
        // Must have a regime selected
        if (!this.regime.isValid()) {
            return false;
        }
        // Must have at least one risk factor selected if it's not regime only
        return this.isRegimeOnly || this.riskFactors.length > 0;
    }
}
