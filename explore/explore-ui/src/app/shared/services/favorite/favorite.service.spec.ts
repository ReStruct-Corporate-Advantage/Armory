import {HttpParams} from '@angular/common/http';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {
    AbstractFavoriteConfig,
    ConfigTypeFactory,
    CoreFavoriteStore, CoreFavoriteUtils,
    CoreUserMetaDataStore,
    ExploreDeleteFavoriteEventLocation,
    Favorite,
    TelemetryService,
    UserMetaData
} from '@blk/explore-ui-core';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {FavoriteConstants} from '@constants/favorite.constants';
import {ScheduledBatchConfig} from '@models/batch-reporting/scheduled-batch/scheduled-batch-config.model';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {Http2BmsService} from '@services/bms';
import {FavoriteStore} from '@stores/favorite.store';
import {FavoriteUtils} from '@utils/favorite.utils';
import {HttpUtils} from '@utils/http.utils';
import {Observable, of, throwError} from 'rxjs';
import * as getFavoriteResponse from '../../../../../mocks/getFavoriteResponseMock.json';
import * as saveFavoriteResponse from '../../../../../mocks/saveFavoriteResponseMock.json';
import {NotificationService} from '../notification';
import {FavoriteService} from './favorite.service';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WorkspaceStore} from '@stores/workspace.store';
import moment from 'moment';
import 'moment-timezone/index';
import {DataRequestConstants} from '@constants/data-request.constants';

