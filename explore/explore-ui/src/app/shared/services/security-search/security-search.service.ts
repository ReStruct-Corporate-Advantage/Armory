import {Injectable} from '@angular/core';
import {Http2BmsService} from '@services/bms';
import {Observable} from 'rxjs';
import {RequestConstants, StatusConstants} from '../../../constants';
import {map} from 'rxjs/operators';
import {SecuritySearchItem} from '@interfaces/security-search-item.interface';
import {isArray} from 'lodash';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import {DesignateValueList} from '@interfaces/designate-value-list.interface';
import {HttpUtils} from '@utils/http.utils';
import {HttpParams} from '@angular/common/http';

/**
 * Service that calls the backend to retrieve securities related data
 */
@Injectable({
    providedIn: 'root'
})
export class SecuritySearchService {

    private static readonly SEARCH_UNIVERSE = 'ALADDIN_PORTFOLIOS';

    constructor(private http2BmsService: Http2BmsService) {
    }

    /**
     * Searches for securities matching a specific search string in a universe
     * @param text  Term to filter securities against
     * @param asOfDate  Search for securities that existed on this date
     * @param multipleSecurities  Flag to indicate if text parameter has multiple securites, space separated
     */
    searchSecurity$(text: string, asOfDate: string, multipleSecurities = false): Observable<SecuritySearchItem[]> {
        // construct request data
        const data: any = {
            searchText: text,
            asOfDate: asOfDate,
            universe: SecuritySearchService.SEARCH_UNIVERSE,
            multipleSecuritiesFlag: multipleSecurities
        };

        return this.http2BmsService.post$(RequestConstants.SECURITY_SEARCH, data).pipe(
            map((payload: any): SecuritySearchItem[] => {
                // verify result is an array
                if (isArray(payload.data)) {
                    // map every result to a SecuritySearchItem
                    return this.transformDataAsSecuritySearchItem(payload.data);
                }
                return [];
            })
        );
    }

    /**
     * Searches for securities matching the cusips in rules and calculates
     * total NMV based on individual NMV of securities
     */
    updateDesignateValue$(rules: BaseRule[], asOfDate: string, ruleUnit: string, currency: string, multipleSecurities = false): Observable<DesignateValueList> {
        const data: any = {
            rules: rules ? JSON.stringify(rules.map(rule => rule.serialize())) : null,
            asOfDate,
            universe: SecuritySearchService.SEARCH_UNIVERSE,
            multipleSecuritiesFlag: multipleSecurities,
            ruleUnit,
            currency
        };
        const params: HttpParams = HttpUtils.getCopiedParamWithLoadingKeyAndMessage( new HttpParams(), StatusConstants.LOADING_SECURITIES);

        return this.http2BmsService.post$(RequestConstants.UPDATE_DESIGNATED_VALUE, data, params).pipe(
            map((payload: any): DesignateValueList => {
                // verify result is an array
                if (isArray(payload.data.securityRecords)) {
                    // map every result to a DesignateValueList
                    return {
                        'designateValue': payload.data.designateValue,
                        'securitySearchItems': this.transformDataAsSecuritySearchItem(payload.data.securityRecords)
                    };
                    }
                return {'designateValue': payload.data.designateValue,
                        'securitySearchItems': []};
            })
        );
    }

    private transformDataAsSecuritySearchItem(data: any): [] {
        return data.map((item): SecuritySearchItem => {
            return {
                cusip: item.cusip,
                description: item.desc1,
                ticker: item.ticker,
                sedol: item.sedol,
                isin: item.isin,
                bbTicker: item.bbTicker,
                securityGroup: item.secGroup,
                securityType: item.secType
            };
        });
    }
}
