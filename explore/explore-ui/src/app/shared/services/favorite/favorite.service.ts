import {Injectable} from '@angular/core';
import {catchError, map, switchMap, timeout} from 'rxjs/operators';
import {difference, isEmpty, sortBy} from 'lodash';
import {HttpParams} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {FavoriteConstants} from '@constants/favorite.constants';
import {FavoriteUser} from '@interfaces/favorite-user.interface';
import {Http2BmsService} from '../bms';
import {FavoriteStore, WorkspaceStore} from '../../../stores';
import {FavoriteUtils, HttpUtils} from '../../../utils';
import {NotificationService} from '@services/notification';
import {
    AbstractConfig,
    AbstractFavoriteConfig,
    ConfigTypeFactory,
    CoreFavoriteStore,
    CoreFavoriteUtils,
    CoreUserMetaDataStore,
    DateFormatConstants,
    ErrorTypeConstants,
    ExploreDeleteFavoriteEventLocation,
    ExplorePortfolioFavoriteTypeEnum,
    Favorite,
    FavoriteCacheKey,
    FavoriteServiceInterface,
    FavoriteUserDetails,
    TelemetryActionConstants,
    TelemetryDeleteFavoriteParameters,
    TelemetryLoadPortfolioTypeParameters,
    TelemetryService,
    UIErrorParameters,
    SaveFavoriteResult, FavoriteStatus
} from '@blk/explore-ui-core';
import {DataRequestConstants} from '@constants/data-request.constants';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {CommonConstants} from '@constants/common.constants';
import moment from 'moment';

/**
 * Favorite Service
 */
@Injectable({
    providedIn: 'root'
})
export class FavoriteService implements FavoriteServiceInterface {

    constructor(private httpService: Http2BmsService, private notificationService: NotificationService) {
    }

    /**
     * Save favorite
     */
    saveFavorite$(favorite: Favorite, owner?: string, savingFromBulk?: boolean): Observable<SaveFavoriteResult> {
        // Convert the favorite into a json object of it.
        const favToSave = favorite.serialize();

        // If the username has been specified then add that onto the favorite object, otherwise use the default user.
        favToSave.owner = owner ? owner : CoreUserMetaDataStore.userMetaData.login;

        const dataToSave: any = {
            data: favToSave,
            isGlobalFav: CoreFavoriteUtils.isGlobalFavorite(favToSave.owner)
        };
        const saveFav = !!favToSave.id;

        // Perform the save.
        return this.httpService.post$('saveFavorite', dataToSave)
            .pipe(
                map((payload: any) => {
                    // if data and message both are missing from payload, throw exception
                    if (!payload || (!payload.data && !payload.message)) {
                        throw throwError('Failed to save the favorite:  ', favToSave);
                    }

                    const result: SaveFavoriteResult = {
                        status: payload.status,
                        message: payload.message
                    };

                    if (payload.status !== DataRequestConstants.SUCCESS_RESPONSE) {
                        // If this is as part of bulk saving, we shouldn't toast individual error messages.
                        if (!savingFromBulk) {
                            this.notificationService.error(result.message, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SAVE_FAVORITE_ERROR);
                        }
                        return result;
                    }

                    // Set the favorite attributes on the favorite response
                    result.favoriteId = payload.data.id;
                    result.owner = payload.data.owner;
                    result.type = payload.data.type;
                    result.currentFavoriteVersion = payload.data.currentFavoriteVersion;
                    result.latestFavoriteVersion = payload.data.latestFavoriteVersion;
                    result.versionNumber = payload.data.versionNumber;

                    const isGlobal: boolean = CoreFavoriteUtils.isGlobalFavorite(result.owner);
                    const favItem = new FavoriteCacheKey(result.favoriteId, isGlobal);
                    // Create a new favorite object to update the cache
                    const cacheFav: Favorite = new Favorite(payload.data);
                    // overwrite data with what was saved
                    cacheFav.data = favToSave.data;

                    // update cache after saving
                    CoreFavoriteStore.favoriteCache.set(favItem.toString(), cacheFav);
                    // update old favorite cache which has been migrated to ADL
                    if (saveFav && result.favoriteId !== favToSave.id) {
                        const favKey = new FavoriteCacheKey(favToSave.id, isGlobal);
                        CoreFavoriteStore.favoriteCache.set(favKey.toString(), cacheFav);
                    }
                    FavoriteStore.updateSlimFavCache(cacheFav, dataToSave.data.id, saveFav);
                    CoreFavoriteStore.favSavedNotifier$.next(result.favoriteId);

                    return result;
                }),
                catchError((error: Error) => {
                    // Log that an error happened and then return a failed promise.
                    console.error('Failed to save the favorite:  ', favToSave, error);
                    return throwError(error);
                })
            );
    }

