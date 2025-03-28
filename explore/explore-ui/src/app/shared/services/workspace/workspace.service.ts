import {Injectable} from '@angular/core';

import {Workspace} from '@models/workspace/workspace.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {FavoriteService} from '../favorite';
import {WorkpadService} from './workpad.service';
import {WorkspaceStore} from '../../../stores';
import {NotificationService} from '@services/notification';
import {
    AlertConstants,
    DateService,
    ErrorTypeConstants,
    ExploreDialogParam,
    UIErrorParameters
} from '@blk/explore-ui-core';
import moment from 'moment';
import {isEmpty, isNil} from 'lodash';
import {Report} from '@models/workspace/report.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {PortfolioService} from '@services/portfolio';

/**
 * WorkspaceService
 */
@Injectable({
    providedIn: 'root'
})
export class WorkspaceService {
    constructor(private favoriteService: FavoriteService, private workpadService: WorkpadService, private notificationService: NotificationService, private dateService: DateService, private portfolioService: PortfolioService) {
        this.reloadAtMidnight();
    }

    /**
     * Reload Banner that appears at midnight to refresh the data
     */
    reloadAtMidnight(): void {
        const now = new Date();
        // Pick a random minute to reload so we don't overload the servers all at the same time
        // Anywhere between 5 - 35 minutes (00:05:00 - 00:35:00)
        const randomMinute = Math.floor(Math.random() * 31 + 5);
        // Date object for next day (we want the reload button to appear between 12:05am - 12:35am)
        const resetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, randomMinute, 0);
        // MilliSeconds to midnight. Time at which the reload button should appear i.e 12:05 am.
        const msToMidnight = resetTime.getTime() - now.getTime();

