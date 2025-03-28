import {CommonUtils, TokenConstants, TokenUtils} from '@blk/explore-ui-core';
import {ExploreCachingService} from '@services/widget-data/explore-caching.service';
import {ExploreDataRequest} from '@models/requests/explore-data-request.model';
import {DataRequestConstants} from '@constants/data-request.constants';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {cloneDeep} from 'lodash';
import {HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BatchExportingStore} from '../../../stores';
import {ExploreResponse} from '@interfaces/response.interface';
import {BatchContainerStatus} from '@enums/batch-reporting/batch-container-status.enum';
import {URLConstants} from '@constants/url.constants';
import {AppStore} from '../../../app.store';
import {RequestCancelerStore} from '../../../modules/request-canceler/store/request-canceler.store';
import {AppUtils} from '@utils/app.utils';
import {HttpRequestQueueService} from '@services/http-request-queue/http-request-queue.service';
import {Http2BmsService} from '@services/bms';

@Injectable({
    providedIn: 'root'
})
export class ExploreDataRequestService {
    /**
     * map of widget id to request cache key
     */
    static widgetRequestMap: Map<number, string> = new Map<number, string>();

    /**
     * map of request cache key to request
     */
    static inProgressRequests: Map<string, ExploreDataRequest> = new Map<string, ExploreDataRequest>();

    batchPDFDebugMode = false;

    /**
     * constructor
     */
    constructor(private exploreCachingService: ExploreCachingService, private http2BmsService: Http2BmsService, private httpRequestQueueService: HttpRequestQueueService) {
        this.batchPDFDebugMode = CommonUtils.getURLParam(URLConstants.SHOW_BATCH_PDF_TOGGLE_BUTTON) === 'true';
    }

    /**
     * getData$
     */
    public getData$(widgetDataRequest: ExploreDataRequest, isMultiPortRequest: boolean, url: string, bypassBrowserCache?: boolean, omitData?: boolean): Observable<ExploreResponse> {
        const widgetLoadingStatus$ = AppStore.getWidgetLoadingStatus$(widgetDataRequest.widgetId, widgetDataRequest.isBatchExport);
        if (widgetLoadingStatus$) {
            widgetLoadingStatus$.next(true);
        }

        const requestInProgress = ExploreDataRequestService.inProgressRequests.get(widgetDataRequest.getCacheKey());
        // If the request is already in progress (if duplicate request comes in),
        // remove the request from RequestCancelerStore.requestsToCancel (if request was cancelled already), and return DUPLICATE REQUEST message with no data.
        if (requestInProgress && requestInProgress.widgetId === widgetDataRequest.widgetId) {
            RequestCancelerStore.removeRequestFromRequestToCancel(widgetDataRequest.widgetId);
            return of({message: DataRequestConstants.DUPLICATE_REQUEST, data: null});
        }

        // Before we send a request, we want to add the request to inProgressRequests and consume it after we get the response to prevent sending the same request multiple time.
        ExploreDataRequestService.inProgressRequests.set(widgetDataRequest.getCacheKey(), widgetDataRequest);

        // TODO: We need to have the request validation performed before we actually fetch data. Removed verfiyParams since it wasnt the most reliable way to check
        let requestParams;
        if (isMultiPortRequest) {
            // this is required because over BMS we cannot send collection of object. It needs to be wrapped in a property.
            requestParams = {multiRequests: widgetDataRequest.requestParams, isTimeSeries: widgetDataRequest.isTimeSeries};
        } else {
            requestParams = widgetDataRequest.requestParams[0];
        }

        // Create a copy of the request for caching purposes because later we modify the request params
        const originalRequest = cloneDeep(widgetDataRequest);

        // Key off the dataRequest to the widget's id
        // We do this to keep track of what the latest request is generated from a widget
        //
        // Don't count load all requests as the latest request of a widget.
        // This is important because let's say the user has a Report Group #1 with Report #1 that has Widget #1 and is processing normally (Request #1)
        // Then the user kicks off load all which will generate another request (Request #2) for a different Portfolio but still for the same Widget #1
        // Then the map will consider the loadAll request (Request #2) for Widget #1 as the 'latest' and Widget #1 won't update when Request #1 comes back
        if (widgetDataRequest.widgetId && !omitData) {
            ExploreDataRequestService.widgetRequestMap[widgetDataRequest.widgetId] = widgetDataRequest.getCacheKey();
        }

        // Set the data format to NO_DATA if we are omitting data from the response
        if (omitData) {
            if (isMultiPortRequest) {
                // For MultiPort requests, we need to set the NO_DATA dataFormat onto each of the requestParams
                requestParams.multiRequests.forEach((params: any) => {
                    params.dataFormat = DataRequestConstants.DATA_FORMAT.NO_DATA;
                });
            } else {
                requestParams.dataFormat = DataRequestConstants.DATA_FORMAT.NO_DATA;
            }
        }

        if (originalRequest.hardRefresh || bypassBrowserCache) {
            // If we're in here, the user has requested a hard refresh. Remove the key from the cache,
            // delete the entry and get the data from the server
            this.exploreCachingService.deleteDataFromCache(originalRequest);
            return this.requestDataFromServer$(requestParams, originalRequest, url).pipe(tap(() => this.tapHandler(widgetLoadingStatus$, widgetDataRequest)));
        }

        return this.exploreCachingService.getDataFromCache$(originalRequest).pipe(map((response: any) => {
                // If we're in here, then we got data back from the cache.
                // Remove the request from the InProgressRequests map
                this.removeRequestFromInProgress(widgetDataRequest.getCacheKey());

                // To prevent column key mismatches, update the column keys in the cached data
                const cachedColumns = response.originalColumns;
                let cachedData = response.data;

                // First find the difference between the column keys
                // We JSON parse the stringified version of the columns because JSON.stringify will remove key/value pairs if the value is undefined
                // The cached columns won't have any undefined values because the stringified version is cached,
                // but the incoming request might still have undefined values.
                const columnKeyDiffMap = ExploreCachingService.getColumnKeyDiffMapping(cachedColumns, JSON.parse(JSON.stringify(originalRequest.requestParams[0].columns)));

                // Go through each difference and update the cachedData with the new column keys
                columnKeyDiffMap.forEach((oldColumnKey: string, newColumnKey: string) => {
                    cachedData = ExploreCachingService.updateKeysInResponse(cachedData, oldColumnKey, newColumnKey);
                });
                return cachedData;
            }), catchError(() => {
                // If we're here, then the data doesn't exist in the cache and we'll have to make a request to the server for data
                return this.requestDataFromServer$(requestParams, originalRequest, url);
            }), tap(() => this.tapHandler(widgetLoadingStatus$, widgetDataRequest))
        );
    }

