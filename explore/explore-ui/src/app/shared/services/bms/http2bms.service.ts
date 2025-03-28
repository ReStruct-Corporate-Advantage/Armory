import {Injectable} from '@angular/core';
import {CommonUtils, CoreRequestConstants, HttpServiceInterface} from '@blk/explore-ui-core';
import {Observable, of, Subject, throwError, timer} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AppUtils} from '@utils/app.utils';
import {catchError, switchMap, tap} from 'rxjs/operators';
import {DataRequestConstants, RequestConstants, UtilConstants} from '../../../constants';
import {Http2BmsResponse} from '../../../interfaces';
import {NotificationService} from '@services/notification';
import {UserSessionInfo} from '@models/widget/user-session-info.model';
import {AppStore} from '../../../app.store';
import {LongRunningHandlerService} from '@services/long-running-operations/long-running-handler.service';

@Injectable({
    providedIn: 'root'
})
export class Http2BmsService implements HttpServiceInterface {
    public useCombinedLRO: boolean;

    constructor(private http: HttpClient, private notificationService: NotificationService) {
    }

    /**
     * Callback to enable Http2BmsService to use the combined long-running status check
     * Tied to ExploreEnableCombinedLRO token
     */
    public enableCombinedLRO(): void {
        this.useCombinedLRO = true;
        this.checkLongRunningRequestStatuses().subscribe(() => {
            // Intentionally empty
        });
    }

    /**
     * BMS request for posting data
     */
    post$(command: string, data: any, params?: HttpParams, initialResponseCallback?: () => void): Observable<any> {
        return this.postRequest$(command, data, params, undefined, initialResponseCallback);
    }

    /**
     * BMS request for getting data
     * @param command BMS command
     */
    get$(command: string, params?: HttpParams): Observable<any> {
        return this.getRequest$(command, params);
    }

    /**
     * Incapsulated this method as retry count is used only for long running requests.
     */
    private postRequest$(command: string, data: any, params?: HttpParams, retryCount?: number, initialResponseCallback?: () => void): Observable<any> {
        const url = this.getURL(command);
        this.addRequestIdToPostData(data);

        const http2BmsResponse$ = this.http.post<Http2BmsResponse<Response>[]>(url, data, {params, withCredentials: true}).pipe(
            tap(() => {
                if (initialResponseCallback) {
                    initialResponseCallback();
                }
            })
        );
        const convertBMSResponse$ = this.convertBmsResponse$(http2BmsResponse$, command, data);

        return this.checkLongRunningResponse$(convertBMSResponse$, data, data.requestId, retryCount, params);
    }

    /**
     * Incapsulated this method as retry count is used only for long running requests.
     */
    private getRequest$(command: string, params?: HttpParams, retryCount?: number): Observable<any> {
        const url = this.getURL(command);
        params = this.getCopiedParamWithRequestId(params);

        const http2BmsResponse$ = this.http.get<Http2BmsResponse<Response>[]>(url, {params, withCredentials: true});
        const convertBMSResponse$ = this.convertBmsResponse$(http2BmsResponse$, command, params);

        // originalDataRequestId will already be set in params if in LONG_RUNNING, otherwise this is the original GET data request so we take the requestId
        const originalDataRequestId = params?.get(RequestConstants.ORIGINAL_DATA_REQUEST_ID_PARAM) || params?.get(RequestConstants.REQUEST_ID_PARAM);

        return this.checkLongRunningResponse$(convertBMSResponse$, null, originalDataRequestId, retryCount, params);
    }

    /**
     * @param command BMS command
     */
    private getURL(command: string): string {
        return AppUtils.getBaseUrl() + UtilConstants.SLASH + command + AppUtils.getCustomSource();
    }

