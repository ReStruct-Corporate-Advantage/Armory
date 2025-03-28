import {PraadaAttributionCalculatorMethod} from './praada-attribution-calculator-method.model';

/**
 * Test cases for PraadaAttributionCalculatorMethod model class
 */
describe('PraadaAttributionCalculatorMethod', () => {

    /**
     * Test deserialize
     */
    it('deserialize', () => {
        const data: any = {'availableOnStandAlone': false, 'sectorLevels': ['IMMEDIATE_PARENT_LEVEL'], 'value': 'HYBRID', 'displayName': 'Hybrid'};
        const praadaAttributionCalculatorMethod = new PraadaAttributionCalculatorMethod(data);
        expect(praadaAttributionCalculatorMethod.label).toBe('Hybrid');
        expect(praadaAttributionCalculatorMethod.value).toBe('HYBRID');

        const data2: any = {'availableOnStandAlone': false, 'sectorLevels': ['IMMEDIATE_PARENT_LEVEL', 'BENCHMARK_TOTAL_LEVEL', 'FIRST_LEVEL'], 'value': 'RELATIVE', 'displayName': 'Relative'};
        const praadaAttributionCalculatorMethod2 = new PraadaAttributionCalculatorMethod(data2);
        expect(praadaAttributionCalculatorMethod2.label).toBe('Relative');
        expect(praadaAttributionCalculatorMethod2.value).toBe('RELATIVE');
        expect(praadaAttributionCalculatorMethod2.sectorLevels.length).toBe(2);
        expect(praadaAttributionCalculatorMethod2.sectorLevels[0]).toBe('IMMEDIATE_PARENT_LEVEL');
        expect(praadaAttributionCalculatorMethod2.sectorLevels[1]).toBe('BENCHMARK_TOTAL_LEVEL');
    });
});
