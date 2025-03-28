import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';
import {isObject, isUndefined} from 'lodash';
import {DiversificationAdditionalAnalytics} from '../../enums/diversification-additional-analytics.enum';

export class FactorSettingsColumnOption extends AbstractColumnOption {

    public static CONFIG_TYPE = 'factorSettingsColumnOption';

    numberOfRiskFactors: number;
    additionalAnalytics: string[];

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    get configType(): string {
        return FactorSettingsColumnOption.CONFIG_TYPE;
    }

    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            numberOfRiskFactors: this.numberOfRiskFactors,
            additionalAnalytics: this.additionalAnalytics
        };
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        this.numberOfRiskFactors = data.numberOfRiskFactors;
        this.additionalAnalytics = data.additionalAnalytics;
    }

    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof FactorSettingsColumnOption)) {
            return false;
        }
        if (this.numberOfRiskFactors !== otherColOption.numberOfRiskFactors) {
            return false;
        }
        if (!this.additionalAnalytics && !otherColOption.additionalAnalytics) {
            return true;
        }
        if (this.additionalAnalytics?.length !== otherColOption.additionalAnalytics?.length) {
            return false;
        }
        return this.additionalAnalytics?.every((analytic, index) => analytic === otherColOption.additionalAnalytics[index]);
    }

    isValid(): boolean {
        return (isUndefined(this.numberOfRiskFactors) || (this.numberOfRiskFactors > 0 && this.numberOfRiskFactors <= 10)) && this._isValidAdditionalAnalytics(this.additionalAnalytics);
    }

    private _isValidAdditionalAnalytics(additionalAnalytics: string[]) {
        return isUndefined(additionalAnalytics) || additionalAnalytics.findIndex((item) => !(item in DiversificationAdditionalAnalytics)) < 0;
    }

    addRequestParams(requestParams: any, _paramName?: string) {
        requestParams['factorSettings'] = {
            numberOfRiskFactors: this.numberOfRiskFactors,
            additionalAnalytics: this.additionalAnalytics
        };
    }
}
