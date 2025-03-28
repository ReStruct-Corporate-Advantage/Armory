import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';
import * as getFavoriteFolderStructureResponse from '@mocks/favoriteFolderStructureMock.json';
import * as getFavoriteFolderStructureStatusTagsResponse from '@mocks/favoriteFolderStructureWithStatusMock.json';
import * as getSlimFavoriteResponse from '@mocks/slimFavoriteMock.json';
import {CoreFavoriteConstants, Favorite, TokenUtils} from '@blk/explore-ui-core';
import {FavoriteTreeGenerationUtils} from './favorite-tree-generation.utils';
import {FavoriteConstants} from '@constants/favorite.constants';
import {cloneDeep} from 'lodash';
import {FavoriteTreeActionUtils} from './favorite-tree-action.utils';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {FavoriteStore} from '@stores/favorite.store';

describe('FavoriteTreeGenerationUtils', () => {
    const treeData: FavoriteFolderItem = new FavoriteFolderItem(getFavoriteFolderStructureResponse);
    const slimFavorites: Favorite[] = [];
    const favMap: Map<number, Favorite> = new Map<number, Favorite>();
    const addedFavoriteIds: number[] = [];

    beforeAll(() => {
        for (const favData of getSlimFavoriteResponse.workspaces) {
            slimFavorites.push(new Favorite(favData));
        }

        for (const favorite of slimFavorites) {
            favMap.set(favorite.id, favorite);
        }
    });

    it('createFavoriteTree Test', () => {
        expect(FavoriteTreeGenerationUtils.createFavoriteTree(treeData, 'seakim', FavoriteConstants.WORKSPACE, FavoriteConstants.WORKSPACE_FOLDER, 'WORKSPACES', slimFavorites, false, false)).toEqual(auxFavTree.children);
    });

    it('BUG 1723274: should test duplicate favorite within a same folder', () => {
        // test duplicate
        const fav = treeData.children[0].children[0];
        expect(fav.title).toEqual('BAMY (bamba)');
        expect(fav.favoriteId).toBe(1517717);

        treeData.children[0].children.push(cloneDeep(fav));
        const favTree = FavoriteTreeGenerationUtils.createFavoriteTree(treeData, 'seakim', FavoriteConstants.WORKSPACE, FavoriteConstants.WORKSPACE_FOLDER, 'WORKSPACES', slimFavorites, false, false);
        expect(favTree).toEqual(auxFavTree.children);
        expect(favTree[0].children[0].label).toEqual('BAMY (bamba)');
        expect(favTree[0].children[0].eventData.favoriteId).toBe(1517717);
        expect(favTree[0].children.length).toBe(1);
    });

    describe('createAuxFavTreeData Test', () => {
        it('should create tree with auxFavTreeData', () => {
            expect(FavoriteTreeGenerationUtils['createAuxFavTreeData'](treeData, 'WORKSPACE', favMap, addedFavoriteIds, false, false, false, false)).toEqual(initialAuxFavTree);
        });

        it('should create tree with auxFavTreeData with status tags', () => {
            const slimFavoritesLayout = [];
            const favMapLayout = new Map<number, Favorite>();
            for (const favData of getSlimFavoriteResponse.layout) {
                slimFavoritesLayout.push(new Favorite(favData));
            }
            for (const favorite of slimFavoritesLayout) {
                favMapLayout.set(favorite.id, favorite);
            }
            const treeDataStatusTags: FavoriteFolderItem = new FavoriteFolderItem(getFavoriteFolderStructureStatusTagsResponse);
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            expect(FavoriteTreeGenerationUtils['createAuxFavTreeData'](treeDataStatusTags, 'LAYOUT', favMapLayout, addedFavoriteIds, false, false, false, false)).toEqual(auxTreeLayout);
        });

        it('should create tree with auxFavTreeData for what if portfolios', () => {
            expect(FavoriteTreeGenerationUtils['createAuxFavTreeData'](
                new FavoriteFolderItem({title: 'REG1', type: 'favorite', favoriteId: 2332205}),
                'WHATIF_POS',
                new Map([
                    [2332205, new Favorite({
                        tool: 'Explore_BETA',
                        title: 'REG1',
                        type: 'ADHOC_PORT',
                        id: 2332205,
                        listOrder: 28,
                        owner: 'kapsharm',
                        description: 'REG1'
                    })]
                ]),
                [2332205],
                false, false, false, false
            )).toEqual({
                eventData: {
                    description: 'REG1',
                    favoriteId: 2332205,
                    originalLabel: 'REG1',
                    type: 'ADHOC_PORT'
                },
                isExpanded: false,
                label: 'REG1 (From scratch)'
            });

            expect(FavoriteTreeGenerationUtils['createAuxFavTreeData'](
                new FavoriteFolderItem({title: 'REG1', type: 'favorite', favoriteId: 2332205}),
                'WHATIF_POS',
                new Map([
                    [2332205, new Favorite({
                        tool: 'Explore_BETA',
                        title: 'REG1',
                        type: 'ADHOC_PORT',
                        id: 2332205,
                        listOrder: 28,
                        owner: 'kapsharm',
                        description: 'REG1-#-2023-04-05'
                    })]
                ]),
                [2332205],
                false, false, false, false
            )).toEqual({
                eventData: {
                    description: 'REG1',
                    favoriteId: 2332205,
                    originalLabel: 'REG1',
                    type: 'ADHOC_PORT'
                },
                isExpanded: false,
                label: 'REG1 (From scratch) [ DATE - 2023-04-05 ]'
            });

            expect(FavoriteTreeGenerationUtils['createAuxFavTreeData'](
                new FavoriteFolderItem({title: 'REG1', type: 'favorite', favoriteId: 2332205}),
                'WHATIF_RULES',
                new Map([
                    [2332205, new Favorite({
                        tool: 'Explore_BETA',
                        title: 'REG1',
                        type: 'WHATIF_RULES',
                        id: 2332205,
                        listOrder: 28,
                        owner: 'kapsharm',
                        description: 'REG1-#-2'
                    })]
                ]),
                [2332205],
                false, false, false, false
            )).toEqual({
                eventData: {
                    description: 'REG1',
                    favoriteId: 2332205,
                    type: 'WHATIF_RULES'
                },
                isExpanded: false,
                label: 'REG1'
            });

            expect(FavoriteTreeGenerationUtils['createAuxFavTreeData'](
                new FavoriteFolderItem({title: 'REG1', type: 'favorite', favoriteId: 2332205, children: [{}]}),
                'WHATIF_POS',
                new Map([]),
                [2332205],
                false, false, false, false
            )).toEqual({
                children: [
                    {
                        eventData: {},
                        isExpanded: false
                    }
                ],
                eventData: {
                    favoriteId: 2332205,
                    type: 'folder'
                },
                iconType: 'folder-subtle',
                isExpanded: false,
                label: 'REG1'
            });
        });
    });

    describe('addMissingFavoriteNodes Test', () => {
        it('should add all missing favorite nodes to tree', () => {
            FavoriteTreeGenerationUtils['addMissingFavoriteNodes'](slimFavorites, initialAuxFavTree, [1517717], false, undefined, ['WORKSPACE']);
            expect(initialAuxFavTree).toEqual(auxFavTree);
        });


        it('should add all missing favorite nodes to tree - test for point in time', () => {
            const initAuxTree = JSON.parse(JSON.stringify(initialAuxFavTree));
            initAuxTree.children = [];
            FavoriteTreeGenerationUtils['addMissingFavoriteNodes']([new Favorite({
                tool: 'Explore_BETA',
                title: 'REG1',
                type: 'ADHOC_PORT',
                id: 2332205,
                listOrder: 28,
                owner: 'kapsharm',
                description: 'REG1-#-01/01/2015'
            })], initAuxTree, [1517717], false, undefined);
            expect(initAuxTree.children.length).toBe(1);
            expect(initAuxTree.children[0].label).toBe('REG1 [ DATE - 01/01/2015 ]');
        });
    });

    describe('sortTreeNodes Test', () => {
        it('should sort tree nodes', () => {
            const sortedTree = {
                label: 'WORKSPACES',
                eventData: {favoriteId: 1517716, type: 'folder'},
                isExpanded: false,
                children: [
                    {
                        label: 'new2',
                        eventData: {favoriteId: undefined, type: 'folder'},
                        isExpanded: false,
                        children: [{
                            eventData: {favoriteId: 1517717, type: 'WORKSPACE'},
                            label: 'BAMY (bamba)',
                            isExpanded: false
                        }]
                    },
                    {label: 'demo', eventData: {favoriteId: 1576328, type: 'WORKSPACE'}},
                    {label: 'fromProd', eventData: {favoriteId: 1557322, type: 'WORKSPACE'}},
                    {label: 'Prism: sean-prism', eventData: {favoriteId: 1501543, type: 'WORKSPACE'}}
                ]
            };
            const unsortedTree = {
                label: 'WORKSPACES',
                isExpanded: false,
                eventData: {favoriteId: 1517716, type: 'folder'},
                children: [
                    {label: 'demo', eventData: {favoriteId: 1576328, type: 'WORKSPACE'}},
                    {label: 'Prism: sean-prism', eventData: {favoriteId: 1501543, type: 'WORKSPACE'}},
                    {
                        label: 'new2',
                        eventData: {favoriteId: undefined, type: 'folder'},
                        isExpanded: false,
                        children: [{
                            eventData: {favoriteId: 1517717, type: 'WORKSPACE'},
                            label: 'BAMY (bamba)',
                            isExpanded: false
                        }]
                    },
                    {label: 'fromProd', eventData: {favoriteId: 1557322, type: 'WORKSPACE'}}
                ]
            };
            FavoriteTreeGenerationUtils['sortTreeNodes'](unsortedTree);

            expect(unsortedTree).toEqual(sortedTree);
        });
    });

    describe('handleAuxFavTreeForFavorite', () => {
        let auxFavTreeData;
        let data;
        let favorite;
        let favType;
        let addedFavoriteIds;
        let isSaveMode;
        let favDisplayName;

        beforeEach(() => {
            auxFavTreeData = {
                eventData: {}
            };
            data = new FavoriteFolderItem({favoriteId: 1, type: FavoriteConstants.FAVORITE});
            favorite = new Favorite({id: 1, owner: CoreFavoriteConstants.ADMIN, enterpriseDescription: 'Enterprise Description'});
            favType = FavoriteConstants.WORKSPACE;
            addedFavoriteIds = [];
            isSaveMode = true;
            favDisplayName = 'Favorite Display Name';
        });

        it('should set isLearnLink to true and set enterpriseDescription if favorite owner is ADMIN', () => {
            FavoriteTreeGenerationUtils['handleAuxFavTreeForFavorite'](auxFavTreeData, data, favorite, favType, addedFavoriteIds, isSaveMode, favDisplayName);

            expect(auxFavTreeData.isLearnLink).toBe(true);
            expect(auxFavTreeData.eventData.enterpriseDescription).toBe('Enterprise Description');
        });

        it('should set isLearnLink to true and set enterpriseDescription to empty string if enterpriseDescription is undefined', () => {
            favorite.enterpriseDescription = 'Test Description';
            FavoriteTreeGenerationUtils['handleAuxFavTreeForFavorite'](auxFavTreeData, data, favorite, favType, addedFavoriteIds, isSaveMode, favDisplayName);

            expect(auxFavTreeData.isLearnLink).toBe(true);
            expect(auxFavTreeData.eventData.enterpriseDescription).toBe('Test Description');
        });

        it('should not set isLearnLink or enterpriseDescription if favorite owner is not ADMIN', () => {
            favorite.owner = 'non-admin';
            FavoriteTreeGenerationUtils['handleAuxFavTreeForFavorite'](auxFavTreeData, data, favorite, favType, addedFavoriteIds, isSaveMode, favDisplayName);

            expect(auxFavTreeData.isLearnLink).toBeUndefined();
            expect(auxFavTreeData.eventData.enterpriseDescription).toBeUndefined();
        });

        it('should add favoriteId to addedFavoriteIds', () => {
            FavoriteTreeGenerationUtils['handleAuxFavTreeForFavorite'](auxFavTreeData, data, favorite, favType, addedFavoriteIds, isSaveMode, favDisplayName);

            expect(addedFavoriteIds).toContain(data.favoriteId);
        });

        it('should add context menu if isSaveMode is true', () => {
            jest.spyOn(FavoriteTreeActionUtils, 'addContextMenu');
            FavoriteTreeGenerationUtils['handleAuxFavTreeForFavorite'](auxFavTreeData, data, favorite, favType, addedFavoriteIds, isSaveMode, favDisplayName);

            expect(FavoriteTreeActionUtils.addContextMenu).toHaveBeenCalledWith(auxFavTreeData, FavoriteConstants.FAVORITE, favDisplayName);
        });

        it('should not add context menu if isSaveMode is false', () => {
            isSaveMode = false;
            jest.spyOn(FavoriteTreeActionUtils, 'addContextMenu');
            FavoriteTreeGenerationUtils['handleAuxFavTreeForFavorite'](auxFavTreeData, data, favorite, favType, addedFavoriteIds, isSaveMode, favDisplayName);

            expect(FavoriteTreeActionUtils.addContextMenu).toHaveBeenCalled();
        });

        it('should set children to undefined if data has children', () => {
            data.children = [{}];
            FavoriteTreeGenerationUtils['handleAuxFavTreeForFavorite'](auxFavTreeData, data, favorite, favType, addedFavoriteIds, isSaveMode, favDisplayName);

            expect(auxFavTreeData.children).toBeUndefined();
        });
    });

    describe('addMissingFavoriteNodes LearnLink', () => {
        let tree: AuxAdvancedTreeListInterface;
        let favorites: Favorite[];
        let addedFavoriteIds: (number | string)[];
        let isSaveMode: boolean;
        let favDisplayName: string;
        let favTypes: string[];

        beforeEach(() => {
            tree = {
                children: []
            } as AuxAdvancedTreeListInterface;
            favorites = [
                new Favorite({ id: 1, owner: CoreFavoriteConstants.ADMIN, enterpriseDescription: 'Enterprise Description', type: 'WORKSPACE', description: 'Description' }),
                new Favorite({ id: 2, owner: 'user', type: 'WORKSPACE', description: 'Description' }),
                new Favorite({ id: 3, owner: CoreFavoriteConstants.ADMIN, type: 'WORKSPACE', enterpriseDescription: 'Admin Description' })
            ];
            addedFavoriteIds = [];
            isSaveMode = true;
            favDisplayName = 'Favorite Display Name';
            favTypes = ['WORKSPACE'];
        });

        it('should add missing favorite nodes to the tree', () => {
            FavoriteTreeGenerationUtils['addMissingFavoriteNodes'](favorites, tree, addedFavoriteIds, isSaveMode, favDisplayName, favTypes);

            expect(tree.children.length).toBe(3);
            expect(tree.children[0].eventData.favoriteId).toBe(1);
            expect(tree.children[1].eventData.favoriteId).toBe(2);
            expect(tree.children[2].eventData.favoriteId).toBe(3);
        });

        it('should set isLearnLink to true and set enterpriseDescription if favorite owner is ADMIN', () => {
            FavoriteTreeGenerationUtils['addMissingFavoriteNodes'](favorites, tree, addedFavoriteIds, isSaveMode, favDisplayName, favTypes);

            expect(tree.children[0].isLearnLink).toBe(true);
            expect(tree.children[0].eventData.enterpriseDescription).toBe('Enterprise Description');
            expect(tree.children[2].isLearnLink).toBe(true);
            expect(tree.children[2].eventData.enterpriseDescription).toBe('Admin Description');
        });

        it('should not set isLearnLink or enterpriseDescription if favorite owner is not ADMIN', () => {
            FavoriteTreeGenerationUtils['addMissingFavoriteNodes'](favorites, tree, addedFavoriteIds, isSaveMode, favDisplayName, favTypes);

            expect(tree.children[1].isLearnLink).toBeUndefined();
            expect(tree.children[1].eventData.enterpriseDescription).toBeUndefined();
        });

        it('should add context menu if isSaveMode is true', () => {
            jest.spyOn(FavoriteTreeActionUtils, 'addContextMenu');
            FavoriteTreeGenerationUtils['addMissingFavoriteNodes'](favorites, tree, addedFavoriteIds, isSaveMode, favDisplayName, favTypes);

            expect(FavoriteTreeActionUtils.addContextMenu).toHaveBeenCalledWith(tree.children[0], FavoriteConstants.FAVORITE, favDisplayName);
            expect(FavoriteTreeActionUtils.addContextMenu).toHaveBeenCalledWith(tree.children[1], FavoriteConstants.FAVORITE, favDisplayName);
            expect(FavoriteTreeActionUtils.addContextMenu).toHaveBeenCalledWith(tree.children[2], FavoriteConstants.FAVORITE, favDisplayName);
        });

        it('should not add context menu if isSaveMode is false', () => {
            isSaveMode = false;
            jest.spyOn(FavoriteTreeActionUtils, 'addContextMenu');
            FavoriteTreeGenerationUtils['addMissingFavoriteNodes'](favorites, tree, addedFavoriteIds, isSaveMode, favDisplayName, favTypes);

            expect(FavoriteTreeActionUtils.addContextMenu).toHaveBeenCalled();
        });
    });

    describe('setSelectFolderLearnLink', () => {
        let auxFavData: AuxAdvancedTreeListInterface;
        let favoriteType: string;

        beforeEach(() => {
            auxFavData = {
                eventData: {
                    favoriteId: 1
                }
            } as AuxAdvancedTreeListInterface;
            favoriteType = FavoriteConstants.WORKSPACE;
        });

        it('should set isLearnLink to true and set enterpriseDescription if favorite is from admin and has enterprise description', () => {
            const slimFavorites = [
                new Favorite({ id: 1, owner: CoreFavoriteConstants.ADMIN, enterpriseDescription: 'Enterprise Description' })
            ];
            jest.spyOn(FavoriteStore.slimFavCache, 'get').mockReturnValue(slimFavorites);

            FavoriteTreeGenerationUtils['setSelectFolderLearnLink'](auxFavData, favoriteType);

            expect(auxFavData.isLearnLink).toBe(true);
            expect(auxFavData.eventData.enterpriseDescription).toBe('Enterprise Description');
        });

        it('should not set isLearnLink or enterpriseDescription if favorite is not from admin', () => {
            const slimFavorites = [
                new Favorite({ id: 1, owner: 'user', enterpriseDescription: 'Enterprise Description' })
            ];
            jest.spyOn(FavoriteStore.slimFavCache, 'get').mockReturnValue(slimFavorites);

            FavoriteTreeGenerationUtils['setSelectFolderLearnLink'](auxFavData, favoriteType);

            expect(auxFavData.isLearnLink).toBeTruthy();
            expect(auxFavData.eventData.enterpriseDescription).toBe('Enterprise Description');
        });

        it('should not set isLearnLink or enterpriseDescription if favorite does not have enterprise description', () => {
            const slimFavorites = [
                new Favorite({ id: 1, owner: CoreFavoriteConstants.ADMIN })
            ];
            jest.spyOn(FavoriteStore.slimFavCache, 'get').mockReturnValue(slimFavorites);

            FavoriteTreeGenerationUtils['setSelectFolderLearnLink'](auxFavData, favoriteType);

            expect(auxFavData.isLearnLink).toBeUndefined();
            expect(auxFavData.eventData.enterpriseDescription).toBeUndefined();
        });

        it('should not set isLearnLink or enterpriseDescription if favorite is not found in cache', () => {
            jest.spyOn(FavoriteStore.slimFavCache, 'get').mockReturnValue([]);

            FavoriteTreeGenerationUtils['setSelectFolderLearnLink'](auxFavData, favoriteType);

            expect(auxFavData.isLearnLink).toBeUndefined();
            expect(auxFavData.eventData.enterpriseDescription).toBeUndefined();
        });

        it('should handle LAYOUT favorite type', () => {
            favoriteType = FavoriteConstants.LAYOUT;
            const slimFavorites = [
                new Favorite({ id: 1, owner: CoreFavoriteConstants.ADMIN, enterpriseDescription: 'Enterprise Description' })
            ];
            jest.spyOn(FavoriteStore.slimFavCache, 'get').mockReturnValue(slimFavorites);

            FavoriteTreeGenerationUtils['setSelectFolderLearnLink'](auxFavData, favoriteType);

            expect(auxFavData.isLearnLink).toBe(true);
            expect(auxFavData.eventData.enterpriseDescription).toBe('Enterprise Description');
        });
    });

    describe('createBaseAuxFavTreeData', () => {
        let favorite: Favorite;
        let favoriteFolderItem: FavoriteFolderItem;
        let favType: string;
        let isExpanded: boolean;
        let favoriteType: string;
        let isEnterpriseAccess: boolean;

        beforeEach(() => {
            favorite = new Favorite({
                id: 1,
                owner: CoreFavoriteConstants.ADMIN,
                enterpriseDescription: 'Enterprise Description',
                type: 'WORKSPACE',
                description: 'Description'
            });
            favoriteFolderItem = new FavoriteFolderItem({
                favoriteId: 1,
                type: 'favorite',
                title: 'Favorite Title'
            });
            favType = FavoriteConstants.WORKSPACE;
            isExpanded = false;
            favoriteType = 'WORKSPACE';
            isEnterpriseAccess = true;
        });

        it('should create base auxFavTreeData with enterprise description', () => {
            jest.spyOn(FavoriteTreeGenerationUtils, 'setSelectFolderLearnLink').mockImplementation((auxFavData, favoriteType) => {
                auxFavData.isLearnLink = true;
                auxFavData.eventData.enterpriseDescription = 'Enterprise Description';
            });
            favorite = null;
            const result = FavoriteTreeGenerationUtils.createBaseAuxFavTreeData(favorite, favoriteFolderItem, favType, isExpanded, favoriteType, isEnterpriseAccess);

            expect(result.isExpanded).toBe(false);
            expect(result.eventData.favoriteId).toBe(1);
            expect(result.eventData.statusTag).toBeUndefined();
            expect(result.isLearnLink).toBe(true);
            expect(result.eventData.enterpriseDescription).toBe('Enterprise Description');
        });

        it('should create base auxFavTreeData without enterprise description', () => {
            favorite.enterpriseDescription = undefined;
            const result = FavoriteTreeGenerationUtils.createBaseAuxFavTreeData(favorite, favoriteFolderItem, favType, isExpanded, favoriteType, isEnterpriseAccess);
            expect(result.isExpanded).toBe(false);
            expect(result.eventData.favoriteId).toBe(1);
            expect(result.eventData.statusTag).toBeUndefined();
            expect(result.eventData.description).toBe('Description');
            expect(result.isLearnLink).toBeUndefined();
            expect(result.eventData.enterpriseDescription).toBeUndefined();
        });

        it('should create base auxFavTreeData for select folder modal', () => {
            jest.spyOn(FavoriteTreeGenerationUtils, 'setSelectFolderLearnLink').mockImplementation((auxFavData, favoriteType) => {
                auxFavData.isLearnLink = true;
                auxFavData.eventData.enterpriseDescription = 'Enterprise Description';
            });

            favoriteFolderItem.favoriteId = 1;
            favorite = null;
            const result = FavoriteTreeGenerationUtils.createBaseAuxFavTreeData(favorite, favoriteFolderItem, favType, isExpanded, favoriteType, isEnterpriseAccess);
            expect(result.isExpanded).toBe(false);
            expect(result.eventData.favoriteId).toBe(1);
            expect(result.eventData.statusTag).toBeUndefined();
            expect(result.isLearnLink).toBe(true);
            expect(result.eventData.enterpriseDescription).toBe('Enterprise Description');
        });

        it('should create base auxFavTreeData without extra field', () => {
            favorite.description = 'Description';
            const result = FavoriteTreeGenerationUtils.createBaseAuxFavTreeData(favorite, favoriteFolderItem, favType, isExpanded, favoriteType, isEnterpriseAccess);

            expect(result.isExpanded).toBe(false);
            expect(result.eventData.favoriteId).toBe(1);
            expect(result.eventData.statusTag).toBeUndefined();
            expect(result.eventData.description).toBe('Description');
        });

        it('should create base auxFavTreeData with extra field', () => {
            favorite.description = 'Description-#-2023-04-05';
            const result = FavoriteTreeGenerationUtils.createBaseAuxFavTreeData(favorite, favoriteFolderItem, favType, isExpanded, favoriteType, isEnterpriseAccess);

            expect(result.isExpanded).toBe(false);
            expect(result.eventData.favoriteId).toBe(1);
            expect(result.eventData.statusTag).toBeUndefined();
            expect(result.eventData.description).toBe('Description');
        });
    });
});

