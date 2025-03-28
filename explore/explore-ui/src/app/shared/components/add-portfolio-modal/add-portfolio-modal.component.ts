import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {forkJoin, Observable, of} from 'rxjs';
import {catchError, map, switchMap, takeUntil} from 'rxjs/operators';
import {cloneDeep} from 'lodash';

import {ExplorePortfolioSearchService, PortfolioService, WorkpadService} from '@services/index';
import {WorkspaceStore} from '@stores/index';
import {WorkspaceUtils} from '@utils/index';
import {AddPortfolioService} from './add-portfolio.service';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {IndexSearchTreeItem} from '@models/portfolio/index-search-tree-item.model';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {NotificationService} from '@services/notification/notification.service';
import {AlertConstants, CalendarDateUtils, ExploreDialogParam, SubscribableComponent} from '@blk/explore-ui-core';
import {PortfolioType, PortfolioTypeEnumUtils} from './portfolio-type.enum';
import {AddCustomPortfolioComponent} from './add-custom-portfolio/add-custom-portfolio.component';
import {FileParsingLogicParams} from '@services/upload/file-parsing-logic-params.interface';

/**
 * Add Portfolio Modal Component
 *
 * @example
 *  <ng-container *ngIf="isAddPortfolioModalOpen">
 *      <app-add-portfolio-modal [isOpen]="isAddPortfolioModalOpen"
 *                               (modalClosed)="closeAddPortfolioModal()">
 *      </app-add-portfolio-modal>
 *  </ng-container>
 */
@Component({
    selector: 'app-add-portfolio-modal',
    templateUrl: './add-portfolio-modal.component.html',
    styleUrls: ['./add-portfolio-modal.component.scss']
})
export class AddPortfolioModalComponent extends SubscribableComponent implements OnInit {
    // variables to control modal open/close event
    @Output() modalClosed = new EventEmitter();
    @Input() isOpen: boolean;
    @Input() portfolioType = PortfolioType.PORTFOLIO;
    @Input() reportGroup: ReportGroup;
    @Input() loadFavActionCallback: (...arg) => void;
    @Input() onAddCallback: (...arg) => void;
    // Reference to the custom portfolio element
    @ViewChild('customPortfolio', {static: false}) customPortfolio: AddCustomPortfolioComponent;

    @Input() allowPortUpload = false;
    @Input() uploadFileParsingLogic: FileParsingLogicParams;

    portfolioTypeEnum = PortfolioType;

    modalTitle: string;

    // list of selected portfolios
    selectedPortfolioTickers: Set<PortfolioSearchItem|IndexSearchTreeItem|AdhocPortParams>;

    // all report groups in the workspace
    reportGroupList: ReportGroup[];

