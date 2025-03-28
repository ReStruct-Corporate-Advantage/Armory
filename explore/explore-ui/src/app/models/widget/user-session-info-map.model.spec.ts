/**
 * Test cases for RiskAndExposureWidget model
 */
import {TestUtils} from '@utils/test.utils';
import {UserSessionInfoMap} from '@models/widget/user-session-info-map.model';
import {UserSessionInfo} from '@models/widget/user-session-info.model';

describe('UserSessionInfoMap', () => {

    let userSessionInfoMap;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    /**
     * Test constructor
     */
    it('constructor', () => {
        userSessionInfoMap = new UserSessionInfoMap();
        expect(userSessionInfoMap).toBeTruthy();
    });

    /**
     */
    it('updateMap', () => {
        userSessionInfoMap = new UserSessionInfoMap();
        const userSessionMap = userSessionInfoMap.updateMap(new UserSessionInfo({serverId: 'test11111', timestamp: 123, queuedRequest: 1, runningRequests: 1}));
        expect(userSessionMap).toBeTruthy();
    });

    /**
     * Test constructor
     */
    it('updateMap with older value', () => {
        userSessionInfoMap = new UserSessionInfoMap();
        userSessionInfoMap.updateMap(new UserSessionInfo({serverId: 'test11111', timestamp: 123, queuedRequest: 1, runningRequests: 1}));
        const isUpdated = userSessionInfoMap.updateMap(new UserSessionInfo({serverId: 'test11111', timestamp: 12, queuedRequest: 1, runningRequests: 1}));
        expect(!isUpdated).toBeTruthy();
    });

    /**
     * Test constructor
     */
    it('updateMap with newer value', () => {
        userSessionInfoMap = new UserSessionInfoMap();
        userSessionInfoMap.updateMap(new UserSessionInfo({serverId: 'test11111', timestamp: 12, queuedRequest: 1, runningRequests: 1}));
        const isUpdated = userSessionInfoMap.updateMap(new UserSessionInfo({serverId: 'test11111', timestamp: 123, queuedRequests: 1, runningRequests: 1}));
        expect(isUpdated).toBeTruthy();
        expect(userSessionInfoMap.getCombinedRequestCount() === 2 ).toBeTruthy();
    });

    /**
     * Test constructor
     */
    it('getCombinedRequestCount', () => {
        // tslint:disable-next-line:no-shadowed-variable
        const userSessionInfoMap = new UserSessionInfoMap();
        let isUpdated = userSessionInfoMap.updateMap(new UserSessionInfo({serverId: 'test11111', timestamp: 124444, queuedRequests: 1, runningRequests: 1}));
        isUpdated = userSessionInfoMap.updateMap(new UserSessionInfo({serverId: 'test11112', timestamp: 1332, queuedRequests: 1, runningRequests: 1}));

        // newer
        isUpdated = userSessionInfoMap.updateMap(new UserSessionInfo({serverId: 'test11111', timestamp: 124445, queuedRequests: 2, runningRequests: 1}));
        expect(isUpdated).toBeTruthy();

        // older - should not reflect
        userSessionInfoMap.updateMap(new UserSessionInfo({serverId: 'test11112', timestamp: 1331, queuedRequests: 5, runningRequests: 1}));
        expect(userSessionInfoMap.getCombinedRequestCount() === 5 ).toBeTruthy();
    });


});
