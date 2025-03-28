import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {RequestConstants} from '@constants/request.constants';
import {map} from 'rxjs/operators';
import {RequestCancelerStore} from './store/request-canceler.store';
import {ReportUtils} from '@utils/report.utils';
import {AppStore} from '../../app.store';
import {DataRequestConstants} from '@constants/data-request.constants';

/**
 * CancelRequestInterceptor to intercept HTTP response and cancel them if cancel button is clicked on reports.
 * Also handles the loading status of the widgets
 */
@Injectable()
export class CancelRequestInterceptor implements HttpInterceptor {

    private static cancelResponse(event: HttpResponse<any>, widgetID: number, requestToCancel: string): HttpResponse<any> {
        event = event.clone({body: [{message: DataRequestConstants.CANCELLED_RESPONSE}]});
        // Once the response is nullified, delete the requestID from inProgressRequests and requestsToCancel
        RequestCancelerStore.requestsToCancel.delete(requestToCancel);
        RequestCancelerStore.deleteInProgressRequest(widgetID, requestToCancel);
        return event;
    }

    /**
     * Stop the loading of the widget
     */
    private static stopLoadingWidget(widgetID: number, requestToCancel: string, isBatchExport?: boolean): void {
        if (!widgetID) {
            return;
        }

        const widgetLoadingStatus$ = AppStore.getWidgetLoadingStatus$(widgetID, isBatchExport);
        if (widgetLoadingStatus$) {
            // update loading status to false
            widgetLoadingStatus$.next(false);

            // Check whether the report has loaded completely
            ReportUtils.checkIsReportLoading();
            RequestCancelerStore.deleteInProgressRequest(widgetID, requestToCancel);
        }
    }

    /**
     * In case an in progress widget request needs to be cancelled, we cancel its incoming response.
     * If the status of the response is longRunning, then the requestID is replaced with the dataStatusId of longRunning request.
     * If the status is Success or Failure, then the loading of the widget is stopped.
     */
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const widgetID: number = +request.params.get(RequestConstants.WIDGET_ID);

        // Just cater to the requests having widget id
        if (widgetID) {
            // Check if the request is for a batch export
            const isBatchExport = request.params.has('isBatch');
            // If it's for a batch export, then we need to check the widgetLoadingStatusMap from the BatchExportingStore
            // Widget requests will be tracked in either the normal WorkspaceStore or BatchExportingStore
            const widgetLoadingStatus$ = AppStore.getWidgetLoadingStatus$(widgetID, isBatchExport);
            // true in case of load All reports
            if (!widgetLoadingStatus$) {
                return next.handle(request);
            }

            // if loading status for the widget is false, then update to true
            if (!widgetLoadingStatus$.getValue()) {
                widgetLoadingStatus$.next(true);
            }
            // set the loading if the widget to true
            AppStore.reportLoadingStatus$.next(true);


            // create a map for in progress requests with widget and request id.
            const currentRequestID = request.body.requestId;
            RequestCancelerStore.setInProgressRequestsForWidgetID(widgetID, currentRequestID);

            return next.handle(request)
                .pipe(
                    map((event: HttpEvent<any>) => {
                        if (event instanceof HttpResponse) {
                            if (RequestCancelerStore.requestsToCancel.has(currentRequestID)) {
                                event = CancelRequestInterceptor.cancelResponse(event, widgetID, currentRequestID);
                            } else {
                                // if the status of the response is:
                                // long running - create a map with longRunningDataStatusId and widgetID
                                // Success or failure - stop the loading
                                if (event.body[0].output.status === 'LONG_RUNNING') {
                                    // create a map with long Running status ID and widget ID.
                                    const longRunningDataStatusId = event.body[0].output.message;
                                    RequestCancelerStore.longRunningRequestIdToWidgetId.set(longRunningDataStatusId, widgetID);
                                    RequestCancelerStore.replaceInProgressRequestIDWithLongRunningID(widgetID, currentRequestID, longRunningDataStatusId);
                                } else {
                                    CancelRequestInterceptor.stopLoadingWidget(widgetID, currentRequestID, isBatchExport);
                                }
                            }
                            return event;
                        }
                    }));
        } else if (request.params.get(RequestConstants.LONG_RUNNING_STATUS_ID_PARAM)) {
            const longRunningStatusId = request.params.get(RequestConstants.LONG_RUNNING_STATUS_ID_PARAM);
            return next.handle(request)
                .pipe(
                    map((event: HttpEvent<any>) => {
                        if (event instanceof HttpResponse) {
                            const widgetId: number = RequestCancelerStore.longRunningRequestIdToWidgetId.get(longRunningStatusId);
                            // If the requestsToCancel has the longRunningStatusId then nullify the response received for the request
                            if (RequestCancelerStore.requestsToCancel.has(longRunningStatusId)) {
                                event = CancelRequestInterceptor.cancelResponse(event, widgetId, longRunningStatusId);
                                RequestCancelerStore.longRunningRequestIdToWidgetId.delete(longRunningStatusId);
                                // if the status of the longRunning request in success or failure then stop loading the widget
                                // and delete the original id from the map
                            } else if (event.body[0].output.status === 'FAILURE' || event.body[0].output.status === DataRequestConstants.SUCCESS_RESPONSE) {
                                CancelRequestInterceptor.stopLoadingWidget(widgetId, longRunningStatusId);
                                RequestCancelerStore.longRunningRequestIdToWidgetId.delete(longRunningStatusId);
                            }
                            return event;
                        }
                    }));
        } else {
            return next.handle(request);
        }
    }
}
