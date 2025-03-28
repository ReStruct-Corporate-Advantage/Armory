import {isNil, isObject} from 'lodash';
import {ColumnDefinition} from '@blk/explore-ui-core';

/**
 * Constraint Model Class for Optimization Constraint
 */
export class OptimizationConstraint extends ColumnDefinition {
    constraintType: string;
    isRelaxable: boolean;
    isConstraintOnly: boolean;
    aliasConstraintTag: string;

    /**
     * Optimization models mapping to appropriate models
     */
    static createOptimizationConstraintMapping(data: any): OptimizationConstraint[] {
        return data.optimizationConstraints.map((constraint) => new OptimizationConstraint(constraint));
    }

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Set attributes from the passed in data on this Constraint
     */
    doDeserialize(data: any): void {
        if (!data) {
            return;
        }
        super.doDeserialize(data);
        if (!isNil(data.constraintType)) {
            this.constraintType = data.constraintType;
        }
        this.isRelaxable = isNil(data.isRelaxable) ? false : data.isRelaxable;
        if (data.group) {
            this.groups = [data.group];
        }
        if (data.constraintTag) {
            this.columnTag = data.constraintTag;
        }
        if (data.constraintFormat) {
            this.columnFormat = data.constraintFormat;
        }
        if (data.isConstraintOnly) {
            this.isConstraintOnly = data.isConstraintOnly;
        }
        this.aliasConstraintTag = data?.aliasConstraintTag;
    }
}
