import {CoreDefinitionStore, TokenConstants} from '@blk/explore-ui-core';
import {LoadAllDataRequest} from './load-all-data-request.model';
import {LoadAllTracker} from './load-all-tracker.model';

/**
 * Class that holds unprocessedRequestQueue and inProgressRequestQueue of LoadAllDataRequest
 */
export class LoadAllRequestQueue {
    requestLimit: number;
    unprocessedRequestQueue: LoadAllDataRequest[];
    inProgressRequests: LoadAllDataRequest[];
    loadAllTracker: LoadAllTracker;

    /**
     * Constructor
     */
    constructor() {
        // Set the requestLimit
        this.requestLimit = CoreDefinitionStore.tokens[TokenConstants.LOAD_ALL_REQUEST_LIMIT]
            ? parseInt(CoreDefinitionStore.tokens[TokenConstants.LOAD_ALL_REQUEST_LIMIT], 10)
            : 1;
        this.resetQueue();
    }

    /**
     * Get moved LoadAllDataRequest from unprocessed to in progress
     */
    getAndMoveRequestToInProgress(): LoadAllDataRequest {
        const queuedRequest = this.unprocessedRequestQueue.shift();
        this.loadAllTracker.moveUnprocessedRequestToInProgress();
        queuedRequest.portfolio.loadAllTracker.moveUnprocessedRequestToInProgress();
        return queuedRequest;
    }

    /**
     * Resets the queue
     */
    resetQueue(): void {
        this.unprocessedRequestQueue = [];
        this.inProgressRequests = [];
        this.loadAllTracker = new LoadAllTracker();
    }
}
