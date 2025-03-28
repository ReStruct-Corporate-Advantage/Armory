import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {finalize, takeUntil} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ArrayUtils} from '@utils/array.utils';
import {NotificationService} from '@services/notification';
import {UserMetaDataStore, WorkspaceStore} from '../../../../stores';
import {AppUtils} from '@utils/app.utils';
import {AlertConstants, SubscribableComponent} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import {PortfolioLoadingStatus} from '@interfaces/portfolio-loading-status.interface';
import {isNil} from 'lodash';
import {AppStore} from '../../../../app.store';
import {WorkpadUtils} from '@utils/workpad.utils';
import {Report} from '@models/workspace/report.model';
import {isAdhocPort} from '@interfaces/base-adhoc-portfolio.interface';
import {UserPreference} from '@constants/user-preference.constants';
import {PortfolioService} from '@services/portfolio';
import {WorkpadType} from '@enums/workpad-type.enum';

/**
 * This components represents portfolio in side bar
 *
 * @example
 *  <ng-container *ngIf="isFlatWorkpad(workpad)">
 *      <app-side-bar-portfolio (emitPortfolioDeleted)="deleteWorkpad(workpad)"
 *                             (emitPortfolioSelected)="flatWorkpadSelected(workpad)"
 *                             [portfolio]=workpad.getAllPortfolios()[0]>
 *      </app-side-bar-portfolio>
 *  </ng-container>
 *
 *  <app-side-bar-portfolio (emitPortfolioDeleted)="deletePortfolio(portfolio)"
 *                          (emitPortfolioSelected)="selectPortfolio(portfolio)"
 *                          *ngFor="let portfolio of reportGroup.portfolios"
 *                          [portfolio]="portfolio">
 *  </app-side-bar-portfolio>
 */
@Component({
    selector: 'app-side-bar-portfolio',
    templateUrl: './side-bar-portfolio.component.html',
    styleUrls: ['./side-bar-portfolio.component.scss']
})
export class SideBarPortfolioComponent extends SubscribableComponent implements OnInit {
    // emit events
    @Output() emitPortfolioDeleted = new EventEmitter();
    @Output() emitPortfolioSelected = new EventEmitter();

    // emit events as portfolios are being reordered.  used by SideBarReportGroupComponent.
    @Output() emitPortfolioDrag = new EventEmitter();
    @Output() emitPortfolioReordered = new EventEmitter();

    @Input() portfolio: Portfolio;
    @Input() parentWorkpad: BaseWorkpad;

    showDelete = false;
    isSelected = false;
    isWhatIfPortfolio: boolean;
    isWhatIfPortfolioStyle: boolean;
    portfolioSidebarDisplayName: string;
    isParentReportGroup = false;
    // Variables to manipulate border while dragging over a workpad.
    borderStyle: string;
    borderWidth: string;

    // control load all loading status for each portfolio in the side bar
    isPortfolioLoading$ = new BehaviorSubject<boolean>(false);
    portfolioPercentLoaded: string; // displays percentage of portfolio loaded when load all is done
    displayFullPortfolioName = false;

    /**
     * constructor
     */
    constructor(private notificationService: NotificationService, private changeDetectorRef: ChangeDetectorRef, private appStore: AppStore, private portfolioService: PortfolioService) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.isParentReportGroup = this.parentWorkpad instanceof ReportGroup;
        this.portfolioSidebarDisplayName = this.portfolio.getDisplayTitle();
        this.isWhatIfPortfolio = this.portfolio instanceof WhatIfPortfolio;

        // Not sure why this is done in this component as it seems a little odd.
        this.portfolio.title = this.portfolioSidebarDisplayName;

        // We do not want to style an adhoc portfolio like a what-if.
        this.isWhatIfPortfolioStyle = (this.isWhatIfPortfolio && !(isAdhocPort(this.portfolio)) && this.isParentReportGroup) || ((this.portfolio instanceof AdhocPortfolio || this.portfolio instanceof AdhocPortGroup) && !isNil(this.portfolio.parentPortfolio));

        this.displayFullPortfolioName = UserMetaDataStore.getPreferenceValue(UserPreference.DISPLAY_FULL_PORTFOLIO_NAME) === 'true';