    /**
     * Common reusable method to quick save favorites
     */
    quickSaveFavorite$(favoriteConfig: AbstractFavoriteConfig, favoriteToSave: Favorite, owner: string): Observable<boolean> {
        return this.saveFavorite$(favoriteToSave, owner).pipe(
            switchMap(
                (payload: SaveFavoriteResult) => {
                    if (payload && payload.favoriteId) {
                        // Update the favorite object with the attributes
                        favoriteConfig.id = payload.favoriteId;
                        favoriteConfig.owner = payload.owner;
                        favoriteConfig.currentFavoriteVersion = payload.currentFavoriteVersion;
                        favoriteConfig.latestFavoriteVersion = payload.latestFavoriteVersion;
                        favoriteConfig.versionNumber = payload.versionNumber;
                        this.notificationService.success('Favorite:' + favoriteConfig.title + ' saved successfully!');
                    }
                    return of(true);
                }
            ),
            catchError(
                error => {
                    // error saving favorite, so send an error response
                    const errMsg: string = error.message ? error.message : 'Error saving favorite';
                    this.notificationService.error(errMsg + ' ' + favoriteConfig.title, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_QUICK_SAVE_FAVORITE_ERROR);
                    return of(false);
                }
            )
        );
    }


    /**
     * Method to update favorite status
     * @param abstractConfig
     * @param statusTag
     * @param favType
     */
    updateFavorite$(abstractConfig: AbstractFavoriteConfig, statusTag: FavoriteStatus, favType: string): Observable<void> {
        const params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage( new HttpParams(), 'Updating favorite status');
        return this.httpService.post$('updateFavStatus', {id: abstractConfig.id, statusTag}, params).pipe(
            map((payload: any) => {

                if (payload.status !== DataRequestConstants.SUCCESS_RESPONSE) {
                    throw throwError(payload.message);
                }
                const updatedSlimFavCache = FavoriteStore.slimFavCache.get(FavoriteUtils.getCacheKey(abstractConfig.owner, favType));

                if (updatedSlimFavCache) {
                    const indexOfTarget = updatedSlimFavCache.findIndex(
                        item => item.id === abstractConfig.id
                    );
                    updatedSlimFavCache[indexOfTarget].statusTag = statusTag;
                }
                const fav = CoreFavoriteStore.favoriteCache.get(CoreFavoriteUtils.getFavoriteKey(false, abstractConfig.id).toString());
                if (fav) {
                    fav.statusTag = statusTag;
                }
                abstractConfig.statusTag = statusTag;
            }), catchError((error: Error) => {
                console.error('Failed to update favorite status:  ', abstractConfig.id, abstractConfig.title, error);
                return throwError(error);
            })
        );
    }

