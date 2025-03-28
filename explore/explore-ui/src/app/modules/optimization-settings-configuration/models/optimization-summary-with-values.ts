import {OptimizationSummary} from './optimization-summary.model';

export interface OptimizationSummaryWithValues<T> {
    summary: OptimizationSummary;
    values: T;
}
