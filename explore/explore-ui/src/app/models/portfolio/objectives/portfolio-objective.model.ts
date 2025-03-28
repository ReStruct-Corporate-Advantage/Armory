import {AbstractConfig} from '@blk/explore-ui-core';
import {isNil, isObject} from 'lodash';

/**
 * Model class for representing a Portfolio Objective to be set on the Portfolio Object
 */
export class PortfolioObjective extends AbstractConfig {

    weight = 1;  // Weight of Portfolio Objective
    enabled = true;  // Flag which determines if the objective is enabled
    key = '';  // Unique key identifying the portfolio objective

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Return data to be saved for this Portfolio Objective
     */
    serialize(): any {
        return {
            weight: this.weight,
            enabled: this.enabled,
            key: this.key
        };
    }

    /**
     * Set attributes from the passed in data on this portfolio Objective
     */
    deserialize(data: any) {
        if (!data) {
            return;
        }

        if (!isNil(data.weight)) {
            this.weight = data.weight;
        }
        if (!isNil(data.enabled)) {
            this.enabled = data.enabled;
        }
        if (!isNil(data.key)) {
            this.key = data.key;
        }
    }

    /**
     * Return false if the passed in portfolio objective is not equal to this
     */
    equals(otherPortfolioObjective: AbstractConfig): boolean {
        if (!(otherPortfolioObjective instanceof PortfolioObjective)) {
            return false;
        }

        if (this.key !== otherPortfolioObjective.key) {
            return false;
        }

        if (this.weight !== otherPortfolioObjective.weight) {
            return false;
        }

        return this.enabled === otherPortfolioObjective.enabled;
    }

    /**
     * If a portfolio objective is not set which means it has a blank key this methods returns false
     */
    isValid(): boolean {
        return this.key !== '';
    }
}
