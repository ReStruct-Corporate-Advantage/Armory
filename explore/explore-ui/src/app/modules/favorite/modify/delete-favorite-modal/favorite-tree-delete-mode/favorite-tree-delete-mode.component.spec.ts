import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FavoriteConstants} from '@constants/favorite.constants';
import {FavoriteStore} from '@stores/favorite.store';
import {of, Subject} from 'rxjs';
import {cloneDeep} from 'lodash';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';

import {FavoriteTreeDeleteModeComponent} from './favorite-tree-delete-mode.component';
import {FavoriteService} from '@services/favorite';
import {NotificationService} from '@services/notification';
import * as getFavoriteFolderStructure from '@mocks/favoriteFolderStructureMock.json';
import {FavoriteTreeService} from '../../../service/favorite-tree.service';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';
import {HashMap} from '@qbstr/hash-map';
import {FavoriteTreeUtils} from '../../../utils/favorite-tree.utils';
import {auxFavoriteTreeDataOnSaveMode} from '../../../utils/favorite-tree.utils.spec';
import {FavoriteTreeActionUtils} from '../../../utils/favorite-tree-action.utils';

const auxFavoriteTreeDataOnDeleteMode = auxFavoriteTreeDataOnSaveMode;

describe('FavoriteTreeDeleteModeComponent', () => {
    let component: FavoriteTreeDeleteModeComponent;
    let fixture: ComponentFixture<FavoriteTreeDeleteModeComponent>;

    FavoriteStore.folderFavCache.set('random,WORKSPACE', new FavoriteFolderItem(getFavoriteFolderStructure));

    const favoriteServiceStub = {
        deleteFavorite$: jest.fn(() => of({}))
    };

    const favoriteTreeServiceStub = {
        generateFavoriteTree$: jest.fn(),
        favoriteFolderStructure: new HashMap()
    };

    const notificationServiceStub = {
        success: jest.fn(),
        error: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FavoriteTreeDeleteModeComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: FavoriteTreeService, useValue: favoriteTreeServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub}
            ]
        });

        fixture = TestBed.createComponent(FavoriteTreeDeleteModeComponent);
        component = fixture.componentInstance;

        component['favType'] = FavoriteConstants.WORKSPACE;
        component['favTreeType'] = FavoriteConstants.WORKSPACE_FOLDER;
        component['favDisplayName'] = FavoriteConstants.WORKSPACE_PASCAL;
        component['favoriteOwner$'] = of('random');
        component['selectedFavoriteNode$'] = new Subject<any>();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });


    describe('deleteFavorite Test', () => {
        it('should delete the selected folder when Delete folder is clicked', () => {
            component.allFavoriteTreeData = cloneDeep(auxFavoriteTreeDataOnSaveMode);
            component.filteredFavoriteTreeData = cloneDeep(auxFavoriteTreeDataOnSaveMode);

            const selectedNode = component.allFavoriteTreeData[0].children[1];
            jest.spyOn(FavoriteTreeUtils, 'findParentNode' as any).mockImplementation((nodeList: AuxAdvancedTreeListInterface[]) => {
                const foundNode = FavoriteTreeUtils.findNode(nodeList, selectedNode.uid);
                return FavoriteTreeUtils.findNode(nodeList, foundNode.parent.uid);
            });
            expect(component.allFavoriteTreeData[0].children.length).toBe(2);

            component['updateFavoriteTreeStructure'](selectedNode, null, null);
            expect(component.allFavoriteTreeData[0].children.length).toBe(1);
            expect(component.allFavoriteTreeData[0].children[0].label).toBe('BAMY (bamba)');
        });
    });

    describe('deleteFavorite Test for all data', () => {
        it('should call removeSelectedNodeAndUpdateParent and remove selected node from all data', () => {
            const selectedNodesParent = cloneDeep(auxFavoriteTreeDataOnDeleteMode);

            jest.spyOn(FavoriteTreeUtils, 'findParentNode' as any).mockReturnValue(selectedNodesParent);
            jest.spyOn(FavoriteTreeActionUtils, 'removeSelectedNodeAndUpdateParent' as any);
            component['updateFavoriteTreeStructure'](selectedNodesParent[0].children[1], null, null);

            expect(FavoriteTreeActionUtils['removeSelectedNodeAndUpdateParent']).toHaveBeenCalled();
        });
    });

    describe('After Component Initialize', () => {
        beforeEach(() => {
            component.filteredFavoriteTreeData = auxFavoriteTreeDataOnDeleteMode;
            component['favoriteOwner'] = 'random';
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
    });

    describe('onInit Test', () => {
        const selectedNode: AuxAdvancedTreeListInterface = {
            label: 'abc',
            uid: '212132',
            eventData: {favoriteId: 1111, type: 'WORKSPACE'}
        };

        beforeEach(() => {
            component['favoriteTreeOwner$'] = of('random');
            component.updateFavoriteTreeStructure$ = of(selectedNode as any);
            jest.spyOn(favoriteTreeServiceStub, 'generateFavoriteTree$').mockReturnValueOnce(
                of([])
            );
        });

        it('should subscribe to favoriteTreeOwner$ and set favoriteTreeOwner', () => {
            component['favoriteTreeOwner$'] = of('random');
            component.ngOnInit();
            expect(component['favoriteTreeOwner']).toBe('random');
        });
    });

    describe('createFilteredTreeData Test', () => {
        it('should create and returned filteredTreeDataList', () => {
            expect(component['createFilteredTreeData'](auxFavoriteTreeDataOnSaveMode, 'prism')).toEqual([
                    {
                        'contextMenu': [
                            {
                                'label': 'Delete favorite'
                            }
                        ],
                        'eventData': {
                            'favoriteId': 1501543,
                            'type': 'WORKSPACE'
                        },
                        'isExpanded': false,
                        'isNested': 0,
                        'label': 'Prism: sean-prism',
                        'uid': '42f7e3d3-ef46-41f7-b22c-1914fdb3db5a'
                    }
                ]
            );
            expect(component['createFilteredTreeData'](auxFavoriteTreeDataOnSaveMode, 'o')).toEqual([
                {
                    'children': [
                        {
                            'contextMenu': [
                                {
                                    'label': 'Create folder'
                                },
                                {
                                    'label': 'Rename folder'
                                },
                                {
                                    'label': 'Delete folder'
                                }
                            ],
                            'eventData': {
                                'favoriteId': 1517717,
                                'type': 'WORKSPACE'
                            },
                            'isExpanded': false,
                            'isNested': 1,
                            'label': 'Empty folder',
                            'parent': {
                                'contextMenu': [
                                    {
                                        'label': 'Create folder'
                                    },
                                    {
                                        'label': 'Rename folder'
                                    }
                                ],
                                'eventData': {
                                    'type': 'folder'
                                },
                                'isExpanded': false,
                                'isNested': 0,
                                'label': 'new2',
                                'uid': 'bef51565-b88b-4574-878e-d345be3e5ffe'
                            },
                            'uid': '3dc0661d-b82d-41d6-a9c7-f2c6631c7a92'
                        }
                    ],
                    'contextMenu': [
                        {
                            'label': 'Create folder'
                        },
                        {
                            'label': 'Rename folder'
                        }
                    ],
                    'eventData': {
                        'type': 'folder'
                    },
                    'isExpanded': true,
                    'isNested': 0,
                    'label': 'new2',
                    'uid': 'bef51565-b88b-4574-878e-d345be3e5ffe'
                },
                {
                    'contextMenu': [
                        {
                            'label': 'Delete favorite'
                        }
                    ],
                    'eventData': {
                        'favoriteId': 1576328,
                        'type': 'WORKSPACE'
                    },
                    'isExpanded': false,
                    'isNested': 0,
                    'label': 'demo',
                    'uid': 'd7af692b-9405-4944-8e06-335801ed2687'
                },
                {
                    'contextMenu': [
                        {
                            'label': 'Delete favorite'
                        }
                    ],
                    'eventData': {
                        'favoriteId': 1557322,
                        'type': 'WORKSPACE'
                    },
                    'isExpanded': false,
                    'isNested': 0,
                    'label': 'fromProd',
                    'uid': 'ccf0d73e-97cb-4c08-957a-4374bda330eb'
                }
            ]);
            expect(component['createFilteredTreeData'](auxFavoriteTreeDataOnSaveMode, 'a')).toEqual([
                {
                    'children': [
                        {
                            'contextMenu': [
                                {
                                    'label': 'Delete favorite'
                                }
                            ],
                            'eventData': {
                                'favoriteId': 1517717,
                                'type': 'WORKSPACE'
                            },
                            'isExpanded': false,
                            'isNested': 1,
                            'label': 'BAMY (bamba)',
                            'parent': {
                                'contextMenu': [
                                    {
                                        'label': 'Create folder'
                                    },
                                    {
                                        'label': 'Rename folder'
                                    }
                                ],
                                'eventData': {
                                    'type': 'folder'
                                },
                                'isExpanded': false,
                                'isNested': 0,
                                'label': 'new2',
                                'uid': 'bef51565-b88b-4574-878e-d345be3e5ffe'
                            },
                            'uid': '22ecfbc5-e7cc-4a24-8e05-ac6687fdf86f'
                        }
                    ],
                    'contextMenu': [
                        {
                            'label': 'Create folder'
                        },
                        {
                            'label': 'Rename folder'
                        }
                    ],
                    'eventData': {
                        'type': 'folder'
                    },
                    'isExpanded': true,
                    'isNested': 0,
                    'label': 'new2',
                    'uid': 'bef51565-b88b-4574-878e-d345be3e5ffe'
                },
                {
                    'contextMenu': [
                        {
                            'label': 'Delete favorite'
                        }
                    ],
                    'eventData': {
                        'favoriteId': 1501543,
                        'type': 'WORKSPACE'
                    },
                    'isExpanded': false,
                    'isNested': 0,
                    'label': 'Prism: sean-prism',
                    'uid': '42f7e3d3-ef46-41f7-b22c-1914fdb3db5a'
                }
            ]);
        });
    });
});
