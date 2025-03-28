import {CoreUserMetaDataStore, FavoriteDisplayEnum, FavoriteType, UserMetaData} from '@blk/explore-ui-core';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';
import {TestBed} from '@angular/core/testing';
import {FavoriteChangeFolderState, FolderFavoriteTreeService} from './folder-favorite-tree.service';
import {Report} from '@models/workspace/report.model';
import {FavoriteChange} from '@models/favorite/favorite-change.model';

export const folderFavoriteData = new FavoriteFolderItem({
    'children': [{
        'children': [{
            'children': [{
                'children': [{
                    'children': [],
                    'title': 'Report 2a',
                    'type': 'favorite',
                    'favoriteId': 1991504
                }], 'title': 'folder2-1-1', 'type': 'folder'
            }], 'title': 'folder2-1', 'type': 'folder'
        }], 'title': 'folder2', 'type': 'folder'
    }, {
        'children': [{'children': [], 'title': 'folder1-1', 'type': 'folder'}, {
            'children': [],
            'title': 'test',
            'type': 'favorite',
            'favoriteId': 2162717
        }], 'title': 'folder1', 'type': 'folder'
    }], 'type': 'folder', 'favoriteId': 2434106
});


describe('FolderFavoriteTreeService', () => {
    let service: FolderFavoriteTreeService;

    const report = new Report();
    report.title = 'Report 2a';
    report.id = 1991504;
    let favoriteChange: FavoriteChange;


    beforeAll(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.access = true;
        CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
        CoreUserMetaDataStore.userMetaData.launchApps = ['SECURITY_MASTER', 'ANSER', 'ALADDIN_VIEW'];
        CoreUserMetaDataStore.userMetaData.login = 'seakim';
        CoreUserMetaDataStore.userMetaData.globalFavPerms = true;
        CoreUserMetaDataStore.userMetaData.perfDataPerms = true;
        CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;

        favoriteChange = new FavoriteChange(report, FavoriteDisplayEnum.REPORT, FavoriteType.REPORT);
        favoriteChange.savingUser = 'seakim';
        favoriteChange.saveTitle = 'Report 2a';

        TestBed.configureTestingModule({providers: [FolderFavoriteTreeService]});
        service = TestBed.inject(FolderFavoriteTreeService);
    });

    it('should generate folderOnlyFavoriteTreeNodes with proper expanded/selected state and update properties', () => {
        const favoriteTreeNode = service.generateFavoriteTreeNode(folderFavoriteData, favoriteChange);

        expect(favoriteTreeNode.eventData.favoriteId).toBe(2434106);
        expect(favoriteTreeNode.children[0].isExpanded).toBeTruthy();
        expect(favoriteTreeNode.children[0].children[0].isExpanded).toBeTruthy();
        expect(favoriteTreeNode.children[0].children[0].children[0]).toEqual(service['currentFavoriteChangeHoldingFolderState'].get(FavoriteChangeFolderState.ORIGINAL));
        expect(favoriteTreeNode.children[0].children[0].children[0].label).toBe('folder2-1-1');
        expect(favoriteTreeNode.children[0].children[0].children[0].isExpanded).toBeTruthy();
        expect(favoriteTreeNode.children[0].children[0].children[0].isSelected).toBeTruthy();

        expect(favoriteTreeNode.children[0].children[0].children[0].eventData.childFavoriteData[0]).toEqual(favoriteChange);
        expect(favoriteTreeNode.children[0].children[0].children[0].eventData.childFavoriteData[0].saveTitle).toBe('Report 2a');
        expect(favoriteTreeNode.children[0].children[0].children[0].eventData.childFavoriteData[0].value.id).toBe(1991504);

        expect(favoriteTreeNode.children[1].isExpanded).toBeFalsy();
    });

    it('should update expanded/selected state if different favorite was passed in and update properties', () => {
        let favoriteTreeNode = service.generateFavoriteTreeNode(folderFavoriteData, favoriteChange);

        const newReport = new Report();
        newReport.title = 'test';
        newReport.id = 2162717;
        const newFavoriteChange = new FavoriteChange(newReport, FavoriteDisplayEnum.REPORT, FavoriteType.REPORT);
        newFavoriteChange.savingUser = 'seakim';
        newFavoriteChange.saveTitle = 'test';

        expect(favoriteTreeNode.children[1].eventData.childFavoriteData[0] instanceof FavoriteFolderItem).toBeTruthy();

        favoriteTreeNode = service.generateFavoriteTreeNode(favoriteTreeNode, newFavoriteChange);

        expect(favoriteTreeNode.children[1]).toEqual(service['currentFavoriteChangeHoldingFolderState'].get(FavoriteChangeFolderState.ORIGINAL));
        expect(favoriteTreeNode.children[1].label).toBe('folder1');
        expect(favoriteTreeNode.children[1].isExpanded).toBeTruthy();
        expect(favoriteTreeNode.children[1].isSelected).toBeTruthy();

        expect(favoriteTreeNode.children[1].eventData.childFavoriteData[0]).toEqual(newFavoriteChange);
        expect(favoriteTreeNode.children[1].eventData.childFavoriteData[0].saveTitle).toBe('test');
        expect(favoriteTreeNode.children[1].eventData.childFavoriteData[0].value.id).toBe(2162717);
    });

    it('should know the favorite title if changed', () => {
        favoriteChange.saveTitle = 'NEW';
        const favoriteTreeNode = service.generateFavoriteTreeNode(folderFavoriteData, favoriteChange);

        const folderNode = service['currentFavoriteChangeHoldingFolderState'].get(FavoriteChangeFolderState.ORIGINAL);
        expect(folderNode).toEqual(favoriteTreeNode.children[0].children[0].children[0]);
        expect(folderNode.label).toBe('folder2-1-1');
        expect(folderNode.isExpanded).toBeTruthy();
        expect(folderNode.isSelected).toBeTruthy();

        expect(favoriteChange).toEqual(favoriteTreeNode.children[0].children[0].children[0].eventData.childFavoriteData[0]);
        expect(favoriteChange.saveTitle).toBe('NEW');
        expect(favoriteChange.value.id).toBe(1991504);
    });
});
