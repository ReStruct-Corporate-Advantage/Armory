import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';

/**
 * interface for the response received as part of generating efficient frontier trades
 */
export interface EfficientFrontierTradesResponse {
    error?: Error;
    portfolio?: PortfolioWithPositions;
    efficientFrontierTradesData?: any[];
}
