import {OptimizationConstants} from '../../../constants/optimization.constants';
import {PortfolioObjective} from './portfolio-objective.model';
import {PortfolioObjectiveFactory} from '../../../factories/portfolio-objective.factory';

/**
 * Test cases for PortfolioObjective.ts
 */
describe('Portfolio Objective tests', () => {

    /**
     * Test case for method serialize
     */
    it('Test serialize', () => {
        expect(
            new PortfolioObjective({
                key: 'MINIMIZE_RISK',
                weight: 0.5
            }).serialize()
        ).toEqual({
            weight: 0.5,
            enabled: true,
            key: 'MINIMIZE_RISK'
        });
    });

    /**
     * Test case for default weight to be 1
     */
    it('Test creation and weight', () => {
        expect(new PortfolioObjective().weight).toEqual(1);
    });

    /**
     * Test case for method deserialize
     */
    it('Test deserialize', () => {
        const portfolioObjective = PortfolioObjectiveFactory.getObjective(OptimizationConstants.GENERAL_PORTFOLIO_OBJECTIVE);
        portfolioObjective.deserialize({
            weight: 0.5,
            enabled: false,
            key: 'MINIMIZE_RISK',
            type: OptimizationConstants.GENERAL_PORTFOLIO_OBJECTIVE
        });

        expect(portfolioObjective.key).toEqual('MINIMIZE_RISK');
        expect(portfolioObjective.weight).toEqual(0.5);
        expect(portfolioObjective.enabled).toEqual(false);
    });


    /**
     * Test case for method equal
     */
    it('Test equal', () => {
        const data: any = {
            weight: 0.5,
            enabled: false,
            key: 'MINIMIZE_RISK',
            type: OptimizationConstants.GENERAL_PORTFOLIO_OBJECTIVE
        };
        const portfolioObjective1 = PortfolioObjectiveFactory.getObjective(OptimizationConstants.GENERAL_PORTFOLIO_OBJECTIVE);
        portfolioObjective1.deserialize(data);

        const portfolioObjective2 = PortfolioObjectiveFactory.getObjective(OptimizationConstants.GENERAL_PORTFOLIO_OBJECTIVE);
        portfolioObjective2.deserialize(data);

        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(true);

        // Unequal keys
        portfolioObjective2.key = 'abc';
        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(false);

        // Unequal weight
        portfolioObjective2.key = 'MINIMIZE_RISK';
        portfolioObjective2.weight = 1.0;
        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(false);

        // Unequal enabled
        portfolioObjective2.weight = 0.5;
        portfolioObjective2.enabled = true;
        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(false);
    });


    /**
     * Test case for method isValid
     */
    it('Test isValid', () => {
        const portfolioObjective = PortfolioObjectiveFactory.getObjective(OptimizationConstants.GENERAL_PORTFOLIO_OBJECTIVE);
        expect(portfolioObjective.isValid()).toBe(false);

        portfolioObjective.key = 'MINIMIZE_RISK';
        expect(portfolioObjective.isValid()).toBe(true);
    });
});
