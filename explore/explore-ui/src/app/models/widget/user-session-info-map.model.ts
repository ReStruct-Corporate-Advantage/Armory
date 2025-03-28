import {UserSessionInfo} from '@models/widget/user-session-info.model';
import {isNil} from 'lodash';

/**
 * Map of user sesisons across multiple client environments
 */
export class UserSessionInfoMap {

    map = new Map<string, UserSessionInfo>();

    /**
     * get total outstanding requests across all insatnces for a user
     */
    getCombinedRequestCount(): number {
        let alertCount = 0;
        this.map.forEach((sessionInfo, serverId) => {
            alertCount += (sessionInfo.queuedRequests + sessionInfo.runningRequests);
        });
        return alertCount;
    }

    /**
     * returns true if update is success
     */
    updateMap(userSessionInfo: UserSessionInfo): boolean {
        if (!userSessionInfo.serverId) {
            return false;
        }
        const session = this.map.get(userSessionInfo.serverId);
        if (isNil(session) || session.isOlderThan(userSessionInfo)) {
            this.map.set(userSessionInfo.serverId, userSessionInfo);
            return true;
        }
        return false;
    }
}
