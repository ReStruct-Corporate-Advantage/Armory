import {CoreWidgetConfigStore, DateStore, FavoriteConfigParameters, TelemetryActionConstants, TelemetryService} from '@blk/explore-ui-core';
import {FavoriteConstants} from '@constants/favorite.constants';
import {PortfolioLoadingStatus} from '@interfaces/portfolio-loading-status.interface';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {Widget} from '@models/widget/widget.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Report} from '@models/workspace/report.model';
import {Workspace} from '@models/workspace/workspace.model';
import {WorkspaceUtils} from '@utils/workspace.utils';
import {isNumber} from 'lodash';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {LongRunningHandlerService} from '@services/long-running-operations/long-running-handler.service';

/**
 * WorkspaceStore to contain workspace state and the state management logic
 */
export class WorkspaceStore {
    // Workspace subjects - These include the objects that the app uses
    static currentWorkpad$: BehaviorSubject<BaseWorkpad>;
    static currentReport$: BehaviorSubject<Report>;
    static currentPortfolio$: BehaviorSubject<Portfolio>;
    static workspace$: BehaviorSubject<Workspace>;
    static widgetLoadingStatusMap = new Map<number, BehaviorSubject<boolean>>();
    // map of portfolio's loading status for load all
    static portfolioLoadingStatusMap = new Map<string, BehaviorSubject<PortfolioLoadingStatus>>();
    // workpadValidation$ to check if all the required portfolio info are fetched before updating workpad
    static workpadValidation$ = new Subject<{ workspace: Workspace, currentWorkpad: BaseWorkpad, currentPortfolio: Portfolio, currentReport: Report, reloadReport?: boolean }>();

    static currentWidget$: BehaviorSubject<Widget> = new BehaviorSubject<Widget>(undefined);

    /**
     * get workspace observable
     */
    static getWorkspace$(): Observable<Workspace> {
        return WorkspaceStore.workspace$;
    }

    /**
     * get current Workpad observable
     */
    static getCurrentWorkpad$(): Observable<BaseWorkpad> {
        return WorkspaceStore.currentWorkpad$;
    }

    /**
     * get current Report observable
     */
    static getCurrentReport$(): Observable<Report> {
        return WorkspaceStore.currentReport$;
    }

    /**
     * get current Portfolio observable
     */
    static getCurrentPortfolio$(): Observable<Portfolio> {
        return WorkspaceStore.currentPortfolio$;
    }

    /**
     * get current Widget observable (lifespan is for the duration widget settings is open)
     */
    static getCurrentWidget$(): Observable<Widget> {
        return WorkspaceStore.currentWidget$;
    }

    /**
     * get workspace
     */
    static getWorkspace(): Workspace {
        return WorkspaceStore.workspace$.getValue();
    }

    /**
     * get current Workpad
     */
    static getCurrentWorkpad(): BaseWorkpad {
        return WorkspaceStore.currentWorkpad$.getValue();
    }

    /**
     * get current Report
     */
    static getCurrentReport(): Report {
        return WorkspaceStore.currentReport$.getValue();
    }

    /**
     * get current Portfolio observable
     */
    static getCurrentPortfolio(): Portfolio {
        return WorkspaceStore.currentPortfolio$.getValue();
    }

    /**
     * get current Widget (lifespan is for the duration widget settings is open)
     */
    static getCurrentWidget(): any {
        return WorkspaceStore.currentWidget$.getValue();
    }

    static getReportFromCurrentWorkpad(reportKey: number): Report {
        const selectedReport = WorkspaceStore.getCurrentWorkpad().reports.find(report => report.key === reportKey);

        // Theoretically below condition should never happen
        if (!selectedReport) {
            console.error('reportKey does not exist in current workpad');
            return WorkspaceStore.getCurrentReport();
        }
        return selectedReport;
    }

    /**
     * initialize the Workspace store with default values
     */
    static init(): void {
        WorkspaceStore.workspace$ = new BehaviorSubject<Workspace>(new Workspace());
        WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(undefined);
        WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(undefined);
        WorkspaceStore.currentReport$ = new BehaviorSubject<Report>(undefined);
        WorkspaceStore.currentWidget$ = new BehaviorSubject<Widget>(undefined);
    }

    /**
     * set new workspace
     */
    static newWorkspace(): void {
        // Remove and cancel all long-running requests from the previous workspace
        LongRunningHandlerService.removeAllLongRunningRequests();
        WorkspaceStore.updateWorkspace(new Workspace());
    }

