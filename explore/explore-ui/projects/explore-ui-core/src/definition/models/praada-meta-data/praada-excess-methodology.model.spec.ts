import {PraadaExcessMethodologyModel} from './praada-excess-methodology.model';

/**
 * Test cases for PraadaExcessMethodologyModel model class
 */
describe('PraadaExcessMethodology', () => {

    /**
     * Test deserialize
     */
    it('deserialize', () => {
        const data: any = {
            'name': 'EB_MULTI_ASSET_xFXMTE',
            'displayName': 'Bottom-Up Multi-Manager Attribution',
            'factors': ['te_ms', 'fx_spot_carry_contr']
        };
        const praadaExcessMethodology = new PraadaExcessMethodologyModel(data);
        expect(praadaExcessMethodology.name).toBe('EB_MULTI_ASSET_xFXMTE');
        expect(praadaExcessMethodology.factors.length).toBe(2);
        expect(praadaExcessMethodology.factors[0]).toBe('te_ms');
        expect(praadaExcessMethodology.factors[1]).toBe('fx_spot_carry_contr');
        expect(praadaExcessMethodology.label).toBe('Bottom-Up Multi-Manager Attribution');
    });
});
