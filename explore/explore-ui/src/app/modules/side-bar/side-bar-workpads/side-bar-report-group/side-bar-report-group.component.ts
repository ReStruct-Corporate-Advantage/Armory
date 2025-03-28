import {ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WorkspaceStore} from '../../../../stores';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {takeUntil} from 'rxjs/operators';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {CommonConstants} from '@constants/common.constants';
import {Report} from '@models/workspace/report.model';
import {AppStore} from '../../../../app.store';
import {NotificationService} from '@services/notification';
import {WorkpadExportComposite} from '@models/export/export-composite/workpad-export-composite.model';
import {ExportDownloadingStatus} from '@interfaces/export-downloading-status.interface';
import {ExportUtils} from '@utils/export/export.utils';
import {WorkpadUtils} from '@utils/workpad.utils';
import {SubscribableComponent} from '@blk/explore-ui-core';
import {AuxTextInput} from '@blk/aladdin-angular-components';
import {WorkpadType} from '@enums/workpad-type.enum';

/**
 * This component represents a ReportGroup and list of portfolios in that ReportGroup
 */
@Component({
    selector: 'app-side-bar-report-group',
    templateUrl: './side-bar-report-group.component.html',
    styleUrls: ['./side-bar-report-group.component.scss']
})
export class SideBarReportGroupComponent extends SubscribableComponent implements OnInit {
    @Input() reportGroup: ReportGroup;

    @ViewChild('reportGroupNameField', {static: false}) reportGroupNameField: AuxTextInput;

    isSelected: boolean;

    exportingInProgress: boolean;

    reportGroupBorder: BorderProperties;

    // flag to indicate if this report group is the target of a drag (portfolio being dragged into this group)
    isReportGroupDropTarget = false;

    // flag to indicate if portfolio is being dropped on the report group header
    isHeaderDrop = false;

    editReportGroupName = false;

    /**
     * constructor
     */
    constructor(private appStore: AppStore, private notificationService: NotificationService, private changeDetectorRef: ChangeDetectorRef) {
        super();
        this.resetReportGroupBorder();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.setEditReportGroupName(this.reportGroup?.editMode);
        WorkspaceStore.getCurrentWorkpad$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((currentWorkpad: BaseWorkpad) => {
                this.isSelected = currentWorkpad === this.reportGroup;
            });

        // Check if downloading is in progress for current report group or not
        this.appStore.exportDownloadingStatus$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((downloadStatus: ExportDownloadingStatus) => {
            this.exportingInProgress = ExportUtils.isExportDownloadingStatusValid(downloadStatus) && (downloadStatus.exportComposite as WorkpadExportComposite).workpad instanceof ReportGroup && this.reportGroup.id === ((downloadStatus.exportComposite as WorkpadExportComposite).workpad as ReportGroup).id;
            this.changeDetectorRef.detectChanges();
        });

    }

    /**
     * It is triggered when report group name field is shown/hidden.
     * If report group name field is shown, the focus is set to it.
     */
    setEditReportGroupName(edit: boolean): void {
        this.editReportGroupName = edit;
        if (edit) {
            // This is done to make setting focus input to workspace name field async
            // as workspaceNameField will not be available in HTML dom until this function execution is finished
            setTimeout(() => {
                if (this.reportGroupNameField) {
                    this.reportGroupNameField.focusInput();
                }
            }, 0);
        }
    }

    /**
     * Method is triggered when report group name field is updated
     */
    updateReportGroupName(reportGroupName: string): void {
        if (this.reportGroup.title !== reportGroupName) {
            this.reportGroup.title = reportGroupName;
        }
    }

    /**
     * Deletes the portfolio from report group
     */
    deletePortfolio(portfolio: Portfolio): void {
        WorkspaceStore.portfolioLoadingStatusMap.delete(portfolio.portId);
        WorkspaceStore.removePortfolioAndUpdateCurrent(this.reportGroup, portfolio);
        this.notificationService.invokeWidgetReloadPrompt();
    }

