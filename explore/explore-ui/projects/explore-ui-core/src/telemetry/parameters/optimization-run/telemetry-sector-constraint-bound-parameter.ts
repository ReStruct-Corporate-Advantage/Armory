import {isObject} from 'lodash';
import {
    ExploreSectorConstraintBoundType,
    ExploreSectorConstraintRelativeOperatorType
} from '../../enums';

/**
 * TelemetrySectorConstraintBoundParameter captures information related to bound type and operator of Sector Constraint.
 */
export class TelemetrySectorConstraintBoundParameter {
    constraintType: ExploreSectorConstraintBoundType;
    constraintLowerBoundOperator: ExploreSectorConstraintRelativeOperatorType;
    constraintUpperBoundOperator: ExploreSectorConstraintRelativeOperatorType;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize.
     */
    protected deserialize(data: any): void {
        // Get out of here if there is no data.
        if (!data) {
            return;
        }
        this.constraintType = data.constraintType;
        this.constraintLowerBoundOperator = data.constraintLowerBoundOperator;
        this.constraintUpperBoundOperator = data.constraintUpperBoundOperator;
    }
}
