import {OptimizationConstants} from '@constants/optimization.constants';
import {ObjectiveSettings} from './objective.settings.model';
import {StressScenarioPortfolioObjective} from './stress-scenario-portfolio-objective.model';
import {AlphaScorePortfolioObjective} from '@models/portfolio/objectives/alpha-score-portfolio-objective.model';

/**
 * Test cases for ObjectiveSettings.ts
 */
describe('Objective Settings tests', () => {

    /**
     * Test case for method save
     */
    it('Test save', () => {
        const objectiveSettings = new ObjectiveSettings();
        objectiveSettings.riskParityEnabled = false;
        objectiveSettings.portfolioObjectives.push(new StressScenarioPortfolioObjective({
            key: OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO,
            weight: 0.5,
            stressScenario: 'BRExit'
        }));
        objectiveSettings.portfolioObjectives.push(new StressScenarioPortfolioObjective());

        expect(objectiveSettings.serialize()).toEqual({
            objectivesType: OptimizationConstants.ACTIVE_OBJECTIVE_TYPE,
            riskParityEnabled: false,
            portfolioObjectives: [
                {
                    weight: 0.5,
                    enabled: true,
                    key: OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO,
                    stressScenario: 'BRExit',
                    type: 'STRESS_SCENARIO'
                }
            ]
        });
    });

    /**
     * Test case for method deserialize
     */
    it('Test deserialize', () => {
        const objectiveSettings = new ObjectiveSettings();
        objectiveSettings.deserialize({
            objectivesType: OptimizationConstants.ACTIVE_OBJECTIVE_TYPE,
            riskParityEnabled: true,
            portfolioObjectives: [
                {
                    weight: 0.5,
                    enabled: false,
                    key: OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO,
                    type: OptimizationConstants.STRESS_SCENARIO_PORTFOLIO_OBJECTIVE,
                    stressScenario: 'BRExit'
                },
                {
                    // this one will be skipped since this is not valid
                    weight : 1,
                    enabled : true,
                    key : OptimizationConstants.MAXIMIZE_ALPHA_SCORE,
                    type : OptimizationConstants.ALPHA_SCORE_PORTFOLIO_OBJECTIVE,
                    isUploadAlpha : true
                },
                {
                    weight : 2,
                    enabled : true,
                    key : OptimizationConstants.MAXIMIZE_ALPHA_SCORE,
                    type : OptimizationConstants.ALPHA_SCORE_PORTFOLIO_OBJECTIVE,
                    isUploadAlpha : false,
                    alphaScoreMeasure: {}
                }
            ]
        });

        expect(objectiveSettings.objectivesType).toEqual(OptimizationConstants.ACTIVE_OBJECTIVE_TYPE);
        expect(objectiveSettings.portfolioObjectives.length).toEqual(2);
        expect(objectiveSettings.riskParityEnabled).toEqual(true);
        const portfolioObjective = objectiveSettings.portfolioObjectives[0];

        expect(portfolioObjective instanceof StressScenarioPortfolioObjective).toBe(true);
        expect(portfolioObjective.key).toEqual(OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO);
        expect(portfolioObjective.weight).toEqual(0.5);
        expect(portfolioObjective.enabled).toEqual(false);
        expect((<StressScenarioPortfolioObjective>portfolioObjective).stressScenario).toEqual('BRExit');

        const alphaScoreObjective = objectiveSettings.portfolioObjectives[1];
        expect(alphaScoreObjective.weight).toBe(2);
        expect((alphaScoreObjective as AlphaScorePortfolioObjective).alphaScoreMeasure).toBeTruthy();
    });


    /**
     * Test case for method equal
     */
    it('Test equal', () => {
        const data: any = {
            objectivesType: OptimizationConstants.ACTIVE_OBJECTIVE_TYPE,
            portfolioObjectives: [
                {
                    weight: 0.5,
                    enabled: true,
                    key: OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO,
                    type: OptimizationConstants.STRESS_SCENARIO_PORTFOLIO_OBJECTIVE,
                    stressScenario: 'BRExit'
                }
            ]
        };
        const objectiveSettings1 = new ObjectiveSettings();
        objectiveSettings1.deserialize(data);

        const objectiveSettings2 = new ObjectiveSettings();
        objectiveSettings2.deserialize(data);

        expect(objectiveSettings1.equals(objectiveSettings2)).toBe(true);

        // Unequal objective type
        objectiveSettings2.objectivesType = OptimizationConstants.ABSOLUTE_OBJECTIVE_TYPE;
        expect(objectiveSettings1.equals(objectiveSettings2)).toBe(false);

        // Unequal number of PortfolioObjectives
        objectiveSettings2.objectivesType = OptimizationConstants.ACTIVE_OBJECTIVE_TYPE;
        objectiveSettings2.portfolioObjectives.push(new StressScenarioPortfolioObjective());
        expect(objectiveSettings1.equals(objectiveSettings2)).toBe(false);

        // Unequal PortfolioObjectives
        objectiveSettings2.portfolioObjectives.splice(1, 1);
        const portfolioObjective1 = objectiveSettings1.portfolioObjectives[0];
        const portfolioObjective2 = objectiveSettings2.portfolioObjectives[0];

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
        (<StressScenarioPortfolioObjective>portfolioObjective2).stressScenario = 'US Election';
        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(false);
    });
});
