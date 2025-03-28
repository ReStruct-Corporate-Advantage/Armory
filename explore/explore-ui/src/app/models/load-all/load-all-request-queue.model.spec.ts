import {CoreDefinitionStore, TokenConstants} from '@blk/explore-ui-core';
import {LoadAllRequestQueue} from './load-all-request-queue.model';
import {LoadAllTracker} from './load-all-tracker.model';
import {LoadAllDataRequest} from './load-all-data-request.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {Widget} from '@models/widget/widget.model';

/**
 * Tests for LoadAllRequestQueue
 */
describe('LoadAllRequestQueue', () => {
    let loadAllRequestQueue: LoadAllRequestQueue;

    beforeAll(() => {
        loadAllRequestQueue = new LoadAllRequestQueue();
    });

    it('Test requestLimit', () => {
        // Should default to 1 request
        expect(loadAllRequestQueue.requestLimit).toEqual(1);

        // Test with a different token value
        CoreDefinitionStore.tokens[TokenConstants.LOAD_ALL_REQUEST_LIMIT] = 3;
        loadAllRequestQueue = new LoadAllRequestQueue();
        expect(loadAllRequestQueue.requestLimit).toEqual(3);
    });

    it('Test variables defined', () => {
        expect(loadAllRequestQueue.unprocessedRequestQueue).toEqual([]);
        expect(loadAllRequestQueue.inProgressRequests).toEqual([]);
        expect(loadAllRequestQueue.loadAllTracker.totalRequestCounter).toBe(0);
    });

    it('Test getAndMoveRequestToInProgress', () => {
        loadAllRequestQueue.unprocessedRequestQueue.push(new LoadAllDataRequest(new Portfolio('PEP'), new Report(), new Widget()));
        loadAllRequestQueue.unprocessedRequestQueue[0].portfolio.loadAllTracker = new LoadAllTracker();
        loadAllRequestQueue.loadAllTracker.addRequestToTracker();
        expect(loadAllRequestQueue.loadAllTracker.unprocessedRequestCounter).toBe(1);
        expect(loadAllRequestQueue.loadAllTracker.inProgressRequestCounter).toBe(0);
        const queuedRequest = loadAllRequestQueue.getAndMoveRequestToInProgress();
        expect(queuedRequest.portfolio.portName).toBe('PEP');
        expect(loadAllRequestQueue.loadAllTracker.unprocessedRequestCounter).toBe(0);
        expect(loadAllRequestQueue.loadAllTracker.inProgressRequestCounter).toBe(1);
        expect(queuedRequest.portfolio.loadAllTracker.inProgressRequestCounter).toBe(1);
    });
});
