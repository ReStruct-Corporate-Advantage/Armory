import {Subject} from 'rxjs';

/**
 * Class to contain long running request details
 * We will track which widget and portfolio the request is for
 */
export class LongRunningTrackingDetails {
    longRunningId: string;
    originalDataRequestId: string;
    longRunningStatus: Subject<boolean>;
    widgetId: number;
    // Portfolio Ids associated with this request. Can be multiple in the case of a comparison
    portIds: string[];

    constructor(longRunningId: string, originalDataRequestId: string, widgetId?: number) {
        this.longRunningId = longRunningId;
        this.originalDataRequestId = originalDataRequestId;
        this.longRunningStatus = new Subject();
        this.widgetId = widgetId;
        this.portIds = [];
    }

    /**
     * Returns true if a portId is in the list of portfolio ids associated with this request
     */
    isRequestForPortfolio(portId: string): boolean {
        return this.portIds.includes(portId);
    }
}
