import {PortfolioSecurityHoldingChange} from '@models/portfolio/composition/portfolio-security-holding-change.model';

describe('PortfolioSecuritiesHoldingChange tests', () => {

    it('tests serialize/deserialize', () => {
        const change: PortfolioSecurityHoldingChange = new PortfolioSecurityHoldingChange();
        change.lineItem = 'abc';
        change.changeInWeight = 50;
        change.isCashOffsetRequired = true;
        change.newAdjNMV = 5.0;

        expect(new PortfolioSecurityHoldingChange(change.serialize())).toEqual(change);
    });
});
