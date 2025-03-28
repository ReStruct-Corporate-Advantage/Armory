/**
 * Interface that defines item for the security search typeahead
 */
export interface SecuritySearchItem {
    // required
    cusip: string;

    // these are set if item is created from backend
    description?: string;
    securityGroup?: string;
    securityType?: string;
    ticker?: string;
    sedol?: string;
    isin?: string;
    bbTicker?: string;
    // set when backend does not return a valid security
    error?: string;
}
