import {LongRunningTrackingDetails} from '@models/requests/long-running-tracking-details.model';
import {Observable, of} from 'rxjs';

export class LongRunningHandlerService {
    static longRunningIdToLongRunningTrackingDetails = new Map<string, LongRunningTrackingDetails>();
    static widgetIdToToLongRunningTrackingDetails = new Map<number, LongRunningTrackingDetails[]>();
    static longRunningRetryCount = 0;

    /**
     * Clears out all long running requests
     */
    static removeAllLongRunningRequests(): void {
        LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.clear();
        LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.clear();
    }

    /**
     * Adds a long running request to the long running tracking service.
     */
    static addLongRunningRequest$(longRunningId: string, requestParams: any, originalDataRequestId: string, paramsWidgetId?: string): Observable<any> {
        const longRunningDetails = new LongRunningTrackingDetails(longRunningId, originalDataRequestId);
        // If a widget id was passed in, then this request is a widget data request.
        // We'll need to add some more fields for long-running tracking/handling
        if (paramsWidgetId) {
            const widgetId = parseInt(paramsWidgetId, 10);
            // If the widget id is not a number, then get out of here. Something else is wrong.
            if (Number.isNaN(widgetId)) {
                return of(false);
            }
            longRunningDetails.widgetId = widgetId;

            // multi-portfolio comparison will have an id for each portfolio, all other requests will only have one
            longRunningDetails.portIds = requestParams.portIdsLRO;
            // If we don't have any port ids, then get out of here. Something else is wrong.
            if (longRunningDetails.portIds.length === 0) {
                return of(false);
            }
            const widgetLongRunningDetails = LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.has(widgetId) ? LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.get(widgetId) : [];
            widgetLongRunningDetails.push(longRunningDetails);
            LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.set(widgetId, widgetLongRunningDetails);
        }
        LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.set(longRunningId, longRunningDetails);
        LongRunningHandlerService.longRunningRetryCount = 0;
        return longRunningDetails.longRunningStatus;
    }

    static getCurrentLongRunningIds(): string[] {
        return Array.from(LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.keys());
    }

    /**
     * Adds all current pending long-running request ids (with original request ids) to the request data params
     */
    static getLongRunningStatusRequestParams(): any {
        const data = {longRunningStatusIds: [], originalRequestIds: []};
        for (const longRunningDetails of LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.values()) {
            data.longRunningStatusIds.push(longRunningDetails.longRunningId);
            data.originalRequestIds.push(longRunningDetails.originalDataRequestId);
        }
        return data;
    }
}
