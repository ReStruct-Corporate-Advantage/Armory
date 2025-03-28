import {OptimizationConstants} from '../constants/optimization.constants';
import {StressScenarioPortfolioObjective} from '../models/portfolio/objectives/stress-scenario-portfolio-objective.model';
import {PortfolioObjective} from '../models/portfolio/objectives/portfolio-objective.model';
import {AlphaScorePortfolioObjective} from '@models/portfolio/objectives/alpha-score-portfolio-objective.model';
import {StressScenarioDateRangeObjective} from '@models/portfolio/objectives/stress-scenario-date-range-objective.model';

/**
 * Factory class for creating instance of appropriate Portfolio Objective based on the type
 */
export class PortfolioObjectiveFactory {

    /**
     * private map to hold holding change types
     */
    private static objectiveTypes: Map<string, any> = new Map<string, any>();

    /**
     * Registers a change type with the factory.
     */
    static registerObjectiveType(name: string, configType: any) {
        PortfolioObjectiveFactory.objectiveTypes.set(name, configType);
    }

    /**
     * Create instance of appropriate Portfolio Objective based on the type passed in
     */
    static getObjective(type: string): PortfolioObjective {
        if (type === OptimizationConstants.STRESS_SCENARIO_PORTFOLIO_OBJECTIVE) {
            // For Stress Scenario type create a StressScenarioPortfolioObjective
            return new StressScenarioPortfolioObjective();
        } else if (type === OptimizationConstants.ALPHA_SCORE_PORTFOLIO_OBJECTIVE) {
            // For Alpha Score type create a AlphaScorePortfolioObjective
            return new AlphaScorePortfolioObjective();
        } else if (type === OptimizationConstants.STRESS_SCENARIO_DATE_RANGE) {
            return new StressScenarioDateRangeObjective();
        }
        return new PortfolioObjective();
    }
}
