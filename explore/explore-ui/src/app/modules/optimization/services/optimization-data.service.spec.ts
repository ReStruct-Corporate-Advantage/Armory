import {TestBed} from '@angular/core/testing';
import {FavoriteConstants} from '@constants/favorite.constants';
import {OptimizationDataService} from './optimization-data.service';
import {WorkspaceStore} from '../../../stores';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {OptimizationConstants} from '@constants/optimization.constants';
import {AppStore} from '../../../app.store';
import {FavoriteService} from '@services/favorite';
import {of} from 'rxjs';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {CoreUserMetaDataStore, DateValue, UserMetaData} from '@blk/explore-ui-core';
import {InvestmentUniversePortfolio} from '@models/portfolio/investmentUniverse/investment-universe-portfolio.model';

describe('OptimizationDataService', () => {
    let service: OptimizationDataService;
    let appStore: AppStore;
    let favoriteService: FavoriteService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                OptimizationDataService,
                {
                    provide: AppStore,
                    useValue: {
                        saveFavoriteAction$: {
                            next: jest.fn()
                        },
                        openLoadFavoriteModal$: {
                            next: jest.fn()
                        }
                    }
                },
                {
                    provide: FavoriteService,
                    useValue: {
                        getFavorite$: jest.fn()
                    }
                }
            ]
        });

        service = TestBed.inject(OptimizationDataService);
        appStore = TestBed.inject(AppStore);
        favoriteService = TestBed.inject(FavoriteService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('should get portfolio with positions', () => {
        it('should return portfolio with positions if of correct type', (done: any) => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions('test');
            WorkspaceStore.init();
            WorkspaceStore.updateCurrentPortfolio(portfolio);
            service.getPortfolioWithPositions$().subscribe((portfolioWithPositions: PortfolioWithPositions) => {
                expect(portfolioWithPositions).toBe(portfolio);
                done();
            });
        });

        it('should return undefined if of wrong type', (done: any) => {
            const portfolio: Portfolio = new Portfolio('test');
            WorkspaceStore.init();
            WorkspaceStore.updateCurrentPortfolio(portfolio);
            service.getPortfolioWithPositions$().subscribe((portfolioWithPositions: PortfolioWithPositions) => {
                expect(portfolioWithPositions).toBeUndefined();
                done();
            });
        });
    });

    it('should restore default optimization settings', () => {
        const portfolio: PortfolioWithPositions = new PortfolioWithPositions('test');
        portfolio.optimizationSettings = new OptimizationSettings({
            objectiveSettings: {
                objectivesType: OptimizationConstants.ABSOLUTE_OBJECTIVE_TYPE
            }
        });
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentPortfolio(portfolio);

        service.restoreDefaultOptimizationSettings();
        const defaultOptimizationSettings: OptimizationSettings = new OptimizationSettings();
        defaultOptimizationSettings.clear();
        defaultOptimizationSettings.setDefaultObjective();
        expect((WorkspaceStore.getCurrentPortfolio() as PortfolioWithPositions).optimizationSettings).toEqual(defaultOptimizationSettings);
    });

    it('should load optimization settings', () => {
        const portfolio: PortfolioWithPositions = new PortfolioWithPositions('test', new DateValue());
        portfolio.optimizationSettings = new OptimizationSettings({
            objectiveSettings: {
                objectivesType: OptimizationConstants.ABSOLUTE_OBJECTIVE_TYPE
            }
        });
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentPortfolio(portfolio);
        const favId = 1;
        const loadingMessage = 'loading';
        const login = 'login';
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = login;
        const openModalSpy = jest.spyOn(appStore.openLoadFavoriteModal$, 'next');
        openModalSpy.mockImplementation((loadFavoriteAction: LoadFavoriteAction) => {
            loadFavoriteAction.callback(favId, loadingMessage, undefined, undefined);
        });
        const newOptimizationSettings: OptimizationSettings = new OptimizationSettings();
        const getFavoriteSpy = jest.spyOn(favoriteService, 'getFavorite$');
        getFavoriteSpy.mockReturnValue(of(newOptimizationSettings));

        let subsc = service.loadOptimizationSettings$().subscribe((optimizationSettings: OptimizationSettings) => {
            expect(optimizationSettings).toEqual(newOptimizationSettings);
        });
        subsc.unsubscribe();

        expect(openModalSpy).toHaveBeenCalledTimes(1);
        expect(openModalSpy).toHaveBeenCalledWith(new LoadFavoriteAction({
            type: FavoriteConstants.OPTO_SETTINGS,
            treeType: FavoriteConstants.OPTO_SETTINGS_FOLDER,
            displayName: FavoriteConstants.OPTO_SETTINGS_PASCAL,
            callback: expect.anything(),
            headerDisplayName: FavoriteConstants.OPTO_SETTINGS_PASCAL,
            ignoreEnterpriseTree: true
        }));
        expect(getFavoriteSpy).toHaveBeenCalledTimes(1);
        expect(getFavoriteSpy).toHaveBeenCalledWith(favId, loadingMessage);
        const expectedPortfolio: PortfolioWithPositions = new PortfolioWithPositions('test', new DateValue());
        expectedPortfolio.optimizationSettings = newOptimizationSettings;
        expectedPortfolio.portId = portfolio.portId;
        expect(WorkspaceStore.getCurrentPortfolio().equals(expectedPortfolio)).toBeTruthy();

        let investmentUniverse = [new InvestmentUniversePortfolio({'portfolio' : 'PEP'})];
        portfolio.optimizationSettings.investmentUniverseSettings.investmentUniverse = investmentUniverse;
        WorkspaceStore.updateCurrentPortfolio(portfolio);
        subsc = service.loadOptimizationSettings$().subscribe((optimizationSettings: OptimizationSettings) => {
            expect(optimizationSettings).toEqual(newOptimizationSettings);
        });
        subsc.unsubscribe();

        investmentUniverse = [new InvestmentUniversePortfolio({'portfolio' : 'test'}), new InvestmentUniversePortfolio({'portfolio' : 'MSAC_APACN'})];
        portfolio.optimizationSettings.investmentUniverseSettings.investmentUniverse = investmentUniverse;
        WorkspaceStore.updateCurrentPortfolio(portfolio);

        subsc = service.loadOptimizationSettings$().subscribe((optimizationSettings: OptimizationSettings) => {
            expect(optimizationSettings.investmentUniverseSettings.investmentUniverse).toEqual(investmentUniverse);
        });
        subsc.unsubscribe();

        investmentUniverse = [new InvestmentUniversePortfolio({'portfolio' : 'test'}), new InvestmentUniversePortfolio({'portfolio' : 'bench'})];
        portfolio.optimizationSettings.investmentUniverseSettings.investmentUniverse = investmentUniverse;
        WorkspaceStore.updateCurrentPortfolio(portfolio);
        subsc = service.loadOptimizationSettings$().subscribe((optimizationSettings: OptimizationSettings) => {
            expect(optimizationSettings.investmentUniverseSettings.investmentUniverse).toEqual([]);
        });
        subsc.unsubscribe();
    });

    it('should save optimization settings', () => {
        const portfolio: PortfolioWithPositions = new PortfolioWithPositions('test');
        const optimizationSettings: OptimizationSettings = new OptimizationSettings({
            objectiveSettings: {
                objectivesType: OptimizationConstants.ABSOLUTE_OBJECTIVE_TYPE
            }
        });
        portfolio.optimizationSettings = optimizationSettings;
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentPortfolio(portfolio);
        const saveFavoriteSpy = jest.spyOn(appStore.saveFavoriteAction$, 'next');

        service.saveOptimizationSettings();
        expect(saveFavoriteSpy).toHaveBeenCalledTimes(1);
        expect(saveFavoriteSpy).toHaveBeenCalledWith(new SaveFavoriteAction(
            optimizationSettings,
            FavoriteConstants.OPTO_SETTINGS_PASCAL,
            FavoriteConstants.OPTO_SETTINGS,
            FavoriteConstants.OPTO_SETTINGS_FOLDER
        ));
    });
});
