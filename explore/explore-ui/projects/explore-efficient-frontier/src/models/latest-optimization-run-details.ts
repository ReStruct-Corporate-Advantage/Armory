/**
 * Model class for opto details if the run is successful
 */
export class LatestOptimizationRunDetails {

    // Turnover (fraction of initial)
    turnover = 0;
    // Tcost of Trades (% of initial)
    tcostOfTrades = 0;
    // Market Impact Tcost of Trades (percent of initial)
    marketImapctTcostOfTrades = 0;
    // Spread Tcost of Trades (percent of initial)
    spreadTcostOfTrades = 0;
    // Portfolio Asset Count
    portfolioAssetCount: number;
    // Benchmark Asset Count
    benchmarkAssetCount: number;
    // Universe Asset Count
    universeAssetCount: number;
    // expected return
    expectedReturn: number[];
    // expected volatility
    expectedVolatility: number[];
    // expected specific volatility
    expectedSpecificVolatility: number[];
    // expected factor volatility
    expectedFactorVolatility: number[];
    // boolean to check if opto run is successful or not
    optoRunSuccessful: boolean;
    // constraint bound values
    constraintBoundValues: {};
}
