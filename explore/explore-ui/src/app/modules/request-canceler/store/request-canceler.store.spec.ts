import {RequestCancelerStore} from './request-canceler.store';

describe('Tests for requestCanceler Store', () => {
    it('setInProgressRequestsForWidgetID test case', () => {
        RequestCancelerStore.setInProgressRequestsForWidgetID(123, 'RequestID1');
        expect(RequestCancelerStore.inProgressRequests.get(123)[0]).toStrictEqual('RequestID1');
    });

    it('replaceInProgressRequestIDWithLongRunningID test case', () => {
        RequestCancelerStore.setInProgressRequestsForWidgetID(123, 'RequestID2');
        RequestCancelerStore.replaceInProgressRequestIDWithLongRunningID(123, 'RequestID2', 'newRequestID');
        expect(RequestCancelerStore.inProgressRequests.get(123)).toStrictEqual(['RequestID1', 'newRequestID']);
    });

    it('deleteInProgressRequest test case', () => {
        RequestCancelerStore.deleteInProgressRequest(123, 'RequestID2');
        expect(RequestCancelerStore.inProgressRequests.get(123)).toEqual(['RequestID1']);
    });

    it('should add and remove request to/from requestsToCancel', () => {
        // adding request to requestsToCancel
        RequestCancelerStore.setInProgressRequestsForWidgetID(456, 'RequestID2');
        RequestCancelerStore.setRequestsToCancelForWidgetID(456);
        expect(RequestCancelerStore.requestsToCancel.size).toStrictEqual(1);
        expect(RequestCancelerStore.requestsToCancel.has('RequestID2')).toBeTruthy();

        // removing request from requestToCancel
        RequestCancelerStore.removeRequestFromRequestToCancel(456);
        expect(RequestCancelerStore.requestsToCancel.size).toStrictEqual(0);
        expect(RequestCancelerStore.requestsToCancel.has('RequestID2')).toBeFalsy();
    });
});
