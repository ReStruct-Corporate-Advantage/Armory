import {isFunction, isNil, isString, isUndefined} from 'lodash';
import {AbstractConfig} from '../../core/models/abstract-config.model';
import {AbstractFavoriteConfig} from '../models/abstract-favorite-config.model';
import {FavoriteCacheKey} from '../models/favorite-cache-key.model';
import {Favorite} from '../models/favorite.model';
import {CoreFavoriteStore} from '../stores';
import {CoreFavoriteUtils} from '../utils';

/**
 * Utility class for the generic functions relating to config.
 */
export class ConfigTypeFactory {
    private static configTypes: Map<string, any> = new Map<string, any>();

    /**
     * Registers a config type with the factory.
     */
    static registerConfigType(name: string, configType: any) {
        ConfigTypeFactory.configTypes.set(name, configType);
    }

    /**
     * Gets the config type from the map with a key
     */
    static getConfigTypeFromKey(key: string): any {
        return ConfigTypeFactory.configTypes.get(key);
    }

    /**
     *Checks if both keys have same config type registered.
     */
    static haveSameConfigType(key1: string, key2: string): boolean {
        return ConfigTypeFactory.configTypes.get(key1) === ConfigTypeFactory.configTypes.get(key2);
    }

    /**
     * Creates the correct config object for the the object passed in if it is one that we know about,
     * to do this it looks at the configType parameter.    Otherwise it will return the object passed in.
     */
    static createConfig(object: any, key: string, isRootObject?: boolean): any {
        // If the object passed in is not defined then just return it.
        if (isNil(object)) {
            return undefined;
        }

        // If the object is a string then we need to convert it to json.
        if (isString(object)) {
            try {
                object = JSON.parse(object);
            } catch (e) {
                // Just ignore the error.
            }
        }

        // If the object has an id and we are not the root object then we should try and load the favorite for it.
        if (!isRootObject && (object.favId || object.id)) {
            // guard so that old linked personal favorites will work
            const isGlobal = isUndefined(object.isGlobalFav) ? false : object.isGlobalFav;
            const cachedItem: AbstractConfig = ConfigTypeFactory.getFavoriteConfig(object.favId ? object.favId : object.id, isGlobal);
            if (cachedItem) {
                return cachedItem;
            }
        }

        // Return a new instance of the correct config object.
        // NOTE:    The check on key here is to be able to deserialize existing favorites that may not have the config type specified.
        let configType: any = ConfigTypeFactory.configTypes.get(key);
        if (!configType && object.configType) {
            configType = ConfigTypeFactory.configTypes.get(object.configType);
        }

        // If we still have not found a type then loop all of them and see if any of them support it.
        if (!configType) {
            for (const type of Array.from(ConfigTypeFactory.configTypes.values())) {
                if (isFunction(type.supportsObject) && type.supportsObject(object)) {
                    configType = type;
                    break;
                }
            }
        }

        if (configType) {
            const configObject: any = new configType();
            configObject.deserialize(object);
            return configObject;
        } else if (object.configType) {
            // Log that we couldn't deserialize an item with a configType.
            console.warn('Unknown config type:    ' + object.configType);
        }

        // If we got here then just return the original object as we don't know what it is.
        return object;
    }

    static getFavoriteFromCache(id: number|string, isGlobalFav?: boolean, versionId?: string): Favorite {
        // If flag is undefined then default to false
        isGlobalFav = isUndefined(isGlobalFav) ? false : isGlobalFav;

        const favItem: FavoriteCacheKey = CoreFavoriteUtils.getFavoriteKey(isGlobalFav, id, versionId);
        return CoreFavoriteStore.favoriteCache.get(favItem.toString());
    }

    /**
     * Generates the Config object that is represented by this favorite id.
     */
    static getFavoriteConfig(id: number|string, isGlobalFav?: boolean, versionId?: string): AbstractFavoriteConfig {
        // By this stage the cache should have all the favorites loaded into it.
        // So we should not be able to loop through all the nested favorites and load them.
        const fav: Favorite = ConfigTypeFactory.getFavoriteFromCache(id, isGlobalFav, versionId);

        // If we happen to not get a cache hit then the favorite is broken.
        // Just log an error and return null so the caller can handle this gracefully.
        if (!fav) {
            console.error('The favorite does not exist.  id:' + id + ' and global: ' + isGlobalFav);
            return null;
        }

        // Now using the ConfigTypeFactory convert this favorite object into a Config class and return it.
        const config: AbstractFavoriteConfig = ConfigTypeFactory.createConfig(fav.data, fav.type, true);
        config.deserializeFavoriteAttributes(fav);
        return config;
    }
}
