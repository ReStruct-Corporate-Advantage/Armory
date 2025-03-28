import {PraadaFactor} from './praada-factor.model';

/**
 * Test cases for PraadaFactor model class
 */
describe('PraadaFactor', () => {

    /**
     * Test deserialize
     */
    it('deserialize', () => {
        const data: any = {'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'], 'activeColumnTag': 'active_price_contr', 'availableOnStandAlone': true, 'factorGroup': 'Accounting', 'value': 'price_contr', 'displayName': 'Price Contribution', 'CLASS_TYPE': 'com.bfm.prism.pnl.PraadaFactorBean'};
        const praadaFactor = new PraadaFactor(data);
        expect(praadaFactor.label).toBe('Price Contribution');
        expect(praadaFactor.value).toBe('price_contr');
        expect(praadaFactor.activeColumnTag).toBe('active_price_contr');
        expect(praadaFactor.factorGroup).toBe('Accounting');
        expect(praadaFactor.assetClassList.length).toBe(3);
        expect(praadaFactor.assetClassList[0]).toBe('EQ_MANDATE');
        expect(praadaFactor.assetClassList[1]).toBe('BAL_MANDATE');
        expect(praadaFactor.assetClassList[2]).toBe('FI_MANDATE');
    });
});