    /**
     * Update workspace
     * update currentWorkpad if NOT NULL (if undefined, default to the first one)
     */
    static updateWorkspace(workspace?: Workspace, currentWorkpad?: BaseWorkpad): void {
        // if workspace is not passed, update current workspace only
        if (!workspace) {
            workspace = WorkspaceStore.getWorkspace();
            currentWorkpad = null;
        }

        if (currentWorkpad !== null) {
            currentWorkpad = currentWorkpad || (workspace && workspace.workpads && workspace.workpads.length ? workspace.workpads[0] : undefined);
        }

        WorkspaceStore.validateWorkpadAndUpdate(currentWorkpad, undefined, undefined, workspace);
    }

    /**
     * Update Workspace after saving the workspace.
     */
    static refreshWorkspace(): void {
        WorkspaceStore.workspace$.next(WorkspaceStore.getWorkspace());
    }

    /**
     * Update Workspace after saving the workspace.
     */
    static refreshCurrentWorkpad(): void {
        WorkspaceStore.currentWorkpad$.next(WorkspaceStore.getCurrentWorkpad());
    }

    /**
     * Validate workpad (if all required portfolios info are fetched) and update accordingly
     */
    static validateWorkpadAndUpdate(currentWorkpad: BaseWorkpad, currentPortfolio?: Portfolio, currentReport?: Report, workspace?: Workspace, reloadReport?: boolean): void {
        WorkspaceStore.workpadValidation$.next({
            workspace,
            currentWorkpad,
            currentPortfolio,
            currentReport,
            reloadReport
        });
    }

    /**
     * Update current workpad
     * update currentPortfolio and currentReport if NOT NULL (if undefined, default to the first one)
     */
    static updateCurrentWorkpad(currentWorkpad: BaseWorkpad, currentPortfolio?: Portfolio, currentReport?: Report): void {
        // if no currentWorkpad, then we want to reset the children
        if (!currentWorkpad) {
            WorkspaceStore.updateCurrentReport(undefined);
            WorkspaceStore.updateCurrentPortfolio(undefined);
            WorkspaceStore.currentWorkpad$.next(undefined);
            return;
        }

        // checking !null to handle cases that we don't want to update currentPortfolio
        if (currentPortfolio !== null) {
            if (currentWorkpad instanceof FlatWorkpad) {
                currentPortfolio = currentPortfolio || currentWorkpad.portfolio;
            } else if (currentWorkpad instanceof ReportGroup) {
                currentPortfolio = currentPortfolio || (currentWorkpad.portfolios && currentWorkpad.portfolios.length ? currentWorkpad.portfolios[0] : undefined);
            }
            WorkspaceStore.updateCurrentPortfolio(currentPortfolio);
        }
        WorkspaceStore.currentWorkpad$.next(currentWorkpad);
        // checking !null to handle cases that we don't want to update currentReport
        if (currentReport !== null) {
            currentReport = currentReport || (currentWorkpad.activeReport ? currentWorkpad.activeReport : (currentWorkpad.reports && currentWorkpad.reports.length ? currentWorkpad.reports[0] : undefined));

            // update current report only if exists (before curated report workpad doesn't have report)
            if (currentReport) {
                WorkspaceStore.updateCurrentReport(currentReport);
            }
        }
    }

    /**
     * Update current portfolio
     */
    static updateCurrentPortfolio(currentPortfolio: Portfolio): void {
        WorkspaceStore.currentPortfolio$.next(currentPortfolio);
        if (currentPortfolio) {
            DateStore.updateCurrentDate(currentPortfolio.datePicker);
        }
    }

    /**
     * update current report
     */
    static updateCurrentReport(reportToUpdate: Report | number): void {
        // if report key was passed in, then find the report from the current workpad's reports
        if (isNumber(reportToUpdate)) {
            reportToUpdate = WorkspaceStore.getReportFromCurrentWorkpad(reportToUpdate);
        }
        WorkspaceStore.currentReport$.next(reportToUpdate);
        // track report on telemetry
        this.trackFavoriteReportConfigTelemetry(reportToUpdate);
        // update activeReport of currentWorkpad
        const currentWorkpad = WorkspaceStore.getCurrentWorkpad();
        if (currentWorkpad) {
            currentWorkpad.activeReport = reportToUpdate;
        }
        WorkspaceStore.updateCurrentWidget(undefined);
    }

    /**
     * Track report with Telemetry
     */
    static trackFavoriteReportConfigTelemetry(report: Report): void {
        if (report && report.widgets && report.widgets.length > 0) {
            const id = report.id ? report.id : report.key;
            const owner = report.owner ? report.owner : '_ADMIN';
            const favoriteConfigParameters = new FavoriteConfigParameters(id, FavoriteConstants.REPORT.toString(), report.title, owner);
            TelemetryService.track(
                TelemetryActionConstants.FAVORITE.LOAD_FAVORITE,
                favoriteConfigParameters
            );
        }
    }

