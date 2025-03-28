import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {Dictionary} from 'lodash';

/**
 * Transforms Constraint objects into a flat dictionaries for display purposes
 */
export interface ConstraintTransformer {
    type(): string;

    transform(constraint: Constraint): Dictionary<any>;
}
