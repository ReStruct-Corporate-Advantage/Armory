import {UniversePortfolioDetail} from '@interfaces/universe-portfolio-detail.interface';

export interface InvestmentUniverseRequest {
    mainPortfolio: UniversePortfolioDetail;
    benchmark: UniversePortfolioDetail;
    portfolios?: Record<string, UniversePortfolioDetail>;
    securities?: Record<string, string[]>;
}
