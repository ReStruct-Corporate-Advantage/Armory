import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {Http2BmsResponse} from '@interfaces/http2bms-response.interface';
import {Http2BmsService} from '@services/bms';
import {RequestConstants} from '@constants/request.constants';

/**
 * Service that queues Explore data requests and limits the number allowed to be processed at the same time.
 */
@Injectable({
    providedIn: 'root'
})
export class HttpRequestQueueService {
    // maximum number of requests that can be processed in parallel
    private static readonly MAX_CONCURRENT_REQUESTS = 5;

    // number of requests currently in progress
    private numberOfProcessingRequests = 0;
    // queued requests
    private queue: QueuedRequest[] = [];

    constructor(private http2BmsService: Http2BmsService) {
    }

    /**
     * Adds a request to the queue and returns an observable that will emit the response when it is available.
     * If there are less than MAX_CONCURRENT_REQUESTS requests being processed, the request will be executed immediately.
     */
    queueRequest$(url: string, data: any, params: HttpParams): Observable<Http2BmsResponse<any>[]> {
        const response$ = new Subject<Http2BmsResponse<any>[]>();

        const widgetId = +params.get(RequestConstants.WIDGET_ID);

        this.queue.push({widgetId, url, data, params, response$});

        if (this.numberOfProcessingRequests < HttpRequestQueueService.MAX_CONCURRENT_REQUESTS) {
            this.startNextRequest();
        }
        // return an empty observable that will eventually emit the response
        return response$.asObservable();
    }

    /**
     * Starts the next request in the queue
     */
    private startNextRequest(): void {
        if (this.queue.length > 0) {
            this.numberOfProcessingRequests++;
            this.execute(this.queue.shift());
        }
    }

    /**
     * Executes the Http2Bms request, emits the response, and starts the next request in the queue
     * @param queuedRequest  Request to be executed
     */
    private execute(queuedRequest: QueuedRequest): void {
        const {url, data, params, response$} = queuedRequest;

        this.http2BmsService.post$(url, data, params, this.onInitialServerResponse).subscribe({
            next: (event) => {
                // emit the response
                response$.next(event);
                response$.complete();
            },
            error: (error) => {
                response$.error(error);
                response$.complete();
            }
        });
    }

    /**
     * Callback to start the next request once the server gives its initial response
     */
    onInitialServerResponse = (): void => {
        // decrement number of processing requests
        this.numberOfProcessingRequests--;
        // start the next request
        this.startNextRequest();
    }

    /**
     * Cancels any queued requests for the given widgetId
     */
    cancelQueuedRequest(widgetId: number): void {
        this.queue = this.queue.filter(request => request.widgetId !== widgetId);
    }
}

export interface QueuedRequest {
    widgetId: number;
    url: string;
    params: HttpParams;
    data: any;
    response$: Subject<Http2BmsResponse<any>[]>;
}
