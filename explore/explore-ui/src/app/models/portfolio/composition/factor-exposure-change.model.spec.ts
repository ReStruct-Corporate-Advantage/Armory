import { FactorExposureChange } from './factor-exposure-change.model';

describe('FactorExposureChange', () => {
    let factorExposureChange: FactorExposureChange;

    beforeEach(() => {
        factorExposureChange = new FactorExposureChange();
    });

    it('should create an instance', () => {
        expect(factorExposureChange).toBeTruthy();
    });

    it('should deserialize data correctly', () => {
        const data = {
            exposureValue: 10,
            newExposureValue: 20,
            factorTitle: 'Factor 1'
        };
        factorExposureChange.deserialize(data);
        expect(factorExposureChange.exposureValue).toBe(10);
        expect(factorExposureChange.newExposureValue).toBe(20);
        expect(factorExposureChange.factorTitle).toBe('Factor 1');
    });

    it('should serialize data correctly', () => {
        factorExposureChange.exposureValue = 10;
        factorExposureChange.newExposureValue = 20;
        factorExposureChange.factorTitle = 'Factor 1';
        const serializedData = factorExposureChange.serialize();
        expect(serializedData).toEqual({
            exposureValue: 10,
            newExposureValue: 20,
            factorTitle: 'Factor 1'
        });
    });

    it('should return true for equal objects', () => {
        expect(factorExposureChange.equals({})).toBe(false);

        const data = {
            exposureValue: 10,
            newExposureValue: 20,
            factorTitle: 'Factor 1'
        };
        const anotherFactorExposureChange = new FactorExposureChange(data);
        factorExposureChange.deserialize(data);
        expect(factorExposureChange.equals(anotherFactorExposureChange)).toBe(true);
    });

    it('should return false for unequal objects', () => {
        const data1 = {
            exposureValue: 10,
            newExposureValue: 20,
            factorTitle: 'Factor 1'
        };
        const data2 = {
            exposureValue: 15,
            newExposureValue: 25,
            factorTitle: 'Factor 2'
        };
        const anotherFactorExposureChange = new FactorExposureChange(data2);
        factorExposureChange.deserialize(data1);
        expect(factorExposureChange.equals(anotherFactorExposureChange)).toBe(false);
    });
});