    /**
     * update current widget (to be updated to undefined as soon as widget settings are closed)
     */
    static updateCurrentWidget(widgetToUpdate: Widget): void {
        WorkspaceStore.currentWidget$.next(widgetToUpdate);
        if (widgetToUpdate) {
            CoreWidgetConfigStore.updateCurrentWidgetConfigType(widgetToUpdate.configType);
        }
    }

    /**
     * Add ONE or MANY workpads
     */
    static addWorkpads(workpadsToAdd: BaseWorkpad | BaseWorkpad[]): void {
        WorkspaceStore.getWorkspace().addWorkpads(workpadsToAdd);
    }

    /**
     * Get first valid workpad (which has portfolio and report)
     */
    static getFirstValidWorkpad(): BaseWorkpad {
        return WorkspaceStore.getWorkspace().workpads.find((workpad: BaseWorkpad) => {
            return workpad.getAllPortfolios() && workpad.getAllPortfolios().length > 0 && workpad.reports && workpad.reports.length > 0;
        });
    }

    /**
     * add one or many workpads and update current workpad
     */
    static addWorkpadsAndUpdateCurrent(workpadsToAdd: BaseWorkpad | BaseWorkpad[]): void {
        WorkspaceStore.getWorkspace().addWorkpads(workpadsToAdd);
        const currentWorkpad = Array.isArray(workpadsToAdd) ? workpadsToAdd[0] : workpadsToAdd;
        WorkspaceStore.validateWorkpadAndUpdate(currentWorkpad);
    }

    /**
     * remove a workpad and update current workpad
     */
    static removeWorkpadAndUpdateCurrent(workpadToRemove: BaseWorkpad, removeLongRunningRequests?: boolean): void {
        WorkspaceStore.getWorkspace().removeWorkpad(workpadToRemove);
        if (removeLongRunningRequests) {
            for (const report of workpadToRemove.reports) {
                report.removeAllWidgetLongRunningRequests();
            }
        }
        if (WorkspaceStore.getCurrentWorkpad() === workpadToRemove) {
            const validWorkpad = WorkspaceStore.getFirstValidWorkpad();
            WorkspaceStore.validateWorkpadAndUpdate(validWorkpad, validWorkpad ? validWorkpad.getAllPortfolios()[0] : undefined);
        }
    }

    /**
     * add one portfolio and update current portfolio
     * FlatWorkpad CANNOT take array for portfoliosToAdd, since it can have only ONE Portfolio.
     */
    static addPortfoliosAndUpdateCurrent(workpad: BaseWorkpad, portfoliosToAdd: Portfolio | Portfolio[], index?: number): void {
        // if workpad is FlatWorkpad, it sets passed in portfolio as it's portfolio
        // if workpad is ReportGroup, and portfoliosToAdd is Portfolio and index is given, then we insert the portfolio
        // if workpad is ReportGroup, and portfoliosToAdd is Portfolio[], then we append the portfolios
        workpad.addPortfolios(portfoliosToAdd, index);

        WorkspaceStore.updateCurrentWorkpad(workpad);
    }

    /**
     * For ReportGroup Only
     * remove one portfolio and update current portfolio
     */
    static removePortfolioAndUpdateCurrent(reportGroup: ReportGroup, portfolioToRemove: Portfolio): void {
        // Find the index of report group in workspace before removing the portfolio
        const indexOfReportGroup = WorkspaceStore.getWorkspace().workpads.indexOf(reportGroup);
        let flatWorkpad: FlatWorkpad;
        reportGroup.removePortfolio(portfolioToRemove);
        // Also remove any long running requests pending for the portfolio in this report group
        for (const report of reportGroup.reports) {
            report.removeAllWidgetLongRunningRequests(portfolioToRemove.portId);
        }
        WorkspaceStore.updatePortfolioInComparisonConfig(portfolioToRemove);
        // If after deleting we are left with only one portfolio, is not user created report, and we removed a what-if portfolio convert report group to flat workpad.
        // Checking what-If using instanceOf WhatIfPortfolio isn't advised as it would lead to issues while deleting the base AdhocPortfolio
        if (!reportGroup.isUserCreated && reportGroup.portfolios.length === 1 && (portfolioToRemove as WhatIfPortfolio).parentPortfolio === reportGroup.portfolios[0]) {
            flatWorkpad = reportGroup.initializeFlatWorkpadFromReportGroup();
            // Remove report group from workpads array and add flatworkpad in it's place
            WorkspaceStore.getWorkspace().workpads.splice(indexOfReportGroup, 1, flatWorkpad);
            WorkspaceStore.workspace$.next(WorkspaceStore.getWorkspace());
        }
        if (WorkspaceStore.getCurrentPortfolio() === portfolioToRemove) {
            let newCurrentWorkpad: BaseWorkpad;
            if (reportGroup.portfolios.length > 0) {
                // If reportgroup is not created by user and is left with one portfolio after deletion and we've deleted what if portfolio change it to flat workpad
                newCurrentWorkpad = !reportGroup.isUserCreated && reportGroup.portfolios.length === 1 && portfolioToRemove instanceof WhatIfPortfolio ? flatWorkpad : reportGroup;
            } else {
                newCurrentWorkpad = WorkspaceStore.getFirstValidWorkpad();
            }
            WorkspaceStore.validateWorkpadAndUpdate(newCurrentWorkpad);
        }
    }

