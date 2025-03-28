import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {UIConstants} from '@constants/ui.constants';
import {FavoriteTreeUtils} from './favorite-tree.utils';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';
import {cloneDeep} from 'lodash';


describe('FavoriteTreeUtils', () => {
    describe('Delete favorite Label Test', () => {
        it('Delete favorite Label Test', () => {
            expect(FavoriteTreeUtils.getFavoriteDeleteLabel(null)).toEqual(UIConstants.DELETE_FAVORITE);
            expect(FavoriteTreeUtils.getFavoriteDeleteLabel('Workspace')).toEqual(UIConstants.DELETE_FAVORITE + ' Workspace');
        });
    });

    describe('findParentNode Test', () => {
        it('should find parent node with uid', () => {
            const uid = '22ecfbc5-e7cc-4a24-8e05-ac6687fdf86f';
            expect(auxFavoriteTreeDataOnSaveMode[0].children[0].uid).toBe(uid);
            expect(auxFavoriteTreeDataOnSaveMode[0].label).toBe('new2');

            const foundNode = FavoriteTreeUtils['findParentNode'](auxFavoriteTreeDataOnSaveMode, uid) as AuxAdvancedTreeListInterface;
            expect(foundNode.label).toBe('new2');
        });

        it('should return the passed in array if no parent', () => {
            const uid = 'bef51565-b88b-4574-878e-d345be3e5ffe';
            expect(auxFavoriteTreeDataOnSaveMode[0].uid).toBe(uid);
            expect(auxFavoriteTreeDataOnSaveMode[0].label).toBe('new2');

            expect(FavoriteTreeUtils['findParentNode'](auxFavoriteTreeDataOnSaveMode, uid)).toBe(auxFavoriteTreeDataOnSaveMode);
        });
    });

    describe('findNode Test', () => {
        it('should find node with uid', () => {
            const uid = '22ecfbc5-e7cc-4a24-8e05-ac6687fdf86f';
            expect(auxFavoriteTreeDataOnSaveMode[0].children[0].uid).toBe(uid);
            expect(auxFavoriteTreeDataOnSaveMode[0].children[0].label).toBe('BAMY (bamba)');

            const foundNode = FavoriteTreeUtils['findNode'](auxFavoriteTreeDataOnSaveMode, uid);
            expect(foundNode.label).toBe('BAMY (bamba)');
        });
    });

    it('should generateFavoriteFolderItem from aux favorite tree node', () => {
        const favoriteFolderItem = FavoriteTreeUtils.generateFavoriteFolderItem(folderFavoriteTree as AuxAdvancedTreeListInterface);
        expect(favoriteFolderItem instanceof FavoriteFolderItem).toBeTruthy();
        expect(favoriteFolderItem.children[0].title).toBe('folder1');

        expect(favoriteFolderItem.children[0].children[0].title).toBe('folder1-1');
        expect(favoriteFolderItem.children[0].children[0].children[0].title).toBe('folder1-1-1');
        expect(favoriteFolderItem.children[0].children[0].children[1].title).toBe('1FavColumnSet1');
        expect(favoriteFolderItem.children[0].children[0].children[1].favoriteId).toBe(2449299);

        expect(favoriteFolderItem.children[0].children[1].title).toBe('folder1-2');
        expect(favoriteFolderItem.children[0].children[1].children[0].title).toBe('1FavColumnSet1 Copy');
        expect(favoriteFolderItem.children[0].children[1].children[0].favoriteId).toBe(2449487);
        expect(favoriteFolderItem.children[0].children[1].children[1].title).toBe('1FavColumnSet1 Copy Copy');
        expect(favoriteFolderItem.children[0].children[1].children[1].favoriteId).toBe(2449906);
    });

    it('BUG 1723274: should filter out duplicates during generateFavoriteFolderItem if any', () => {
        const folderFavoriteTreeCopy = cloneDeep(folderFavoriteTree);
        const folder1 = folderFavoriteTreeCopy.children[0];
        expect(folder1.label).toEqual('folder1');
        expect(folder1.eventData.childFavoriteData.length).toBe(0);
        const fav = folderFavoriteTreeCopy.children[0].children[0].eventData.childFavoriteData[0];
        expect(fav.title).toEqual('1FavColumnSet1');
        expect(fav.favoriteId).toBe(2449299);
        folder1.eventData.childFavoriteData.push(cloneDeep(fav));
        folder1.eventData.childFavoriteData.push(cloneDeep(fav));
        folder1.children = [];

        const favoriteFolderItem = FavoriteTreeUtils.generateFavoriteFolderItem(folderFavoriteTreeCopy as AuxAdvancedTreeListInterface);
        expect(favoriteFolderItem.children[0].title).toEqual('folder1');
        expect(favoriteFolderItem.children[0].children[0].title).toEqual('1FavColumnSet1');
        expect(favoriteFolderItem.children[0].children[0].favoriteId).toBe(2449299);
        expect(favoriteFolderItem.children[0].children.length).toBe(1);
    });
});

