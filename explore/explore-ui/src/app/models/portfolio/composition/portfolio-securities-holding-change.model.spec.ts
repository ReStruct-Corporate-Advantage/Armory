import {
    PortfolioSecuritiesHoldingChange
} from '@models/portfolio/composition/portfolio-securities-holding-change.model';
import {PortfolioSecuritiesRule} from '@models/portfolio/tradeRules/portfolio-securities-rule.model';

describe('PortfolioSecuritiesHoldingChange tests', () => {

    it('tests serialize/deserialize', () => {
        const change: PortfolioSecuritiesHoldingChange = new PortfolioSecuritiesHoldingChange();
        change.lineItem = 'abc';
        change.changeInWeight = 50;
        change.ruleToUse = new PortfolioSecuritiesRule();
        change.existingPort = true;
        change.isCashOffsetRequired = true;

        expect(new PortfolioSecuritiesHoldingChange(change.serialize())).toEqual(change);
    });
});
