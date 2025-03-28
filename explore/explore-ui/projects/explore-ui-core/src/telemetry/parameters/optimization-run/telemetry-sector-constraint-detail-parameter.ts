import {ExploreSectorsForConstraint} from '../../enums';
import {isObject} from 'lodash';
import {TelemetrySectorConstraintBoundParameter} from './telemetry-sector-constraint-bound-parameter';

/**
 * TelemetrySectorConstraintDetailParameter captures information related to  Sector Constraints.
 */
export class TelemetrySectorConstraintDetailParameter {
    constraintAttribute: string;
    isFilterApplied: boolean;
    sectorsForConstraint: ExploreSectorsForConstraint;
    sectorConstraintType: TelemetrySectorConstraintBoundParameter;

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
    deserialize(data: any): void {
        // Get out of here if there is no data.
        if (!data) {
            return;
        }
        this.constraintAttribute = data.constraintAttribute;
        this.isFilterApplied = data.isFilterApplied;
        this.sectorsForConstraint = data.sectorsForConstraint;
        this.sectorConstraintType = data.sectorConstraintType;
    }
}
