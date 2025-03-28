/**
 * model for portfolio search item
 */
export class PortfolioSearchItem {
    ticker: string;
    fullName: string;

    // properties of regular portfolio
    currency: string;
    code: number|string;

    // properties of what if portfolio
    type: string;
    id: number|string;
    newValue?: number;

    constructor(ticker: string, fullName?: string, currency?: string, code?: number|string, type?: string, id?: number|string, newValue?: number) {
        this.ticker = ticker;
        this.fullName = fullName;
        this.currency = currency;
        this.code = code;
        this.type = type;
        this.id = id;
        this.newValue = newValue;
    }
}