const folderFavoriteTree = {
    'eventData': {'favoriteId': 2449326, 'childFavoriteData': []},
    'children': [{
        'label': 'folder1',
        'eventData': {'childFavoriteData': []},
        'children': [{
            'label': 'folder1-1',
            'eventData': {
                'childFavoriteData': [
                    new FavoriteFolderItem({'title': '1FavColumnSet1', 'type': 'favorite', 'favoriteId': 2449299})
                ]
            },
            'children': [{
                'label': 'folder1-1-1',
                'eventData': {'type': 'folder'},
                'children': [],
                'iconType': 'folder-subtle',
                'contextMenu': [{'label': 'Create folder'}, {'label': 'Rename folder'}, {'label': 'Delete folder'}],
                'key': 0,
                'nestedLevel': 2,
                'isExpanded': false,
                'uid': 'e4d2b2c3-6569-4446-8311-e407b5d96d16',
                'isHidden': false,
                'posInSet': 1,
                'setSize': 1,
                'isSelected': false
            }],
            'iconType': 'folder-subtle',
            'contextMenu': [{'label': 'Create folder', 'isFocusable': true}, {'label': 'Rename folder'}],
            'key': 0,
            'nestedLevel': 1,
            'isExpanded': false,
            'uid': 'f4806376-97e2-43d9-9762-948ffbf3ad4d',
            'isHidden': false,
            'posInSet': 1,
            'setSize': 2,
            'isSelected': false
        }, {
            'label': 'folder1-2',
            'eventData': {
                'childFavoriteData': [
                    new FavoriteFolderItem({'title': '1FavColumnSet1 Copy', 'type': 'favorite', 'favoriteId': 2449487}),
                    new FavoriteFolderItem({'type': 'favorite', 'title': '1FavColumnSet1 Copy Copy', 'favoriteId': 2449906})
                ]
            },
            'children': [],
            'iconType': 'folder-subtle',
            'contextMenu': [{'label': 'Create folder', 'isFocusable': true}, {'label': 'Rename folder'}],
            'key': 1,
            'nestedLevel': 1,
            'isExpanded': false,
            'uid': '86143b07-07fa-4434-a1f8-ee2bd0361d69',
            'isHidden': false,
            'posInSet': 2,
            'setSize': 2,
            'isSelected': true
        }],
        'iconType': 'folder-subtle',
        'contextMenu': [{'label': 'Create folder', 'isFocusable': true}, {'label': 'Rename folder'}],
        'isSelected': false,
        'isExpanded': true,
        'key': 0,
        'nestedLevel': 0,
        'uid': '383fdea7-fce9-48bd-bcaf-98c5f334fdc5',
        'isHidden': false,
        'posInSet': 1,
        'setSize': 1
    }],
    'iconType': 'folder-subtle',
    'contextMenu': [{'label': 'Create folder'}, {'label': 'Rename folder'}],
    'isExpanded': true
};

export const auxFavoriteTreeDataOnSaveMode = [
    {
        label: 'new2',
        uid: 'bef51565-b88b-4574-878e-d345be3e5ffe',
        isExpanded: false,
        isNested: 0,
        contextMenu: [{label: 'Create folder'}, {label: 'Rename folder'}],
        eventData: {favoriteId: undefined, type: 'folder'},
        children: [{
            label: 'BAMY (bamba)',
            uid: '22ecfbc5-e7cc-4a24-8e05-ac6687fdf86f',
            isExpanded: false,
            isNested: 1,
            contextMenu: [{label: 'Delete favorite'}],
            eventData: {favoriteId: 1517717, type: 'WORKSPACE'},
            parent: {
                label: 'new2',
                uid: 'bef51565-b88b-4574-878e-d345be3e5ffe',
                isExpanded: false,
                isNested: 0,
                contextMenu: [{label: 'Create folder'}, {label: 'Rename folder'}],
                eventData: {favoriteId: undefined, type: 'folder'},
            }
        }, {
            label: 'Empty folder',
            uid: '3dc0661d-b82d-41d6-a9c7-f2c6631c7a92',
            isExpanded: false,
            isNested: 1,
            contextMenu: [{label: 'Create folder'}, {label: 'Rename folder'}, {label: 'Delete folder'}],
            eventData: {favoriteId: 1517717, type: 'WORKSPACE'},
            parent: {
                label: 'new2',
                uid: 'bef51565-b88b-4574-878e-d345be3e5ffe',
                isExpanded: false,
                isNested: 0,
                contextMenu: [{label: 'Create folder'}, {label: 'Rename folder'}],
                eventData: {favoriteId: undefined, type: 'folder'},
            }
        }]
    }, {
        label: 'demo',
        uid: 'd7af692b-9405-4944-8e06-335801ed2687',
        isExpanded: false,
        isNested: 0,
        contextMenu: [{label: 'Delete favorite'}],
        eventData: {favoriteId: 1576328, type: 'WORKSPACE'}
    }, {
        label: 'fromProd',
        uid: 'ccf0d73e-97cb-4c08-957a-4374bda330eb',
        isExpanded: false,
        isNested: 0,
        contextMenu: [{label: 'Delete favorite'}],
        eventData: {favoriteId: 1557322, type: 'WORKSPACE'}
    }, {
        label: 'Prism: sean-prism',
        uid: '42f7e3d3-ef46-41f7-b22c-1914fdb3db5a',
        isExpanded: false,
        isNested: 0,
        contextMenu: [{label: 'Delete favorite'}],
        eventData: {favoriteId: 1501543, type: 'WORKSPACE'}
    }
];
