import {LoadAllTracker} from './load-all-tracker.model';

/**
 * Tests for LoadAllTracker
 */
describe('LoadAllTracker', () => {
    let loadAllTracker: LoadAllTracker;

    beforeEach(() => {
        loadAllTracker = new LoadAllTracker();
    });

    it('should create an instance', () => {
        expect(loadAllTracker).toBeTruthy();
    });

    it('Test initialization', () => {
        // All tracker values should start at 0
        expect(loadAllTracker.totalRequestCounter).toEqual(0);
        expect(loadAllTracker.unprocessedRequestCounter).toEqual(0);
        expect(loadAllTracker.inProgressRequestCounter).toEqual(0);
    });

    it('Test unprocessedRequestCounter', () => {
        // Begin at 0
        expect(loadAllTracker.unprocessedRequestCounter).toEqual(0);

        loadAllTracker.incrementUnprocessedRequestCounter();
        loadAllTracker.incrementUnprocessedRequestCounter();
        expect(loadAllTracker.unprocessedRequestCounter).toEqual(2);

        loadAllTracker.decrementUnprocessedRequestCounter();
        expect(loadAllTracker.unprocessedRequestCounter).toEqual(1);
    });

    it('Test inProgressRequestCounter', () => {
        // Begin at 0
        expect(loadAllTracker.inProgressRequestCounter).toEqual(0);

        loadAllTracker.incrementInProgressRequestCounter();
        loadAllTracker.incrementInProgressRequestCounter();
        expect(loadAllTracker.inProgressRequestCounter).toEqual(2);

        loadAllTracker.decrementInProgressRequestCounter();
        expect(loadAllTracker.inProgressRequestCounter).toEqual(1);
    });

    it('Test totalRequestCounter', () => {
        // Begin at 0
        expect(loadAllTracker.totalRequestCounter).toEqual(0);

        loadAllTracker.incrementTotalRequestCounter();
        expect(loadAllTracker.totalRequestCounter).toEqual(1);

        loadAllTracker.incrementTotalRequestCounter();
        expect(loadAllTracker.totalRequestCounter).toEqual(2);
    });

    it('Test addRequestToTracker method', () => {
        // Add 1 request
        loadAllTracker.addRequestToTracker();
        expect(loadAllTracker.unprocessedRequestCounter).toEqual(1);
        expect(loadAllTracker.totalRequestCounter).toEqual(1);
    });

    it('Test moveUnprocessedRequestToInProgress method', () => {
        // Add 2 requests
        loadAllTracker.addRequestToTracker();
        loadAllTracker.addRequestToTracker();
        expect(loadAllTracker.totalRequestCounter).toEqual(2);
        expect(loadAllTracker.unprocessedRequestCounter).toEqual(2);
        expect(loadAllTracker.inProgressRequestCounter).toEqual(0);

        loadAllTracker.moveUnprocessedRequestToInProgress();
        expect(loadAllTracker.unprocessedRequestCounter).toEqual(1);
        expect(loadAllTracker.inProgressRequestCounter).toEqual(1);
    });

    it('Test getCompletionPercentage method', () => {
        // Add 5 requests
        for (let i = 0; i < 5; i++) {
            loadAllTracker.addRequestToTracker();
        }

        // Should start at 0
        expect(loadAllTracker.getCompletionPercentage()).toEqual(0);

        // Send two requests into processing
        loadAllTracker.moveUnprocessedRequestToInProgress();
        loadAllTracker.moveUnprocessedRequestToInProgress();

        // Should still be 0
        expect(loadAllTracker.getCompletionPercentage()).toEqual(0);

        // Finish 1 request
        loadAllTracker.decrementInProgressRequestCounter();

        // Should be 20% done (1/5)
        expect(loadAllTracker.getCompletionPercentage()).toEqual(20);
    });

    it('Test getStringCompletionPercentage method', () => {
        // Add 3 requests
        for (let i = 0; i < 3; i++) {
            loadAllTracker.addRequestToTracker();
        }

        // Should start at 0
        expect(loadAllTracker.getStringCompletionPercentage()).toEqual('(0%)');

        // Send two requests into processing
        loadAllTracker.moveUnprocessedRequestToInProgress();
        loadAllTracker.moveUnprocessedRequestToInProgress();

        // Should still be 0
        expect(loadAllTracker.getStringCompletionPercentage()).toEqual('(0%)');

        // Finish 1 request
        loadAllTracker.decrementInProgressRequestCounter();

        // Should be 33% done (1/3)
        expect(loadAllTracker.getStringCompletionPercentage()).toEqual('(33%)');

        // Finish another request
        loadAllTracker.decrementInProgressRequestCounter();

        // Should be 67% done (2/3) - The method rounds up decimal places
        expect(loadAllTracker.getStringCompletionPercentage()).toEqual('(67%)');
    });

    it('Test isLoadAllInProgress method', () => {
        // Should start as false
        expect(loadAllTracker.isLoadAllInProgress()).toBeFalsy();

        // Add 3 requests
        for (let i = 0; i < 3; i++) {
            loadAllTracker.addRequestToTracker();
        }

        // Should be in progress now
        expect(loadAllTracker.isLoadAllInProgress()).toBeTruthy();

        // Send two requests into processing and 'finish' them
        loadAllTracker.moveUnprocessedRequestToInProgress();
        loadAllTracker.decrementInProgressRequestCounter();
        loadAllTracker.moveUnprocessedRequestToInProgress();
        loadAllTracker.decrementInProgressRequestCounter();

        // Should still be in progress
        expect(loadAllTracker.isLoadAllInProgress()).toBeTruthy();

        // Finish the last request
        loadAllTracker.moveUnprocessedRequestToInProgress();
        loadAllTracker.decrementInProgressRequestCounter();

        // Should be false now
        expect(loadAllTracker.isLoadAllInProgress()).toBeFalsy();
    });

    it('Test resetTrackerCount method', () => {
        // Mock some requests being added
        loadAllTracker.addRequestToTracker();
        loadAllTracker.addRequestToTracker();
        expect(loadAllTracker.totalRequestCounter).toEqual(2);

        // Reset the counter
        loadAllTracker.resetTotalRequestCount();
        expect(loadAllTracker.totalRequestCounter).toEqual(0);
    });
});
