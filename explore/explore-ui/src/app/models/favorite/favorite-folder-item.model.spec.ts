import * as getFavoriteFolderStructureResponse from '@mocks/favoriteFolderStructureMock.json';
import {FavoriteFolderItem} from './favorite-folder-item.model';

describe('FavoriteFolderItem', () => {
    describe('serialize/deserialize Test', () => {
        let favoriteFolderItem: FavoriteFolderItem;
        beforeEach(() => {
            favoriteFolderItem = new FavoriteFolderItem(getFavoriteFolderStructureResponse);
        });
        it('should deserialize from construct', () => {
            expect(favoriteFolderItem.title).toBe('WORKSPACES');
            expect(favoriteFolderItem.type).toBe('folder');
            expect(favoriteFolderItem.favoriteId).toBe(1517716);
            expect(favoriteFolderItem.children.length).toBe(1);
            expect(favoriteFolderItem.children.length).toBe(1);
            expect(favoriteFolderItem.children[0].title).toBe( 'new2');
            expect(favoriteFolderItem.children[0].type).toBe( 'folder');
            expect(favoriteFolderItem.children[0].children.length).toBe( 1);
            expect(favoriteFolderItem.children[0].children[0].title).toBe('BAMY (bamba)');
            expect(favoriteFolderItem.children[0].children[0].type).toBe('favorite');
            expect(favoriteFolderItem.children[0].children[0].favoriteId).toBe(1517717);
        });

        it('should serialize', () => {
            const serializedData = favoriteFolderItem.serialize();
            expect(serializedData.title).toBe('WORKSPACES');
            expect(serializedData.type).toBe('folder');
            expect(serializedData.favoriteId).toBe(1517716);
            expect(serializedData.children.length).toBe(1);
            expect(serializedData.children.length).toBe(1);
            expect(serializedData.children[0].title).toBe( 'new2');
            expect(serializedData.children[0].type).toBe( 'folder');
            expect(serializedData.children[0].children.length).toBe( 1);
            expect(serializedData.children[0].children[0].title).toBe('BAMY (bamba)');
            expect(serializedData.children[0].children[0].type).toBe('favorite');
            expect(serializedData.children[0].children[0].favoriteId).toBe(1517717);
        });
    });
});