        this.portfolioSidebarDisplayName = this.displayFullPortfolioName ? this.portfolio.getPortfolioTitleForSideBar() : this.portfolio.getDisplayTitle();

        WorkspaceStore.getCurrentPortfolio$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((currentPortfolio: Portfolio) => {
                this.portfolioSidebarDisplayName = this.displayFullPortfolioName ? this.portfolio.getPortfolioTitleForSideBar() : this.portfolio.getDisplayTitle();
                this.isWhatIfPortfolio = this.portfolio instanceof WhatIfPortfolio;
                this.isSelected = currentPortfolio === this.portfolio;
                this.changeDetectorRef.markForCheck();
            });

        // Subscribe to portfolioLoadingStatusMap to get loading status of each portfolio for load all.
        WorkspaceStore.getPortfolioLoadingStatus$(this.portfolio)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((portfolioLoadingStatus: PortfolioLoadingStatus) => {
                if (!isNil(portfolioLoadingStatus.isLoading)) {
                    this.isPortfolioLoading$.next(portfolioLoadingStatus.isLoading);
                }
                this.portfolioPercentLoaded = portfolioLoadingStatus.loadingPercent;
                this.changeDetectorRef.markForCheck();
            });

        // updates portfolio name for current portfolio in the sidebar
        this.appStore.portfolioNameSubject$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((portfolioDisplayName: string) => {
                if (WorkspaceStore.getCurrentPortfolio() === this.portfolio) {
                    this.portfolioSidebarDisplayName = this.displayFullPortfolioName ? this.portfolio.getPortfolioTitleForSideBar() : portfolioDisplayName;
                }
            });
        this.checkPortFullNamePreference();
    }

    private checkPortFullNamePreference() {
        UserMetaDataStore.getPreferenceSubject(UserPreference.DISPLAY_FULL_PORTFOLIO_NAME)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(value => {
                    this.displayFullPortfolioName = value === 'true';
                    // we are doing this because for portfolios we don't save full name as part of favorite content as it is ever changing value.
                    // But we only want to make a request when there is need to display full name and if this portfolio is not current portfolio or full name is undefined
                    if (this.displayFullPortfolioName && WorkspaceStore.getCurrentPortfolio() !== this.portfolio && this.portfolio.fullName === undefined) {
                        this.isPortfolioLoading$.next(true);
                        this.portfolioService.fetchPortfolioInformation$(this.portfolio, { isLightVersion: true, includeMandate: true }, true).pipe(
                            takeUntil(this.ngUnsubscribe),
                            finalize(() => this.isPortfolioLoading$.next(false)) // Execute when the observable completes
                        ).subscribe(
                            portfolio => {
                                this.portfolio.copyFrom(portfolio);
                                this.portfolioSidebarDisplayName = this.portfolio.getPortfolioTitleForSideBar();
                                this.changeDetectorRef.markForCheck();
                            }
                        );
                    } else {
                        this.portfolioSidebarDisplayName = this.displayFullPortfolioName ? this.portfolio.getPortfolioTitleForSideBar() : this.portfolio.getDisplayTitle();
                        this.changeDetectorRef.markForCheck();
                    }
                }
            );
    }

    /**
     * sets portfolio to current portfolio
     */
    selectPortfolio(): void {
        if (!this.isSelected) {
            this.emitPortfolioSelected.emit();
        }
    }

    /**
     * Deletes portfolio and asks for user confirmation
     */
    confirmToDeletePortfolio(event: MouseEvent): void {
        AppUtils.alertNotification(
            event,
            AlertConstants.HEADER.DELETE_PORTFOLIO,
            AlertConstants.BODY.DELETE_PORTFOLIO_2,
            AlertConstants.BTN.DELETE,
            AlertConstants.BTN.CANCEL,
            this.deletePortfolio,
            this.notificationService
        );
        event.stopPropagation();
    }

    /**
     * Emit event to delete portfolio
     * this function is used as callback so need arrow to get the right scope
     */
    deletePortfolio = (): void => {
        if (this.isWhatIfPortfolio) {
            AppStore.expandModellingSubject$.next(false);
        }
        this.emitPortfolioDeleted.emit();
    };

    /**
     * Method called on drag action on portfolio component.
     * Data like report group Id  and portfolio Id is added in drag event.
     */
    onPortfolioDrag(event: DragEvent) {
        event.dataTransfer.setData(CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID, this.portfolio.portId);
        event.dataTransfer.setData(
            CommonConstants.DRAG_DROP_PARAMS.WORKPAD_INDEX,
            WorkspaceStore.getWorkspace().workpads.indexOf(this.parentWorkpad).toString()
        );
        // Adding index of dragged object as a key in dataTransfer because on dragover, the data store is in protected mode, hence the data is not available
        event.dataTransfer.setData(CommonConstants.DRAG_DROP_PARAMS.DRAGGED_WORKPAD_INDEX + WorkspaceStore.getWorkspace().workpads.indexOf(this.parentWorkpad).toString(), undefined);
        event.dataTransfer.setData(CommonConstants.DRAG_DROP_PARAMS.DRAGGED_PORTFOLIO_INDEX_IN_WORKPAD + this.parentWorkpad.getAllPortfolios().indexOf(this.portfolio).toString(), undefined);
        event.dataTransfer.setData(
            CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_INDEX_IN_WORKPAD,
            this.parentWorkpad.getAllPortfolios().indexOf(this.portfolio).toString()
        );
        if (this.parentWorkpad && this.parentWorkpad instanceof ReportGroup) {
            event.dataTransfer.setData(CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID, this.parentWorkpad.id);
            event.dataTransfer.setData(this.parentWorkpad.id, this.parentWorkpad.id);
        }
        if (this.portfolio instanceof WhatIfPortfolio) {
            // Checking if this.portfolio has a parent portfolio
            // Ad-hoc portfolios extend WhatIfPortfolio but do not have a parent portfolio.
            // Leading to errors when WhatIfPortfolios are dragged
            if (this.portfolio?.parentPortfolio?.portId) {
                event.dataTransfer.setData(
                    CommonConstants.DRAG_DROP_PARAMS.WHAT_IF_PORTFOLIO_PARENT + this.portfolio.parentPortfolio.portId,
                    this.portfolio.parentPortfolio.portId
                );
            }
            isAdhocPort(this.portfolio) ? event.dataTransfer.setData(CommonConstants.DRAG_DROP_PARAMS.IS_CUSTOM_PORTFOLIO, 'true') :
                event.dataTransfer.setData(CommonConstants.DRAG_DROP_PARAMS.IS_WHAT_IF_PORTFOLIO, 'true');
        }
        this.emitPortfolioDrag.emit();
    }

    /**
     * Method called on portfolio drop.
     * Reordering of portfolio is performed using data attached to event
     */
    onPortfolioDrop(event: DragEvent): void {
        event.preventDefault();
        const portfolioId = event.dataTransfer.getData(CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID);
        const reportGroupId = event.dataTransfer.getData(CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID);
        const portfolioIndex = Number(event.dataTransfer.getData(CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_INDEX_IN_WORKPAD));
        const workpadIndex = Number(event.dataTransfer.getData(CommonConstants.DRAG_DROP_PARAMS.WORKPAD_INDEX));

        // adding portfolio into non-empty report group, insert at index where dropped
        if (!reportGroupId && this.parentWorkpad instanceof ReportGroup) {
            const reportGroup: ReportGroup = this.parentWorkpad;
            const portfolioCurrentWorkpad = WorkspaceStore.getWorkspace().workpads[workpadIndex];

            // insert portfolio below the one dropped on (plus any child what-if portfolios)
            const numWhatIfPortfolios = reportGroup.getAllPortfolios().filter(portfolio => portfolio instanceof WhatIfPortfolio && portfolio.parentPortfolio === this.portfolio).length;
            const insertIndex = reportGroup.getAllPortfolios().indexOf(this.portfolio) + numWhatIfPortfolios + 1; // always insert below

            if (portfolioCurrentWorkpad && portfolioCurrentWorkpad instanceof FlatWorkpad) {
                const portfolio = portfolioCurrentWorkpad.getAllPortfolios().pop();
                reportGroup.addPortfolios(portfolio, insertIndex);
                // Copy reports of workpad
                portfolioCurrentWorkpad.reports.forEach((report: Report) => {
                    reportGroup.reports.push(report);
                });
                // expand report group
                reportGroup.isOpen = true;

                // record the activeReport in the workpad so that when we click between workpads, the report will be updated
                reportGroup.activeReport = portfolioCurrentWorkpad.activeReport;
                WorkspaceStore.validateWorkpadAndUpdate(reportGroup, portfolio);

                // Remove the dragged workpad
                WorkspaceStore.removeWorkpadAndUpdateCurrent(portfolioCurrentWorkpad, false);
            }
        } else if (reportGroupId && this.parentWorkpad instanceof ReportGroup && reportGroupId === this.parentWorkpad.id) {
            // reordering portfolios inside of same report group
            this.reorderPortfoliosAfterDrop(workpadIndex, portfolioIndex, portfolioId, true);
        } else if (!reportGroupId && this.parentWorkpad instanceof FlatWorkpad) {
            // reordering individual portfolios (workpads)
            this.reorderPortfoliosAfterDrop(workpadIndex, portfolioIndex, portfolioId, false);
        } else if (reportGroupId && this.parentWorkpad instanceof FlatWorkpad) {
            // drag portfolio out of a report group
            const workPadDropIndex = WorkspaceStore.getWorkspace().workpads.indexOf(this.parentWorkpad);
            WorkpadUtils.dragPortfolioFromReportGroupToWorkspace(portfolioIndex, workpadIndex, workPadDropIndex, WorkpadType.FLAT);
        }
        this.emitPortfolioReordered.emit();
        this.resetBorder();
    }

    /**
     * Reordering portfolio after drop
     */
    private reorderPortfoliosAfterDrop(workpadIndex: number, portfolioIndex: number, portfolioId: string, isSameReportGroup: boolean): void {
        if (isSameReportGroup && portfolioIndex !== this.parentWorkpad.getAllPortfolios().indexOf(this.portfolio)) {
            this.reorderPortfolio(portfolioIndex, portfolioId);
        } else if (workpadIndex !== WorkspaceStore.getWorkspace().workpads.indexOf(this.parentWorkpad)) {
            WorkpadUtils.reorderWorkpad(workpadIndex, this.parentWorkpad);
        }
    }

    /**
     * Method to reorder portfolio within report group at place it in this portfolio position
     */
    private reorderPortfolio(currentIndex: number, portId: string) {
        const portfolio = this.parentWorkpad.getAllPortfolios()[currentIndex];
        if (portfolio && portfolio.portId === portId) {
            ArrayUtils.moveItemInArray(
                this.parentWorkpad.getAllPortfolios().indexOf(this.portfolio),
                portfolio,
                this.parentWorkpad.getAllPortfolios()
            );
            this.reorderWhatIfPortfolios(portfolio);
            this.reorderWhatIfPortfolios(this.portfolio);
            if (WorkspaceStore.getCurrentPortfolio() !== portfolio) {
                WorkspaceStore.validateWorkpadAndUpdate(this.parentWorkpad, portfolio);
            }
        }
    }

    /**
     * Return whatIf portfolios in workpad having parent portfolio
     */
    private getWhatIfPortfolios(parentPortfolio: Portfolio) {
        return this.parentWorkpad
            .getAllPortfolios()
            .filter((port) => port instanceof WhatIfPortfolio && port.parentPortfolio === parentPortfolio);
    }

    /**
     * Method to move what-if portfolios under parent portfolio
     */
    private reorderWhatIfPortfolios(parentPortfolio: Portfolio) {
        const whatIfPortfolios = this.getWhatIfPortfolios(parentPortfolio);
        if (!whatIfPortfolios.length) {
            return;
        }
        // Remove whatIf portfolios from workpad
        this.parentWorkpad
            .getAllPortfolios()
            .splice(this.parentWorkpad.getAllPortfolios().indexOf(whatIfPortfolios[0]), whatIfPortfolios.length);
        // Reinsert under parent portfolio
        let parentPortfolioIndex = this.parentWorkpad.getAllPortfolios().indexOf(parentPortfolio);
        whatIfPortfolios.forEach((whatIfPort: WhatIfPortfolio) => {
            this.parentWorkpad.getAllPortfolios().splice(++parentPortfolioIndex, 0, whatIfPort);
        });
    }

    /**
     * Method to check if drop action is allowed on the component
     * There are three scenarios in which drop is allowed
     *  1. When reordering portfolio within report group
     *  2. When reordering flat workpad portfolio with other flat workpad portfolios
     *  3. Portfolio drop from another report group
     */
    allowDrop(event: DragEvent): void {
        // check if portfolio drop is being performed
        const isPortfolio = event.dataTransfer.types.includes(CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID);
        const isReportGroup = event.dataTransfer.types.includes(CommonConstants.DRAG_DROP_PARAMS.DRAGGED_REPORT_GROUP_ID);
        if (!isPortfolio && !isReportGroup) {
            return;
        }
        const hasReportGroupAsParent = event.dataTransfer.types.includes(CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID);
        if (hasReportGroupAsParent) {
            event.stopPropagation();
            event.cancelBubble = true;
        }
        let draggedIndex: number;
        let droppedIndex: number;
        if (
            this.portfolio instanceof WhatIfPortfolio && this.portfolio?.parentPortfolio?.portId &&
            !event.dataTransfer.types.includes(
                CommonConstants.DRAG_DROP_PARAMS.WHAT_IF_PORTFOLIO_PARENT + this.portfolio.parentPortfolio.portId.toLowerCase()
            )
        ) {
            // Not allow drop of any other portfolio other than sibling what if portfolios
            return;
        } else if (!this.isWhatIfPortfolio && event.dataTransfer.types.includes(CommonConstants.DRAG_DROP_PARAMS.IS_WHAT_IF_PORTFOLIO)) {
            // Not allow drop of what if portfolio on non-what-if portfolios
            return;
        } else if (
            hasReportGroupAsParent &&
            this.parentWorkpad instanceof ReportGroup &&
            event.dataTransfer.types.includes(this.parentWorkpad.id)
        ) {
            // Check if drag and drop is performed to reorder portfolio within report group
            if (event.dataTransfer.types.includes(CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID)) {
                draggedIndex = Number(event.dataTransfer.types.find(property => property.startsWith(CommonConstants.DRAG_DROP_PARAMS.DRAGGED_PORTFOLIO_INDEX_IN_WORKPAD)).substr(-1));
                droppedIndex = this.parentWorkpad.getAllPortfolios().indexOf(this.portfolio);
                this.addBorder(draggedIndex, droppedIndex);
            }
            event.preventDefault();
        } else if (this.parentWorkpad instanceof FlatWorkpad) {
            // Check if drag and drop is performed to reorder flat workpad portfolio or move out a portfolio from report group to wordpad
            draggedIndex = Number(event.dataTransfer.types.find(property => property.startsWith(CommonConstants.DRAG_DROP_PARAMS.DRAGGED_WORKPAD_INDEX)).substr(-1));
            droppedIndex = WorkspaceStore.getWorkspace().workpads.indexOf(this.parentWorkpad);
            this.addBorder(draggedIndex, droppedIndex);
            event.preventDefault();
        } else if (!isReportGroup && !hasReportGroupAsParent && this.parentWorkpad instanceof ReportGroup) {
            // adding flat workpad portfolio to report group
            draggedIndex = this.parentWorkpad.getAllPortfolios().indexOf(this.portfolio);
            // always put border below the target portfolio
            droppedIndex = draggedIndex + 1;
            this.addBorder(draggedIndex, droppedIndex);
        }
    }

    /**
     * Method to reset border-width so that blue line is not visible
     */
    resetBorder(event?: DragEvent): void {
        this.borderWidth = '0px';

        if (event) {
            event.stopPropagation();
        }
    }

    /**
     * Method to add border while dragging over workpads
     */
    addBorder(draggedIndex: number, droppedIndex: number): void {
        this.borderStyle = draggedIndex > droppedIndex ? 'solid none none none' : 'none none solid none';
        this.borderWidth = '1px';
    }
}
