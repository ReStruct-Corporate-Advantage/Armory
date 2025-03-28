/**
 * Enum used for Commitment risk management data change
 *  event details key
 */
export enum AcrmRequestLevelChangeEventDetailsKey {
    DATA_REQUEST_LEVEL = 'dataRequestLevel',
    PORTFOLIO_OR_FUND_NAME = 'portfolioOrFundName'
}

/**
 * Enum used for Data Request Level
 */
export enum DataRequestLevel {
    // Fund request level 
    FUND = 'FUND',
    // Portfolio request level 
    PORTFOLIO = 'PORTFOLIO'
}