    /**
     * constructor
     */
    constructor(public portfolioSearchService: ExplorePortfolioSearchService, protected portfolioService: PortfolioService, protected addPortfolioService: AddPortfolioService, protected workpadService: WorkpadService, protected notificationService: NotificationService) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.reportGroupList = this.addPortfolioService.reportGroupList = WorkspaceStore.getWorkspace().getReportGroups().map(rpg => cloneDeep(rpg));
        this.selectedPortfolioTickers = this.addPortfolioService.selectedPortfolioTickers;
        this.modalTitle = PortfolioTypeEnumUtils.displayName(this.portfolioType);
    }

    /**
     * Close modal
     */
    closeModal(): void {
        this.isOpen = false;
        this.addPortfolioService.clear();
        this.modalClosed.emit();
    }

    /**
     * Add existing portfolios to workspace
     */
    addExistingPortfoliosToWorkspace(): Observable<boolean> {
        // Rename the workpad's report groups if their names have changed or create the report group if it's new
        const workpadReportGroups: ReportGroup[] = WorkspaceStore.getWorkspace().getReportGroups();
        this.reportGroupList.forEach(modalRG => {
            const found = workpadReportGroups.find(rpg => rpg.id === modalRG.id);
            if (found) {
                if (modalRG.title !== found.title) {
                    found.title = modalRG.title;
                }
            } else {
                const reportTitle = WorkspaceUtils.getNewReportTitle(modalRG.reports);
                modalRG.reports.push(new Report(reportTitle));
                WorkspaceStore.getWorkspace().addWorkpads(modalRG);
            }
        });

        // Get all the portfolio information.
        const observableQueue: Observable<any>[] = [];
        if (this.portfolioType !== PortfolioType.CUSTOM) {
            this.selectedPortfolioTickers.forEach(portItem => {
                // determine if it's a custom portfolio
                if (!(portItem instanceof AdhocPortParams)) {
                    observableQueue.push(
                        this.portfolioService.fetchPortfolioInformation$(PortfolioService.getPortfolioObject(portItem, CalendarDateUtils.getDefaultDateObject(), portItem instanceof IndexSearchTreeItem), { isLightVersion: true, includeMandate: true })
                            .pipe(catchError(error => {
                                this.notificationService.openDialog(
                                    new ExploreDialogParam(
                                        AlertConstants.TYPE.ALERT,
                                        AlertConstants.HEADER.PORT_INFO_MISSING,
                                        AlertConstants.BODY.PORT_INFO_MISSING,
                                        AlertConstants.BTN.OK
                                    ));
                                return of(error);
                            }))
                    );
                }
            });
        } else {
            observableQueue.push(
                this.customPortfolio.addCustomPortfolioToSelectedPortfolioList()
            );
        }

        return forkJoin(observableQueue).pipe(
            // Filter out any results that are not portfolios.
            // TODO:  Should we log something about all the invalid portfolios?
            takeUntil(this.ngUnsubscribe),
            map((ports: any[]) => ports.filter((port: any) => port instanceof Portfolio)),
            // For each portfolio returned, add it to the selected report groups or give each it's own workpad.
            switchMap((ports: Portfolio[]) => {
                if (ports?.length) {
                    this.addPortfoliosToWorkpads(ports);
                    WorkspaceStore.workspace$.next(WorkspaceStore.getWorkspace());
                    this.closeModal();
                    return of(true);
                }}),
            catchError((error) => {
                console.log(error);
                return of(false);
            })
        );
    }

    public addPortfoliosToWorkpads(ports: Portfolio[]) {
        if (this.reportGroup) {
            this.reportGroup.addPortfolios(ports);
            WorkspaceStore.updateCurrentWorkpad(this.reportGroup);
        } else if (this.addPortfolioService.checkedReportGroupList.length !== 0) {
            const workpadReportGroups = WorkspaceStore.getWorkspace().getReportGroups();
            this.addPortfolioService.checkedReportGroupList.forEach((reportGroup, index) => {
                const found = workpadReportGroups.find(rpg => rpg.id === reportGroup.id);
                // It should always be found since report groups that don't exist in the workpad should be added above
                if (found) {
                    found.addPortfolios(ports);

                    // set the first workpad as the currentWorkpad
                    if (index === 0) {
                        WorkspaceStore.updateCurrentWorkpad(found);
                    }
                }
            });
        } else {
            ports.forEach((port, index) => {
                this.createWorkpadForAddedPortfolio(port, index);
            });
        }
    }

    /**
     * method which creates workpad for new added portfolio
     */
    public createWorkpadForAddedPortfolio(portfolio: Portfolio, index: number) {
        const newFlatWorkpad = this.workpadService.createFlatWorkpad(portfolio, index);
        WorkspaceStore.addWorkpads(newFlatWorkpad);
        // set the first workpad as the currentWorkpad
        if (index === 0) {
            WorkspaceStore.updateCurrentWorkpad(newFlatWorkpad);
        }
    }

    /**
     * Is add button enabled
     */
    isAddButtonEnabled(): boolean {
        // enable if there is an existing portfolio or index to add
        return this.portfolioType === PortfolioType.CUSTOM ? this.customPortfolio?.isAddButtonEnabled : this.selectedPortfolioTickers.size !== 0;
    }

    /**
     * Callback for Report Group button Add click event
     */
    addReportGroupDoneClickedCallback() {
        this.addExistingPortfoliosToWorkspace().subscribe();
    }

    /**
     * function to be called when Add button is clicked upon
     */
    onAddClick(): void {
        if (this.loadFavActionCallback) {
            // In case we pass a favorite action callback, for special cases where we need more control
            this.onAddCallback(this.selectedPortfolioTickers);
            this.closeModal();
        } else {
            // happens generally
            this.addExistingPortfoliosToWorkspace().subscribe();
        }
    }
}
