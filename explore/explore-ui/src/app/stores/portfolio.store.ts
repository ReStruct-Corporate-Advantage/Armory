import {PortfolioCacheKey} from '@models/portfolio/portfolio-cache-key.model';
import {cloneDeep} from 'lodash';

/**
 * stores and fetches portfolio info object received from the server
 * this applies to both saved and non-saved portfolios where we can deserialize
 * this information into portfolio object
 */
export class PortfolioStore {
    private static cache: Map<string, any> = new Map<string, any>();

    /**
     * Function to get a portfolio object from the cache as per the key
     */
    static getPortfolioInfoFromCache(portfolioCacheKey: PortfolioCacheKey): any {
        const portInfoResponse = PortfolioStore.cache.get(portfolioCacheKey.getString());
        if (!portInfoResponse && !portfolioCacheKey.includeMandate) {
            // if no response cached and includeMandate===false, fallback to trying to get with includeMandate===true
            // since we don't care whether it has mandate
            const portfolioCacheKeyWithMandate = new PortfolioCacheKey(portfolioCacheKey.portfolioName, portfolioCacheKey.date, portfolioCacheKey.isLightVersion, true);
            return PortfolioStore.cache.get(portfolioCacheKeyWithMandate.getString());
        }
        return portInfoResponse;
    }

    /**
     * Function to save copy of portfolio info response received from server
     */
    static addPortfolioInfoToCache(portfolioCacheKey: PortfolioCacheKey, portInfoRes: any): void {
        PortfolioStore.cache.set(portfolioCacheKey.getString(), cloneDeep(portInfoRes));
    }
}
