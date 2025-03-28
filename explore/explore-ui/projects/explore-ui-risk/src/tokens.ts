import {InjectionToken} from '@angular/core';
import {PortfolioSearchServiceInterface} from '@blk/explore-ui-portfolio-search';

export const PORTFOLIO_SEARCH_SERVICE_TOKEN = new InjectionToken<PortfolioSearchServiceInterface>('PORTFOLIO_SEARCH_SERVICE_TOKEN');