describe('FavoriteService', () => {
    let service: FavoriteService;
    let httpServiceStub: any;
    const notificationServiceStub = {
        success: jest.fn(),
        error: jest.fn()
    };

    beforeAll(() => {
        httpServiceStub = {
            post$: jest.fn((command: string) => {
                switch (command) {
                    case 'saveFavorite':
                        return of(saveFavoriteResponse.workspace);
                    case 'saveFolderStructure':
                        return of(saveFavoriteResponse.workspaceFolder);
                }

            }),
            get$: jest.fn((command: string, params: any) => {
                switch (command) {
                    case 'getFavorite':
                        return of(getFavoriteResponse.workspace);
                    case 'getFavoriteForTypeAndUser':
                        if (params.get('owner') === '_ADMIN' && params.get('type') === 'MANDATE_MAP') {
                            return of(getFavoriteResponse.mandate);
                        }
                        return of(getFavoriteResponse.workspaceFolder);
                    case 'getAllFavoritesForUserAndType':
                        return params.get('isFullFav') === 'true' ? of(getFavoriteResponse.fullFavorites) : of(getFavoriteResponse.slimFavorite);
                    case 'getAllUsersForType':
                        return of(getFavoriteResponse.users);
                    case 'getFavoriteUsers':
                        return of(getFavoriteResponse.favoriteUsers);
                    case 'getEnterprisePermGroups':
                        return of(getFavoriteResponse.permGroups);
                    case 'deleteFavorite':
                        return of(getFavoriteResponse.deleteWorkspace);
                    case 'getFavoriteVersions':
                        return of(getFavoriteResponse.versions);
                }
            })
        };
    });

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        TestBed.configureTestingModule({
            providers: [
                {provide: Http2BmsService, useValue: httpServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub}
            ]
        });
        service = TestBed.inject(FavoriteService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('saveFavorite$ Test', () => {
        let favorite: Favorite;

        beforeEach(() => {
            favorite = new Favorite({
                'title': 'Untitled Workspace',
                'type': 'WORKSPACE',
                'owner': 'seakim',
                'data': '{"configType":"workspace","workpads":[{"configType":"flat-workpad","reports":[{"configType":"WIDGETS_REPORT","widgets":[],"title":"Report"}],"portfolios":[{"configType":"portfolio","ticker":"PEP","benchmark":{"type":"RISK","order":1,"name":"MSAC_APACN"}}]}],"title":"Untitled Workspace"}'
            });
        });

        it('should throwError if Prism favorite', function () {
            jest.spyOn(service['httpService'], 'post$').mockReturnValue(of({data: {tool: 'Prism'}}));
            const subscription = service.saveFavorite$(favorite, 'seakim')
                .subscribe((response: any) => {
                    expect(response).toThrowError();
                });
            subscription.unsubscribe();
        });

        it('should throw error if status is not SUCCESS', () => {
            jest.spyOn(service['httpService'], 'post$').mockReturnValue(of({status: 'FAILED'}));
            const subscription = service.saveFavorite$(favorite, 'seakim')
                .subscribe((response: any) => {
                    expect(response).toThrowError();
                });
            subscription.unsubscribe();
        });

        it('should make a post request to save', () => {
            jest.spyOn(service['httpService'], 'post$');
            jest.spyOn(CoreFavoriteStore.favoriteCache, 'set');
            jest.spyOn(FavoriteStore, 'updateSlimFavCache');
            const expectedCacheFavorite = {
                'data': '{"configType":"workspace","workpads":[{"configType":"flat-workpad","reports":[{"configType":"WIDGETS_REPORT","widgets":[],"title":"Report"}],"portfolios":[{"configType":"portfolio","ticker":"PEP","benchmark":{"type":"RISK","order":1,"name":"MSAC_APACN"}}]}],"title":"Untitled Workspace"}',
                'owner': 'seakim',
                'id': 1719487,
                'title': 'Untitled Workspace',
                'type': 'WORKSPACE'
            };

            const subscription = service.saveFavorite$(favorite, 'seakim')
                .subscribe((response: any) => {
                    expect(httpServiceStub.post$).toHaveBeenCalled();
                    expect(response).toEqual({
                        'status': 'SUCCESS',
                        'message': 'Successfully saved the favorite',
                        'favoriteId': 1719487,
                        'owner': 'seakim',
                        'type': 'WORKSPACE'
                    });
                    expect(CoreFavoriteStore.favoriteCache.set).toHaveBeenCalledWith('false;1719487', expectedCacheFavorite);
                    expect(FavoriteStore.updateSlimFavCache).toHaveBeenCalled();
                });
            subscription.unsubscribe();
        });

        it('Test favorite save sybase enterprise when favorite id changes', () => {
            favorite.id = 34578;
            jest.spyOn(service['httpService'], 'post$').mockReturnValue(of({status: 'SUCCESS', data: {id: 'be35c275-158e-4030-90ce-6e101fc8da72', owner: 'seakim',
                    data: '{"configType":"workspace","workpads":[{"configType":"flat-workpad","reports":[{"configType":"WIDGETS_REPORT","widgets":[],"title":"Report"}],"portfolios":[{"configType":"portfolio","ticker":"PEP","benchmark":{"type":"RISK","order":1,"name":"MSAC_APACN"}}]}],"title":"Untitled Workspace"}'},
                    title: 'Untitled Workspace', type: 'WORKSPACE'}));
            jest.spyOn(CoreFavoriteStore.favoriteCache, 'set');
            jest.spyOn(FavoriteStore, 'updateSlimFavCache');
            const expectedCacheFavorite = {
                'data': '{"configType":"workspace","workpads":[{"configType":"flat-workpad","reports":[{"configType":"WIDGETS_REPORT","widgets":[],"title":"Report"}],"portfolios":[{"configType":"portfolio","ticker":"PEP","benchmark":{"type":"RISK","order":1,"name":"MSAC_APACN"}}]}],"title":"Untitled Workspace"}',
                'owner': 'seakim',
                'id': 'be35c275-158e-4030-90ce-6e101fc8da72',
                'title': 'Untitled Workspace',
                'type': 'WORKSPACE'
            };

            const subscription = service.saveFavorite$(favorite, 'seakim')
                .subscribe((response: any) => {
                    expect(httpServiceStub.post$).toHaveBeenCalled();
                    expect(response).toEqual({
                        'status': 'SUCCESS',
                        'message': 'Successfully saved the favorite',
                        'favoriteId': 'be35c275-158e-4030-90ce-6e101fc8da72',
                        'owner': 'seakim',
                        'type': 'WORKSPACE'
                    });
                    expect(CoreFavoriteStore.favoriteCache.set).toHaveBeenCalledWith('false;be35c275-158e-4030-90ce-6e101fc8da72', expectedCacheFavorite);
                    expect(CoreFavoriteStore.favoriteCache.set).toHaveBeenCalledWith('false;34578', expectedCacheFavorite);
                    expect(FavoriteStore.updateSlimFavCache).toHaveBeenCalledWith(expectedCacheFavorite, 34578, true);
                });
            subscription.unsubscribe();
        });

        it('should handle error', () => {
            jest.spyOn(service['httpService'], 'post$').mockReturnValue(throwError('Failed to save the favorite'));

            const subscription = service.saveFavorite$(favorite, 'seakim')
                .subscribe(() => {
                }, error => {
                    expect(error).toBe('Failed to save the favorite');
                });
            subscription.unsubscribe();
        });
    });

    describe('quickSaveFavorite$ Test', () => {
        it('quick save success', fakeAsync(() => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            jest.spyOn(service, 'saveFavorite$').mockImplementation(
                (favorite: AbstractFavoriteConfig): Observable<any> => {
                    return of({
                        favoriteId: 234,
                        owner: 'simsingh'
                    });
                }
            );
            const breakdownToSave = new Breakdown();
            breakdownToSave.title = 'Test Breakdown';
            jest.spyOn(moment.tz, 'guess').mockReturnValue('America/New_York');
            service.quickSaveFavorite$(breakdownToSave, breakdownToSave.createFavorite(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN), 'simsingh').subscribe(
                (updated: boolean) => {
                    expect(updated).toBeTruthy();
                    expect(breakdownToSave.id).toEqual(234);
                    expect(breakdownToSave.owner).toEqual('simsingh');
                }
            );
            tick();
            expect(notificationServiceStub.success).toHaveBeenCalled();
        }));
        it('quick save failure', fakeAsync(() => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            jest.spyOn(service, 'saveFavorite$').mockImplementation(
                (favorite: AbstractFavoriteConfig): Observable<any> => {
                    return throwError('Save Failed');
                }
            );
            const breakdownToSave = new Breakdown();
            breakdownToSave.title = 'Test Breakdown';
            service.quickSaveFavorite$(breakdownToSave, breakdownToSave.createFavorite(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN), 'simsingh').subscribe(
                (updated: boolean) => {
                    expect(updated).toBeFalsy();
                }
            );
            tick();
            expect(notificationServiceStub.error).toHaveBeenCalled();
        }));
    });

    describe('deleteFavorite$ Test', () => {
        let favToDelete: Favorite;

        beforeEach(() => {
            favToDelete = new Favorite({title: 'Untitled Workspace', type: 'WORKSPACE', id: 1842154});
        });

        it('should delete favorite and update cache', () => {
            FavoriteStore.slimFavCache.set('seakim,WORKSPACE', [favToDelete]);
            expect(FavoriteStore.slimFavCache.get('seakim,WORKSPACE').length).toBe(1);

            const subscription = service.deleteFavorite$(favToDelete.id, favToDelete.type, favToDelete.title, 'seakim')
                .subscribe(() => {
                    expect(FavoriteStore.slimFavCache.get('seakim,WORKSPACE').length).toBe(0);
                });
            subscription.unsubscribe();
        });

        it('should delete portfolio favorite and update owner to null only if id is same ', () => {
            FavoriteStore.slimFavCache.set('arpaul,WORKSPACE', [favToDelete]);
            expect(FavoriteStore.slimFavCache.get('arpaul,WORKSPACE').length).toBe(1);
            const port: Portfolio = new Portfolio('PEP');
            port.owner = 'test';
            port.id = 1842154;
            jest.spyOn(WorkspaceStore, 'getCurrentPortfolio').mockReturnValue(port);
            let subscription = service.deleteFavorite$(favToDelete.id, favToDelete.type, favToDelete.title, 'arpaul')
                .subscribe(() => {
                    expect(port.owner).toBeNull();
                });
            subscription.unsubscribe();

            port.id = 2;
            port.owner = 'test';
            subscription = service.deleteFavorite$(favToDelete.id, favToDelete.type, favToDelete.title, 'arpaul')
                .subscribe(() => {
                    expect(port.owner).toBe('test');
                });
            subscription.unsubscribe();
        });

        it('should handle error', () => {
            jest.spyOn(service['httpService'], 'post$').mockReturnValue(throwError('Failed to delete favorite'));

            const subscription = service.deleteFavorite$(favToDelete.id, favToDelete.type, favToDelete.title, 'seakim')
                .subscribe(() => {
                }, error => {
                    expect(error.message).toBe('Failed to delete favorite');
                });
            subscription.unsubscribe();
        });
    });

    describe('getFavorite$ Test', () => {
        it('should get favorite from cache if favKey is in the cache', () => {
            CoreFavoriteStore.favoriteCache.set('false;1719479', new Favorite());
            jest.spyOn<any, string>(service, 'getFavoriteConfigFromCache$').mockImplementationOnce((_a, _b) => of());
            service.getFavorite$(1719479);

            expect(service['getFavoriteConfigFromCache$']).toHaveBeenCalled();
        });

        it('should get favorite from cache if favKey is in the cache latest description', fakeAsync(() => {
            const favWithDescription = new Favorite();
            favWithDescription.enterpriseDescription = 'test';
            CoreFavoriteStore.favoriteCache.set('false;1719479', favWithDescription);
            CoreFavoriteStore.favoriteCache.set('false;1719479;2', new Favorite());
            CoreFavoriteStore.favoriteCache.set('false;1719478', new Favorite());
            jest.spyOn(ConfigTypeFactory, 'getFavoriteConfig').mockImplementation((id, isGlobalFav, versionNo ) => {
                if (id === 1719478) {
                    return new Favorite();
                }
               if (versionNo) {
                   return new Favorite();
               } else {
                   return favWithDescription;
               }
                return undefined;
            });
            let config = service.getFavorite$(1719479, '', false, false, '2');
            tick();
            config.subscribe(value => {
               expect(value['enterpriseDescription']).toBe('test');
            });
            config = service.getFavorite$(1719478);
            tick();
            config.subscribe(value => {
                expect(value['enterpriseDescription']).toBeUndefined();
            });
            config = service.getFavorite$(1719478, '', false, false, '2');
            tick();
            config.subscribe(value => {
                expect(value['enterpriseDescription']).toBeUndefined();
            });
        }));

        it('should make a get request to load', () => {
            jest.spyOn<any>(service, 'processFavoriteResponse');
            jest.spyOn(ConfigTypeFactory, 'getFavoriteConfig');

            const subscription = service.getFavorite$(1719487)
                .subscribe(() => {
                    expect(service['processFavoriteResponse']).toHaveBeenCalled();
                    expect(ConfigTypeFactory.getFavoriteConfig).toHaveBeenCalled();
                });
            subscription.unsubscribe();
        });

        it('should add loadingMessage to params if loadingMessage', () => {
            jest.spyOn(HttpUtils, 'getCopiedParamWithLoadingKeyAndMessage');
            const params = new HttpParams({fromObject: {id: '1719487', isGlobalFav: 'false'}});

            const subscription = service.getFavorite$(1719487, false, false, 'Loading Favorite Workspace')
                .subscribe(() => {
                    expect(HttpUtils.getCopiedParamWithLoadingKeyAndMessage).toHaveBeenCalledWith(params, 'Loading Favorite Workspace');
                });
            subscription.unsubscribe();
        });

        it('should make a get request to load if forceRefresh is true when the data is in the cache', () => {
            CoreFavoriteStore.favoriteCache.set('false;1719479', new Favorite());
            jest.spyOn<any>(service, 'processFavoriteResponse');
            jest.spyOn(ConfigTypeFactory, 'getFavoriteConfig');

            const subscription = service.getFavorite$(1719487, '', false, true)
                .subscribe(() => {
                    expect(service['processFavoriteResponse']).toHaveBeenCalled();
                    expect(ConfigTypeFactory.getFavoriteConfig).toHaveBeenCalled();
                });
            subscription.unsubscribe();
        });

        it('should handle error', () => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(throwError('Failed to get favorite'));

            const subscription = service.getFavorite$(1719487, '', false, true)
                .subscribe(() => {
                }, error => {
                    expect(error).toBe('Failed to get favorite');
                });
            subscription.unsubscribe();
        });
    });

    describe('processFavoriteResponse Test', () => {
        it('should return nothing and log "The favorite does not exist.  id:" + idsNotFound, when the id is not in the payload', () => {
            jest.spyOn(console, 'error');

            service['processFavoriteResponse'](getFavoriteResponse.workspace, [1]);
            expect(console.error).toHaveBeenCalledWith('The favorite does not exist.  id:' + 1);
        });

        it('should return nothing and log "Failed to convert favorite", favData, when favorite failed to convert', () => {
            jest.spyOn(console, 'error');
            const getResponseDataBackup = getFavoriteResponse.workspace.data[0];
            getFavoriteResponse.workspace.data[0] = ({'active_flag': 'Failed Convert', 'id': 1719479} as any);

            service['processFavoriteResponse'](getFavoriteResponse.workspace, [1719479]);
            expect(console.error).toHaveBeenCalledWith('Failed to convert favorite', getFavoriteResponse.workspace.data[0]);

            getFavoriteResponse.workspace.data[0] = getResponseDataBackup;
        });

        it('should save favorite to the cache', () => {
            jest.spyOn<any>(FavoriteUtils, 'decodeFavorite');
            jest.spyOn(CoreFavoriteStore.favoriteCache, 'set');
            service['processFavoriteResponse'](getFavoriteResponse.workspace, [1719479]);

            expect(FavoriteUtils.decodeFavorite).toHaveBeenCalledWith(getFavoriteResponse.workspace.data[0]);
            expect(CoreFavoriteStore.favoriteCache.set).toHaveBeenCalled();
        });
    });

    describe('getFavoriteByTypeAndUser$ Test', () => {
        it('should get favorite by type and user', () => {
            const subscription = service.getFavoriteByTypeAndUser$('MANDATE_MAP', '_ADMIN')
                .subscribe((response) => {
                    console.log(response);
                    expect(response instanceof Favorite).toBeTruthy();
                    expect(response.title).toBe('MANDATE_MAP');
                    expect(response.type).toBe('MANDATE_MAP');
                    expect(response.id).toBe(1421773);
                    expect(response.owner).toBe('_ADMIN');
                });
            subscription.unsubscribe();
        });

        it('should add loadingMessage to params if loadingMessage', () => {
            jest.spyOn(FavoriteStore.userFavCache, 'has').mockReturnValue(false);
            jest.spyOn(HttpUtils, 'getCopiedParamWithLoadingKeyAndMessage');
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(of());
            const params = new HttpParams({fromObject: {owner: '_ADMIN', type: 'MANDATE_MAP', isGlobalFav: 'false'}});

            const subscription = service.getFavoriteByTypeAndUser$('MANDATE_MAP', '_ADMIN', 'Loading Mandate Settings')
                .subscribe(() => {
                    expect(HttpUtils.getCopiedParamWithLoadingKeyAndMessage).toHaveBeenCalledWith(params, 'Loading Mandate Settings');
                });
            subscription.unsubscribe();
        });

        it('should get the favorite from userFavCache if already saved', () => {
            jest.spyOn(FavoriteStore.userFavCache, 'has').mockReturnValue(true);
            jest.spyOn(FavoriteStore.userFavCache, 'get').mockReturnValue(getFavoriteResponse.mandate);
            jest.spyOn(console, 'log');

            const subscription = service.getFavoriteByTypeAndUser$('MANDATE_MAP', '_ADMIN')
                .subscribe(response => {
                    expect(FavoriteStore.userFavCache.get).toHaveBeenCalled();
                    expect(response).toEqual(getFavoriteResponse.mandate);
                    expect(console.log).toHaveBeenCalledWith('loaded MANDATE_MAP,_ADMIN from cache');
                });
            subscription.unsubscribe();
        });

        it('should throw error if the response.data is empty', () => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(of({data: undefined}));

            const subscription = service.getFavoriteByTypeAndUser$('MANDATE_MAP', '_ADMIN')
                .subscribe(response => {
                    expect(response).toThrowError();
                });
            subscription.unsubscribe();
        });

        it('should handle error', () => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(throwError('Failed to get favorite by type and user'));

            const subscription = service.getFavoriteByTypeAndUser$('MANDATE_MAP', '_ADMIN')
                .subscribe(() => {
                }, error => {
                    expect(error).toBe('Failed to get favorite by type and user');
                });
            subscription.unsubscribe();
        });
    });

    describe('updateStatus$ test', () => {
        it('update status success', fakeAsync(() => {
            FavoriteStore.slimFavCache.set(FavoriteUtils.getCacheKey('_ADMIN', 'WORKSPACE'), [{id: '23456'} as any]);
            jest.spyOn(httpServiceStub, 'post$').mockReturnValue(of({status: DataRequestConstants.SUCCESS_RESPONSE}));
            CoreFavoriteStore.favoriteCache.set(CoreFavoriteUtils.getFavoriteKey(false, '23456').toString(), {id: '23456', statusTag: 'mature'} as any);
            // Create a jest mock function to track success callback
            const successCallback = jest.fn();
            const config = { id: '23456', owner: '_ADMIN', statusTag: 'mature' };
            service.updateFavorite$(
                config as any,
                'under_review',
                'WORKSPACE'
            ).subscribe(successCallback);
            tick();
            expect(successCallback).toHaveBeenCalled();
            expect(FavoriteStore.slimFavCache.get(FavoriteUtils.getCacheKey('_ADMIN', 'WORKSPACE'))[0].statusTag).toEqual('under_review');
            expect(CoreFavoriteStore.favoriteCache.get(CoreFavoriteUtils.getFavoriteKey(false, '23456').toString()).statusTag).toEqual('under_review');
            expect(config.statusTag).toEqual('under_review');
        }));
        it('update status error', fakeAsync(() => {
            jest.spyOn(httpServiceStub, 'post$').mockReturnValue(throwError("Error"));
            const errorCallback = jest.fn();
            const config = { id: '23456', owner: '_ADMIN', statusTag: 'mature' };
            service.updateFavorite$(
                config as any,
                'under_review',
                'WORKSPACE'
            ).subscribe({error: errorCallback});
            tick();
            expect(errorCallback).toHaveBeenCalled();
        }));
    });

    describe('getSlimFavorites$ Test', () => {
        it('should make a get request to get slim favorites and decode favorites', () => {
            jest.spyOn(FavoriteUtils, 'decodeFavorite');
            service.getSlimFavorites$('seakim', 'WORKSPACE')
                .subscribe((response) => {
                    expect(Array.isArray(response)).toBeTruthy();
                    let count = 0;
                    for (const fav of response) {
                        expect(fav instanceof Favorite).toBeTruthy();
                        count++;
                    }
                    expect(FavoriteUtils.decodeFavorite).toHaveBeenCalledTimes(count);
                });
        });

        it('should get the slim favorites from slimFavCache if already saved', () => {
            jest.spyOn(FavoriteStore.slimFavCache, 'has').mockReturnValue(true);
            jest.spyOn(FavoriteStore.slimFavCache, 'get').mockReturnValue(getFavoriteResponse.slimFavorite);
            jest.spyOn(console, 'log');

            const subscription = service.getSlimFavorites$('seakim', 'WORKSPACE')
                .subscribe(response => {
                    expect(FavoriteStore.slimFavCache.get).toHaveBeenCalled();
                    expect(response).toEqual(getFavoriteResponse.slimFavorite);
                    expect(console.log).toHaveBeenCalledWith('loaded seakim,WORKSPACE from cache');
                });
            subscription.unsubscribe();
        });

        it('should return slim favorites with fields from data object', done => {
            jest.spyOn(FavoriteStore.slimFavCache, 'has').mockReturnValueOnce(false);
            jest.spyOn(FavoriteStore.slimFavCache, 'set').mockImplementationOnce((a, b) => new Map());
            httpServiceStub.get$.mockRestore();
            jest.spyOn(httpServiceStub, 'get$').mockReturnValueOnce(of(getFavoriteResponse.slimFavoriteWithExtraFields));
            service.getSlimFavorites$('abc', 'bcd', 'loading favorites', 'date')
                .subscribe(slimFavsWithExtraFields => {
                    const httpGetCall = httpServiceStub.get$.mock.calls[0];
                    expect(slimFavsWithExtraFields.length).toBe(3);
                    expect(httpGetCall[0]).toBe('getSlimFavWithExtraFields');
                    expect((httpGetCall[1] as HttpParams).get('dataObjectField')).toBe('date');
                    done();
                }).unsubscribe();
        });

        it('should add loadingMessage to params if loadingMessage', () => {
            jest.spyOn(FavoriteStore.slimFavCache, 'has').mockReturnValue(false);
            jest.spyOn(HttpUtils, 'getCopiedParamWithLoadingKeyAndMessage');
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(of());
            const params = new HttpParams({fromObject: {owner: '_ADMIN', type: 'MANDATE_MAP'}});

            const subscription = service.getSlimFavorites$('_ADMIN', 'MANDATE_MAP', 'Loading Mandate Options')
                .subscribe(() => {
                    expect(HttpUtils.getCopiedParamWithLoadingKeyAndMessage).toHaveBeenCalledWith(params, 'Loading Mandate Options');
                });
            subscription.unsubscribe();
        });

        it('should throw error if the response.data is empty', () => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(of({data: undefined}));

            const subscription = service.getSlimFavorites$('seakim', 'WORKSPACE')
                .subscribe(response => {
                    expect(response).toThrowError();
                });
            subscription.unsubscribe();
        });

        it('should handle error', () => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(throwError('Failed to get slim favorites'));
            service.getSlimFavorites$('seakim', 'WORKSPACE')
                .subscribe(() => {
                }, error => {
                    expect(error).toBe('Failed to get slim favorites');
                });
        });
    });

    describe('getAllFavorites$ Test', () => {
        it('should make a get request to get full favorites and decode favorites', () => {
            jest.spyOn(ConfigTypeFactory, 'getFavoriteConfig');
            service.getAllFavorites$(FavoriteConstants.ADMIN_USER, ScheduledBatchConfig.configType)
                .subscribe((response) => {
                    expect(Array.isArray(response)).toBeTruthy();
                    let count = 0;
                    for (const fav of response) {
                        count++;
                    }
                    expect(ConfigTypeFactory.getFavoriteConfig).toHaveBeenCalledTimes(count);
                });
        });

        it('should add loadingMessage to params if loadingMessage', () => {
            jest.spyOn(FavoriteStore.slimFavCache, 'has').mockReturnValue(false);
            jest.spyOn(HttpUtils, 'getCopiedParamWithLoadingKeyAndMessage');
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(of());
            const params = new HttpParams({fromObject: {owner: '_ADMIN', type: 'SCHEDULED_BATCH', isFullFav: 'true'}});

            const subscription = service.getAllFavorites$('_ADMIN', 'SCHEDULED_BATCH', 'Loading Scheduled Batch Configs')
                .subscribe(() => {
                    expect(HttpUtils.getCopiedParamWithLoadingKeyAndMessage).toHaveBeenCalledWith(params, 'Loading Scheduled Batch Configs');
                });
            subscription.unsubscribe();
        });

        it('should throw error if the response.data is empty', () => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(of({data: undefined}));

            const subscription = service.getAllFavorites$(FavoriteConstants.ADMIN_USER, ScheduledBatchConfig.configType)
                .subscribe(response => {
                    expect(response).toThrowError();
                });
            subscription.unsubscribe();
        });

        it('should handle error', () => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(throwError('Failed to get full favorites'));
            service.getAllFavorites$(FavoriteConstants.ADMIN_USER, ScheduledBatchConfig.configType)
                .subscribe(() => {
                }, error => {
                    expect(error).toBe('Failed to get full favorites');
                });
        });
    });

    describe('getUsersForFavoriteType$ Test', () => {
        it('should make a get request to get all users and return sorted user list', () => {
            service.getUsersForFavoriteType$('WORKSPACE')
                .subscribe((response) => {
                    expect(Array.isArray(response)).toBeTruthy();
                    expect(response[0].fullName).toBe(' Shared Account');
                    expect(response[1].fullName < response[2].fullName).toBeTruthy();
                    expect(response[2].fullName < response[3].fullName).toBeTruthy();
                });
        });

        it('should throw error if the response.data is empty', () => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(of({data: undefined}));

            const subscription = service.getUsersForFavoriteType$('WORKSPACE')
                .subscribe(response => {
                    expect(response).toThrowError();
                });
            subscription.unsubscribe();
        });

        it('should handle error', () => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(throwError('Failed to favorites for user and type'));
            service.getUsersForFavoriteType$('WORKSPACE')
                .subscribe(() => {
                }, error => {
                    expect(error).toBe('Failed to favorites for user and type');
                });
        });
    });

    describe('postDeleteTelemetry Test', () => {
        it('should call telemetry service track method', () => {
            const mockStaticTelemetryTrack = jest.fn();
            TelemetryService.track = mockStaticTelemetryTrack;
            service.postDeleteTelemetry(ExploreDeleteFavoriteEventLocation.EXPLORE_DELETE_FAVORITE_EVENT_LOCATION_SAVE, 'WORKSPACE', 123, 'Just Test', 'random');
            expect(mockStaticTelemetryTrack).toHaveBeenCalled();
        });
    });
