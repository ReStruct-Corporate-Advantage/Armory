import {CoreFavoriteUtils} from './core-favorite.utils';
import {CoreUserMetaDataStore} from '../../user-meta-data/core-user-meta-data.store';
import {UserMetaData} from '../../user-meta-data/user-meta-data.model';
import {TokenUtils} from '../../definition/token/token.utils';
import {Workspace} from '../../../../../src/app/models/workspace/workspace.model';
import {CoreFavoriteConstants} from '../constants';

describe('CoreFavoriteUtils Test', () => {

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.userPermissionGroups = [];
    });

    it('should return true if at least one user permission group is included in the selected permission groups', () => {

        CoreUserMetaDataStore.userMetaData.userPermissionGroups = ['apg-rio', 'apm'];
        expect(CoreFavoriteUtils.isUserPermissionGroupIncluded(['apg-rio', 'qa'])).toEqual(true);

        CoreUserMetaDataStore.userMetaData.userPermissionGroups = ['apg-rio', 'apm'];
        expect(CoreFavoriteUtils.isUserPermissionGroupIncluded(['qa', 'dev'])).toEqual(false);

        CoreUserMetaDataStore.userMetaData.userPermissionGroups = [];
        expect(CoreFavoriteUtils.isUserPermissionGroupIncluded(['qa', 'dev'])).toEqual(false);

        CoreUserMetaDataStore.userMetaData.userPermissionGroups = ['apg-rio', 'apm'];
        expect(CoreFavoriteUtils.isUserPermissionGroupIncluded([])).toEqual(false);

        CoreUserMetaDataStore.userMetaData.userPermissionGroups = [];
        expect(CoreFavoriteUtils.isUserPermissionGroupIncluded([])).toEqual(false);
    });

    it('test showStatusTagMenu', () => {
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
        jest.spyOn(CoreUserMetaDataStore.userMetaData, 'canUserSaveEnterpriseFavorites').mockReturnValue(true);
        const workspace = new Workspace();
        workspace.id = 12345;
        workspace.owner = '_ADMIN';
        expect(CoreFavoriteUtils.showFavStatusTagMenu(workspace)).toBeFalsy();
        workspace.owner = 'simsingh';
        expect(CoreFavoriteUtils.showFavStatusTagMenu(workspace)).toBeFalsy();
        workspace.owner = '_ADMIN';
        jest.spyOn(CoreUserMetaDataStore.userMetaData, 'canUserSaveEnterpriseFavorites').mockReturnValue(false);
        expect(CoreFavoriteUtils.showFavStatusTagMenu(workspace)).toBeFalsy();
    });
    it('test showStatusTag', () => {
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
        const workspace = new Workspace();
        workspace.id = 12345;
        workspace.owner = '_ADMIN';
        expect(CoreFavoriteUtils.showFavStatusTag(workspace)).toBeFalsy();
        workspace.statusTag = CoreFavoriteConstants.FAVORITE_STATUS.DECOMMISSIONED;
        expect(CoreFavoriteUtils.showFavStatusTag(workspace)).toBeFalsy();
        workspace.statusTag = CoreFavoriteConstants.FAVORITE_STATUS.UNDER_REVIEW;
        expect(CoreFavoriteUtils.showFavStatusTag(workspace)).toBeFalsy();
    });
});
