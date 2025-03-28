import {
    AbstractConfig,
    SerializeFavoriteType
} from '@blk/explore-ui-core';
import {cloneDeep, isEmpty, isEqual, isObject} from 'lodash';
import {FactorExposureChange} from '@models/portfolio/composition/factor-exposure-change.model';


export class FactorExposureCompositionSetting extends AbstractConfig {
    static readonly FACTOR_EXPOSURE_COMPOSITION_SETTING = 'FactorExposureCompositionSetting';

    static readonly FACTOR_TO_EXPOSURE_HOLDINGS: string = 'factorToExposureHoldings';

    factorToExposureMap: Map<string, FactorExposureChange> = new Map<string, FactorExposureChange>();

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    copyFrom(source: AbstractConfig): void {
        if (!source) {
            return;
        }
        if (!(source instanceof FactorExposureCompositionSetting)) {
            return;
        }

        this.factorToExposureMap = cloneDeep(source.factorToExposureMap);
    }

    deserialize(data: any): void {
        if (!data) {
            return;
        }

        const factorToExposureHoldings = data[FactorExposureCompositionSetting.FACTOR_TO_EXPOSURE_HOLDINGS];
        if (!isEmpty(factorToExposureHoldings)) {
            this.factorToExposureMap = new Map<string, FactorExposureChange>();
            for (const key of Object.keys(factorToExposureHoldings)) {
                const value = factorToExposureHoldings[key];
                this.factorToExposureMap.set(key, new FactorExposureChange(value));
            }
        }
    }

    /**
     * serialize implementation
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const serializedObject: any = {};

        const factorExposures = this.doSerializeFactorExposureMap();
        if (!isEmpty(factorExposures)) {
            serializedObject[FactorExposureCompositionSetting.FACTOR_TO_EXPOSURE_HOLDINGS] = factorExposures;
        }

        return serializedObject;
    }

    equals(obj: FactorExposureCompositionSetting): boolean {
        if (!(obj instanceof FactorExposureCompositionSetting)) {
            return false;
        }
        return isEqual(this.factorToExposureMap, obj.factorToExposureMap);
    }

    addRequestParams(requestParams: any): void {
        if (!isEmpty(this.factorToExposureMap)) {
            const factorToExposureObj: any = {};
            // factorTag: exposureValue object
            this.factorToExposureMap?.forEach((value, key) => {
                factorToExposureObj[key] = value.newExposureValue;
            });
            requestParams.factorToExposureMap = factorToExposureObj;
        }
    }

    private doSerializeFactorExposureMap(): any {
        const factorToExposureObj: any = {};
        this.factorToExposureMap?.forEach((value, key) => {
            factorToExposureObj[key] = value.serialize();
        });
        return factorToExposureObj;
    }

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return FactorExposureCompositionSetting.FACTOR_EXPOSURE_COMPOSITION_SETTING;
    }

}
