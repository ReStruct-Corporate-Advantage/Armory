import {Dictionary} from 'lodash';
import {OptimizationColDef} from './optimization-col-def';

export interface OptimizationSummary {
    title: string;
    type: string;
    subType?: string;
    columns: OptimizationColDef[];
    additionalData?: Dictionary<any>;
}
