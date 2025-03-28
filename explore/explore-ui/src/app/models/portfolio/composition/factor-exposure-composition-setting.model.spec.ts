import { FactorExposureCompositionSetting } from './factor-exposure-composition-setting.model';
import { FactorExposureChange } from './factor-exposure-change.model';

describe('FactorExposureCompositionSetting', () => {
    let factorExposureCompositionSetting: FactorExposureCompositionSetting;

    beforeEach(() => {
        factorExposureCompositionSetting = new FactorExposureCompositionSetting();
    });

    it('should create an instance', () => {
        expect(factorExposureCompositionSetting).toBeTruthy();
    });

    it('should deserialize data correctly', () => {
        const data = {
            factorToExposureHoldings: {
                factor1: { exposureValue: 10, newExposureValue: 20, factorTitle: 'Factor 1' }
            }
        };
        factorExposureCompositionSetting.deserialize(data);
        expect(factorExposureCompositionSetting.factorToExposureMap.size).toBe(1);
        expect(factorExposureCompositionSetting.factorToExposureMap.get('factor1')).toBeInstanceOf(FactorExposureChange);
    });

    it('should serialize data correctly', () => {
        const factorExposureChange = new FactorExposureChange({ exposureValue: 10, newExposureValue: 20, factorTitle: 'Factor 1' });
        factorExposureCompositionSetting.factorToExposureMap.set('factor1', factorExposureChange);
        const serializedData = factorExposureCompositionSetting.serialize();
        expect(serializedData).toEqual({
            factorToExposureHoldings: {
                factor1: { exposureValue: 10, newExposureValue: 20, factorTitle: 'Factor 1' }
            }
        });
    });

    it('should return true for equal objects', () => {
        factorExposureCompositionSetting.deserialize(undefined);
        const data = {
            factorToExposureHoldings: {
                factor1: { exposureValue: 10, newExposureValue: 20, factorTitle: 'Factor 1' }
            }
        };
        const anotherFactorExposureCompositionSetting = new FactorExposureCompositionSetting(data);
        factorExposureCompositionSetting.deserialize(data);
        expect(factorExposureCompositionSetting.equals(anotherFactorExposureCompositionSetting)).toBe(true);
    });

    it('should return false for unequal objects', () => {
        expect(factorExposureCompositionSetting.equals({})).toBe(false);

        const data1 = {
            factorToExposureHoldings: {
                factor1: { exposureValue: 10, newExposureValue: 20, factorTitle: 'Factor 1' }
            }
        };
        const data2 = {
            factorToExposureHoldings: {
                factor2: { exposureValue: 15, newExposureValue: 25, factorTitle: 'Factor 2' }
            }
        };
        const anotherFactorExposureCompositionSetting = new FactorExposureCompositionSetting(data2);
        factorExposureCompositionSetting.deserialize(data1);
        expect(factorExposureCompositionSetting.equals(anotherFactorExposureCompositionSetting)).toBe(false);
    });

    it('should copy data from another instance', () => {
        factorExposureCompositionSetting.copyFrom(undefined);
        expect(factorExposureCompositionSetting.factorToExposureMap.size).toBe(0);

        factorExposureCompositionSetting.copyFrom({});
        expect(factorExposureCompositionSetting.factorToExposureMap.size).toBe(0);

        const source = new FactorExposureCompositionSetting({
            factorToExposureHoldings: {
                factor1: { exposureValue: 10, newExposureValue: 20, factorTitle: 'Factor 1' }
            }
        });
        factorExposureCompositionSetting.copyFrom(source);
        expect(factorExposureCompositionSetting.factorToExposureMap.size).toBe(1);
        expect(factorExposureCompositionSetting.factorToExposureMap.get('factor1')).toBeInstanceOf(FactorExposureChange);
    });

    it('should add request params correctly', () => {
        const factorExposureChange = new FactorExposureChange({ exposureValue: 10, newExposureValue: 20, factorTitle: 'Factor 1' });
        factorExposureCompositionSetting.factorToExposureMap.set('factor1', factorExposureChange);
        const requestParams: any = {};
        factorExposureCompositionSetting.addRequestParams(requestParams);
        expect(requestParams).toEqual({
            factorToExposureMap: { factor1: 20 }
        });
    });
});
