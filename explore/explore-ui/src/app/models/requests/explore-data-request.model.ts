import {cloneDeep, isNil, map, omit, sortBy} from 'lodash';
import * as objectHash from 'object-hash';
import {CacheKey} from '@interfaces/cache-key.interface';
import {CommonUtils} from '@blk/explore-ui-core';

/**
 * Model for the prism data request sent for reporting data
 */
export class ExploreDataRequest implements CacheKey {
    private cacheKey: string;
    requestParams: any[];
    hardRefresh = false;
    isBatchExport: boolean;
    widgetId: number;
    debugContext = false;
    locationHref: string;
    isTimeSeries: boolean;
    reportTitle: string;
    widgetTitle: string;
    workspaceTitle: string;
    workspaceOwner: string;

    /**
     *
     */
    constructor(queryParams: any[]) {
        this.requestParams = queryParams;
        this.locationHref = CommonUtils.getLocation().href;
    }

    /**
     * Get the cache key for this request object.
     */
    public getCacheKey = (): string => {
        if (!isNil(this.cacheKey)) {
            return this.cacheKey;
        }
        const sortedRequestParams = [];
        // Before we generate the cache key, we need to sort the columns so that column re-ordering doesn't result in a key mismatch
        this.requestParams.forEach((param: any) => {
            let cacheParam = cloneDeep(param);
            if (cacheParam != null) {
                if (!isNil(cacheParam.columns)) {
                    // Sort the columns by column key
                    cacheParam.columns = sortBy(cacheParam.columns, 'columnKey');

                    // Remove the column key from the cache key generation
                    cacheParam.columns = map(cacheParam.columns, function (col: any) {
                        return omit(col, 'columnKey');
                    });
                }
                // Remove the type field from the request
                cacheParam = omit(cacheParam, ['type', 'title', 'report', 'layout', 'benchmarkFullName']);
                sortedRequestParams.push(cacheParam);
            }
        });

        const requestCopy: ExploreDataRequest = new ExploreDataRequest(sortedRequestParams);
        this.cacheKey = objectHash(requestCopy);
        return this.cacheKey;
    };

    /**
     * Equality check for two Prism data requests. Unfortunately, this is a deep check at this point since the column keys for the columns
     * get generated dynamically. So two requests exact same columns+options could have diff column keys.
     */
    public equals(req1: ExploreDataRequest, req2: ExploreDataRequest) {
        return req1.getCacheKey() === req2.getCacheKey();
    }
}