    /**
     * Delete favorite
     */
    deleteFavorite$(id: number|string, favType: string, favName: string, owner: string): Observable<void> {
        const isGlobal = CoreFavoriteUtils.isGlobalFavorite(owner);
        const params = new HttpParams({fromObject: {id: id.toString(), favName: favName.toString(), isGlobalFav: isGlobal.toString()}});

        return this.httpService.get$('deleteFavorite', params)
            .pipe(
                map((payload: any) => {
                    if (payload.status !== DataRequestConstants.SUCCESS_RESPONSE) {
                        throw throwError(payload.message);
                    }

                    const cacheKey = FavoriteUtils.getCacheKey(owner, favType);
                    const updatedSlimFavCache = FavoriteStore.slimFavCache.get(cacheKey);

                    if (!updatedSlimFavCache) {
                        return;
                    }

                    const indexOfTarget = updatedSlimFavCache.findIndex(
                        item => item.id === id
                    );

                    // If current portfolio is the one that is being deleted, then
                    // remove owner from portfolio so that it is treated as a new favorite when re-saving
                    const currentPortfolio: Portfolio = WorkspaceStore.getCurrentPortfolio();
                    if (currentPortfolio && currentPortfolio.id === id && updatedSlimFavCache[indexOfTarget].type === favType) {
                        currentPortfolio.owner = null;
                    }
                    // dont need for slimFavCache.set since updatedSlimFavCache pointing the same reference
                    updatedSlimFavCache.splice(indexOfTarget, 1);

                }), catchError((error: Error) => {
                    console.error('Failed to delete favorite:  ', id, favName, error);
                    return throwError(error);
                })
            );
    }

    /**
     * Method to get the enterprise permission groups.
     * This service call will be modified once the backend service is available to use
     */
    getEnterprisePermGroups$(owner: string): Observable<string[]> {
        const params = new HttpParams({fromObject: {owner: owner}});
        return this.httpService.get$('getPermissionScopes', params)
            .pipe(
                map((payload: any) => {
                    // check if there is any failure
                    if (payload?.status === 'FAILURE') {
                        throw payload;
                    }
                    const permGroups: string[] = [];
                for (const group of payload.data) {
                    // Create favorite and push to favorites.
                    permGroups.push(group);
                }
                return permGroups;
                }), catchError((error: Error) => {
                    console.error('Failed to get the permission groups:  ', error);
                    return throwError(error);
                })
            );
    }

    /**
     * This method returns the top users of the slected favorite
     * within the selected date range
     */
    getFavoriteUsers$(id: number|string, minDate: string, maxDate: string, topUserCount: number, favType: string): Observable<FavoriteUserDetails[]> {
        let params = new HttpParams({
            fromObject: {id: id.toString(), minDate: minDate, maxDate: maxDate, topUserCount: topUserCount, type: favType.toString()}
        });
        return this.httpService.get$('getFavoriteUsers', params).pipe(
            timeout(120000),
            map((payload: any) => {
                // check if there is any failure
                if (payload?.status === 'FAILURE') {
                    throw payload;
                }
                const favoriteUsers: FavoriteUserDetails[] = [];
                for (const key in payload.data) {
                    if (payload.data[key]) {
                        const user = payload.data[key];
                        const favoriteUser: FavoriteUserDetails = {
                            userId: user.userId,
                            usageCount: user.usageCount,
                            userFullName: user.userFullName,
                            userDepartment: user.userDepartment,
                            userLastAccessedDateTime: moment(user.userLastAccessedDateTime, DateFormatConstants.YYYY_MM_DD_HH_mm_ss_ZZ).format(DateFormatConstants.MMDDYYYY_SLASH)
                        };
                        favoriteUsers.push(favoriteUser);
                    }
                }
                return favoriteUsers;
            }),
            catchError((error: Error) => {
                console.error('Failed to get favorite users:  ', id, error);
                return throwError(error);
            })
        );
    }