    removeWidgetWithNotificationFromBatchMap(widgetId: number): void {
        BatchExportingStore.widgetLoadingStatusMap.delete(widgetId);
    }

    removeRequestFromInProgress(key: string): void {
        if (ExploreDataRequestService.inProgressRequests.has(key)) {
            ExploreDataRequestService.inProgressRequests.delete(key);
        }
    }
    /**
     * Request data for the request from the server
     */
    requestDataFromServer$(requestParams: any, originalRequest: ExploreDataRequest, url: string): Observable<any> {
        requestParams.refreshCachedResponse = originalRequest.hardRefresh;
        requestParams.debugContext = originalRequest.debugContext;
        requestParams.reportTitle = originalRequest.reportTitle;
        requestParams.widgetTitle = originalRequest.widgetTitle;
        requestParams.workspaceTitle = originalRequest.workspaceTitle;
        requestParams.workspaceOwner = originalRequest.workspaceOwner;
        // adding params for loading to handle in interceptor
        const paramsOptions: any = {widgetId: originalRequest.widgetId};

        if (originalRequest.isBatchExport) {
            paramsOptions.isBatch = 'true';
        }

        const params = new HttpParams({fromObject: paramsOptions});

        // encode request payload in base64
        requestParams = AppUtils.encodeRequest(requestParams);

        // only send widget data requests through a queue if the token is enabled, ExploreEnableUIRequestQueue
        const httpResponse$ = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_UI_REQUEST_QUEUE) ?
            this.httpRequestQueueService.queueRequest$(url, requestParams, params) :
            this.http2BmsService.post$(url, requestParams, params);

        return httpResponse$.pipe(map((response: any) => {
            // Remove the request from the InProgressRequests map
            this.removeRequestFromInProgress(originalRequest.getCacheKey());
            this.exploreCachingService.addDataToCache(originalRequest, response);
            return response;
        }), catchError((error) => {
            this.removeRequestFromInProgress(originalRequest.getCacheKey());
            return throwError(error);
        }));
    }

    /**
     * Clear data from cache for the passed in request
     */
    public clearDataFromCache(widgetDataRequest: ExploreDataRequest) {
        this.exploreCachingService.deleteDataFromCache(widgetDataRequest);
    }

    /**
     * logic for tap after the response has been received
     */
    private tapHandler = (widgetLoadingStatus$, widgetDataRequest) => {
        // If user has two portfolios in a report group, and has a smaller portfolio selected, when user switches to bigger portfolio:
        //  If the data for the smaller portfolio came back,
        //  the loading spinner for the widget will be off although the data for the bigger portfolio is still pending.
        //  Easy way to handle this is to make the key more unique with widget and portfolio combined.
        if (widgetLoadingStatus$) {
            // Explicitly set the isLoading$ BehaviorSubject to false (from WidgetComponent)
            widgetLoadingStatus$.next(false);
        }
        // Check if this is for a batch export
        if (widgetDataRequest.isBatchExport) {
            // If it's for a batch export, then remove it from the widgetLoadingStatusMap
            BatchExportingStore.widgetLoadingStatusMap.delete(widgetDataRequest.widgetId);
            if (BatchExportingStore.widgetLoadingStatusMap.size === 0) {
                if (this.batchPDFDebugMode) {
                    console.log('PDF Widget requests have been completed. Moving onto rendering step.');
                }
                // If there are no more widgets loading, then the batch container is ready for exporting
                // TODO: We can enhance this later because technically we can proceed if the widget
                // the user wants has already loaded (so we don't hold up an export because of a returns request for example)
                BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.DATA_LOADED_PRE_RENDER);
            }
        }
    };
}