    /**
     * Selects the portfolio from report group
     */
    selectPortfolio(portfolio: Portfolio): void {
        if (WorkspaceStore.getCurrentPortfolio() !== portfolio) {
            if (!this.reportGroup.activeReport) {
                this.reportGroup.activeReport = this.reportGroup.reports.length ? this.reportGroup.reports[0] : null;
            }
            WorkspaceStore.validateWorkpadAndUpdate(this.reportGroup, portfolio, null, null, true);
        }
    }

    /**
     * Method called on drop of portfolio or report group on report group header
     */
    onWorkpadDrop(event: DragEvent, topBottomDrop?: 'TOP' | 'BOTTOM') {
        event.preventDefault();
        const workpadIndex = Number(event.dataTransfer.getData(CommonConstants.DRAG_DROP_PARAMS.WORKPAD_INDEX));
        const droppedWpIdx = WorkspaceStore.getWorkspace().workpads.indexOf(this.reportGroup);
        const reportGroupId = event.dataTransfer.getData(CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID);
        const portfolioIndex = Number(event.dataTransfer.getData(CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_INDEX_IN_WORKPAD));
        if (reportGroupId) {
            WorkpadUtils.dragPortfolioFromReportGroupToWorkspace(portfolioIndex, workpadIndex, droppedWpIdx, WorkpadType.REPORT_GROUP, topBottomDrop);
        } else if (workpadIndex !== droppedWpIdx) {
            WorkpadUtils.reorderWorkpad(workpadIndex, this.reportGroup);
        }
        this.clearDropTargetStyling();
    }

    /**
     * Method called on drag action on Report Group component.
     * Data like report group Id  and portfolio Id is added in drag event.
     */
    onReportGroupDrag(event: DragEvent) {
        event.dataTransfer.setData(
            CommonConstants.DRAG_DROP_PARAMS.WORKPAD_INDEX,
            WorkspaceStore.getWorkspace().workpads.indexOf(this.reportGroup).toString()
        );
        // Adding index of dragged object as a key in dataTransfer because on dragover, the data store is in protected mode, hence the data is not available
        event.dataTransfer.setData(CommonConstants.DRAG_DROP_PARAMS.DRAGGED_WORKPAD_INDEX + WorkspaceStore.getWorkspace().workpads.indexOf(this.reportGroup).toString(), undefined);
        event.dataTransfer.setData(CommonConstants.DRAG_DROP_PARAMS.DRAGGED_REPORT_GROUP_ID, this.reportGroup.id);
        event.stopPropagation();
    }

    /**
     * Method called on drop of portfolio into report group component on either the report group header or just below.
     * Will always add portfolio as first in report group.
     * Adding to any other index in report group portfolio list is handled by individual SideBarPortfolioComponent
     */
    onPortfolioDrop(event: DragEvent) {
        console.log('Report grp port drop');
        event.preventDefault();
        const workpadIndex = event.dataTransfer.getData(CommonConstants.DRAG_DROP_PARAMS.WORKPAD_INDEX);
        const portfolioCurrentWorkpad = WorkspaceStore.getWorkspace().workpads[workpadIndex];
        if (portfolioCurrentWorkpad && portfolioCurrentWorkpad instanceof FlatWorkpad) {
            const portfolio = portfolioCurrentWorkpad.getAllPortfolios().pop();
            this.reportGroup.addPortfolios(portfolio, 0);
            // Copy reports of workpad
            portfolioCurrentWorkpad.reports.forEach((report: Report) => {
                this.reportGroup.reports.push(report);
            });
            // expand report group
            this.reportGroup.isOpen = true;

            // record the activeReport in the workpad so that when we click between workpads, the report will be updated
            this.reportGroup.activeReport = portfolioCurrentWorkpad.activeReport;
            WorkspaceStore.validateWorkpadAndUpdate(this.reportGroup, portfolio);

            // Remove the dragged workpad
            WorkspaceStore.removeWorkpadAndUpdateCurrent(portfolioCurrentWorkpad, false);
        }

        this.clearDropTargetStyling();
    }

