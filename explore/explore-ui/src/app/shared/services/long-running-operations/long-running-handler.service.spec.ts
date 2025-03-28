import {LongRunningHandlerService} from '@services/long-running-operations/long-running-handler.service';
import {LongRunningTrackingDetails} from '@models/requests/long-running-tracking-details.model';

/**
 * Test cases for LongRunningHandlerService
 */
describe('LongRunningHandlerService', () => {
    it('Test addLongRunningRequest$', () => {
        const requestParams = {portIdsLRO: ['PEP']};
        LongRunningHandlerService.addLongRunningRequest$('abc', requestParams, 'abc123', '123');
        expect(LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.get('abc')).toBeTruthy();
        expect(LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.get(123)).toBeTruthy();

        LongRunningHandlerService.addLongRunningRequest$('def', {}, 'abc123');
        expect(LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.get('def')).toBeTruthy();

        const obs = LongRunningHandlerService.addLongRunningRequest$('xyz', {}, 'abc123', 'test');

        const multiParams = {multiRequests: [{portId: 'PEP'}, {portId: 'BR-CORE'}], portIdsLRO: ['PEP', 'BR_CORE']};
        LongRunningHandlerService.addLongRunningRequest$('xyz', multiParams, 'abc123', '456');
        expect(LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.get('xyz')).toBeTruthy();
        expect(LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.get('xyz').portIds).toEqual(multiParams.portIdsLRO);

        const ids = LongRunningHandlerService.getCurrentLongRunningIds();
        expect(ids).toEqual(['abc', 'def', 'xyz']);
    });

    it('Test removeALlLongRunningRequests', () => {
        LongRunningHandlerService.addLongRunningRequest$('abc', {portIdsLRO: ['PEP']}, 'abc123', '123');
        expect(LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.get('abc')).toBeTruthy();
        expect(LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.get(123)).toBeTruthy();

        LongRunningHandlerService.removeAllLongRunningRequests();
        expect(LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.get('abc')).toBeFalsy();
        expect(LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.get(123)).toBeFalsy();
    });

    it('Test getLongRunningStatusRequestParams', () => {
        LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.clear();
        const details1 = new LongRunningTrackingDetails('123', 'abc');
        const details2 = new LongRunningTrackingDetails('456', 'xyz');
        LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.set('123', details1);
        LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.set('456', details2);
        const params: {longRunningStatusIds: string[], originalRequestIds: string[]} = LongRunningHandlerService.getLongRunningStatusRequestParams();
        expect(params.longRunningStatusIds).toEqual(['123', '456']);
        expect(params.originalRequestIds).toEqual(['abc', 'xyz']);
    });
});
