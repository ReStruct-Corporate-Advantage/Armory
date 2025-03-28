/**
 * Class for price chart data inputs
 */
export class PriceChartInputs {
    cusip: string;
    label: string;

     /**
     * @param cusip
     * @param label
     */
    constructor (cusip: string, label: string) {
        this.cusip = cusip;
        this.label = label;
    }
}
