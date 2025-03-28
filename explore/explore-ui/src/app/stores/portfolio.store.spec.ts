import {PortfolioStore} from '@stores/portfolio.store';
import {PortfolioCacheKey} from '@models/portfolio/portfolio-cache-key.model';

describe('PortfolioStoreTest', () => {

    it('getPortfolioInfoFromCache with mandate fallback', () => {
        const portfolioResponseWithMandate = {portfolio: 'BR-CORE', mandate: {}};
        const portfolioCacheKey = new PortfolioCacheKey('BR-CORE', '09/23/2024', true, true);
        PortfolioStore.addPortfolioInfoToCache(portfolioCacheKey, portfolioResponseWithMandate);

        // with mandate
        expect(PortfolioStore.getPortfolioInfoFromCache(portfolioCacheKey)).toEqual(portfolioResponseWithMandate);

        // no mandate requested
        const portfolioCacheKeyNoMandate = new PortfolioCacheKey('BR-CORE', '09/23/2024', true, false);
        expect(PortfolioStore.getPortfolioInfoFromCache(portfolioCacheKeyNoMandate)).toEqual(portfolioResponseWithMandate);

        const portfolioResponseNoMandate = {portfolio: 'BR-CORE'};
        PortfolioStore.addPortfolioInfoToCache(portfolioCacheKeyNoMandate, portfolioResponseNoMandate);
        expect(PortfolioStore.getPortfolioInfoFromCache(portfolioCacheKeyNoMandate)).toEqual(portfolioResponseNoMandate);
    });

});