        setTimeout(() => {
            // To be executed at midnight
            this.refreshWorkspaceDates();
            // reset the time again next midnight.
            this.reloadAtMidnight();
        }, msToMidnight);
    }

    /**
     * Refresh dates of all portfolios with a relative date in a workspace
     */
    refreshWorkspaceDates(): void {
        // Trigger midNightRefresh$ to update datePicker component maxDate.
        this.dateService.midNightRefresh$.next();

        for (const workpad of WorkspaceStore.getWorkspace().workpads) {
            for (const portfolio of workpad.getAllPortfolios()) {
                // If the date is a relative date (ex: T-1), then we need to update it
                if (portfolio.datePicker.dateString) {
                    this.dateService.parseDateString$(portfolio.datePicker.calCode, portfolio.datePicker.dateStringValue)
                        .subscribe((newDate: Date) => {
                            portfolio.datePicker.setMoment(moment(newDate));
                            this.workpadService.updatePortInfoOnDateChange([portfolio], portfolio.datePicker, workpad, true);
                        });
                }
                portfolio.publishStateWrapperSubject$.getValue().isNullQC = true;
                portfolio.publishStateWrapperSubject$.getValue().publishedStateResults.splice(0);
            }
        }
        // Provide a notification in report presenter with a reload button.
        this.notificationService.invokeWidgetReloadPrompt();
    }

    /**
     * initialize workspace with flatWorkpad
     */
    initializeWorkspaceFromIntro(portfolio: Portfolio): void {
        const newFlatWorkpad = this.workpadService.createFlatWorkpad(portfolio);
        WorkspaceStore.addWorkpads(newFlatWorkpad);
        WorkspaceStore.updateWorkspace(WorkspaceStore.getWorkspace());
    }

    /**
     * load favorite workspace
     * this function is used as callback so need arrow to get the right scope
     * this is one time event so promise.then pattern would be better to use than observable.subscribe pattern so we don't have to deal with unsubscription.
     */
    loadFavoriteWorkspace = (workspaceId: number|string, loadingMessage: string, forceRefresh?: boolean, isGlobalFavorite?: boolean): void => {
        this.loadFavoriteWorkspaceVersion(workspaceId, loadingMessage, forceRefresh, isGlobalFavorite);
    };

    /**
     * load favorite workspace
     * this function is used as callback so need arrow to get the right scope
     * this is one time event so promise.then pattern would be better to use than observable.subscribe pattern so we don't have to deal with unsubscription.
     */
    loadFavoriteWorkspaceVersion = (workspaceId: number|string, loadingMessage: string, forceRefresh?: boolean, isGlobalFavorite?: boolean, versionId?: string): void => {
        this.favoriteService.getFavorite$(workspaceId, loadingMessage, isGlobalFavorite, forceRefresh, versionId)
            .subscribe((workspace: Workspace) => {
                if (isNil(workspace) || isEmpty(workspace.workpads)) {
                    this.notificationService.warning(AlertConstants.BODY.WORKSPACE_NOT_EXIST, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_WARNING, true);
                    // this is done to show intro page
                    WorkspaceStore.updateCurrentPortfolio(undefined);
                    WorkspaceStore.newWorkspace();
                } else {
                    this.initializeWorkspaceFromFavorite(workspace);
                }
            }, error => {
                console.error(error);
                if (error?.status === 'FAILURE' && error?.message?.startsWith('ABORTED:') ) {
                    this.notificationService.warning(error?.message ? error?.message : AlertConstants.BODY.WORKSPACE_LOAD_ERROR, ErrorTypeConstants.BACK_END_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_WARNING, true);
                } else if (error?.status === 'FAILURE') {
                    this.notificationService.warning(AlertConstants.BODY.WORKSPACE_LOAD_ERROR, ErrorTypeConstants.BACK_END_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_WARNING, true);
                } else {
                    this.notificationService.warning(AlertConstants.BODY.BROKEN_WORKSPACE_FORMAT, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_WARNING, true);
                }
                // this is done to show intro page
                WorkspaceStore.updateCurrentPortfolio(undefined);
                WorkspaceStore.newWorkspace();
            });
    };

    /**
     * initialize workspace from favorite
     */
    private initializeWorkspaceFromFavorite(workspace: Workspace): void {
        // fetch portfolio(s) of the first workpad and initialize the workspace
        this.workpadService.fetchAllPortfolios$(workspace.workpads[0])
            .subscribe((response: Portfolio[]) => {
                    if (isEmpty(response)) {
                        this.notificationService.warning(AlertConstants.BODY.BROKEN_WORKSPACE_FORMAT, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_FETCH_ALL_PORTFOLIOS_WARNING, true);
                        // this is done to show intro page
                        WorkspaceStore.updateCurrentPortfolio(undefined);
                        WorkspaceStore.newWorkspace();
                    } else {
                        workspace.workpads[0].replacePortfolios(response);
                        WorkspaceStore.updateWorkspace(workspace);
                    }
                },
                (error) => {
                    WorkspaceStore.updateCurrentWorkpad(workspace.workpads[0]);
                    WorkspaceStore.workspace$.next(workspace);
                    console.error('Fetch portfolio information error', error);
                    this.notificationService.openDialog(
                        new ExploreDialogParam(
                            AlertConstants.TYPE.ALERT,
                            AlertConstants.HEADER.PORT_INFO_MISSING,
                            AlertConstants.BODY.PORT_INFO_MISSING,
                            AlertConstants.BTN.OK
                        ));
                });
    }

    /**
     * load portfolio mentioned and create a workspace for it.
     */
    loadPortfolioAndCreateWorkspace(port: Portfolio) {
        this.portfolioService.fetchPortfolioInformation$(port, {isLightVersion: true, includeMandate: true})
            .subscribe((updatedPort: Portfolio) => {
                this.initializeWorkspaceFromIntro(updatedPort);

            }, (error) => {
                console.error('Fetch portfolio information error', error);
                this.notificationService.openDialog(
                    new ExploreDialogParam(
                        AlertConstants.TYPE.ALERT,
                        AlertConstants.HEADER.PORT_INFO_MISSING,
                        AlertConstants.BODY.PORT_INFO_MISSING,
                        AlertConstants.BTN.OK
                    ));
            });
    }

    /**
     * load favorite all the reports when report favorite reportIds are mentioned in the url.
     */
    loadFavoriteReportWithUrl(reportId: string[], portfolio: Portfolio, forceRefresh?: boolean, isGlobalLayout?: boolean): void {
        const newFlatWorkpad = new FlatWorkpad();
        newFlatWorkpad.addPortfolios(portfolio);
        WorkspaceStore.addWorkpads(newFlatWorkpad);

        reportId.forEach(x => this.favoriteService.getFavorite$(x, null, isGlobalLayout, forceRefresh)
            .subscribe((report: Report) => {
                newFlatWorkpad.addReports(report);
            }, error => {
                console.error(error);
            }));
        WorkspaceStore.updateWorkspace(WorkspaceStore.getWorkspace());
    }
}
