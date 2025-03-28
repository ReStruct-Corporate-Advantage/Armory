import {FactorDataAnalytic} from '@blk/explore-ui-core';

/**
 * Enum for Factor Data Widget chart type option
 */
export enum FactorTimeSeriesSelectedOption {
    FACTOR_LEVELS = 'FACTOR_LEVELS',
    FACTOR_RETURNS = 'FACTOR_RETURNS',
    CUMULATIVE_RETURNS = 'CUMULATIVE_RETURNS',
    VOLATILITIES = 'VOLATILITIES',
    CORRELATIONS = 'CORRELATIONS',
    REGRESSION_BETAS = 'REGRESSION_BETAS',
}
export class FactorTimeSeriesUtil {

    public static getDisplayName(selectedOption: FactorTimeSeriesSelectedOption): string {
        switch (selectedOption) {
            case FactorTimeSeriesSelectedOption.FACTOR_LEVELS:
                return 'Factor Levels';
            case FactorTimeSeriesSelectedOption.FACTOR_RETURNS:
                return 'Factor Returns';
            case FactorTimeSeriesSelectedOption.CUMULATIVE_RETURNS:
                return 'Cumulative Returns';
            case FactorTimeSeriesSelectedOption.VOLATILITIES:
                return 'Volatilities';
            case FactorTimeSeriesSelectedOption.CORRELATIONS:
                return 'Correlations';
            case FactorTimeSeriesSelectedOption.REGRESSION_BETAS:
                return 'Regression Betas';
        }
    }

    public static getFactorDataAnalytic(selectedOption: FactorTimeSeriesSelectedOption): FactorDataAnalytic {
        switch (selectedOption) {
            case FactorTimeSeriesSelectedOption.FACTOR_LEVELS:
                return FactorDataAnalytic.FACTOR_DATA_ANALYTIC_FACTOR_LEVELS;
            case FactorTimeSeriesSelectedOption.FACTOR_RETURNS:
                return FactorDataAnalytic.FACTOR_DATA_ANALYTIC_FACTOR_RETURNS;
            case FactorTimeSeriesSelectedOption.CUMULATIVE_RETURNS:
                return FactorDataAnalytic.FACTOR_DATA_ANALYTIC_CUMULATIVE_RETURNS;
            case FactorTimeSeriesSelectedOption.VOLATILITIES:
                return FactorDataAnalytic.FACTOR_DATA_ANALYTIC_VOLATILITIES;
            case FactorTimeSeriesSelectedOption.CORRELATIONS:
                return FactorDataAnalytic.FACTOR_DATA_ANALYTIC_CORRELATIONS;
            case FactorTimeSeriesSelectedOption.REGRESSION_BETAS:
                return FactorDataAnalytic.FACTOR_DATA_ANALYTIC_REGRESSION_BETAS;
            default: return FactorDataAnalytic.FACTOR_DATA_ANALYTIC_UNSPECIFIED;
        }
    }
}



