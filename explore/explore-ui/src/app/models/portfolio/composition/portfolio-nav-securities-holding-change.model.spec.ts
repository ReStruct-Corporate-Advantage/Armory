import {
    PortfolioNavSecurityHoldingChange
} from '@models/portfolio/composition/portfolio-nav-securities-holding-change.model';

describe('PortfolioNAVSecuritiesHoldingChange tests', () => {

    it('tests serialize/deserialize', () => {
        const change: PortfolioNavSecurityHoldingChange = new PortfolioNavSecurityHoldingChange();
        change.lineItem = 'abc';
        change.changeInWeight = 50;
        change.order = 1;
        change.isCashOffsetRequired = true;

        expect(new PortfolioNavSecurityHoldingChange(change.serialize())).toEqual(change);
    });
});