    /**
     * Method to get a favorite from the server.  Also optionally allows the caller to force a refresh of the cache item.
     */
    getFavorite$(favoriteId: number|string, loadingMessage?: string, isGlobalFavorite = false, forceRefresh = false, versionId?: string): Observable<AbstractConfig> {
        // check to make sure favoriteId is properly cast to number if it is numerical
        const id = CoreFavoriteUtils.castFavoriteId(favoriteId);

        const favKey = CoreFavoriteUtils.getFavoriteKey(isGlobalFavorite, id, versionId).toString();

        // Check if this favorite is already in the cache
        if (!forceRefresh && CoreFavoriteStore.favoriteCache.has(favKey)) {
            // Now that it is in the cache we can process the config and generate the config promise.
            console.log('got cached version from favorite cache', id);
            return this.getFavoriteConfigFromCache$(id, isGlobalFavorite, versionId);
        }

        // Not in the cache so go and load this favorite from the server.
        let params = new HttpParams({fromObject: {id: id.toString(), isGlobalFav: isGlobalFavorite.toString(), ...(versionId && {versionId})}});

        if (loadingMessage) {
            params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(params, loadingMessage);
        }

        return this.httpService.get$('getFavorite', params)
            .pipe(
                map((payload: any) => {
                    // check if there is any failure
                    if (payload?.status === 'FAILURE') {
                        throw payload;
                    }
                    // Process the return data into the cache.
                    this.processFavoriteResponse(payload, [id]);
                    const favorite = ConfigTypeFactory.getFavoriteConfig(id, isGlobalFavorite, versionId);
                    if (loadingMessage === CommonConstants.LOADING_WHAT_IF) {
                        payload.data.forEach(rawFavorite => {
                            TelemetryService.track(TelemetryActionConstants.FAVORITE.LOAD_PORTFOLIO, new TelemetryLoadPortfolioTypeParameters({
                                typeOfFavorite: rawFavorite.owner === FavoriteConstants.ADMIN_USER || rawFavorite.owner === FavoriteConstants.SHARED_USER ? ExplorePortfolioFavoriteTypeEnum.EXPLORE_FAVORITE_TYPE_SHARED : ExplorePortfolioFavoriteTypeEnum.EXPLORE_FAVORITE_TYPE_PERSONAL,
                                whatIfName: (favorite as Portfolio).title,
                                whatIfPortfolioType: (favorite as Portfolio).getTelemetricPortfolioType()
                            }));
                        });
                    }

                    // Now that it is in the cache we can process the config and generate the promise with the config in it.
                    return favorite;
                }), catchError((error: Error) => {
                    console.error('Failed to get favorite:  ', id, forceRefresh, error);
                    return throwError(error);
                })
            );
    }

    /**
     * Gets the config and returns it wrapped in a promise
     */
    private getFavoriteConfigFromCache$(id: number|string, isGlobalFavorite: boolean, versionId?: string): Observable<AbstractConfig> {
        const config = ConfigTypeFactory.getFavoriteConfig(id, isGlobalFavorite, versionId);
        if (!config) {
            return throwError('Failed to find favorite: ' + id);
        }

        // If the versionId is passed, then fetch the latest enterprise description as the cached version may not have it
        if (versionId) {
            const latestConfig = ConfigTypeFactory.getFavoriteConfig(id, isGlobalFavorite);
            if (latestConfig) {
                config.enterpriseDescription = latestConfig.enterpriseDescription;
                config.statusTag = latestConfig.statusTag;
            }
        }

        return of(config);
    }

    /**
     * Gets the favorite object by type and user (favorite's owner and mandate settings)
     */
    getFavoriteByTypeAndUser$(type: string, owner: string, loadingMessage?: string): Observable<Favorite> {
        // if cacheKey, return it from cache
        const cacheKey = FavoriteUtils.getCacheKey(owner, type);
        if (FavoriteStore.userFavCache.has(cacheKey)) {
            console.log('loaded ' + cacheKey + ' from cache');
            return of(FavoriteStore.userFavCache.get(cacheKey));
        }

        let params = new HttpParams({
            fromObject: {
                owner,
                type,
                isGlobalFav: CoreFavoriteUtils.isGlobalFavorite(owner).toString(),
            }
        });

        if (loadingMessage) {
            params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(params, loadingMessage);
        }

        return this.httpService.get$('getFavoriteForTypeAndUser', params).pipe(
            map((payload: any) => {
                if (!payload.data) {
                    throw throwError('Failed to get favorite by type and user');
                }

                FavoriteStore.userFavCache.set(cacheKey, new Favorite(payload.data));
                return new Favorite(payload.data);
            }),
            catchError(error => {
                console.error('Failed to get favorite by type and user', owner, type, error);
                return throwError(error);
            }));
    }

