import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FavoriteConstants} from '@constants/favorite.constants';
import {FavoriteStore} from '@stores/favorite.store';
import {BehaviorSubject, of, Subject, throwError} from 'rxjs';
import {cloneDeep} from 'lodash';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';

import {FavoriteTreeSaveModeComponent} from './favorite-tree-save-mode.component';
import {UIConstants} from '@constants/index';
import {FavoriteService} from '@services/favorite';
import {NotificationService} from '@services/notification';
import * as getFavoriteFolderStructure from '@mocks/favoriteFolderStructureMock.json';
import {FavoriteTreeService} from '../../../service/favorite-tree.service';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';
import {HashMap} from '@qbstr/hash-map';
import {ErrorTypeConstants, UIErrorParameters} from '@blk/explore-ui-core';
import {FavoriteTreeUtils} from '../../../utils/favorite-tree.utils';
import {auxFavoriteTreeDataOnSaveMode} from '../../../utils/favorite-tree.utils.spec';
import {FavoriteTreeActionUtils} from '../../../utils/favorite-tree-action.utils';

describe('FavoriteTreeSaveModeComponent', () => {
    let component: FavoriteTreeSaveModeComponent;
    let fixture: ComponentFixture<FavoriteTreeSaveModeComponent>;

    FavoriteStore.folderFavCache.set('seakim,WORKSPACE', new FavoriteFolderItem(getFavoriteFolderStructure));

    const favoriteServiceStub = {
        getFavoriteFolderStructure$: jest.fn(() => of(getFavoriteFolderStructure)),
        getSlimFavorites$: jest.fn(),
        saveFavoriteFolderStructure$: jest.fn(() => of({})),
        deleteFavorite$: jest.fn(() => of({})),
        postDeleteTelemetry: jest.fn(() => of({}))
    };

    const favoriteTreeServiceStub = {
        generateFavoriteTree$: jest.fn(),
        saveFavoriteFolderStructure$: jest.fn(() => of({})),
        favoriteFolderStructure: new HashMap()
    };

    const notificationServiceStub = {
        success: jest.fn(),
        error: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FavoriteTreeSaveModeComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: FavoriteTreeService, useValue: favoriteTreeServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub}
            ]
        });

        fixture = TestBed.createComponent(FavoriteTreeSaveModeComponent);
        component = fixture.componentInstance;

        component['favType'] = FavoriteConstants.WORKSPACE;
        component['favTreeType'] = FavoriteConstants.WORKSPACE_FOLDER;
        component['favDisplayName'] = FavoriteConstants.WORKSPACE_PASCAL;
        component['favoriteTreeOwner$'] = of('seakim');
        component['selectedFavoriteNode$'] = new Subject<any>();
        component['saveMode'] = true;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelector('.favorite-tree-save-mode-area')).toMatchSnapshot();
    });

    describe('onInit Test', () => {
        const selectedNode: AuxAdvancedTreeListInterface = {
            label: 'folder123',
            children: [],
            eventData: {type: 'folder'}
        };

        beforeEach(() => {
            component['favoriteTreeOwner$'] = of('seakim');
            component.updateFavoriteTreeStructure$ = of({selectedNode, title: 'Sean\'s workspace', id: 123456});
            component['enableSaveSubject$'] = new BehaviorSubject<boolean>(undefined);
            jest.spyOn(favoriteTreeServiceStub, 'generateFavoriteTree$').mockReturnValueOnce(
                of([])
            );
        });

        it('should subscribe to updateFavoriteTreeStructure$ and save favorite folder structure after adding favorite to selected node', () => {
            jest.spyOn(component, 'saveFavoriteFolderStructure' as any);

            component.ngOnInit();

            expect(selectedNode.children[0].label).toBe('Sean\'s workspace');
            expect(selectedNode.children[0].eventData.favoriteId).toBe(123456);
            expect(component['saveFavoriteFolderStructure']).toHaveBeenCalled();
        });
    });

    describe('After Component Initialize', () => {
        beforeEach(() => {
            component.allFavoriteTreeData = auxFavoriteTreeDataOnSaveMode;
        });

        describe('onFavoriteSelected Test', () => {
            it('should trigger selectedFavoriteNode$ with selected node on save mode', () => {
                jest.spyOn(component['selectedFavoriteNode$'], 'next');
                // @ts-ignore to mock event with the eventData since detail in CustomEvent is readonly property
                component.onFavoriteSelected({detail: {value: [{eventData: {type: 'WORKSPACE', favoriteId: 123456}}]}});

                expect(component['selectedFavoriteNode$'].next).toHaveBeenCalledWith({
                    eventData: {type: 'WORKSPACE', favoriteId: 123456}
                });
            });
        });

        describe('onFolderRenamed Test', () => {
            it('should call saveFavoriteFolderStructure on folder renamed', () => {
                jest.spyOn(component, 'saveFavoriteFolderStructure' as any);
                component.onFolderRenamed();

                expect(component['saveFavoriteFolderStructure']).toHaveBeenCalled();
            });
        });

        describe('createFirstLevelFolder Test', () => {
            it('should append a new folder to the first level when +Create folder button is clicked', () => {
                expect(component.allFavoriteTreeData.length).toBe(4);

                component.createFirstLevelFolder();

                expect(component.allFavoriteTreeData.length).toBe(5);
                expect(component.allFavoriteTreeData[0].label).toBe('New Folder');
                expect(component.allFavoriteTreeData[0].children).toEqual([]);
                expect(component.allFavoriteTreeData[0].contextMenu).toEqual([
                    {label: UIConstants.CREATE_FOLDER},
                    {label: UIConstants.RENAME_FOLDER},
                    {label: UIConstants.DELETE_FOLDER}
                ]);
            });
        });

        describe('onContextMenuClicked Test', () => {
            it('should append a new folder to the tree under the selected folder when Create folder is clicked', () => {
                expect(component.allFavoriteTreeData[0].children.length).toBe(2);
                expect(component.allFavoriteTreeData[0].children[0].label).toBe('BAMY (bamba)');
                expect(component.allFavoriteTreeData[0].children[1].label).toBe('Empty folder');

                const event = {
                    detail: {
                        label: 'Create folder',
                        value: auxFavoriteTreeDataOnSaveMode[0]
                    }
                };
                // @ts-ignore - to mock event since detail in CustomEvent is read-only property
                component.onContextMenuClicked(event);

                expect(component.allFavoriteTreeData[0].children.length).toBe(3);
                expect(component.allFavoriteTreeData[0].children[0].label).toBe('New Folder');
                expect(component.allFavoriteTreeData[0].children[0].isEditable).toBeTruthy();
            });

            describe('findNodeWithLabel Test', () => {
                it('should find node with label', () => {
                    const uid = '22ecfbc5-e7cc-4a24-8e05-ac6687fdf86f';
                    expect(auxFavoriteTreeDataOnSaveMode[0].children[0].uid).toBe(uid);
                    const label = 'BAMY (bamba)';
                    expect(auxFavoriteTreeDataOnSaveMode[0].children[0].label).toBe('BAMY (bamba)');

                    const foundNode = component['findNodeWithLabel'](label, auxFavoriteTreeDataOnSaveMode);
                    expect(foundNode.uid).toBe(uid);
                });
            });



            it('should update the selected node\'s isEditable so the name can be updated when Rename folder is clicked', () => {
                expect(component.allFavoriteTreeData[0].children[1].isEditable).toBeFalsy();

                const event = {
                    detail: {
                        label: 'Rename folder',
                        value: auxFavoriteTreeDataOnSaveMode[0].children[1]
                    }
                };
                // @ts-ignore - to mock event since detail in CustomEvent is read-only property
                component.onContextMenuClicked(event);

                expect(component.allFavoriteTreeData[0].children.length).toBe(2);
                expect(component.allFavoriteTreeData[0].children[1].isEditable).toBeTruthy();
            });

            it('should call removeSelectedNodeAndUpdateParent to delete the selected folder when Delete folder is clicked', () => {
                const selectedNodesParent = cloneDeep(auxFavoriteTreeDataOnSaveMode[0]);
                expect(selectedNodesParent.children.length).toBe(2);

                jest.spyOn(FavoriteTreeUtils, 'findParentNode' as any).mockReturnValue(selectedNodesParent);
                jest.spyOn(FavoriteTreeActionUtils, 'removeSelectedNodeAndUpdateParent' as any);

                const event = {
                    detail: {
                        label: 'Delete folder',
                        value: selectedNodesParent.children[1]
                    }
                };
                // @ts-ignore - to mock event since detail in CustomEvent is read-only property
                component.onContextMenuClicked(event);

                expect(FavoriteTreeActionUtils['removeSelectedNodeAndUpdateParent']).toHaveBeenCalled();
                expect(selectedNodesParent.children.length).toBe(1);
                expect(selectedNodesParent.children[0].label).toBe('BAMY (bamba)');
            });

            it('should call removeSelectedNodeAndUpdateParent, deleteFavorite, and saveFavoriteFolderStructure when Delete favorite is clicked', () => {
                const selectedNodesParent = cloneDeep(auxFavoriteTreeDataOnSaveMode[0]);
                expect(selectedNodesParent.children.length).toBe(2);

                jest.spyOn(FavoriteTreeUtils, 'findParentNode' as any).mockReturnValue(selectedNodesParent);
                jest.spyOn(component, 'deleteFavorite' as any);
                jest.spyOn(FavoriteTreeActionUtils, 'removeSelectedNodeAndUpdateParent' as any);

                const event = {
                    detail: {
                        label: 'Delete Workspace',
                        value: selectedNodesParent.children[0]
                    }
                };
                // @ts-ignore - to mock event since detail in CustomEvent is read-only property
                component.onContextMenuClicked(event);

                expect(selectedNodesParent.children.length).toBe(1);
                expect(selectedNodesParent.children[0].label).toBe('Empty folder');
                expect(component['deleteFavorite']).toHaveBeenCalledWith(selectedNodesParent.children[0].eventData.favoriteId, 'BAMY (bamba)');
                expect(FavoriteTreeActionUtils['removeSelectedNodeAndUpdateParent']).toHaveBeenCalled();
            });

            describe('private functions Test', () => {
                describe('removeSelectedNodeAndUpdateParent Test', () => {
                    it('should remove selected node and update parent node\'s contextMenu', () => {
                        const selectedNodesParent = cloneDeep(auxFavoriteTreeDataOnSaveMode[0]);
                        selectedNodesParent.children.pop();
                        expect(selectedNodesParent.children.length).toBe(1);
                        expect(selectedNodesParent.contextMenu).toEqual([
                            {label: UIConstants.CREATE_FOLDER},
                            {label: UIConstants.RENAME_FOLDER}
                        ]);

                        FavoriteTreeActionUtils['removeSelectedNodeAndUpdateParent'](selectedNodesParent, selectedNodesParent.children[0].uid);

                        expect(selectedNodesParent.children.length).toBe(0);
                        expect(selectedNodesParent.contextMenu).toEqual([
                            {label: UIConstants.CREATE_FOLDER},
                            {label: UIConstants.RENAME_FOLDER},
                            {label: UIConstants.DELETE_FOLDER}
                        ]);
                    });
                });
            });
        });

        describe('saveFavoriteFolderStructure Test', () => {
            it('should call notificationService.success if success', () => {
                jest.spyOn(component['notificationService'], 'success');
                component['saveFavoriteFolderStructure']();
                expect(component['notificationService'].success).toHaveBeenCalledWith('Successfully saved favorite folder structure.');
            });

            it('should call notificationService.error if error', () => {
                jest.spyOn(component['notificationService'], 'error');
                jest.spyOn(component['favoriteTreeService'], 'saveFavoriteFolderStructure$').mockReturnValue(throwError('Failed to save favorite folder structure.'));
                component['saveFavoriteFolderStructure']();

                expect(component['notificationService'].error).toHaveBeenCalledWith('Failed to save favorite folder structure.', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_UPDATE_FAVORITE_FOLDER_ITEM_TO_SAVE_ERROR);
            });
        });

        describe('deleteFavorite Test', () => {
            it('should call notificationService.success if success', () => {
                jest.spyOn(component['notificationService'], 'success');
                component['deleteFavorite'](123456, 'my favorite');

                expect(component['notificationService'].success).toHaveBeenCalledWith('Successfully deleted the favorite: my favorite');
            });

            it('should call notificationService.error if error', () => {
                jest.spyOn(component['notificationService'], 'error');
                jest.spyOn(component['favoriteService'], 'deleteFavorite$').mockReturnValue(throwError('Failed to save favorite folder structure.'));
                component['deleteFavorite'](123456, 'my favorite');

                expect(component['notificationService'].error).toHaveBeenCalledWith('Failed to delete favorite: my favorite', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_DELETE_FAVORITE_ERROR);
            });
        });
    });
});
