import {Injectable} from '@angular/core';

/**
 * Holds the widget ids for which the request has been cancelled.
 */
@Injectable({
    providedIn: 'root'
})
export class RequestCancelerStore {
    static inProgressRequests: Map<number, string[]> = new Map<number, string[]>();
    static requestsToCancel: Set<string> = new Set<string>();
    static longRunningRequestIdToWidgetId: Map<string, number> = new Map<string, number>();

    /**
     * Set all the in progress requests for a widgetID
     */
    static setInProgressRequestsForWidgetID(widgetID: number, requestID: string): void {
        const requestIDForWidget: string[] = RequestCancelerStore.inProgressRequests.get(widgetID);
        if (requestIDForWidget) {
            requestIDForWidget.push(requestID);
        } else {
            RequestCancelerStore.inProgressRequests.set(widgetID, [requestID]);
        }
    }

    /**
     * Replaces the requestID with its long running requestID
     */
    static replaceInProgressRequestIDWithLongRunningID(widgetID: number, oldRequestID: string, newRequestID: string): void {
        const inProgressRequests: string[] = RequestCancelerStore.inProgressRequests.get(widgetID).filter(requestID => requestID !== oldRequestID);
        inProgressRequests.push(newRequestID);
        RequestCancelerStore.inProgressRequests.set(widgetID, inProgressRequests);
    }

    /**
     * deletes the in progress request for a widgetID
     */
    static deleteInProgressRequest(widgetID: number, requestIDToDelete: string): void {
        const requestIDs: string[] = RequestCancelerStore.inProgressRequests.get(widgetID);
        const index = requestIDs.indexOf(requestIDToDelete);
        requestIDs.splice(index, 1);

        if (requestIDs.length === 0) {
            RequestCancelerStore.inProgressRequests.delete(widgetID);
        }
    }

    /**
     * Sets the in Progress Request in requestsToCancel set
     */
    static setRequestsToCancelForWidgetID(widgetID: number): void {
        if (!RequestCancelerStore.inProgressRequests.has(widgetID)) {
            return;
        }
        RequestCancelerStore.inProgressRequests.get(widgetID).forEach(requestIDs => {
            RequestCancelerStore.requestsToCancel.add(requestIDs);
        });
    }

    /**
     * Remove the requestIDs from requestsToCancel on reload
     */
    // TODO: widgetId is not unique with different portfolios in a report group
    static removeRequestFromRequestToCancel(widgetID: number): void {
        if (!RequestCancelerStore.inProgressRequests.has(widgetID)) {
            return;
        }
        RequestCancelerStore.inProgressRequests.get(widgetID).forEach(requestIDs => {
            if (RequestCancelerStore.requestsToCancel.has(requestIDs)) {
                RequestCancelerStore.requestsToCancel.delete(requestIDs);
            }
        });
    }
}
