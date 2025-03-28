import {Dictionary} from 'lodash';

export interface OptimizationSummaryData {
    /**
     * main row data
     */
    data?: Array<Dictionary<any>>;
    /**
     * additional data that applies to all
     */
    additionalData?: Dictionary<any>;
}
