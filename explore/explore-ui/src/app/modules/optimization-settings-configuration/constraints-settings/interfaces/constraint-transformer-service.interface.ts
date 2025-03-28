import {Dictionary} from 'lodash';

export interface ConstraintTransformerService<C> {
    /**
     * transforms a particular type of constraint into a flattened display row
     */
    transform(constraint: C, type: string): Dictionary<any>;
}
