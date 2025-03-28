import {HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {
    CommonUtils,
    CoreRequestConstants,
    DefinitionInitializer,
    TokenConstants,
    TokenUtils
} from '@blk/explore-ui-core';
import {StatusConstants} from '@constants/status.constants';
import {ClosedPositionAggregation} from '@models/definitions/column-definitions/closed-position-aggregation.model';
import {PositionAggregationType} from '@models/definitions/column-definitions/position-aggregation-type.model';
import {SplitPositionType} from '@models/definitions/column-definitions/split-position-types.model';
import {Objectives} from '@models/definitions/optimization/objectives.model';
import {OptimizationConstraint} from '@models/definitions/optimization/optimization-constraint.model';
import {firstValueFrom, from, Observable} from 'rxjs';
import {Http2BmsService} from '@services/bms';
import {DefinitionsStore} from '@stores/definitions.store';
import {MetadataModule} from '../metadata.module';
import {AppUtils} from '@utils/app.utils';
import {URLConstants} from '@constants/url.constants';
import {omit} from 'lodash';
import {LtSecurityProxyTypes, LtSecurityTypes} from '@blk/explore-ui-look-through-settings';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: MetadataModule
})
/**
 * Service for loading all the definitions needed by Explore UI including column definitions, praada methodologies, accounting conventions etc
 */
export class DefinitionsService {

    private readonly DEFINITIONS_KEY = 'definitions';
    private readonly DEFINITIONS_CACHE_NAME = 'column-definitions-cache';

    /**
     * Create all the models for the definitions
     */
    static initDefinitions(data: any): void {
        DefinitionInitializer.initDefinitions(data);

        DefinitionsStore.customColors = data.CustomColors;
        DefinitionsStore.currency = data.currencies;
        DefinitionsStore.exposureLookBackDate = data.exposureLookbackDate;
        DefinitionsStore.fundCharacteristicBreakdown = data.fundCharacteristicBreakdowns;
        DefinitionsStore.indexLookbackDate = data.indexHistoryLookbackDate;
        DefinitionsStore.rasCutoffDate = data.rasCutoffDate;

        DefinitionsStore.ltSecurityProxyType = LtSecurityProxyTypes.createLtSecurityProxyTypeMapping(data.ltSecurityTypes);
        DefinitionsStore.ltSecurityType = LtSecurityTypes.createLtSecurityTypeMapping(data.ltSecurityTypes);
        DefinitionsStore.optimizationObjective = Objectives.createOptimizationObjectiveMapping(data);
        DefinitionsStore.optimizationConstraint = OptimizationConstraint.createOptimizationConstraintMapping(data);
        DefinitionsStore.closedPositionAggregationType = ClosedPositionAggregation.createClosedPositionAggregationMapping(data);
        DefinitionsStore.positionAggregationTypes = PositionAggregationType.createPositionAggregationMapping(data);
        DefinitionsStore.splitPositionType = SplitPositionType.createSplitPositionTypes(data);
        DefinitionsStore.topDownEligibleCols = data.ColumnDefinitions.filter(col => col.forTopdown).map(topdownCol => topdownCol.columnTag);
        DefinitionsStore.commitmentRiskGroupingModels = data?.acrmGroupings?.map(grouping => ({text: grouping.text, value: grouping.value}));
        DefinitionsStore.commitmentRiskStressScenarios = data?.acrmStressScenarios?.map(grouping => ({text: grouping.text, value: grouping.value}));
    }

    constructor(private http2BmsService: Http2BmsService) {
    }

