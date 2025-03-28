/**
 * Cusip Proxy Data Request Interface
 */
export interface CusipProxyDataRequest {
    cusips: string[];
    startDate: Date;
    endDate: Date;
    riskModel: string;
}
