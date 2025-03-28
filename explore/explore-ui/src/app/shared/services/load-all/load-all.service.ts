import {Injectable} from '@angular/core';
import {LoadAllRequestQueue} from '@models/load-all/load-all-request-queue.model';
import {LoadAllTracker} from '@models/load-all/load-all-tracker.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {Widget} from '@models/widget/widget.model';
import {LoadAllDataRequest} from '@models/load-all/load-all-data-request.model';
import {forkJoin, Observable, of, Subject} from 'rxjs';
import {Workspace} from '@models/workspace/workspace.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {PortfolioService} from '@services/portfolio/portfolio.service';
import {WidgetServiceRegistry} from '@services/widget/widget-service-registry';
import {WorkspaceStore} from '@stores/workspace.store';
import {AppStore} from '../../../app.store';

/**
 * LoadAll Service
 */
@Injectable({
    providedIn: 'root'
})
export class LoadAllService {
    // Flag to check if loadAll is in progress
    static loadAllInProgress = false;
    private static loadAllRequestQueue: LoadAllRequestQueue;
    // keeps in check the percentage of workspace loaded
    workspacePercentLoaded$ = new Subject<string>();


    /**
     * Constructor
     */
    constructor(private portfolioService: PortfolioService, private widgetServiceRegistry: WidgetServiceRegistry) {
        LoadAllService.loadAllRequestQueue = new LoadAllRequestQueue();
        AppStore.loadAllRequestSubject$
            .subscribe(({widget, port}) => {
                // Don't do anything if load all isn't currently in progress
                if (!LoadAllService.loadAllInProgress) {
                    return;
                }
                this.loadAllRequestCompletedCallback(widget, port);
                // used to update workspace percentage loaded in the sidebar
                this.workspacePercentLoaded$.next(' (' + this.getCompletionPercentage().toFixed() + '%)');
            });
    }

    /**
     * 1. initiate LoadAll Process
     */
    initiateLoadAllProcess(workspace: Workspace): void {
        LoadAllService.loadAllRequestQueue = new LoadAllRequestQueue();
        LoadAllService.loadAllInProgress = true;
        this.addRequestsToUnprocessedQueue$(workspace).subscribe((portfolios: Portfolio[]) => {
            if (portfolios.length === 0) {
                LoadAllService.loadAllInProgress = false;
                return;
            }
            this.moveTheRequestsToInProgress();
        });
    }

    /**
     * 2. add Requests to UnprocessedQueue
     */
    private addRequestsToUnprocessedQueue$(workspace: Workspace): Observable<Portfolio[]> {
        const observableQueue = new Array<Observable<Portfolio>>();
        workspace.workpads.forEach((workpad: BaseWorkpad) => {
            workpad.getAllPortfolios().forEach((portfolio: Portfolio) => {
                if (portfolio.lookthroughSettings && portfolio.lookthroughSettings.isAnyLookthroughEnabled()) {
                    // Skip adding requests for portfolios with lookthrough enabled
                    console.log('portfolio has LT enabled so skipping adding them to request');
                    return;
                }
                portfolio.loadAllTracker = new LoadAllTracker();

                // disableLoading when fetching portfolio info
                observableQueue.push(this.portfolioService.fetchPortfolioInformation$(portfolio, { isLightVersion: false, includeMandate: true }, true));

                workpad.reports.forEach((report: Report) => {
                    // skip the current report from load all
                    if (workpad === WorkspaceStore.getCurrentWorkpad() && report === WorkspaceStore.getCurrentReport() && portfolio === WorkspaceStore.getCurrentPortfolio()) {
                        return;
                    }
                    // update loading status of each portfolio in the workspace
                    WorkspaceStore.portfolioLoadingStatusMap.get(portfolio.portId).next({isLoading: true, loadingPercent: '(0%)'});

                    let workpadPortfolios;
                    // If the report has comparison mode on, then we need to grab the actual portfolio models from the workpad
                    if (WorkspaceStore.getCurrentWorkpad().isCompareMode(report.comparisonConfigId)) {
                        workpadPortfolios = workpad.getAllPortfolios();
                    }
                    report.widgets.forEach((widget: Widget) => {
                        LoadAllService.loadAllRequestQueue.unprocessedRequestQueue.push(
                            new LoadAllDataRequest(portfolio, report, widget, workpadPortfolios)
                        );
                        LoadAllService.loadAllRequestQueue.loadAllTracker.addRequestToTracker();
                        portfolio.loadAllTracker.addRequestToTracker();
                    });
                });
            });
        });

        // If there are no widget requests, then just get out of here
        if (LoadAllService.loadAllRequestQueue.unprocessedRequestQueue.length === 0) {
            console.log('There were no widget requests generated as a part of run all reports');
            return of([]);
        }
        return forkJoin(observableQueue);
    }

