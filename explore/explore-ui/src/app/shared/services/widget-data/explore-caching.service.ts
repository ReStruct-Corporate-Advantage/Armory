import {CommonUtils} from '@blk/explore-ui-core';
import {cloneDeep, each, isArray, isEqual, isNil, isString, isUndefined, omit} from 'lodash';
import {AppUtils} from '@utils/app.utils';
import {ExploreResponse} from '@interfaces/response.interface';
import {URLConstants} from '@constants/url.constants';
import {ExploreDataRequest} from '@models/requests/explore-data-request.model';
import * as LZString from 'lz-string';
import * as idbKeyVal from 'idb-keyval';
import {from, Observable, throwError} from 'rxjs';
import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';

/**
 * Service to cache data into the browser storage
 */

@Injectable({
    providedIn: 'root'
})
export class ExploreCachingService {
    private static readonly CACHE_TYPE_ZIP = 'ZIP';
    private static readonly CACHE_TYPE_JSON = 'JSON';
    private static readonly CACHE_TYPE_OBJECT = 'OBJECT';

    isCachingEnabled = false;
    cacheType = ExploreCachingService.CACHE_TYPE_JSON;

    private cacheEntries: Set<string> = new Set();

    /**
     * Returns a map of differing column keys
     * Key: New column key
     * Value: Old column key
     */
    public static getColumnKeyDiffMapping(oldColumns: any[], newColumns: any[]): Map<string, string> {
        const columnKeyDiffMap = new Map<string, string>();
        each(newColumns, (newColumn: any) => {
            for (let i = 0; i < oldColumns.length; i++) {
                if (ExploreCachingService.isRequestColumnEqual(newColumn, oldColumns[i])) {
                    if (newColumn.columnKey !== oldColumns[i].columnKey) {
                        columnKeyDiffMap.set(newColumn.columnKey, oldColumns[i].columnKey);
                    }
                    oldColumns.splice(i, 1);
                    break;
                }
            }
        });
        return columnKeyDiffMap;
    }

    /**
     * Checks equality of object representations of columns in an ExploreDataRequest without columnKey
     */
    public static isRequestColumnEqual(firstColumn: any, secondColumn: any): boolean {
        return isEqual(omit(firstColumn, 'columnKey'), omit(secondColumn, 'columnKey'));
    }

    /**
     * Updates a cached response and replaces any instance of old column keys with the new column keys (whether it's a key or a value)
     */
    public static updateKeysInResponse(responseObject: ExploreResponse, oldKey: string, newKey: string): any {
        // If the object passed in is not a javascript object (Object or Array), check if we need to replace anything
        if (!AppUtils.isObject(responseObject)) {
            // If it's a string, replace any instance of the old column key
            // Ex. 'pct_mv_1' --> 'pct_mv_2' or 'pct_mv_1|CASH' --> 'pct_mv_2|CASH'
            //
            // Else, just return the value as is (numbers, undefined, null, etc..)
            return isString(responseObject) ? responseObject.replace(oldKey, newKey) : responseObject;
        }
        // If the object passed in is an Array, then we need to loop through and recursively update each element
        if (isArray(responseObject)) {
            const newArray = [];
            each(responseObject, (element: any) => {
                newArray.push(ExploreCachingService.updateKeysInResponse(element, oldKey, newKey));
            });
            return newArray;
        }

        const newResponseObject = {};

        // Loop through the keys in the responseObject
        Object.keys(responseObject).forEach((key: string) => {
            if (!responseObject.hasOwnProperty(key)) {
                return;
            }
            // Create the keyToUse that uses the newKey
            const keyToUse = key.includes(oldKey) ? key.replace(oldKey, newKey) : key;

            // Recursively update the value and set that into the new object, keyed off with the newKey
            newResponseObject[keyToUse] = ExploreCachingService.updateKeysInResponse(responseObject[key], oldKey, newKey);
        });

        return newResponseObject;
    }

    constructor () {
        const indexedDB: any = window.indexedDB;
        if (!isUndefined(indexedDB) && CommonUtils.getURLParam(URLConstants.CACHE) !== 'false') {
            this.isCachingEnabled = true;
        } else {
            console.log('Caching is not enabled at the client side');
        }

        // Get the cache type as specified by the url param.
        // At some point we may want to control this from the server with a token.
        const cacheTypeParam = CommonUtils.getURLParam(URLConstants.CACHE_TYPE);
        if (cacheTypeParam === ExploreCachingService.CACHE_TYPE_ZIP || cacheTypeParam === ExploreCachingService.CACHE_TYPE_JSON || cacheTypeParam === ExploreCachingService.CACHE_TYPE_OBJECT) {
            this.cacheType = cacheTypeParam;
        }
    }