    /**
     * Method to check if drop action is allowed above or below the report group
     * @param event Event from source of drag
     * @param topBottomDrop Indicates if trying to place above or below report group
     */
    allowDropAboveBelowReportGroup(event: DragEvent, topBottomDrop: 'TOP' | 'BOTTOM'): void {
        const isWhatIfPortfolio = event.dataTransfer.types.includes(CommonConstants.DRAG_DROP_PARAMS.IS_WHAT_IF_PORTFOLIO);

        // what-if portfolios or portfolios belonging to a report group cannot be moved above/below report group
        if (isWhatIfPortfolio) {
            return;
        }

        // clear any stylings related to adding a portfolio the report group
        this.resetGroupHeaderBorder();
        this.resetReportGroupDropTarget();

        const draggedIndex = Number(event.dataTransfer.types.find(property => property.startsWith(CommonConstants.DRAG_DROP_PARAMS.DRAGGED_WORKPAD_INDEX)).substr(-1));
        const droppedIndex = WorkspaceStore.getWorkspace().workpads.indexOf(this.reportGroup);

        // Added a new div: report-group-bottom-line at the end of the side-bar-report-group, to make the behavior more intuitive.
        // Below condition is basically not to allow dropping items below the header div and above the bottom-line div,
        // and in other word, allowing dropping only above the header div and below bottom-line div.
        if (topBottomDrop === 'BOTTOM' && draggedIndex > droppedIndex || topBottomDrop === 'TOP' && draggedIndex < droppedIndex) {
            return;
        }

        // If valid drop, add blue border to top or bottom of report group depending on where this event originated (top or bottom)
        this.reportGroupBorder = {
            borderStyle: topBottomDrop === 'TOP' ? 'solid none none none' : 'none none solid none',
            borderWidth: '1px',
            borderColor: getComputedStyle(document.body).getPropertyValue('--primary-action__color')
        };

        event.preventDefault();
    }

    /**
     * Method to check if portfolio can be added to report group as it is dragged over.
     * Called from report group header or empty report group body
     * If valid drop, adds background color to report group
     */
    allowAddToReportGroup(event: DragEvent, headerDrop: boolean): void {
        // properties from event to see what kind of element is being dragged
        const isWhatIfPortfolio = event.dataTransfer.types.includes(CommonConstants.DRAG_DROP_PARAMS.IS_WHAT_IF_PORTFOLIO);
        const isCustomPortfolio = event.dataTransfer.types.includes(CommonConstants.DRAG_DROP_PARAMS.IS_CUSTOM_PORTFOLIO);
        const isPortfolio = event.dataTransfer.types.includes(CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID);
        const isReportGroup = event.dataTransfer.types.includes(CommonConstants.DRAG_DROP_PARAMS.DRAGGED_REPORT_GROUP_ID);
        const hasReportGroupAsParent = event.dataTransfer.types.includes(CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID);

        // only portfolios and custom portfolios can be added to a report group
        if ((!(isPortfolio || isCustomPortfolio)) || isReportGroup || hasReportGroupAsParent || isWhatIfPortfolio) {
            return;
        }

        // add background coloring to indicate drop over report group
        this.isReportGroupDropTarget = true;

        // if over report group header, add line below to show where portfolio will be added
        if (headerDrop && this.reportGroup.hasPortfolios()) {
            this.isHeaderDrop = true;
        }
        event.preventDefault();
    }

    /**
     * Method to reset border-width so that blue line is not visible
     */
    private resetReportGroupBorder(): void {
        this.reportGroupBorder = {
            borderWidth: '0.0125rem',
            borderStyle: 'none none solid none',
            borderColor: getComputedStyle(document.body).getPropertyValue('--drawer__border-color')
        };
    }

    /**
     * Callback to clear blue border line below report group header
     */
    resetGroupHeaderBorder(): void {
        this.isHeaderDrop = false;
    }

    /**
     * Callback to add blue background-color indicating a drago ver the report group
     */
    setReportGroupDropTarget(): void {
        this.isReportGroupDropTarget = true;
    }

    /**
     * Callback to remove blue background-color indicating a drag over the report group
     */
    resetReportGroupDropTarget(): void {
        this.isReportGroupDropTarget = false;
    }

    /**
     * Clears all styling associated with drag/drop from the report group
     */
    clearDropTargetStyling(): void {
        this.resetReportGroupBorder();
        this.isHeaderDrop = false;
        this.isReportGroupDropTarget = false;
    }
}

interface BorderProperties {
    borderWidth: string;
    borderStyle: string;
    borderColor: string;
}
