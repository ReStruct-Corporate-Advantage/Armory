import {PortfolioObjective} from './portfolio-objective.model';
import {OptimizationConstants} from '@constants/optimization.constants';
import {isEmpty, isObject} from 'lodash';
import {AbstractConfig} from '@blk/explore-ui-core';
import {PortfolioObjectiveFactory} from '../../../factories/portfolio-objective.factory';
import {AlphaScorePortfolioObjective} from '@models/portfolio/objectives/alpha-score-portfolio-objective.model';

/**
 * Model class for representing a entire set of Objective settings
 */
export class ObjectiveSettings extends AbstractConfig {

    portfolioObjectives: PortfolioObjective[] = [];  // List of Portfolio Objectives
    objectivesType: string = OptimizationConstants.ACTIVE_OBJECTIVE_TYPE;  // Objectives type - Absolute or Active
    riskParityEnabled = false;
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Set attributes from the passed in data on this portfolio Optimization settings
     */
    deserialize(data: any) {
        // Get out of here if there is no data.
        if (!data) {
            return;
        }
        this.objectivesType = data.objectivesType;
        this.riskParityEnabled = data.riskParityEnabled;
        if (!isEmpty(data.portfolioObjectives)) {
            this.portfolioObjectives = data.portfolioObjectives.map(portObjective => {
                    const portfolioObjective = PortfolioObjectiveFactory.getObjective(portObjective[OptimizationConstants.OBJECTIVES_TYPE]);
                    portfolioObjective.deserialize(portObjective);
                    return portfolioObjective;
                })
                // adding filter specifically for filtering out bad alpha score objectives
                .filter(portObjective => !(portObjective instanceof AlphaScorePortfolioObjective && !portObjective.isValid()));
        }
    }

    /**
     * Return data to be saved for this Portfolio Optimization settings
     */
    serialize(isNested?: number | boolean): any {
        return {
            'objectivesType': this.objectivesType,
            'riskParityEnabled': this.riskParityEnabled,
            'portfolioObjectives': this.portfolioObjectives
                .filter(portObjective => portObjective.isValid())
                .map(portObjective => portObjective.serialize())
        };
    }

    /**
     * Return false if the passed in objective settings is not equal to this
     */
    equals(otherObjectiveSettings: AbstractConfig): boolean {
        if (!(otherObjectiveSettings instanceof ObjectiveSettings)) {
            return false;
        }

        if (this.objectivesType !== otherObjectiveSettings.objectivesType) {
            return false;
        }

        if (this.portfolioObjectives.length !== otherObjectiveSettings.portfolioObjectives.length) {
            return false;
        }

        if (this.riskParityEnabled !== otherObjectiveSettings.riskParityEnabled) {
            return false;
        }

        for (let i = 0; i < this.portfolioObjectives.length; i++) {
            if (!this.portfolioObjectives[i].equals(otherObjectiveSettings.portfolioObjectives[i])) {
                return false;
            }
        }

        return true;
    }
}
