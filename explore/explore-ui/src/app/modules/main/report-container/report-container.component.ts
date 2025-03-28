import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {AlertConstants, ExploreDialogParam, SubscribableComponent} from '@blk/explore-ui-core';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {Report} from '@models/workspace/report.model';
import {NotificationService} from '@services/notification';
import {AppStore} from '../../../app.store';
import {WorkspaceStore} from '../../../stores';
import {WorkspaceUtils} from '@utils/workspace.utils';
import {ReportGroup} from '@models/workspace/report-group.model';
import {
    AuxBadgeStyleEnum,
    AuxTabBar,
    AuxTabBarDeletedDetailInterface,
    AuxTabBarDraggedDetailInterface,
    AuxTabBarItemInterface,
    AuxTabBarRenamedDetailInterface,
    AuxTabBarSelectedDetailInterface
} from '@blk/aladdin-angular-components';

/**
 * Report Container Component
 *
 * @example
 * <app-report-container></app-report-container>
 */
@Component({
    selector: 'app-report-container',
    templateUrl: './report-container.component.html',
    styleUrls: ['./report-container.component.scss']
})
export class ReportContainerComponent extends SubscribableComponent implements OnInit {
    reportTabs: AuxTabBarItemInterface[];
    currentReport$: Observable<Report>;
    showCompositionModel: boolean;
    expandModellingFlag = false;
    isWhatIfPortfolio = false;
    openPasteWidgetModal = false;
    isNewReportModalOpen = true;

    @ViewChild('auxTabBar', {static: false}) auxTabBar: AuxTabBar;

    /**
     * constructor
     */
    constructor(private notificationService: NotificationService) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.currentReport$ = WorkspaceStore.getCurrentReport$();

        WorkspaceStore.getCurrentPortfolio$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((portfolio) => {
                this.isWhatIfPortfolio = portfolio instanceof WhatIfPortfolio;
            });

        WorkspaceStore.getCurrentWorkpad$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((workpad: BaseWorkpad) => {
                if (!workpad) {
                    return;
                }
                // If workpad's reports array is empty add a blank report and set it as workpad's current report
                if (!workpad.reports.length && workpad instanceof ReportGroup) {
                    workpad.addReports(WorkspaceUtils.createNewReport(workpad.reports));
                    workpad.activeReport = workpad.reports[0];
                }
                // If workpad has active report set it as current report
                if (workpad.activeReport) {
                    WorkspaceStore.currentReport$.next(workpad.activeReport);
                    this.currentReport$ = WorkspaceStore.getCurrentReport$();
                }

                this.isNewReportModalOpen = workpad.reports.length && !workpad.reports[0].widgets;
                
                this.initializeReportTabs(workpad);
            });

        AppStore.getShowCompositionModel$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((showCompositionModel) => {
                this.showCompositionModel = showCompositionModel;
            });

