import {FavoriteStore} from './favorite.store';
import {ColumnDefinition, ConfigTypeFactory, CoreFavoriteStore, CoreFavoriteUtils, DefinitionInitializer, Favorite, FavoriteCacheKey} from '@blk/explore-ui-core';

/**
 * Test cases for FavoriteStore class
 */
describe('FavoriteStore', () => {
    let slimFavoriteCacheMock = undefined;

    function initTest() {
        slimFavoriteCacheMock = [
            new Favorite({
                tool: 'Prism',
                title: 'sean-prism',
                type: 'WORKSPACE',
                id: 1501543,
                listOrder: 2,
                owner: 'seakim',
                description: undefined,
                data: undefined,
                flagid: {id: 1501543, _global: false}
            }),
            new Favorite({
                tool: 'Explore',
                title: 'test-overriding1',
                type: 'WORKSPACE',
                id: 1754972,
                listOrder: 31,
                owner: 'seakim',
                description: ' ',
                data: undefined,
                flagid: {id: 1754972, _global: false}
            })
        ];
        const favItem: FavoriteCacheKey = CoreFavoriteUtils.getFavoriteKey(false, 127);

        const sampleCol: any = {
            'field': 'ActRetSemid',
            'staticColumn': false,
            'title': 'Active Semi Deviation',
            'CLASS_TYPE': DefinitionInitializer.COL_DEF_BEAN
        };

        const cacheFav: Favorite = new Favorite();
        cacheFav.data = JSON.stringify(sampleCol);
        cacheFav.owner = 'tushshar';
        cacheFav.id = 127;
        cacheFav.type = DefinitionInitializer.COL_DEF_BEAN;
        cacheFav.title = 'test_favorite';

        CoreFavoriteStore.favoriteCache.set(favItem.toString(), cacheFav);

        ConfigTypeFactory.registerConfigType(DefinitionInitializer.COL_DEF_BEAN, ColumnDefinition);
    }

    beforeEach(() => {
        initTest();
    });

    describe('getFavoriteFromCache Test', () => {
        it('should return matching favorite if exists', () => {
            jest.spyOn(FavoriteStore.slimFavCache, 'get').mockReturnValue(slimFavoriteCacheMock);
            expect(FavoriteStore.getFavoriteFromCache('seakim', 'WORKSPACE')).toBe(undefined); // If favorite title and ID both are NULL

            expect(FavoriteStore.getFavoriteFromCache('seakim', 'WORKSPACE', 'test-overriding1')).toEqual(slimFavoriteCacheMock[1]);
            expect(FavoriteStore.getFavoriteFromCache('seakim', 'WORKSPACE', 'New Workspace')).toBe(undefined);

            expect(FavoriteStore.getFavoriteFromCache('seakim', 'WORKSPACE', null, 1754972)).toEqual(slimFavoriteCacheMock[1]);
            expect(FavoriteStore.getFavoriteFromCache('seakim', 'WORKSPACE', null, 1234)).toBe(undefined);
        });
    });

    describe('updateSlimFavCache Test', () => {
        beforeEach(() => {
           initTest();
        });
        it('should add a favorite to slimFavCache if passed in favoriteId and new favoriteId are different ', () => {
            const newFavorite = new Favorite({
                tool: 'Explore',
                title: 'Untitled Workspace',
                type: 'WORKSPACE',
                id: 1755796,
                listOrder: 34,
                owner: 'seakim',
                description: ' ',
                data: undefined,
                flagid: {id: 1755796, _global: false}
            });
            jest.spyOn(FavoriteStore.slimFavCache, 'get').mockReturnValue(slimFavoriteCacheMock);
            expect(FavoriteStore.slimFavCache.get('WORKSPACE').length).toBe(2);
            FavoriteStore.updateSlimFavCache(newFavorite, null);

            expect(FavoriteStore.slimFavCache.get('WORKSPACE').length).toBe(3);
            expect(FavoriteStore.slimFavCache.get('WORKSPACE')[2].title).toBe('Untitled Workspace');
            slimFavoriteCacheMock.pop();
        });

        it('should update a favorite to slimFavCache if passed in favoriteId and new favoriteId are different and we are in save fav mode', () => {
            const newFavorite = new Favorite({
                tool: 'Explore',
                title: 'Untitled Workspace',
                type: 'WORKSPACE',
                id: 123,
                listOrder: 34,
                owner: 'seakim',
                description: ' ',
                data: undefined,
                flagid: {id: 123, _global: false}
            });
            jest.spyOn(FavoriteStore.slimFavCache, 'get').mockReturnValue(slimFavoriteCacheMock);
            expect(FavoriteStore.slimFavCache.get('WORKSPACE').length).toBe(2);
            FavoriteStore.updateSlimFavCache(newFavorite, 1754972, true);

            expect(FavoriteStore.slimFavCache.get('WORKSPACE').length).toBe(2);
            expect(FavoriteStore.slimFavCache.get('WORKSPACE')[1].title).toBe('Untitled Workspace');
            expect(FavoriteStore.slimFavCache.get('WORKSPACE')[1].id).toBe(123);
            slimFavoriteCacheMock.pop();
        });

        it('should update existing favorite in the cache if passed in favoriteId and new favoriteId are the same', () => {
            const existingFavorite = new Favorite({
                tool: 'Explore',
                title: 'test-overriding123',
                type: 'WORKSPACE',
                id: 1754972,
                listOrder: 31,
                owner: 'seakim',
                description: ' ',
                data: undefined,
                flagid: {id: 1754972, _global: false}
            });
            jest.spyOn(FavoriteStore.slimFavCache, 'get').mockReturnValue(slimFavoriteCacheMock);
            expect(FavoriteStore.slimFavCache.get('WORKSPACE').length).toBe(2);
            expect(FavoriteStore.slimFavCache.get('WORKSPACE')[1].title).toBe('test-overriding1');

            FavoriteStore.updateSlimFavCache(existingFavorite, 1754972);

            expect(FavoriteStore.slimFavCache.get('WORKSPACE').length).toBe(2);
            expect(FavoriteStore.slimFavCache.get('WORKSPACE')[1].title).toBe('test-overriding123');
        });

        it('should NOT update the cache if no change in title in existing favorite', () => {
            const existingFavorite = new Favorite({
                tool: 'Explore',
                title: 'test-overriding1',
                type: 'WORKSPACE',
                id: 1754972,
                listOrder: 31,
                owner: 'seakim',
                description: ' ',
                data: undefined,
                flagid: {id: 1754972, _global: false}
            });
            jest.spyOn(FavoriteStore.slimFavCache, 'get').mockReturnValue(slimFavoriteCacheMock);
            const slimFavCacheBeforeUpdate = FavoriteStore.slimFavCache.get('WORKSPACE');
            FavoriteStore.updateSlimFavCache(existingFavorite, 1754972);

            expect(FavoriteStore.slimFavCache.get('WORKSPACE')).toEqual(slimFavCacheBeforeUpdate);
        });
    });
});