    /**
     * This method will load full favorite objects for a user and type.
     * e.g: Load all 'SCHEDULED_BATCH' for user '_ADMIN'
     */
    getAllFavorites$(owner: string | string[], type: string, loadingMessage?: string): Observable<AbstractConfig[]> {
        // If the user passed in is an array then convert it into a comma separated string.
        const ownerParam: string = Array.isArray(owner) ? owner.join(',') : owner;

        let params = new HttpParams({fromObject: {owner: ownerParam, type, isFullFav: 'true'}});

        if (loadingMessage) {
            params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(params, loadingMessage);
        }

        // Call to get the favorites for the users.
        return this.httpService.get$('getAllFavoritesForUserAndType', params).pipe(
            map((payload: any) => {
                if (!payload || !payload.data) {
                    throw throwError('Failed to get full favorites.');
                }
                const payloadIds = [];
                for (const favData of payload.data) {
                    payloadIds.push(favData.id);
                }

                this.processFavoriteResponse(payload, payloadIds);

                // Now that it is in the cache we can process the config and generate the promise with the config in it.
                return payloadIds.map((id) => ConfigTypeFactory.getFavoriteConfig(id, false));
            }),
            catchError(error => {
                console.error('Failed to get full favorites:  ', owner, type, error);
                return throwError(error);
            })
        );
    }

    /**
     * This method will load slim favorite info for a user and type.
     * e.g: Load all 'WIDGETS_REPORT' for user 'abc'
     * NOTE:  The data element of the favorite will be null.
     */
    getSlimFavorites$(owner: string | string[], type: string, loadingMessage?: string, dataObjectField?: string): Observable<Favorite[]> {
        // If the user passed in is an array then convert it into a comma separated string.
        const ownerParam: string = Array.isArray(owner) ? owner.join(',') : owner;

        // if cacheKey, return it from cache
        const cacheKey = FavoriteUtils.getCacheKey(ownerParam, type);

        if (FavoriteStore.slimFavCache.has(cacheKey)) {
            console.log('loaded ' + cacheKey + ' from cache');
            return of(FavoriteStore.slimFavCache.get(cacheKey));
        }

        let params = new HttpParams({
            fromObject: {
                owner: ownerParam,
                type,
                ...(!isEmpty(dataObjectField) ? {dataObjectField} : {})
            }
        });

        if (loadingMessage) {
            params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(params, loadingMessage);
        }

        // Call to get the favorites for the users.
        // Based on whether we have a need to fetch extra fields from data object, the command name can be different
        // NOTE: For now, the second command applies to point in time
        const command: string  = isEmpty(dataObjectField) ? 'getAllFavoritesForUserAndType' : 'getSlimFavWithExtraFields';
        return this.httpService.get$(command, params).pipe(
            map((payload: any) => {
                if (!payload || !payload.data) {
                    throw throwError('Failed to get slim favorites.');
                }

                const favorites: Favorite[] = [];
                for (const favData of payload.data) {
                    // Create favorite and push to favorites.
                    favorites.push(new Favorite(FavoriteUtils.decodeFavorite(favData)));
                }

                FavoriteStore.slimFavCache.set(cacheKey, favorites);
                return favorites;
            }),
            catchError(error => {
                console.error('Failed to get slim favorites:  ', owner, type, error);
                return throwError(error);
            })
        );
    }

    /**
     * This method will be used to load all the user list for a particular favorite type e.g 'WIDGETS_REPORT'
     * to provide the browsing ability for the users to load other people's favorites.
     * @param: type
     */
    getUsersForFavoriteType$(type: string): Observable<FavoriteUser[]> {
        const params = new HttpParams({fromObject: {type}});

        return this.httpService.get$('getAllUsersForType', params).pipe(
            map((payload: any) => {
                if (!payload || !payload.data) {
                    throw throwError('Failed to get the users list.');
                }
                const users: FavoriteUser[] = [];

                // Convert the returned data into a list of FavoriteUsers.
                for (const key in payload.data) {
                    if (payload.data[key]) {
                        const favoriteUser: FavoriteUser = {
                            login: key,
                            fullName: payload.data[key],
                            type: FavoriteConstants.PERSONAL_ACCOUNT
                        };
                        users.push(favoriteUser);
                    }
                }

                // Fix to enable the load of SHARED favorites from Prism and Sort the results by full name.
                const sharedAccount: FavoriteUser = {
                    login: FavoriteConstants.SHARED_USER,
                    fullName: ' Shared Account',
                    type: 'Personal'
                };
                return [sharedAccount, ...sortBy(users, 'fullName')];
            }),
            catchError(error => {
                console.error('Failed to favorites for user and type:  ', type, error);
                return throwError(error);
            }));
    }

