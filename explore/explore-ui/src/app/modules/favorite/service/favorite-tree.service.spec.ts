import {fakeAsync, TestBed, tick} from '@angular/core/testing';

import {FavoriteTreeService} from './favorite-tree.service';
import {of, throwError} from 'rxjs';
import * as getFavoriteFolderStructureResponse from '@mocks/favoriteFolderStructureMock.json';
import * as getSlimFavoriteResponse from '@mocks/slimFavoriteMock.json';
import {FavoriteService} from '@services/favorite/favorite.service';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';
import * as getFavoriteFolderStructure from '@mocks/favoriteFolderStructureMock.json';
import {FavoriteStore} from '@stores/favorite.store';
import * as getFavoriteResponse from '@mocks/getFavoriteResponseMock.json';
import {FavoriteConstants} from '@constants/favorite.constants';
import * as saveFavoriteResponse from '@mocks/saveFavoriteResponseMock.json';
import {Http2BmsService} from '@services/bms';


describe('FavoriteTreeService', () => {
    let service: FavoriteTreeService;

    const favoriteServiceStub = {
        getFavoriteFolderStructure$: jest.fn(() => of(getFavoriteFolderStructureResponse)),
        getSlimFavorites$: jest.fn(() => of(getSlimFavoriteResponse.workspaces))
    };

    const httpServiceStub = {
        post$: jest.fn((command: string) => of(saveFavoriteResponse.workspaceFolder)),
        get$: jest.fn((command: string, params: any) => of(getFavoriteResponse.workspaceFolder))
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: Http2BmsService, useValue: httpServiceStub},
                {provide: FavoriteService, useValue: favoriteServiceStub}
            ]
        });
        service = TestBed.inject(FavoriteTreeService);
    });

    describe('saveFavoriteFolderStructure$ Test', () => {
        let favoriteFolderItemToSave: FavoriteFolderItem;

        beforeEach(() => {
            favoriteFolderItemToSave = new FavoriteFolderItem(getFavoriteFolderStructure);
        });

        it('should save favorite folder structure and update cache', () => {
            jest.spyOn(FavoriteStore.folderFavCache, 'set');
            const subscription = service.saveFavoriteFolderStructure$(favoriteFolderItemToSave, 'WORKSPACE_FOLDER', 'seakim')
                .subscribe(() => {
                    expect(FavoriteStore.folderFavCache.set).toHaveBeenCalledWith('seakim,WORKSPACE_FOLDER', favoriteFolderItemToSave);
                });
            subscription.unsubscribe();
        });

        it('should handle error', () => {
            jest.spyOn(service['httpService'], 'post$').mockReturnValue(throwError('Failed to save favorite folder structure'));

            const subscription = service.saveFavoriteFolderStructure$(favoriteFolderItemToSave, 'WORKSPACE_FOLDER', 'seakim')
                .subscribe(() => {
                }, error => {
                    expect(error).toBe('Failed to save favorite folder structure');
                });
            subscription.unsubscribe();
        });
    });

    describe('getFavoriteFolderStructure$ Test', () => {
        it('should make a get request to get favorite folder structure and save cache in folderFavCache', (done: any) => {
            jest.spyOn(httpServiceStub, 'get$').mockRestore();
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(of(getFavoriteResponse.workspaceFolder));
            jest.spyOn(FavoriteStore.folderFavCache, 'set').mockImplementationOnce((_a, _b) => FavoriteStore.folderFavCache);

            const subscription = service.getFavoriteFolderStructure$('seakim', 'WORKSPACE')
                .subscribe((response) => {
                    expect(FavoriteStore.folderFavCache.set).toHaveBeenCalled();
                    expect(response.title).toBe('WORKSPACES');
                    expect(response.children.length).toBe(2);
                    expect(response.children[0].title).toBe('new2');
                    expect(response.children[1].title).toBe('New Folder');
                    expect(response.children[0].children[0].title).toBe('BAMY (bamba)');
                    expect(response.children[0].children[0].favoriteId).toBe(1517717);
                    done();
                });
            subscription.unsubscribe();
        });

        it('should throw error if the response.data is empty', (done: any) => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(of({data: undefined}));

            const subscription = service.getFavoriteFolderStructure$('seakim', 'WORKSPACE')
                .subscribe(response => {
                    fail('An exception should have been thrown');
                }, error => {
                    done();
                });
            subscription.unsubscribe();
        });

        it('should handle error', (done: any) => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(throwError('Failed to get favorite folder structure'));

            const subscription = service.getFavoriteFolderStructure$('seakim', 'WORKSPACE')
                .subscribe(() => {
                }, error => {
                    expect(error).toBe('Failed to get favorite folder structure');
                    done();
                });
            subscription.unsubscribe();
        });

        it('should get the folder favorite from folderFavCache if already saved', (done: any) => {
            // Ensure the cache does not have anything in it.
            FavoriteStore.folderFavCache.clear();

            jest.spyOn(httpServiceStub, 'get$').mockRestore();
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(of(getFavoriteResponse.workspaceFolder));
            jest.spyOn(console, 'log');

            const subscription = service.getFavoriteFolderStructure$('seakim', 'WORKSPACE')
                .subscribe(response => {
                    expect(response).not.toBeUndefined();
                    const subscription2 = service.getFavoriteFolderStructure$('seakim', 'WORKSPACE')
                        .subscribe(response2 => {
                            expect(console.log).toHaveBeenCalledWith('loaded seakim,WORKSPACE from cache');
                            expect(response2).toBe(response);
                            done();
                        });
                    subscription2.unsubscribe();
                });
            subscription.unsubscribe();
        });

        it('Folder structure should return a folder at the root of the object', (done: any) => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(of({data: {data: '{"title":"MSC_Contributions","type":"favorite","favoriteId":83279}'}}));

            const subscription = service.getFavoriteFolderStructure$('proberts', 'WORKSPACE')
                .subscribe(response => {
                    expect(response.type).toBe(FavoriteConstants.FOLDER);
                    expect(response.children.length).toBe(1);
                    expect(response.children[0].title).toBe('MSC_Contributions');
                    done();
                });
            subscription.unsubscribe();
        });

        it('generateFavoriteTree$ - check async calls for PORTFOLIO_FOLDER scenario', fakeAsync(() => {
            favoriteServiceStub.getSlimFavorites$.mockReset();
            jest.spyOn(favoriteServiceStub, 'getSlimFavorites$')
                .mockReturnValueOnce(of([getSlimFavoriteResponse.portfolios[0]]))
                .mockReturnValueOnce(of([getSlimFavoriteResponse.portfolios[1]]))
                .mockReturnValueOnce(of([getSlimFavoriteResponse.portfolios[2]]))
                .mockReturnValueOnce(of([getSlimFavoriteResponse.portfolios[3]]))
                .mockReturnValueOnce(of([getSlimFavoriteResponse.portfolios[4]]));

            service.getFullFavoriteTreeData$('tushshar', 'WHATIF_POS', FavoriteConstants.PORTFOLIO_FOLDER, false)
                .subscribe(
                    () => {
                        expect(favoriteServiceStub.getSlimFavorites$.mock.calls[0].toString()).toBe('tushshar,WHATIF_RULES,Getting What-if Favorites,');
                        expect(favoriteServiceStub.getSlimFavorites$.mock.calls[1].toString()).toBe('tushshar,WHATIF_POS,Getting What-if Favorites,date');
                        expect(favoriteServiceStub.getSlimFavorites$.mock.calls[2].toString()).toBe('tushshar,ADHOC_PORT,Getting What-if Favorites,date');
                        expect(favoriteServiceStub.getSlimFavorites$.mock.calls[3].toString()).toBe('tushshar,ADHOC_PG,Getting What-if Favorites,');
                        expect(favoriteServiceStub.getSlimFavorites$.mock.calls[4].toString()).toBe('tushshar,adhocPortfolio,Getting What-if Favorites,date');
                    }
                );
            tick();
        }));
    });

    describe('FavoriteTreeService - checkFavoriteInTree', () => {
        let favService: FavoriteTreeService;

        beforeAll(() => {
            TestBed.configureTestingModule({
                providers: [
                    FavoriteTreeService,
                    { provide: Http2BmsService, useValue: httpServiceStub },
                    { provide: FavoriteService, useValue: favoriteServiceStub }
                ]
            });
            favService = TestBed.inject(FavoriteTreeService);
        });

        it('should return true if favoriteId is found in the tree', () => {
            const favoriteId = 123;
            const favoriteFolderItem = new FavoriteFolderItem({
                favoriteId: 123,
                type: 'folder',
                children: []
            });

            const result = service['checkFavoriteInTree'](favoriteFolderItem, favoriteId);
            expect(result).toBe(true);
        });

        it('should return false if favoriteId is not found in the tree', () => {
            const favoriteId = 123;
            const favoriteFolderItem = new FavoriteFolderItem({
                favoriteId: 456,
                type: 'folder',
                children: []
            });

            const result = service['checkFavoriteInTree'](favoriteFolderItem, favoriteId);
            expect(result).toBe(false);
        });

        it('should return true if favoriteId is found in nested children', () => {
            const favoriteId = 123;
            const favoriteFolderItem = new FavoriteFolderItem({
                favoriteId: 456,
                type: 'folder',
                children: [
                    new FavoriteFolderItem({
                        favoriteId: 789,
                        type: 'folder',
                        children: [
                            new FavoriteFolderItem({
                                favoriteId: 123,
                                type: 'folder',
                                children: []
                            })
                        ]
                    })
                ]
            });

            const result = service['checkFavoriteInTree'](favoriteFolderItem, favoriteId);
            expect(result).toBe(true);
        });

        it('should return false if favoriteId is not found in nested children', () => {
            const favoriteId = 123;
            const favoriteFolderItem = new FavoriteFolderItem({
                favoriteId: 456,
                type: 'folder',
                children: [
                    new FavoriteFolderItem({
                        favoriteId: 789,
                        type: 'folder',
                        children: [
                            new FavoriteFolderItem({
                                favoriteId: 101112,
                                type: 'folder',
                                children: []
                            })
                        ]
                    })
                ]
            });

            const result = service['checkFavoriteInTree'](favoriteFolderItem, favoriteId);
            expect(result).toBe(false);
        });
    });

    describe('checkFavoriteInFolderStructure$ Test', () => {
        it('should return true if favorite is found in the folder structure', (done: any) => {
            const favoriteId = 1517717;
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(of(getFavoriteResponse.workspaceFolder));

            const subscription = service.checkFavoriteInFolderStructure$('seakim', 'WORKSPACE', favoriteId)
                .subscribe((isFavoriteInFolder) => {
                    expect(isFavoriteInFolder).toBe(true);
                    done();
                });
            subscription.unsubscribe();
        });

        it('should return false if favorite is not found in the folder structure', (done: any) => {
            const favoriteId = 9999999; // Non-existent favorite ID
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(of(getFavoriteResponse.workspaceFolder));

            const subscription = service.checkFavoriteInFolderStructure$('seakim', 'WORKSPACE', favoriteId)
                .subscribe((isFavoriteInFolder) => {
                    expect(isFavoriteInFolder).toBe(false);
                    done();
                });
            subscription.unsubscribe();
        });

        it('should handle error', (done: any) => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(throwError('Failed to get favorite folder structure'));

            const subscription = service.checkFavoriteInFolderStructure$('seakim', 'WORKSPACE', 1517717)
                .subscribe(() => {
                }, error => {
                    expect(error).toBe('Failed to get favorite folder structure');
                    done();
                });
            subscription.unsubscribe();
        });
    });
});
