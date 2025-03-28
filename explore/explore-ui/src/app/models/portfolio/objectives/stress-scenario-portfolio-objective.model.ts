import {OptimizationConstants} from '../../../constants/optimization.constants';
import {PortfolioObjective} from './portfolio-objective.model';
import {isEqual, isObject} from 'lodash';
import {AbstractConfig} from '@blk/explore-ui-core';

/**
 * Model for portfolio objective that has a stress scenario associated with it
 */
export class StressScenarioPortfolioObjective extends PortfolioObjective {

    stressScenario: string;  // Stress scenario associated with this portfolio objective
    type = OptimizationConstants.STRESS_SCENARIO_PORTFOLIO_OBJECTIVE; // type for stress scenario objective class

    /**
     * Default constructor
     */
    constructor(data?: any) {
        super(data);
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Return data to be saved for this Portfolio Objective
     */
    serialize(): any {
        return {
            ...super.serialize(),
            stressScenario: this.stressScenario,
            type: this.type
        };
    }

    /**
     * Set attributes from the passed in data on this portfolio Objective
     */
    deserialize(data: any) {
        super.deserialize(data);
        // old favorite has stressScenario as object while new favorites store only scenCode value
        if (data.stressScenario) {
            this.stressScenario = data.stressScenario.scenCode || data.stressScenario;
        }
    }

    /**
     * Return false if the passed in portfolio objective is not equal to this
     */
    equals(otherPortfolioObjective: AbstractConfig): boolean {
        if (!(otherPortfolioObjective instanceof StressScenarioPortfolioObjective)) {
            return false;
        }

        if (!super.equals(otherPortfolioObjective)) {
            return false;
        }

        return isEqual(this.stressScenario, otherPortfolioObjective.stressScenario);
    }
}

