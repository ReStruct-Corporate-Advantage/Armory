import {CusipProxy} from '@models/proxy/cusip-proxy.model';

/**
 * Cusip Proxy Data Response Model
 */
export class CusipProxyDataResponse {
    filePublishedDate: Date;
    cusipProxyData: CusipProxy[];
    cusipDescriptions: Record<string, string>;

    constructor(filePublishedDate?: string, cusipProxyData?: CusipProxy[], cusipDescriptions?: Record<string, string> ) {
        if (filePublishedDate) {
            this.filePublishedDate = new Date(filePublishedDate);
        }
        this.cusipProxyData = cusipProxyData;
        this.cusipDescriptions = cusipDescriptions;
    }
}
