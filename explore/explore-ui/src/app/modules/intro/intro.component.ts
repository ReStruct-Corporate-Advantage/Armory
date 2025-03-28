import {Component, OnInit} from '@angular/core';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {FavoriteConstants} from '@constants/favorite.constants';
import {ExplorePortfolioSearchService} from '@services/explore-portfolio-search/explore-portfolio-search.service';
import {PortfolioService} from '@services/portfolio';
import {WorkspaceService} from '@services/workspace';
import {
    AddPortfolioTrackingParameters,
    AddPortSource,
    CalendarDateUtils,
    DateValue,
    SubscribableComponent,
    TelemetryActionConstants,
    TelemetryService
} from '@blk/explore-ui-core';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {ModalStateActionInfo} from '@models/favorite/modal-state-action-info.interface';
import {ModalStateAction} from '@models/favorite/modal-state-action.enum';

/**
 * Intro Component
 *
 * @example
 *  <ng-container *ngIf="showIntro; else showMain">
 *      <app-intro></app-intro>
 *  </ng-container>
 */
@Component({
    selector: 'app-intro',
    templateUrl: './intro.component.html',
    styleUrls: ['./intro.component.scss']
})
export class IntroComponent extends SubscribableComponent implements OnInit {

    /** variables for saving/loading favorites */
    readonly favType = FavoriteConstants.WORKSPACE;
    readonly favTreeType = FavoriteConstants.WORKSPACE_FOLDER;
    readonly favDisplayName = FavoriteConstants.WORKSPACE_PASCAL;
    loadFavoriteCallBack: Function;
    /* copy enum to allow usage in template */
    readonly addPortSourceEnum = AddPortSource.INTRO_SCREEN;
    readonly PORTFOLIO: string = 'Portfolio';

    whatIfMode = false;
    loadFavAction: LoadFavoriteAction;

    constructor(public portfolioSearchService: ExplorePortfolioSearchService, private portfolioService: PortfolioService, private workspaceService: WorkspaceService) {
        super();
    }

    ngOnInit(): void {
        this.loadFavoriteCallBack = this.workspaceService.loadFavoriteWorkspace;
    }

    /**
     * Event handler for emitPortfolio event
     */
    onAddPortfolio = (portfolioSearchItem: PortfolioSearchItem): void => {
        if (portfolioSearchItem === null) {
            return;
        }
        this.loadPortInfoAndCreateWorkspace(PortfolioService.getPortfolioObject(portfolioSearchItem));
    };

    /**
     * Track portfolio with Telemetry
     */
    trackPortfolioTelemetry(portfolioSearchItem: PortfolioSearchItem): void {
        const dateObjectToUse: DateValue = CalendarDateUtils.getDefaultDateObject();
        const portfolioTrackingParams = new AddPortfolioTrackingParameters(
            portfolioSearchItem.ticker,
            dateObjectToUse.date,
            portfolioSearchItem.type === this.PORTFOLIO ? 1 : 0,
            this.addPortSourceEnum);
        TelemetryService.track(
            TelemetryActionConstants.PORTFOLIO.ADD_PORTFOLIO,
            portfolioTrackingParams
            );

    }

    /**
     * Function to make a service call and fetch portfolio info
     */
    loadPortInfoAndCreateWorkspace(port: Portfolio): void {
        this.workspaceService.loadPortfolioAndCreateWorkspace(port);
    }

    /**
     * handle what if mode / port search mode switching
     */
    switchToWhatIfMode(event?: boolean | ModalStateActionInfo): void {
        if (event?.['reason'] === ModalStateAction.MODAL_CANCELED) {
            this.whatIfMode = false;
        } else {
            this.loadFavAction = this.portfolioSearchService.enableWhatIfSearch(this.onAddPortfolio);
            this.whatIfMode = true;
        }
    }
}