export const initialAuxFavTree = {
    iconType: 'folder-subtle',
    label: 'WORKSPACES',
    eventData: {favoriteId: 1517716, type: 'folder'},
    isExpanded: false,
    children: [{
        iconType: 'folder-subtle',
        label: 'new2',
        eventData: {favoriteId: undefined, type: 'folder'},
        isExpanded: false,
        children: [{
            eventData: {favoriteId: 1517717, type: 'WORKSPACE'},
            isExpanded: false,
            label: 'BAMY (bamba)'
        }]
    }]
} as any;

export const auxTreeLayout = {
    iconType: 'folder-subtle',
    label: 'LAYOUT',
    eventData: {favoriteId: 15177169, type: 'folder'},
    isExpanded: false,
    children: [{
        iconType: 'folder-subtle',
        label: 'new2',
        eventData: {favoriteId: undefined, type: 'folder'},
        isExpanded: false,
        children: [{
            eventData: {favoriteId: 15177172, type: 'LAYOUT', statusTag: 'decommissioned'},
            col1Slot: 'col1-2-15177172',
            isExpanded: false,
            label: 'BAMY (bamba) 2'
        },
            {
                eventData: {favoriteId: 15177182, type: 'LAYOUT', statusTag: 'mature'},
                isExpanded: false,
                label: 'BAMY (bamba) 3'
            },
            {
                col1Slot: 'col1-1-15177192',
                eventData: {favoriteId: 15177192, type: 'LAYOUT', statusTag: 'under_review'},
                isExpanded: false,
                label: 'BAMY (bamba) 4'
            }]
    }]
} as any;

export const auxFavTree = {
    iconType: 'folder-subtle',
    label: 'WORKSPACES',
    eventData: {favoriteId: 1517716, type: 'folder'},
    isExpanded: false,
    children: [
        {
            iconType: 'folder-subtle',
            label: 'new2',
            eventData: {favoriteId: undefined, type: 'folder'},
            isExpanded: false,
            children: [{
                eventData: {favoriteId: 1517717, type: 'WORKSPACE'},
                label: 'BAMY (bamba)',
                isExpanded: false
            }]
        },
        {label: 'demo', eventData: {favoriteId: 1576328, type: 'WORKSPACE'}},
        {label: 'fromProd', eventData: {favoriteId: 1557322, type: 'WORKSPACE'}},
        {label: 'Prism: sean-prism', eventData: {favoriteId: 1501543, type: 'WORKSPACE'}}
    ]
} as any;
