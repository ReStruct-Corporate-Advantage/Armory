/**
 * This interface will be implemented by all objects/models that can be cached
 */
export interface CacheKey {
    /**
     * Get the key against which data for this object will be stored in the cache
     */
    getCacheKey(): string;
}