    /**
     * This method is responsible for updating the comparison config for all reports of current workpad.. It changes from oldPortfolio to new Portfolio if both arguments are specified
     * If only oldPortfolio is specified  then it gets deleted from the comparison configs
     */
    static updatePortfolioInComparisonConfig(oldPortfolio: Portfolio, newPortfolio?: Portfolio) {
        const workpad = WorkspaceStore.getCurrentWorkpad();
        if (workpad instanceof FlatWorkpad) {
            return;
        }
        workpad.reports.forEach((report: Report) => {
            const comparisonConfig = workpad.comparisonConfigMap.get(report.comparisonConfigId);
            if (comparisonConfig === undefined) {
                return;
            }
            const index = comparisonConfig.portComparisonList.indexOf(oldPortfolio.portId);
            if (index !== -1) {
                newPortfolio ? comparisonConfig.portComparisonList.splice(index, 1, newPortfolio.portId) : comparisonConfig.portComparisonList.splice(index, 1);
                if (comparisonConfig.portAnchorId === oldPortfolio.portId) {
                    newPortfolio ? comparisonConfig.portAnchorId = newPortfolio.portId : comparisonConfig.portAnchorId = undefined;
                }
            }
        });
    }

    /**
     * Replace current portfolio
     */
    static replaceCurrentPortfolio(newPortfolio: Portfolio, newReport: Report = null): void {
        const currentWorkpad = WorkspaceStore.getCurrentWorkpad();
        currentWorkpad.replacePortfolios(newPortfolio, WorkspaceStore.getCurrentPortfolio());

        // update current workpad to update the workpad.portfolio(s) change and update current portfolio (and update current report if not null)
        WorkspaceStore.validateWorkpadAndUpdate(currentWorkpad, newPortfolio, newReport);
    }

    /**
     * add one or many reports and update current report
     */
    static addReportsAndUpdateCurrent(workpad: BaseWorkpad = WorkspaceStore.getCurrentWorkpad(), reportsToAdd?: Report | Report[]): void {
        let report: Report;
        if (!reportsToAdd) {
            reportsToAdd = report = WorkspaceUtils.createNewReport(workpad.reports);
        } else {
            report = Array.isArray(reportsToAdd) ? reportsToAdd[0] : reportsToAdd;
        }
        WorkspaceStore.getCurrentWorkpad().addReports(reportsToAdd);
        WorkspaceStore.updateCurrentReport(report);
    }

    /**
     * remove one report and update current report
     */
    static removeReportAndUpdateCurrent(reportToRemove: Report | number, workpad = WorkspaceStore.getCurrentWorkpad()): void {
        // if report key was passed in, then find the report from the current workpad's reports
        if (isNumber(reportToRemove)) {
            reportToRemove = WorkspaceStore.getReportFromCurrentWorkpad(reportToRemove);
        }
        workpad.removeReport(reportToRemove);

        // Now if the workpad has no reports left we should create an empty one.
        if (workpad.reports.length === 0) {
            workpad.reports.push(WorkspaceUtils.createNewReport());
        }

        // If this report was the selected one, not sure it could be anything else, select the first one.
        if (WorkspaceStore.getCurrentReport() === reportToRemove) {
            WorkspaceStore.updateCurrentReport(workpad.reports[0]);
        }
    }

    /**
     * Replace CurrentReport
     */
    static replaceCurrentReport(newReport: Report): void {
        const currentWorkpad = WorkspaceStore.getCurrentWorkpad();
        currentWorkpad.replaceReport(newReport, WorkspaceStore.getCurrentReport());

        // update current workpad to update the workpad.reports change and update current report
        WorkspaceStore.updateCurrentWorkpad(currentWorkpad, undefined, newReport);
    }

    /**
     * Gets the loading status observable.  If one does not exist then it creates it and initializes it to false.
     */
    static getPortfolioLoadingStatus$(portfolio: Portfolio): Observable<PortfolioLoadingStatus> {
        let loadingStatus$ = WorkspaceStore.portfolioLoadingStatusMap.get(portfolio.portId);
        if (!loadingStatus$) {
            // Doesn't exist so just default a new one as false.
            loadingStatus$ = new BehaviorSubject<PortfolioLoadingStatus>({isLoading: false});
            WorkspaceStore.portfolioLoadingStatusMap.set(portfolio.portId, loadingStatus$);
        }
        return loadingStatus$;
    }
}
