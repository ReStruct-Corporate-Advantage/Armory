import {PraadaCannedAttributionMethod} from './praada-canned-attribution-method.model';

/**
 * Test cases for PraadaCannedAttributionMethod model class
 */
describe('PraadaCannedAttributionMethod', () => {

    /**
     * Test deserialize
     */
    it('deserialize', () => {
        const data: any = {
            'notionalMode': 'NotionalMV',
            'excessMethodologies': [{
                'name': 'EB_MULTI_ASSET_xFXMTE',
                'displayName': 'Bottom-Up Multi-Manager Attribution',
                'restricted': false,
                'factors': ['te_ms', 'fx_spot_carry_contr']
            }],
            'displayName': 'Bottom-Up (with Look-through)',
            'name': 'EB_MULTI_ASSET_xFXMTE',
            'assetClass': 'BAL_MANDATE',
            'attributionWeightType': 'MARKET_VALUE',
            'attributionCalculatorMethod': 'RELATIVE',
            'sectorLevel': 'BENCHMARK_TOTAL_LEVEL'
        };
        const praadaCannedAttributionMethod = new PraadaCannedAttributionMethod(data);
        expect(praadaCannedAttributionMethod.name).toBe('EB_MULTI_ASSET_xFXMTE');
        expect(praadaCannedAttributionMethod.label).toBe('Bottom-Up (with Look-through)');
        expect(praadaCannedAttributionMethod.attributionWeightType).toBe('MARKET_VALUE');
        expect(praadaCannedAttributionMethod.attributionCalculatorMethod).toBe('RELATIVE');
        expect(praadaCannedAttributionMethod.sectorLevel).toBe('BENCHMARK_TOTAL_LEVEL');
        expect(praadaCannedAttributionMethod.notionalMode).toBe('NotionalMV');
        expect(praadaCannedAttributionMethod.assetClass).toBe('BAL_MANDATE');
        expect(praadaCannedAttributionMethod.excessMethodologies.length).toBe(1);
        const excessMeth = praadaCannedAttributionMethod.excessMethodologies[0];
        expect(excessMeth.name).toBe('EB_MULTI_ASSET_xFXMTE');
        expect(excessMeth.label).toBe('Bottom-Up Multi-Manager Attribution');
        expect(excessMeth.factors.length).toBe(2);
        expect(excessMeth.factors[0]).toBe('te_ms');
        expect(excessMeth.factors[1]).toBe('fx_spot_carry_contr');
    });
});