    /**
     * Convert the Http2BMS response to server response and log errors if request was not successful.
     * Http2Bms returns array of Http2BmsResponse as Http2Bms configuration for explore is Multi Response
     */
    private convertBmsResponse$(observable: Observable<Http2BmsResponse<any>[]>, command: string, params: any): Observable<any> {
        const result = new Subject<any>();
        observable
            .subscribe(response => {
                // Check if request was successful.
                if (response && response[0] && response[0].return_val === DataRequestConstants.SUCCESS_RESPONSE) {
                    result.next(response[0].output);
                    result.complete();
                } else if (response && response[0] && response[0].message === DataRequestConstants.CANCELLED_RESPONSE) {
                    result.next(response[0]);
                    result.complete();
                } else {
                    console.group(`Server side error for ${command}`);
                    console.error('Parameters: ', params);
                    console.error('Response: ', response);
                    console.groupEnd();
                    result.error(new Error(this.identifyServerSideError(response[0])));
                }
            },
            (error: { message: string }) => {
                console.error(`Network error for ${command}: ${error.message}`);
                result.error(new Error(error.message));
            });

        return result.asObservable();
    }

    /**
     * return error msg shown to users in case of specific server errors
     */
    identifyServerSideError(response: any): string {
        if (response.message?.includes('Large message replaced with error body')) {
            return 'This report exceeds our maximum response size limit.';
        } else {
            return response.message;
        }
    }

    /**
     * Check if request is long running and handle it.
     */
    private checkLongRunningResponse$(responseObservable: Observable<any>, requestParams: any, originalDataRequestId: string, retryCount: number, params?: HttpParams): Observable<any> {
        return responseObservable.pipe(
            switchMap(response => {
                if (response.userinfo) {
                    const userSessionInfo = new UserSessionInfo(response.userinfo);
                    this.notificationService.pushLatestUserSessionInfoMap(userSessionInfo);
                }
                if (this.isLongRunningResponse(response)) {
                    return this.handleLongRunningRequest$(response, requestParams, originalDataRequestId, retryCount, params);
                } else {
                    return of(response);
                }
            })
        );
    }

    /**
     * Takes an HttpParams and return a new one after adding a requestId to it since HttpParams is immutable.
     */
    private getCopiedParamWithRequestId(params: HttpParams): HttpParams {
        // If we didn't get any params then don't bother adding the request id.
        // TODO:  Might also want to restrict this when we are serving mocked data.
        if (!params) {
            return;
        }

        // Set the request id into the parameters.
        // Now since we log this in gen stats we need to trim it to 15 chars.
        // Also, add session id to the request
        const requestId: string = CommonUtils.generateUniqueIdAsString();
        // params.set creates a clone of params object
        return params.set(RequestConstants.REQUEST_ID_PARAM, requestId)
            .set(RequestConstants.SESSION_ID, AppStore.exploreSessionId);
    }

    /**
     * Generates a requestId and adds it to data of the post request.
     */
    private addRequestIdToPostData(data: any): void {
        // If we didn't get any params then don't bother adding the request id.
        // TODO:  Might also want to restrict this when we are serving mocked data.
        if (!data) {
            return;
        }

        // Set the request id into the parameters.
        // Now since we log this in gen stats we need to trim it to 15 chars.
        data.requestId = CommonUtils.generateUniqueIdAsString();
        // Also, add session id to the request
        data.sessionId = AppStore.exploreSessionId;
    }

    /**
     * Checks if the response is a long running request type.
     */
    private isLongRunningResponse(response: any): boolean {
        return response?.status === 'LONG_RUNNING';
    }

