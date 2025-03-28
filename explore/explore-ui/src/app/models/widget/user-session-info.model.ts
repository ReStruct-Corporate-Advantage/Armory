export class UserSessionInfo {
    serverId: string;
    timestamp: number;
    queuedRequests: number;
    runningRequests: number;

    constructor(info: any) {
        if (info) {
            this.serverId = info.serverId;
            this.timestamp = info.timestamp;
            this.queuedRequests = info.queuedRequests;
            this.runningRequests = info.runningRequests;
        }
    }

    /**
     * returns true if this is older that param
     */
    isOlderThan(userSessionInfo: UserSessionInfo): boolean {
        return this.timestamp < userSessionInfo.timestamp;
    }
}
