import {FavoriteCacheKey} from './favorite-cache-key.model';

describe('FavoriteCacheKey tests', () => {
    it('should create an instance', () => {
        expect(new FavoriteCacheKey(123, false)).toBeTruthy();
    });

    it('should create an instance - isGlobal is undefined', () => {
        expect(new FavoriteCacheKey(123, undefined)).toBeTruthy();
    });

    it('should create an instance - isGlobal is null', () => {
        expect(new FavoriteCacheKey(123, null)).toBeTruthy();
    });

    it('Construct FavoriteCacheKey object and test getters and setters', () => {
        const favKey = new FavoriteCacheKey(123, false);
        expect(favKey).not.toBeUndefined();
        expect(favKey.global).toBe(false);
        expect(favKey.id).toBe(123);
        expect(favKey.toString()).toBe('false;123');
        const favKeyWithVersionUndefined = new FavoriteCacheKey(123, false, undefined);
        expect(favKeyWithVersionUndefined.toString()).toBe('false;123');
        const favKeyWithVersion = new FavoriteCacheKey(123, false, '1234');
        expect(favKeyWithVersion.toString()).toBe('false;123;1234');
    });
});