    /**
     * Add data to the cache
     */
    public addDataToCache (obj: ExploreDataRequest, data: any) {
        // Check if caching is enabled
        if (!this.isCachingEnabled) {
            return;
        }

        // checking data.data for null is important as we don't want to cache data for loadAll requests as it is always null
        if (isNil(data) || isNil(data.data)) {
            console.warn('Trying to cache empty data');
            return;
        }

        try {
            const startTime = window.performance.now();

            // Get the cache key for the obj
            const cacheKey: string = obj.getCacheKey();

            // Cache the columns in the request as well as the data.
            // We want to cache columns to fix an issue with column key mismatches
            //
            // You will have multiple objects in the requestParams in cases like compare.
            // We'll just take the first one since the columns will all be the same across all requests in requestParams (columns from the same widget)
            const cacheObject = {originalColumns: obj.requestParams[0].columns, data};
            const cacheData = this.getToCacheValue(cacheObject);

            // Store it in index db
            idbKeyVal.set(cacheKey, cacheData);

            // Update the cache entries
            this.cacheEntries.add(cacheKey);

            // Log storage
            this.checkAndLogStorageSpace();

            // We are adding this while we are in BETA so that we can monitor performance
            const endTime = window.performance.now();
            const time = endTime - startTime;
            if (time > 1000) {
                console.warn(`Took ${time} to cache response`, cacheKey);
            }
        } catch (e) {
            console.log('Error caching data into the indexDB storage for object:', e);
        }
    }

    /**
     * Delete an entry from the cache
     */
    public deleteDataFromCache(obj: ExploreDataRequest): boolean {
        const cacheKey: string = obj.getCacheKey();
        if (this.isCached(obj, cacheKey)) {
            this.cacheEntries.delete(cacheKey);
            idbKeyVal.del(cacheKey);
            return true;
        }
        return false;
    }

    /**
     * Get data from the cache
     */
    public getDataFromCache$(obj: ExploreDataRequest): Observable<any> {
        // Get the cache key for the obj
        const cacheKey: string = obj.getCacheKey();
        const isCached: boolean = this.isCached(obj, cacheKey);

        // If the object is cached
        if (isCached) {
            try {
                return from(idbKeyVal.get(cacheKey)).pipe(map((data: any) => {
                    const startTime = window.performance.now();

                    // Decompress the data and parse it
                    const response = this.getFromCacheValue(data);

                    // We are adding this while we are in BETA so that we can monitor performance
                    const endTime = window.performance.now();
                    const time = endTime - startTime;
                    if (time > 1000) {
                        console.warn(`Took ${time} to get response from cache`, cacheKey);
                    }

                    return response;
                }));
            } catch (e) {
                console.error('Error retrieving data from the cache:', e);
                return throwError('Error retrieving data from the cache');
            }
        } else {
            return throwError('Data not cached');
        }
    }

    /**
     * Checks if the object is cached or not
     */
    public isCached (obj: ExploreDataRequest, cacheKey?: string): boolean {
        // if caching is not enabled, then return false
        if (!this.isCachingEnabled) {
            return false;
        }

        // Get the cache key for the obj
        if (!cacheKey) {
            cacheKey = obj.getCacheKey();
        }
        return this.cacheEntries.has(cacheKey);
    }

    /**
     * Function to clear the index db storage space
     */
    public clearIndexDbStorage(): void {
        // Clear out the entries from the cache
        this.cacheEntries.clear();

        // Clear out the DB
        idbKeyVal.clear();
    }

    /**
     * Gets the response value to put into the cache.
     */
    private getToCacheValue(data: any): any {
        if (this.cacheType === ExploreCachingService.CACHE_TYPE_OBJECT) {
            return cloneDeep(data);
        } else if (this.cacheType === ExploreCachingService.CACHE_TYPE_JSON) {
            return JSON.stringify(data);
        }

        // Default is just to use the zip method.
        return LZString.compress(JSON.stringify(data));
    }

    /**
     * Get the value from the cache and into the response object.
     */
    private getFromCacheValue(data: any): any {
        if (this.cacheType === ExploreCachingService.CACHE_TYPE_OBJECT) {
            return cloneDeep(data);
        } else if (this.cacheType === ExploreCachingService.CACHE_TYPE_JSON) {
            return JSON.parse(data);
        }

        // Default is just to use the zip method.
        return JSON.parse(LZString.decompress(data));
    }

    /**
     * This method would check and log the space used
     */
    private checkAndLogStorageSpace (): void {
        const nav: any = window.navigator;
        if ( nav && nav.webkitTemporaryStorage) {
            nav.webkitTemporaryStorage.queryUsageAndQuota (
                function(usedBytes: number, grantedBytes: number) {
                    console.log('Using ', (usedBytes / 1000), 'KB of ', (grantedBytes / 1000), 'KB');
                },
                function(e: any) { console.log('Error', e);  }
            );
        }
    }
}
