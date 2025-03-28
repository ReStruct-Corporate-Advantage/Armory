import {OptimizationConstants} from '../../../constants/optimization.constants';
import {StressScenarioPortfolioObjective} from './stress-scenario-portfolio-objective.model';

/**
 * Test cases for StressScenarioPortfolioObjective.ts
 */
describe('Stress Scenario Portfolio Objective tests', () => {

    /**
     * Test case for method save
     */
    it('Test serialize', () => {
        expect(
            new StressScenarioPortfolioObjective({
                key: OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO,
                weight: 0.5,
                stressScenario: 'BRExit'
            }).serialize()
        ).toEqual({
            weight: 0.5,
            enabled: true,
            key: OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO,
            stressScenario: 'BRExit',
            type: 'STRESS_SCENARIO'
        });
    });

    /**
     * Test case for method deserialize
     */
    it('Test deserialize', () => {
        const portfolioObjective = new StressScenarioPortfolioObjective({
            weight: 0.5,
            enabled: false,
            key: OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO,
            type: OptimizationConstants.STRESS_SCENARIO_PORTFOLIO_OBJECTIVE,
            stressScenario: 'BRExit'
        });

        expect(portfolioObjective.key).toEqual(OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO);
        expect(portfolioObjective.weight).toEqual(0.5);
        expect(portfolioObjective.enabled).toEqual(false);
        expect(portfolioObjective.stressScenario).toEqual('BRExit');
    });


    /**
     * Test case for method equal
     */
    it('Test equal', () => {
        const data: any = {
            weight: 0.5,
            enabled: false,
            key: OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO,
            type: OptimizationConstants.STRESS_SCENARIO_PORTFOLIO_OBJECTIVE,
            stressScenario: 'BRExit'
        };
        const portfolioObjective1 = new StressScenarioPortfolioObjective();
        portfolioObjective1.deserialize(data);

        const portfolioObjective2 = new StressScenarioPortfolioObjective();
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

        // Unequal stress scenario
        portfolioObjective2.enabled = false;
        portfolioObjective2.stressScenario = 'US Election';
        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(false);
    });
});
