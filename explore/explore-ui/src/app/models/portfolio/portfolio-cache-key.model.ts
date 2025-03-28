/**
 * Class containing key data to retrieve a portfolio object from the cache
 */
export class PortfolioCacheKey {
    portfolioName: string;
    date: string;
    isLightVersion: boolean;
    includeMandate: boolean;

    constructor(portfolioName: string, date: string, isLightVersion: boolean, includeMandate: boolean) {
        this.portfolioName = portfolioName;
        this.date = date;
        this.isLightVersion = isLightVersion;
        this.includeMandate = includeMandate;
    }

    getString(): string {
        return this.portfolioName + this.date + this.isLightVersion + this.includeMandate;
    }
}