    /**
     * 3. move the Requests to InProgress
     */
    private moveTheRequestsToInProgress(): void {
        while (
            LoadAllService.loadAllRequestQueue.unprocessedRequestQueue.length &&
            LoadAllService.loadAllRequestQueue.loadAllTracker.inProgressRequestCounter < LoadAllService.loadAllRequestQueue.requestLimit
        ) {
            const queuedRequest = LoadAllService.loadAllRequestQueue.getAndMoveRequestToInProgress();
            this.processInProgressRequest(queuedRequest);
        }
    }

    /**
     * 4. process InProgress Request when we move the queued requests to InProgress
     */
    private processInProgressRequest(queuedRequest: LoadAllDataRequest): void {
        LoadAllService.loadAllRequestQueue.inProgressRequests.push(queuedRequest);
        const widgetDataService = this.widgetServiceRegistry.getService(queuedRequest.widget.configType);
        if (widgetDataService) {
            // add the flag param to omit data return
            widgetDataService.extractDataAndStore({
                widget: queuedRequest.widget,
                portfolio: queuedRequest.portfolio,
                report: queuedRequest.report,
                allPortfolios: queuedRequest.workpadPortfolios,
                omitData: true
            });
        } else {
            // For the spritelets such as praBar and praPie, there is no service for them, nor need to make a new request.
            // Just proceed the load all.
            AppStore.loadAllRequestSubject$.next({widget: queuedRequest.widget, port: queuedRequest.portfolio});
        }
    }

    /**
     * Callback when the load all request is completed
     */
    private loadAllRequestCompletedCallback(widget: Widget, portfolio: Portfolio): void {
        this.updateInProgressQueue(widget, portfolio);

        const portfolioCompletionPercentage = portfolio.loadAllTracker.getStringCompletionPercentage();
        console.log(`percentage of portfolio ${portfolio.portName} loaded` + portfolioCompletionPercentage);
        // update each portfolio's loading status if it finishes loading
        if (portfolio.loadAllTracker.isLoadAllInProgress()) {
            // else update the portfolio loading status
            WorkspaceStore.portfolioLoadingStatusMap.get(portfolio.portId).next({loadingPercent: portfolioCompletionPercentage});
        } else {
            WorkspaceStore.portfolioLoadingStatusMap.get(portfolio.portId).next({isLoading: false});
        }
        console.log(`Completion Percentage: ${this.getCompletionPercentage()}%`);
        // Set the loadAllInProgress flag to be false once we are fully completed
        if (this.getCompletionPercentage() === 100) {
            LoadAllService.loadAllInProgress = false;
            // Reset the tracker count when done
            LoadAllService.loadAllRequestQueue.loadAllTracker.resetTotalRequestCount();
            portfolio.loadAllTracker.resetTotalRequestCount();
            console.log('Load all is complete!');
        }
        this.moveTheRequestsToInProgress();
    }

    /**
     * Update in progress queue
     */
    private updateInProgressQueue(widget: Widget, portfolio: Portfolio): void {
        // remove the request from in progress queue
        const requestIndex = LoadAllService.loadAllRequestQueue.inProgressRequests.findIndex(inProgressRequest => {
            return inProgressRequest.portfolio.portId === portfolio.portId
                && inProgressRequest.widget.id === widget.id;
        });
        if (requestIndex !== -1) {
            LoadAllService.loadAllRequestQueue.inProgressRequests.splice(requestIndex, 1);

            // update the in progress counter
            LoadAllService.loadAllRequestQueue.loadAllTracker.decrementInProgressRequestCounter();
            portfolio.loadAllTracker.decrementInProgressRequestCounter();
        }
    }

    /**
     * Gets the Completion rate in Percentage
     */
    private getCompletionPercentage(): number {
        return LoadAllService.loadAllRequestQueue && LoadAllService.loadAllRequestQueue.loadAllTracker
            ? LoadAllService.loadAllRequestQueue.loadAllTracker.getCompletionPercentage()
            : 0;
    }
}
