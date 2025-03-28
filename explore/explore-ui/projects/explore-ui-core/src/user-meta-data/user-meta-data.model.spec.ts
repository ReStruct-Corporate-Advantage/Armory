import {UserMetaData} from './user-meta-data.model';

describe(' Test UserMetaData', () => {

    it('should deserialize data correctly', () => {
        const userMetaData = new UserMetaData({
            access: true,
            pricePopupAccess: true,
            launchApps: ['app1', 'app2'],
            login: 'testUser',
            globalFavPerms: true,
            perfDataPerms: true,
            sharedFavPerms: true,
            preferences: {defaultWorkspace: 123456, theme: 'dark'},
            userOrg: 'testOrg',
            atxAccess: true,
            apiAccess: true,
            aiChatAccess: true,
            userPermissionGroups: [],
            allEnterprisePermissionGroups: []
        });
        expect(userMetaData.access).toBe(true);
        expect(userMetaData.pricePopupAccess).toBe(true);
        expect(userMetaData.launchApps).toEqual(['app1', 'app2']);
        expect(userMetaData.login).toBe('testUser');
        expect(userMetaData.globalFavPerms).toBe(true);
        expect(userMetaData.perfDataPerms).toBe(true);
        expect(userMetaData.sharedFavPerms).toBe(true);
        expect(userMetaData.preferences.get('defaultWorkspace')).toBe(123456);
        expect(userMetaData.preferences.get('theme')).toBe('dark');
        expect(userMetaData.userOrg).toBe('testOrg');
        expect(userMetaData.atxAccess).toBe(true);
        expect(userMetaData.apiAccess).toBe(true);
        expect(userMetaData.aiChatAccess).toBe(true);
    });
});
