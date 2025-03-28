import {Injectable} from '@angular/core';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {WorkspaceStore} from '../../../stores';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {AppStore} from '../../../app.store';
import {FavoriteService} from '@services/favorite';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {FavoriteConstants} from '@constants/favorite.constants';
import {
    AbstractConfig,
    OptimizationScenarioDetailsParameters,
    TelemetryActionConstants,
    TelemetryLoadingOptimizationScenariosParameters,
    TelemetryOptimizationScenarioLoadingTypeEnum,
    TelemetryService
} from '@blk/explore-ui-core';
import {URLConstants} from '@constants/url.constants';
import {isEmpty} from 'lodash';
import {RiskParitySettings} from '@models/portfolio/optimization/risk-parity-settings.model';

@Injectable({
    providedIn: 'root'
})
export class OptimizationDataService {
    constructor(public appStore: AppStore, private favoriteService: FavoriteService) {}

    getPortfolioWithPositions$(): Observable<PortfolioWithPositions> {
        return WorkspaceStore.getCurrentPortfolio$().pipe(
            map((portfolio: Portfolio) => {
                if (portfolio instanceof PortfolioWithPositions) {
                    return portfolio;
                }
                return undefined;
            })
        );
    }

    restoreDefaultOptimizationSettings(): void {
        const portfolio: PortfolioWithPositions = this.getCurrentPortfolio();
        portfolio.optimizationSettings.clear();
        portfolio.updateOptimizationSettings();
        this.updateCurrentPortfolio(portfolio);
    }

    loadOptimizationSettings$(loadForRiskParity?: boolean): Observable<OptimizationSettings | RiskParitySettings> {
        return this.showLoadOptimizationSettingsModal$(loadForRiskParity).pipe(
            switchMap(([favoriteId, loadingMessage]: [number, string]) => this.loadFavorite$(favoriteId, loadingMessage)),
            take(1),
            tap((settings: OptimizationSettings | RiskParitySettings) => {
                const loadedOptimizationScenarioParameters = new OptimizationScenarioDetailsParameters(settings.title, TelemetryOptimizationScenarioLoadingTypeEnum.LOADING_TYPE_USER_DEFINED);
                TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.LOAD_OPTIMIZATION_SCENARIOS, new TelemetryLoadingOptimizationScenariosParameters({loadedOptimizationScenario: loadedOptimizationScenarioParameters}));
                loadForRiskParity ? this.updateRiskParitySettings(settings as RiskParitySettings) : this.updateOptimizationSettings(settings as OptimizationSettings);
            })
        );
    }

    /**
     * load favorite optimization settings
     */
    loadFavoriteOptimzationSettings(reportId: number|string, loadingMessage: string, forceRefresh?: boolean, isGlobalFavorite?: boolean): void {
        this.favoriteService.getFavorite$(reportId, loadingMessage, isGlobalFavorite, forceRefresh)
            .subscribe(optimizationSettings => {
                const loadedOptimizationScenarioParameters = new OptimizationScenarioDetailsParameters((optimizationSettings as OptimizationSettings).title, TelemetryOptimizationScenarioLoadingTypeEnum.LOADING_TYPE_PRE_CANNED);
                TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.LOAD_OPTIMIZATION_SCENARIOS, new TelemetryLoadingOptimizationScenariosParameters({loadedOptimizationScenario: loadedOptimizationScenarioParameters}));
                this.updateOptimizationSettings(optimizationSettings as OptimizationSettings);
            });
    }

    saveOptimizationSettings(): void {
        this.appStore.saveFavoriteAction$.next(
            new SaveFavoriteAction(
                this.getCurrentPortfolio().optimizationSettings,
                FavoriteConstants.OPTO_SETTINGS_PASCAL,
                FavoriteConstants.OPTO_SETTINGS,
                FavoriteConstants.OPTO_SETTINGS_FOLDER
            ));
    }

    private showLoadOptimizationSettingsModal$(loadForRiskParity?: boolean): Observable<[number, string]> {
        const loadFavorite$: Subject<[number, string]> = new ReplaySubject(1);
        this.appStore.openLoadFavoriteModal$.next(
            new LoadFavoriteAction({
                type: loadForRiskParity ? FavoriteConstants.RISK_PARITY_SETTINGS : FavoriteConstants.OPTO_SETTINGS,
                treeType: loadForRiskParity ? FavoriteConstants.RISK_PARITY_SETTINGS_FOLDER : FavoriteConstants.OPTO_SETTINGS_FOLDER,
                displayName: loadForRiskParity ? FavoriteConstants.RISK_PARITY_SETTINGS_PASCAL : FavoriteConstants.OPTO_SETTINGS_PASCAL,
                callback: (favoriteId: number, loadingMessage: string) => loadFavorite$.next([favoriteId, loadingMessage]),
                headerDisplayName: loadForRiskParity ? FavoriteConstants.RISK_PARITY_SETTINGS_PASCAL : FavoriteConstants.OPTO_SETTINGS_PASCAL,
                ignoreEnterpriseTree: true
            }));
        return loadFavorite$;
    }

    private updateOptimizationSettings(optimizationSettings: OptimizationSettings): void {
        const portfolio: PortfolioWithPositions = this.getCurrentPortfolio();
        portfolio.optimizationSettings = optimizationSettings;
        // set investment universe settings to default if either portfolio or benchmark don't match the saved ones
        const invUni = portfolio?.optimizationSettings?.investmentUniverseSettings?.investmentUniverse;
        if (!isEmpty(invUni) && (portfolio.portName !== invUni[0][URLConstants.PORTFOLIO]  || portfolio.benchmark.name !== invUni[1][URLConstants.PORTFOLIO])) {
            portfolio.optimizationSettings.investmentUniverseSettings.investmentUniverse = [];
        }
        this.updateCurrentPortfolio(portfolio);
    }

    /**
     * updates risk parity settings
     */
    public updateRiskParitySettings(settings: RiskParitySettings): void {
        const portfolio: PortfolioWithPositions = this.getCurrentPortfolio();
        portfolio.riskParitySettings = new RiskParitySettings(settings);
        this.updateCurrentPortfolio(portfolio);
    }

    private loadFavorite$(favoriteId: number, loadingMessage: string): Observable<OptimizationSettings> {
        return this.favoriteService.getFavorite$(favoriteId, loadingMessage)
            .pipe(
                map((optimizationSettings: AbstractConfig) => optimizationSettings as OptimizationSettings));
    }

    private getCurrentPortfolio(): PortfolioWithPositions {
        // must be PortfolioWithPositions
        return WorkspaceStore.getCurrentPortfolio() as PortfolioWithPositions;
    }

    private updateCurrentPortfolio(portfolio: PortfolioWithPositions): void {
        WorkspaceStore.updateCurrentPortfolio(portfolio);
    }
}
