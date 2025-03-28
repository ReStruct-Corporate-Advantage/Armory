/**
 * interface for trade stats in trade table
 */
export interface TradeStats {
    totalTrades: number;
    totalBuy: number;
    totalSell: number;
    totalBuyAmount: number;
    totalSellAmount: number;
    turnover: number;
    tcostOfTrades: number;
    spreadTcostOfTrades: number;
    marketImpactTcostOfTrades: number;
}
