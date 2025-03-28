import {OptimizationSummaryData} from '@optimization-settings-configuration/models/optimization-summary-data.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';

/**
 * Transforms the Explore optimization models into the OptimizationSummaryData format required by the optimization-configuration module.
 * Each transformer transforms one type of model (unique type and subType)
 */
export interface OptimizationSummaryDataTransformer {
    type(): string;

    subType?(): string;

    transform(portfolio: PortfolioWithPositions, isRiskParitySettings?: boolean): OptimizationSummaryData;
}