        AppStore.expandModellingSubject$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((expandModellingFlag) => {
                this.expandModellingFlag = expandModellingFlag;
            });

    }

    /**
     * Initialize report tabs for ui
     */
    initializeReportTabs(workpad = WorkspaceStore.getCurrentWorkpad()): void {
        this.reportTabs = [];
        workpad.reports.forEach(report => {
            const reportTab: AuxTabBarItemInterface = {label: report.title, uid: report.key.toString()};
            const comparisonConfig = report.comparisonConfigId && workpad.comparisonConfigMap.get(report.comparisonConfigId);
            if (comparisonConfig?.portComparisonList.length) {
                reportTab.badgeSlot = {
                    badgeStyle: AuxBadgeStyleEnum.NEUTRAL,
                    badgeValue: 'Multi'
                };
            }
            this.reportTabs.push(reportTab);
        });
    }

    /**
     * onTabDragged
     */
    onTabDragAndDropped(event: CustomEvent<AuxTabBarDraggedDetailInterface>): void {
        // update the model
        const currentWorkpad = WorkspaceStore.getCurrentWorkpad();
        const selectedReport = currentWorkpad.reports.splice(event.detail.oldIndex, 1)[0];
        currentWorkpad.reports.splice(event.detail.newIndex, 0, selectedReport);
    }

    /**
     * Event when user click on +, for add report
     */
    onAddTabClicked(): void {
        // update the model
        WorkspaceStore.addReportsAndUpdateCurrent();
        AppStore.updateShowCompositionModel(false);

        this.isNewReportModalOpen = true;
    }


    /**
     * Update current report on tab selected
     */
    onTabSelected(event: CustomEvent<AuxTabBarSelectedDetailInterface>): void {
        if (!event || !event.detail || !event.detail.uid) {
            console.error('error on finding tab uid');
            return;
        }
        // update the model
        WorkspaceStore.updateCurrentReport(+event.detail.uid);
    }

    /**
     * Event for updating title if it get's changed
     */
    onTabEdited(event: CustomEvent<AuxTabBarRenamedDetailInterface>): void {
        if (!event || !event.detail || !event.detail.uid) {
            console.error('error on finding tab uid');
            return;
        }
        // update the model
        const reportToUpdate = WorkspaceStore.getReportFromCurrentWorkpad(+event.detail.uid);
        const newTitle = event.detail.newLabel;
        if (newTitle && newTitle.trim() !== '') {
            reportToUpdate.title = newTitle;
        }
    }

    /**
     * On tab deleted
     */
    onRemoveTabClicked(event: CustomEvent<AuxTabBarDeletedDetailInterface>): void {
        if (!event || !event.detail || !event.detail.uid) {
            console.error('error on finding tab uid');
            return;
        }
        this.notificationService.openDialog(
            new ExploreDialogParam(
                AlertConstants.TYPE.ALERT_WITH_OPTIONS,
                AlertConstants.HEADER.CLOSE_REPORT,
                AlertConstants.BODY.CLOSE_REPORT,
                AlertConstants.BTN.CONFIRM,
                AlertConstants.BTN.CANCEL,
                this.deleteReport,
                null,
                +event.detail.uid
            )
        );
    }

    /**
     * Delete report
     */
    deleteReport = (reportKey: number): void => {
        // update the model
        WorkspaceStore.removeReportAndUpdateCurrent(reportKey);

        // update the ui
        const index = this.getTabIndex(reportKey);
        this.reportTabs = [...this.reportTabs.slice(0, index), ...this.reportTabs.slice(index + 1)];

        // Now if the reportTabs is empty, then take the currentReport (if workpad has no reports left we create an empty one)
        if (!this.reportTabs.length) {
            const addedReport = WorkspaceStore.getCurrentReport();
            this.reportTabs.push({label: addedReport.title, uid: addedReport.key.toString()});
        }

        setTimeout(() => {
            this.updateTabScrollPosition();
        }, 0);
    };

    /**
     * Delete any report from Delete Modal
     */
    removeReportFromReportPanel = (selectedReport: Report): void => {
        WorkspaceStore.removeReportAndUpdateCurrent(selectedReport);
        // update the ui
        const idx = this.getTabIndexByName(selectedReport.title);
        this.reportTabs = [...this.reportTabs.slice(0, idx), ...this.reportTabs.slice(idx + 1)];
        if (!this.reportTabs.length) {
            const newBlankReport = WorkspaceStore.getCurrentReport();
            this.reportTabs.push({label: newBlankReport.title, uid: newBlankReport.key.toString()});
        }

        setTimeout(() => {
            this.updateTabScrollPosition();
        }, 0);
    };

    /**
     * handler for showComposition event emitter from report bar component
     * updates value of showCompositionModel flag
     */
    toggleShowComposition(newValue: boolean): void {
        AppStore.updateShowCompositionModel(newValue);
        this.expandModellingFlag = false;
    }

    /**
     * Update reportTabs
     */
    private updateTabScrollPosition(): void {
        if (this.auxTabBar.updateScrollPosition) {
            this.auxTabBar.updateScrollPosition();
        }
    }

    /**
     * Get tab index with uid
     */
    private getTabIndex(uid: number): number {
        return this.reportTabs.findIndex(tab => +tab.uid === uid);
    }

    /**
     * Get tab index with report name
     */
    private getTabIndexByName(reportName: string): number {
        return this.reportTabs.findIndex(tab => tab.label === reportName);
    }

    closeNewReportModal(): void {
        this.isNewReportModalOpen = false;
    }

    openNewReportModal(): void {
        this.isNewReportModalOpen = true;
    }


}