    /**
     * Handle long running request
     */
    private handleLongRunningRequest$(response: any, requestParams: any, originalDataRequestId: string, retryCount: number = 1, origParams?: HttpParams): Observable<any> {
        // Create the request params to get the response.
        let params: HttpParams = new HttpParams();
        if (originalDataRequestId) {
            params = params.set(RequestConstants.ORIGINAL_DATA_REQUEST_ID_PARAM, originalDataRequestId);
        }
        // id used to fetch the status of the data request in the backend ADL store
        params = params.set(RequestConstants.LONG_RUNNING_STATUS_ID_PARAM, response.message);

        // adding loading params from the previous 'connected' request
        // we need them for loading interceptor logic
        if (origParams) {
            params = params.set(CoreRequestConstants.LOADING_KEY, origParams.get(CoreRequestConstants.LOADING_KEY));
            params = params.set(CoreRequestConstants.LOADING_MESSAGE, origParams.get(CoreRequestConstants.LOADING_MESSAGE));
            if (origParams.get(RequestConstants.ENABLE_BACKGROUND_CLK)) {
                params = params.set(RequestConstants.ENABLE_BACKGROUND_CLK, origParams.get(RequestConstants.ENABLE_BACKGROUND_CLK));
            }
        }

        // If we are using the combined long running request handler, hand it off to the service and return a different observable
        // This Subject will trigger when the handler emits that the request is done.
        if (this.useCombinedLRO) {
            // If it's a long running, go through the long running handler
            return LongRunningHandlerService.addLongRunningRequest$(response.message, requestParams, originalDataRequestId, origParams?.get('widgetId') ?? null).pipe(
                switchMap((success) => {
                    if (!success) {
                        return throwError('Request canceled');
                    }
                    return this.getRequest$(RequestConstants.GET_LONG_RUNNING_REQUEST, params,  0);
                })
            );
        }

        // Calculate the wait time for this iteration.
        const waitTime: number = this.calculateWaitTime(retryCount);
        return timer(waitTime).pipe(
            switchMap(() => this.getRequest$(RequestConstants.GET_LONG_RUNNING_REQUEST, params, retryCount + 1))
        );
    }

    /**
     * Main LongRunningRequest checker method
     * Continuously idles and checks for any long running requests added to the tracker.
     */
    public checkLongRunningRequestStatuses(): Observable<any> {
        const waitTime: number = this.calculateWaitTime(LongRunningHandlerService.longRunningRetryCount);
        const url = this.getURL(RequestConstants.GET_LONG_RUNNING_STATUS_REQUEST);
        // Add all current pending long-running request ids (with original request ids) to the request data
        const data = LongRunningHandlerService.getLongRunningStatusRequestParams();
        this.addRequestIdToPostData(data);
        // Wait the calculated time before sending a request to server to check all long running request statuses
        return timer(waitTime).pipe(
            switchMap(() => {
                // If there are no long running requests, don't bother sending a request to the server
                if (data.longRunningStatusIds.length === 0) {
                    return of({data: []});
                }
                const http2BmsResponse$ = this.http.post<Http2BmsResponse<Response>[]>(url, data, {withCredentials: true});
                return this.convertBmsResponse$(http2BmsResponse$, RequestConstants.GET_LONG_RUNNING_STATUS_REQUEST, data);
            }),
            switchMap((response) => {
                this.handleLROResponse(response);
                // Keep calling itself so this chain will constantly poll
                return this.checkLongRunningRequestStatuses();
            }),
            catchError((error) => {
                // Log any errors but continue to check for long running requests
                console.error('Error checking long running request statuses', error);
                return this.checkLongRunningRequestStatuses();
            })
        );
    }

    /**
     * Handles the Combined LRO status check response
     */
    public handleLROResponse(response: any): void {
        // If we got id's back, that means those requests are done and we can trigger each request to go request the data from the server
        if (response.data.length) {
            for (const id of response.data) {
                // Calling next on the subject will trigger the corresponding request's observable flow to will go get the data
                LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.get(id)?.longRunningStatus.next(true);
                // We need to call complete on the internal Subject so that all other subscribers know to proceed (mainly operators like forkJoin)
                LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.get(id)?.longRunningStatus.complete();
                const widgetId = LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.get(id)?.widgetId;
                LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.delete(id);
                LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.delete(widgetId);
            }
        }
        // If we still have pending long running requests, increment the retry count (which will increase time between polling)
        if (LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.size > 0) {
            LongRunningHandlerService.longRunningRetryCount++;
        } else {
            LongRunningHandlerService.longRunningRetryCount = 0;
        }
    }

    /**
     * For long running requests we want the wait time to increase with the time it has been running.
     * We are going to do this is this way:
     *      - first 10 attempts we will wait 1s
     *      - next 10 attempts we will wait 5s
     *      - next 10 attempts we will wait 10s
     *      - all the rest will be 30s
     */
    private calculateWaitTime(retryCount: number): number {
        if (retryCount <= 10) {
            return 1000;
        } else if (retryCount <= 20) {
            return 5000;
        } else if (retryCount <= 30) {
            return 10000;
        }
        return 30000;
    }
}
