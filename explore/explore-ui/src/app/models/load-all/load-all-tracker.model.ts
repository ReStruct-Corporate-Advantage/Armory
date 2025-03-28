/**
 * Class to keep track of loadAll related requests
 */
export class LoadAllTracker {
    // Counter for the total # of requests
    totalRequestCounter = 0;

    // Counter for the total # of unprocessed requests
    unprocessedRequestCounter = 0;

    // Counter for the # of requests in progress
    inProgressRequestCounter = 0;

    /**
     * Increment the Unprocessed Request Counter
     */
    incrementUnprocessedRequestCounter(): void {
        this.unprocessedRequestCounter++;
    }

    /**
     * Decrement the Unprocessed Request Counter
     */
    decrementUnprocessedRequestCounter(): void {
        this.unprocessedRequestCounter--;
    }

    /**
     * Increment the InProgress Request Counter
     */
    incrementInProgressRequestCounter(): void {
        this.inProgressRequestCounter++;
    }

    /**
     * Decrement the InProgress Request Counter
     */
    decrementInProgressRequestCounter(): void {
        this.inProgressRequestCounter--;
    }

    /**
     * Increment the Total Request Counter
     */
    incrementTotalRequestCounter(): void {
        this.totalRequestCounter++;
    }

    /**
     * Adds a request to the tracker
     * Increments the unprocessed counter as well as the total counter
     */
    addRequestToTracker(): void {
        this.incrementTotalRequestCounter();
        this.incrementUnprocessedRequestCounter();
    }

    /**
     * Updates the tracking counters when you move a request from unprocessed to in progress
     */
    moveUnprocessedRequestToInProgress(): void {
        this.decrementUnprocessedRequestCounter();
        this.incrementInProgressRequestCounter();
    }

    /**
     * Returns the completion percentage
     */
    getCompletionPercentage(): number {
        // finishedRequestNumber is totalRequestNumber minus request the number of requests that we did not get the response back
        const finishedRequestNumber = this.totalRequestCounter - (this.unprocessedRequestCounter + this.inProgressRequestCounter);
        return this.totalRequestCounter ? (finishedRequestNumber * 100) / this.totalRequestCounter : 100;
    }

    /**
     * Returns a string representation of the completion percentage (rounded with no decimal places)
     */
    getStringCompletionPercentage(): string {
        return '(' + this.getCompletionPercentage().toFixed() + '%)';
    }

    /**
     * Returns true if any requests are still in progress
     */
    isLoadAllInProgress(): boolean {
        return !Number.isNaN(this.getCompletionPercentage()) && this.getCompletionPercentage() !== 100;
    }

    /**
     * Reset the total request count
     */
    resetTotalRequestCount(): void {
        this.totalRequestCounter = 0;
    }
}
