import {Setting} from '../core/models/setting.model';
import {TokenUtils} from '../definition/token/token.utils';
import {TokenConstants} from '../definition/token/token.constants';

/**
 * Model for UserMetaData
 */
export class UserMetaData extends Setting {
    access: boolean;
    pricePopupAccess: boolean;
    launchApps: string[];
    login: string;
    globalFavPerms: boolean;
    perfDataPerms: boolean;
    // allows user to save/modify Enterprise favorites
    sharedFavPerms: boolean;
    // allows user to save/modify Enterprise favorites when ExploreEnableEnterpriseTags token is enabled
    enterpriseFavPerms: boolean;
    exportHubAccess: boolean;
    preferences: Map<string, string>;
    userOrg: string;
    atxAccess: boolean;
    apiAccess: boolean;
    aiChatAccess: boolean;
    userPermissionGroups: string[];
    // list of all permission groups available for Enterprise favorites to be saved to
    allEnterprisePermissionGroups: { text: string, value: string }[];

    constructor(data?: any) {
        super(data);
        if (!this.preferences) {
            this.preferences = new Map<string, string>();
        }
    }

    protected doDeserialize(data: any): void {
        // if userMetaDataPayload.access is null or undefined, set it to false
        this.access = !!data.access;
        this.pricePopupAccess = data.pricePopupAccess;
        this.launchApps = data.launchApps;
        this.login = data.login;
        this.globalFavPerms = data.globalFavPerms;
        this.perfDataPerms = data.perfDataPerms;
        this.sharedFavPerms = data.sharedFavPerms;
        this.enterpriseFavPerms = data.enterpriseFavPerms;
        this.exportHubAccess = data.exportHubAccess;

        // Add the user preferences if there are any.
        this.preferences = new Map<string, string>();
        if (data.preferences) {
            Object.keys(data.preferences).forEach(key => {
                this.preferences.set(key, data.preferences[key]);
            });
        }
        this.userOrg = data.userOrg;
        this.atxAccess = data.atxAccess;
        this.apiAccess = data.apiAccess;
        this.aiChatAccess = data.aiChatAccess;
        this.userPermissionGroups = data.userPermissionGroups;
        this.allEnterprisePermissionGroups = data.allEnterprisePermissionGroups?.map(group => ({ text: group.text, value: group.value}));
    }

    canUserSaveEnterpriseFavorites(): boolean {
        return this.sharedFavPerms || (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS) && this.enterpriseFavPerms);
    }
}
