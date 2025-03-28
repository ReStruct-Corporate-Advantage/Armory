import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BehaviorSubject} from 'rxjs';
import {
    CoreDefinitionStore,
    CoreFavoriteConstants,
    CoreUserMetaDataStore,
    FavoriteDisplayEnum,
    FavoriteType,
    TokenConstants,
    UserMetaData
} from '@blk/explore-ui-core';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FolderStructureModalComponent} from './folder-structure-modal.component';
import {FavoriteChangeFolderState, FolderFavoriteTreeService} from './folder-favorite-tree.service';
import {FolderFavoriteTreeComponent} from './folder-favorite-tree/folder-favorite-tree.component';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {Report} from '@models/workspace/report.model';
import {SaveMode} from '@enums/save-mode.enum';
import {SavableFavoriteChange} from '@services/favorite-change-detection/favorite-change-detection.service';

describe('FolderStructureModalComponent', () => {
    let component: FolderStructureModalComponent;
    let fixture: ComponentFixture<FolderStructureModalComponent>;

    const configToSave = new Report();
    configToSave.title = 'Report 2a';
    configToSave.id = 2162717;

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.access = true;
        CoreUserMetaDataStore.userMetaData.login = 'seakim';
        CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;
        CoreUserMetaDataStore.userMetaData.globalFavPerms = true;

        TestBed.configureTestingModule({
            declarations: [FolderStructureModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [FolderFavoriteTreeService],
        });

        fixture = TestBed.createComponent(FolderStructureModalComponent);
        component = fixture.componentInstance;

        component['selectedUser'] = 'seakim';
        component.favoriteChange = new FavoriteChange(configToSave, FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
        component['applyButtonDisabled$'] = new BehaviorSubject<boolean>(false);

        component.ngOnInit();
    });

    it('should handle applyFolderChanges', () => {
        const favorite = component.favoriteChange;
        component['folderFavoriteTreeService'].favoriteChangeHoldingFolderStateMap.set(favorite, new Map());
        component.favoriteFolderStructureComponent = new FolderFavoriteTreeComponent({} as any, component['folderFavoriteTreeService'], {} as any);
        component['selectedFolder'] = {label: 'selectedFolder', eventData: {childFavoriteData: []}} as any;

        expect(component['folderFavoriteTreeService'].folderChangesMap.has('seakim,LAYOUT_FOLDER')).toBeFalsy();
        expect(component['folderFavoriteTreeService'].favoriteChangeHoldingFolderStateMap.get(favorite).has(FavoriteChangeFolderState.NEW)).toBeFalsy();

        component.applyFolderChanges();

        expect(component['folderFavoriteTreeService'].folderChangesMap.has('seakim,LAYOUT_FOLDER')).toBeTruthy();
        expect(component['folderFavoriteTreeService'].favoriteChangeHoldingFolderStateMap.get(favorite).has(FavoriteChangeFolderState.NEW)).toBeTruthy();
    });

    it('BUG 1723274: should test OriginalAndNewFolderHolding when a folder is selected', () => {
        component.favoriteChange.saveMode = SaveMode.SAVE;
        component.favoriteChange.saveTitle = 'test1';
        component['folderFavoriteTreeService'].favoriteChangeHoldingFolderStateMap.set(component.favoriteChange, new Map());
        component['selectedFolder'] = {label: 'selectedFolder', eventData: {childFavoriteData: [{children: [], favoriteId: 2523440, title: 'test1', type: 'favorite'}]}} as any;

        expect(component.favoriteChange.saveMode).toBe(SaveMode.SAVE);
        expect(component['selectedFolder'].eventData.childFavoriteData.length).toBe(1);

        component.updateOriginalAndNewFolderHolding();
        // This shouldn't add duplicate favorite under the same folder.
        expect(component['selectedFolder'].eventData.childFavoriteData.length).toBe(1);
        expect(component['selectedFolder'].eventData.childFavoriteData[0].favoriteId).toBe(2523440);

        component.favoriteChange.saveMode = SaveMode.SAVE_AS;
        component.updateOriginalAndNewFolderHolding();
        expect(component['selectedFolder'].eventData.childFavoriteData.length).toBe(1);
        expect(component['selectedFolder'].eventData.childFavoriteData[0].favoriteId).toBe(2523440);

    });

    it('should handle applyFolderChanges when selectedFolder is defined', () => {
        const favorite = component.favoriteChange;
        component['selectedFolder'] = {label: 'selectedFolder', eventData: {childFavoriteData: []}} as any;
        component.favoriteFolderStructureComponent = new FolderFavoriteTreeComponent({} as any, component['folderFavoriteTreeService'], {} as any);
        component['folderFavoriteTreeService'].favoriteChangeHoldingFolderStateMap.set(favorite, new Map());

        component.applyFolderChanges();

        expect(component['folderFavoriteTreeService'].folderChangesMap.has('seakim,LAYOUT_FOLDER')).toBeTruthy();
        expect(component['folderFavoriteTreeService'].favoriteChangeHoldingFolderStateMap.get(favorite).has(FavoriteChangeFolderState.NEW)).toBeTruthy();
    
    });

    it('should handle applyFolderChanges when selectedFolder is not defined', () => {
        component['selectedFolder'] = null;

        component.applyFolderChanges();

        expect(component.isApplyButtonDisabled).toEqual(false);
    });

    it('should handle onPermissionGroupsSelected', () => {
        component.isFolderTreeLoaded = true;
        component.isFolderRequirementMet = true;
        component.selectedUser = CoreFavoriteConstants.ADMIN;

        const selectedPermissionGroups = ['group1', 'group2'];

        component['onPermissionGroupsSelected'](selectedPermissionGroups);

        expect(component['selectedPermissionGroups']).toEqual(selectedPermissionGroups);
        expect(component.isApplyButtonDisabled).toEqual(false);
    });

    it('should handle onFolderTreeLoaded', () => {
        component.isFolderRequirementMet = true;

        component.selectedUser = CoreFavoriteConstants.ADMIN;
        component.selectedPermissionGroups = [];

        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS] = 'Y';
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED] = 'Y';

        component['onFolderTreeLoaded'](true);

        expect(component.isFolderTreeLoaded).toEqual(true);

        // disabled because FavoritePermissionGroupComponent.isPermissionGroupRequirementsMet is false
        expect(component.isApplyButtonDisabled).toEqual(false);
    });

    it('should return true if selected user is not ADMIN', () => {
        component.isFolderSelectionRequiredEnabled = true;
        component.selectedUser = 'otherUser';

        expect(component['checkIfFolderRequirementMet']()).toEqual(true);
    });

    it('should return false if folder selection is required and selected user is ADMIN', () => {
        component.isFolderSelectionRequiredEnabled = true;
        component.selectedUser = CoreFavoriteConstants.ADMIN;

        expect(component['checkIfFolderRequirementMet']()).toEqual(false);
    });
});