    /**
     * Fetch column definitions - leverage cache if available
     */
    fetchColumnDefinitions$(userName: string): Observable<any> {
        const definitionCacheKey: string = this.DEFINITIONS_KEY + ' ' + CommonUtils.getURLOrigin() + ' ' + userName;

        // For interim QA automation solution
        if (CommonUtils.getURLParam(URLConstants.FORCE_FETCH_DEFINITIONS) === 'true') {
            return this.fetchDefinitionsFromServer$().pipe(
                map((serverResponse) => {
                    this.extractData(serverResponse);
                })
            );
        }

        const fetchColumnDefinitionsAsync = async () => {
            const cache = await caches.open(this.DEFINITIONS_CACHE_NAME);
            const definitionCache = await cache.match(definitionCacheKey);

            let cachedResponse: any;
            let definitionsCacheTimestamp: string;
            if (definitionCache) {
                cachedResponse = await definitionCache.json();
                definitionsCacheTimestamp = cachedResponse?.data.definitionsCacheTimestamp;
            }
            const serverResponse = await firstValueFrom(this.fetchDefinitionsFromServer$(definitionsCacheTimestamp));

            const cacheValidatedStatus = 'CACHE_VALIDATED';
            if (serverResponse.status !== cacheValidatedStatus) {
                this.storeDefinitionsInBrowserCache(serverResponse, cache, definitionCacheKey);
            }
            const definitionsResponse = serverResponse.status === cacheValidatedStatus ? cachedResponse : serverResponse;
            this.extractData(definitionsResponse);
            return definitionsResponse;
        };

        return from(fetchColumnDefinitionsAsync());
    }

    /**
     * Fetch column definitions from server
     */
    private fetchDefinitionsFromServer$(definitionsCacheTimestamp?: string): Observable<any> {
        // Generate loading parameters
        const loadingKey = CoreRequestConstants.LOADING_PREFIX + CommonUtils.generateUniqueIdAsString(7);

        const fromObject = {
            [CoreRequestConstants.LOADING_KEY]: loadingKey,
            [CoreRequestConstants.LOADING_MESSAGE]: StatusConstants.LOADING_DEFINITIONS,
            [CoreRequestConstants.COMPRESS_RESPONSE]: true
        };
        if (definitionsCacheTimestamp) {
            fromObject[CoreRequestConstants.DEFINITIONS_CACHE_TIMESTAMP] = definitionsCacheTimestamp;
        }
        if (AppUtils.getURLParamWithDefault(URLConstants.SKIP_ESG_ENTITLEMENTS_FOR_PRE_PROD, false) === 'true') {
            fromObject[CoreRequestConstants.SKIP_ESG_ENTITLEMENTS_FOR_PRE_PROD] = true;
        }
        if (AppUtils.getURLParamWithDefault(URLConstants.SKIP_CLIMATE_SCENARIOS_FOR_PRE_PROD, false) === 'true') {
            fromObject[CoreRequestConstants.SKIP_CLIMATE_SCENARIOS_FOR_PRE_PROD] = true;
        }
        return this.http2BmsService.get$(this.DEFINITIONS_KEY, new HttpParams({fromObject}));
    }

    private storeDefinitionsInBrowserCache(response: any, cache: Cache, definitionCacheKey: string): void {
        if (!response.data) {
            return;
        }
        if (!TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_BROWSER_CACHE_ENABLED)) {
            cache.delete(definitionCacheKey);
            return;
        }
        // Update the cache with the new data
        const headers = {'Content-Type': 'application/json'};
        const blob = new Blob([JSON.stringify(response)], {type: 'application/json'});
        cache.put(definitionCacheKey, new Response(blob, {headers}));
        console.log('Column definitions response has been stored in the browser`s cache storage.');
    }

    /**
     * Extract column definitions data
     */
    private extractData(response: any): void {
        if (response.data) {
            // decompress the ColumnDefinitions from payload
            response.data.ColumnDefinitions = CommonUtils.decompressResponse(response.data.ColumnDefinitions);

            if (AppUtils.getURLParamWithDefault(URLConstants.LOG_COLUMN_DEFINITIONS, false) === 'true') {
                console.log(omit(response, 'ColumnDefinitions'));
            }
            DefinitionsService.initDefinitions(response.data);
            // After definitions are initialized and tokens are loaded, check if combined LRO is enabled.
            // If so, enable it in the Http2BmsService
            if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_COMBINED_LRO)) {
                this.http2BmsService.enableCombinedLRO();
            }
        } else {
            console.error('Failed to load column definitions data');
            throw Error('Failed to load column definitions data:' + response.message);
        }
    }
}
