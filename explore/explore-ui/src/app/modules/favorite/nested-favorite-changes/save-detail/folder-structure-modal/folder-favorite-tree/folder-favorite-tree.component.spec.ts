import {FolderFavoriteTreeComponent} from './folder-favorite-tree.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BehaviorSubject, of} from 'rxjs';
import {CoreFavoriteConstants, CoreUserMetaDataStore, FavoriteDisplayEnum, FavoriteType, UserMetaData} from '@blk/explore-ui-core';
import {ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {folderFavoriteData} from '../folder-favorite-tree.service.spec';
import {FavoriteChangeDetectionService} from '@services/favorite-change-detection/favorite-change-detection.service';
import {FavoriteChangeFolderState, FolderFavoriteTreeService} from '../folder-favorite-tree.service';
import {Report} from '@models/workspace/report.model';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {FavoriteTreeService} from '../../../../service/favorite-tree.service';
import {FavoriteTreeActionUtils} from '../../../../utils/favorite-tree-action.utils';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';

describe('FolderFavoriteTreeComponent', () => {
    let component: FolderFavoriteTreeComponent;
    let fixture: ComponentFixture<FolderFavoriteTreeComponent>;

    const favoriteTreeServiceStub = {
        getFavoriteFolderStructure$: jest.fn(() => of(folderFavoriteData)),
    };

    FavoriteTreeActionUtils.updateNodeOnDragAndDrop = jest.fn();

    const configToSave = new Report();
    configToSave.title = 'Report 2a';
    configToSave.id = 2162717;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FolderFavoriteTreeComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: FavoriteTreeService, useValue: favoriteTreeServiceStub},
                FavoriteChangeDetectionService,
                FolderFavoriteTreeService,
                ChangeDetectorRef
            ],
        });

        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.access = true;
        CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
        CoreUserMetaDataStore.userMetaData.login = 'seakim';
        CoreUserMetaDataStore.userMetaData.globalFavPerms = true;
        CoreUserMetaDataStore.userMetaData.perfDataPerms = true;
        CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;

        fixture = TestBed.createComponent(FolderFavoriteTreeComponent);
        component = fixture.componentInstance;

        component['selectedUser'] = 'seakim';
        component['favoriteChange'] = new FavoriteChange(configToSave, FavoriteDisplayEnum.REPORT, FavoriteType.REPORT);
        component['applyButtonDisabled$'] = new BehaviorSubject<boolean>(false);
    });

    it('should set rootFolderNode on change', () => {
        component.ngOnChanges({selectedUser: new SimpleChange(undefined, 'seakim', true)});

        expect(component.rootFolderNode.eventData.favoriteId).toBe(2434106);
        expect(component.rootFolderNode.children[0].isExpanded).toBeFalsy();
        expect(component.rootFolderNode.children[0].children[0].isExpanded).toBeFalsy();
        expect(component.rootFolderNode.children[0].children[0].children[0].isExpanded).toBeFalsy();
        expect(component.rootFolderNode.children[0].children[0].children[0].eventData.childFavoriteData[0] instanceof FavoriteFolderItem).toBeTruthy();
        expect(component.rootFolderNode.children[0].children[0].children[0].eventData.childFavoriteData[0].favoriteId).toBe(1991504);

        expect(component.rootFolderNode.children[1]).toEqual(component['folderFavoriteTreeService']['currentFavoriteChangeHoldingFolderState'].get(FavoriteChangeFolderState.ORIGINAL));
        expect(component.rootFolderNode.children[1].label).toBe('folder1');
        expect(component.rootFolderNode.children[1].isExpanded).toBeTruthy();
        expect(component.rootFolderNode.children[1].isSelected).toBeTruthy();

        expect(component.rootFolderNode.children[1].eventData.childFavoriteData[0]).toEqual(component['favoriteChange']);
        expect(component.rootFolderNode.children[1].eventData.childFavoriteData[0]).toEqual(component['favoriteChange']);
        expect(component.rootFolderNode.children[1].eventData.childFavoriteData[0].saveTitle).toEqual('Report 2a');
        expect(component.rootFolderNode.children[1].eventData.childFavoriteData[0].value.id).toEqual(2162717);
    });

    it('should handle onNodeDragAndDrop', () => {
        component.onNodeDragAndDrop({} as any);

        expect(FavoriteTreeActionUtils.updateNodeOnDragAndDrop).toBeCalled();
    });

    it('should handle createFirstLevelFolder', () => {
        component.ngOnChanges({selectedUser: new SimpleChange(undefined, 'seakim', true)});

        expect(component.rootFolderNode.children.length).toBe(2);

        component.createFirstLevelFolder();

        expect(component.rootFolderNode.children.length).toBe(3);
        expect(component.rootFolderNode.children[0].label).toBe('New Folder');
    });

    describe('onContextMenuClicked Test', () => {
        it('should handle edit folder', () => {
            component.ngOnChanges({selectedUser: new SimpleChange(undefined, 'seakim', true)});

            const nodeToUpdate = component.rootFolderNode.children[1];
            nodeToUpdate.uid = '18f0fe6b-ce36-4e63-8a8c-4e2ab61ec8d0';
            nodeToUpdate.isEditable = false;

            component.onContextMenuClicked({detail: {label: 'Rename folder', value: {label: 'folder1', uid: nodeToUpdate.uid}}} as any);

            expect(component.rootFolderNode.children[1].isEditable).toBeTruthy();
        });

        it('should handle create folder', () => {
            component.ngOnChanges({selectedUser: new SimpleChange(undefined, 'seakim', true)});

            const nodeToUpdate = component.rootFolderNode.children[1];
            nodeToUpdate.uid = '18f0fe6b-ce36-4e63-8a8c-4e2ab61ec8d0';
            expect(component.rootFolderNode.children[1].children.length).toBe(2);

            component.onContextMenuClicked({detail: {label: 'Create folder', value: {label: 'folder1', uid: nodeToUpdate.uid}}} as any);

            expect(component.rootFolderNode.children[1].children.length).toBe(3);
        });
    });

    it('should emit selected folder ', () => {
        jest.spyOn(component.folderSelected, 'emit');
        const selectedNode = component.rootFolderNode.children[0];
        component.onNodeSelected({detail: {value: [selectedNode]}} as any);

        expect(component.folderSelected.emit).toHaveBeenCalled();
    });

    it('should disable apply button if selectedUser is ADMIN', () => {
        component['selectedUser'] = CoreFavoriteConstants.ADMIN;
        component.ngOnChanges({selectedUser: new SimpleChange(undefined, CoreFavoriteConstants.ADMIN, true)});

        expect(component['applyButtonDisabled$'].value).toBe(false);
    });

    it('should enable apply button if selectedUser is not ADMIN', () => {
        component.ngOnChanges({selectedUser: new SimpleChange(undefined, 'someOtherUser', true)});

        expect(component['applyButtonDisabled$'].value).toBe(false);
    });

    it('should set showStatusBadge to true and call detectChanges if selectedUser is ADMIN', () => {
        component.selectedUser = CoreFavoriteConstants.ADMIN;
        const detectChangesSpy = jest.spyOn(component['changeDetectorRef'], 'detectChanges');

        component.ngOnInit();

        expect(component.showStatusBadge).toBe(true);
        expect(detectChangesSpy).toHaveBeenCalled();
    });

    it('should set showStatusBadge to false and call detectChanges if selectedUser is not ADMIN', () => {
        component.selectedUser = 'someOtherUser';
        const detectChangesSpy = jest.spyOn(component['changeDetectorRef'], 'detectChanges');

        component.ngOnInit();

        expect(component.showStatusBadge).toBe(false);
        expect(detectChangesSpy).toHaveBeenCalled();
    });
});
