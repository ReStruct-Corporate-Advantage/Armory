import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';
import {OptimizationConstants} from '@constants/optimization.constants';
import {isEqual, isFunction, isObject, isString} from 'lodash';
import {AbstractConfig, ColumnConfig} from '@blk/explore-ui-core';

export class AlphaScorePortfolioObjective extends PortfolioObjective {
    alphaScoreMeasure: ColumnConfig;  // Alpha score associated with this portfolio objective
    type = OptimizationConstants.ALPHA_SCORE_PORTFOLIO_OBJECTIVE; // type for alpha score objective class
    uploadedAlpha: Map<string, number> = new Map<string, number>();
    isUploadAlpha = false;

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
            ...(!this.isUploadAlpha && {alphaScoreMeasure: isFunction(this.alphaScoreMeasure.serialize) ? this.alphaScoreMeasure.serialize() : this.alphaScoreMeasure}),
            type: this.type,
            isUploadAlpha: this.isUploadAlpha
        };
    }

    /**
     * Set attributes from the passed in data on this portfolio Objective
     */
    deserialize(data: any) {
        super.deserialize(data);
        if (data.alphaScoreMeasure) {
            this.alphaScoreMeasure = new ColumnConfig(isString(data.alphaScoreMeasure) ? JSON.parse(data.alphaScoreMeasure) : data.alphaScoreMeasure);
        }
        if (data.isUploadAlpha) {
            this.isUploadAlpha = data.isUploadAlpha;
        }
    }

    /**
     * Return false if the passed in portfolio objective is not equal to this
     */
    equals(otherPortfolioObjective: AbstractConfig): boolean {
        if (!(otherPortfolioObjective instanceof AlphaScorePortfolioObjective)) {
            return false;
        }

        if (!super.equals(otherPortfolioObjective)) {
            return false;
        }

        if (!isEqual(this.uploadedAlpha, otherPortfolioObjective.uploadedAlpha)) {
            return false;
        }

        if (this.isUploadAlpha !== otherPortfolioObjective.isUploadAlpha) {
            return false;
        }

        return isEqual(this.alphaScoreMeasure, otherPortfolioObjective.alphaScoreMeasure);
    }

    /**
     * Get json object for uploaded alpha map.
     */
    getUploadedRequestObject() {
        const uploadedAlphaObject = {};
        this.uploadedAlpha.forEach((value, key) => uploadedAlphaObject[key] = value);
        return uploadedAlphaObject;
    }

    /**
     * overridden from the parent
     */
    isValid(): boolean {
        return super.isValid() && !!this.alphaScoreMeasure;
    }
}
