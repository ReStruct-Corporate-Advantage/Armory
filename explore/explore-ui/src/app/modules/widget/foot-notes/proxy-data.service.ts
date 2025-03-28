import {Injectable} from '@angular/core';
import {Http2BmsService} from '@services/bms';
import {DataRequestConstants} from '@constants/data-request.constants';
import {CusipProxyDataResponse} from '@models/proxy/cusip-proxy-data-response.model';
import {CusipProxyDataRequest} from '@interfaces/cusip-proxy-data-request.interface';
import {CusipProxy} from '@models/proxy/cusip-proxy.model';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ProxyDataService {

    constructor(private httpService: Http2BmsService) {
    }

    /**
     * Get proxy data
     */
    getProxyData$(proxyDataRequest: CusipProxyDataRequest): Observable<CusipProxyDataResponse> {
        return this.httpService.post$(DataRequestConstants.DATA_REQUEST_URL.PROXY_DATA, proxyDataRequest)
            .pipe(map((payload: any) => this.translateToCusipProxyData(payload)));
    }

    /**
     * Translate to cusip proxy data
     */
    private translateToCusipProxyData(rawData: any): CusipProxyDataResponse {
        if (!rawData) {
            return;
        }
        const cusipProxyDataResponse = new CusipProxyDataResponse(rawData.filePublishedDate);

        if (rawData.data) {
            const cusipProxy = [];
            const keys = Object.keys(rawData.data);
            for (const key of keys) {
                rawData.data[key].forEach(e => {
                    cusipProxy.push(new CusipProxy(e.end_date, e.override, e.original_cusip));
                });
            }
            cusipProxyDataResponse.cusipProxyData = cusipProxy;
        }

        if (rawData.cusipDesc) {
            const cusipDescriptions: Record<string, string> = {};
            for (const desc of rawData.cusipDesc) {
                cusipDescriptions[desc.cusip.object] = desc.sec_desc.object;
            }
            cusipProxyDataResponse.cusipDescriptions = cusipDescriptions;
        }
        return cusipProxyDataResponse;
    }
}