//
    describe('getFavoriteVersion$ Test', () => {
        let favorite: Favorite;
        beforeEach(() => {
            favorite = new Favorite({title: 'Untitled Workspace', type: 'WORKSPACE', id: 1842154});
        });
        it('should make a get request to get the favorite version of the Enterprise workspace and returns the list', () => {
            service.getFavoriteVersion$(favorite.id, false)
                .subscribe((response) => {
                    expect(Array.isArray(response)).toBeTruthy();
                });
        });

        it('should throw error if the response.data is empty', () => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(of({data: undefined}));

            const subscription = service.getFavoriteVersion$(favorite.id, '', false)
                .subscribe(response => {
                    expect(response).toThrowError();
                });
            subscription.unsubscribe();
        });

        it('should handle error', () => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(throwError('Failed to get the favorite version details'));
            service.getFavoriteVersion$(favorite.id, '', false)
                .subscribe(() => {
                }, error => {
                    expect(error).toBe('Failed to get the favorite version details');
                });
        });
    });


    describe('getEnterprisePermGroups$ Test', () => {
        it('should make a get request to get all the enterprise permission groups and returns the list', () => {
            service.getEnterprisePermGroups$('favOwner')
                .subscribe((response) => {
                    expect(Array.isArray(response)).toBeTruthy();
                });
        });

        it('should throw error if the response.data is empty', () => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(of({data: undefined}));

            const subscription = service.getEnterprisePermGroups$('favOwner')
                .subscribe(response => {
                    expect(response).toThrowError();
                });
            subscription.unsubscribe();
        });

        it('should handle error', () => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(throwError('Failed to get the permission groups'));
            service.getEnterprisePermGroups$('favOwner')
                .subscribe(() => {
                }, error => {
                    expect(error).toBe('Failed to get the permission groups');
                });
        });
    });

    describe('getFavoriteUsers$ Test', () => {
        let favorite: Favorite;
        const minDate = '2024-07-01 00:00:00';
        const maxDate = '2024-08-02 23:59:59';
        const topUserCount = 25;
        beforeEach(() => {
            favorite = new Favorite({title: 'Untitled Workspace', type: 'WORKSPACE', id: 1842154});
        });

        it('should make a get request to get the top users of the workspace and returns the list', () => {
            service.getFavoriteUsers$(favorite.id, minDate, maxDate, topUserCount, favorite.type).subscribe((response) => {
                expect(Array.isArray(response)).toBeTruthy();
            });
        });

        it('should throw error if the response.data is empty', () => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(of({data: undefined}));
            const subscription = service
                .getFavoriteUsers$(favorite.id, minDate, maxDate, topUserCount, favorite.type)
                .subscribe((response) => {
                    expect(response).toThrowError();
                });
            subscription.unsubscribe();
        });

        it('should handle error', () => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(throwError('Failed to get the top users details'));
            service.getFavoriteUsers$(favorite.id, minDate, maxDate, topUserCount, favorite.type).subscribe(
                () => {
                },
                (error) => {
                    expect(error).toBe('Failed to get the top users details');
                }
            );
        });
    });
});
