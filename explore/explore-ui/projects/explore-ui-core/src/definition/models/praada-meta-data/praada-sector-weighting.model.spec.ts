import {PraadaSectorWeighting} from './praada-sector-weighting.model';

/**
 * Test cases for PraadaSectorWeighting model class
 */
describe('PraadaSectorWeighting', () => {

    /**
     * Test deserialize
     */
    it('deserialize', () => {
        const data: any = {
            'attributionCalculatorMethods': ['HYBRID'],
            'availableOnStandAlone': false,
            'value': 'SPREAD_DURATION',
            'CLASS_TYPE': 'com.bfm.prism.pnl.SectorWeightingBean',
            'displayName': 'Spread Duration'
        };
        const praadaSectorWeighting = new PraadaSectorWeighting(data);
        expect(praadaSectorWeighting.value).toBe('SPREAD_DURATION');
        expect(praadaSectorWeighting.label).toBe('Spread Duration');
        expect(praadaSectorWeighting.attributionCalculatorMethods.length).toBe(1);
        expect(praadaSectorWeighting.attributionCalculatorMethods[0]).toBe('HYBRID');
    });
});