    /**
     * Processes the favorite response into the cache.
     * @param payload from getFavorite
     * @param ids the id(s) of the favorites
     */
    private processFavoriteResponse(payload: any, ids: (string | number)[]): void {
        // Make sure there are some results to actually process.

        // If a list of fav was requested then all of them should be in the payload.
        // If we asked for ids = [1,2,3] and got back only [1,3] then we log that 2 did not exist.
        const payloadIds = [];
        for (const favData of payload.data) {
            payloadIds.push(favData.id);
        }

        const idsNotFound: number[] = difference(ids, payloadIds);
        if (!payload || isEmpty(payload.data) || !isEmpty(idsNotFound)) {
            console.error('The favorite does not exist.  id:' + idsNotFound);
            return;
        }

        // Now put the results into the cache.
        for (const favData of payload.data) {
            // If the favorite failed to convert then write the error to the console and skip over it.
            if (favData.active_flag === 'Failed Convert') {
                console.error('Failed to convert favorite', favData);
                continue;
            }

            // Decode the favorite string first.
            FavoriteUtils.decodeFavorite(favData);

            // Create a favorite object.
            const fav: Favorite = new Favorite(favData);
            // Create object that's going to be saved in the cache.
            const isGlobal: boolean = CoreFavoriteUtils.isGlobalFavorite(fav.owner);
            const favItem = new FavoriteCacheKey(favData.id, isGlobal, favData.currentFavoriteVersion);

            CoreFavoriteStore.favoriteCache.set(favItem.toString(), fav);
            // we are doing this because latest version can be fetched without version no, so setting the cache accordingly
            if (favData.versionNumber && (favData.currentFavoriteVersion === favData.latestFavoriteVersion)) {
                CoreFavoriteStore.favoriteCache.set( new FavoriteCacheKey(favData.id, isGlobal).toString(), fav);
            }

            console.log('Favorite added to cache.', 'id:' + fav.id, 'type:' + fav.type, 'global: ' + isGlobal);
        }
    }


    /**
     * Method to get a favorite versions from the server.  Also optionally allows the caller to force a refresh of the cache item.
     */
    getFavoriteVersion$(id: number, loadingMessage?: string, isGlobalFavorite = false, forceRefresh = false): Observable<AbstractConfig> {
        // Not in the cache so go and load this favorite from the server.
        let params = new HttpParams({ fromObject: { id: id.toString(), isGlobalFav: isGlobalFavorite.toString() } });

        if (loadingMessage) {
            params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(params, loadingMessage);
        }

        return this.httpService.get$('getExploreTemplateVersionsById', params)
            .pipe(
                map((payload: any) => {
                    // check if there is any failure
                    if (payload) {
                        if (payload?.status === 'FAILURE') {
                            throw payload;
                        }
                        for (const favData of payload.data) {
                            FavoriteUtils.decodeFavorite(favData);
                        }
                        return payload;
                    }

                }), catchError((error: Error) => {
                    console.error('Failed to get favorite:  ', id, forceRefresh, error);
                    return throwError(error);
                })
            );
    }


    /**
     * To track Telemetry for delete favorite with location
     */
    postDeleteTelemetry(loc: ExploreDeleteFavoriteEventLocation, favoriteType: string, favoriteId: number|string, title: string, owner: string): void {
        TelemetryService.track(
            TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_DELETE_FAVORITE,
            new TelemetryDeleteFavoriteParameters(
                loc,
                favoriteType,
                favoriteId,
                title,
                owner));
    }
}
