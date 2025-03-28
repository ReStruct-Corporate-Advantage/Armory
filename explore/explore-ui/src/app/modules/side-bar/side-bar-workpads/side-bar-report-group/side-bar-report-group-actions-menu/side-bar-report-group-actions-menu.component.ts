import {ChangeDetectorRef, Component, DoCheck, EventEmitter, Input, Output} from '@angular/core';
import {AuxInlineMenuItemClickedDetailInterface} from '@blk/aladdin-angular-components';
import {ExportConstants} from '@constants/export.constants';
import {WorkspaceStore} from '@stores/workspace.store';
import {WorkpadExportComposite} from '@models/export/export-composite/workpad-export-composite.model';
import {WorkpadExcelExportConfig} from '@models/export/workpad-excel-export-config.model';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {AppUtils} from '@utils/app.utils';
import {AlertConstants} from '@blk/explore-ui-core';
import {ReportGroup} from '@models/workspace/report-group.model';
import {AppStore} from '../../../../../app.store';
import {NotificationService} from '@services/notification';
import {TelemetryClickService} from '@services/telemetry/telemetry-click.service';
import {PortfolioMenuItemsConstants} from '@constants/portfolio-menu-items.constants';
import {PortfolioType} from '../../../../../shared/components/add-portfolio-modal/portfolio-type.enum';
import { CommonConstants } from '@constants/common.constants';

@Component({
    selector: 'app-side-bar-report-group-actions-menu',
    templateUrl: './side-bar-report-group-actions-menu.component.html'
})
export class SideBarReportGroupActionsMenuComponent implements DoCheck {

    static readonly LABELS = {
        EXPORT_TO_PDF: 'Export to PDF',
        EXPORT_TO_EXCEL: 'Export to Excel',
        SET_REPORT_DATE: 'Set Report Group Date',
        RENAME: 'Rename',
        DELETE_REPORT_GROUP: 'Delete Report Group',
        EXPAND_ALL_REPORT_GROUPS: 'Expand All Report Groups',
        COLLAPSE_ALL_REPORT_GROUPS: 'Collapse All Report Groups',
        ADD_TO_GROUP: 'Add to Group',
        ENABLE_MULTI_PORTFOLIO_ANALYSIS: 'Enable Multi-Portfolio Analysis'
    };

    readonly applyText = CommonConstants.BUTTON_TEXT.ADD_PORTFOLIO;
    readonly cancelText = CommonConstants.BUTTON_TEXT.CLOSE;

    @Output() renameReportGroup = new EventEmitter();

    @Input() reportGroup: ReportGroup;

    selectedReportGroup: ReportGroup; 

    private _isAddPortfolioModalOpen: boolean = false;

    @Input()
    set isAddPortfolioModalOpen(value: boolean) {
        this._isAddPortfolioModalOpen = value !== undefined ? value : false;
    }

    get isAddPortfolioModalOpen(): boolean {
        return this._isAddPortfolioModalOpen;
    }

    isCreateMultiPortfolioAnalysisModalComponentOpen = false;
    isMultiPortfolioAnalysisSelectMenuComponentOpen = false;
    portfolioType: PortfolioType;

    reportGroupMenuOptions: any;

    constructor(private appStore: AppStore, private notificationService: NotificationService, private changeDetectorRef: ChangeDetectorRef,  private telemetryClickService: TelemetryClickService) {
    }

    ngDoCheck(): void {
        // we are checking object state to enable/disable export options
        // so each time portfolio is added and deleted we need to update the options
        this.initMenuOptions();
    }

    initMenuOptions() {
        this.reportGroupMenuOptions = [
            [
                {
                    label: SideBarReportGroupActionsMenuComponent.LABELS.ADD_TO_GROUP,
                    flyoutData: [[
                        {label: PortfolioMenuItemsConstants.LABELS.ADD_PORTFOLIO},
                        {label: PortfolioMenuItemsConstants.LABELS.ADD_WHAT_IF_PORTFOLIO},
                        {label: PortfolioMenuItemsConstants.LABELS.ADD_CUSTOM_PORTFOLIO},
                        {label: PortfolioMenuItemsConstants.LABELS.ADD_INDEX_RESEARCH}]]
                },
                {
                    label: SideBarReportGroupActionsMenuComponent.LABELS.ENABLE_MULTI_PORTFOLIO_ANALYSIS
                }
            ],
            [
                {label: SideBarReportGroupActionsMenuComponent.LABELS.RENAME},
                {label: SideBarReportGroupActionsMenuComponent.LABELS.DELETE_REPORT_GROUP}
            ],
            [
                {
                    label: SideBarReportGroupActionsMenuComponent.LABELS.EXPORT_TO_PDF,
                    isDisabled: !this.reportGroup.hasPortfolios()
                },
                {
                    label: SideBarReportGroupActionsMenuComponent.LABELS.EXPORT_TO_EXCEL,
                    isDisabled: !this.reportGroup.hasPortfolios()
                }
            ],
            [
                {label: SideBarReportGroupActionsMenuComponent.LABELS.SET_REPORT_DATE}
            ],
            [
                {label: SideBarReportGroupActionsMenuComponent.LABELS.EXPAND_ALL_REPORT_GROUPS},
                {label: SideBarReportGroupActionsMenuComponent.LABELS.COLLAPSE_ALL_REPORT_GROUPS}
            ]
        ];
    }

    /**
     * Method is triggered when portfolio menu is clicked/selected
     */
    onReportGroupMenuClicked(event: CustomEvent<AuxInlineMenuItemClickedDetailInterface>): void {
        switch (event.detail.element.label) {

            case SideBarReportGroupActionsMenuComponent.LABELS.RENAME:
                this.renameReportGroup.emit(true);
                break;

            case SideBarReportGroupActionsMenuComponent.LABELS.DELETE_REPORT_GROUP:
                this.confirmToDeleteReportGroup(event);
                break;

            case SideBarReportGroupActionsMenuComponent.LABELS.EXPORT_TO_PDF:
                this.openExportModal(ExportConstants.PDF_TYPE);
                break;

            case SideBarReportGroupActionsMenuComponent.LABELS.EXPORT_TO_EXCEL:
                this.openExportModal(ExportConstants.EXCEL);
                break;

            case SideBarReportGroupActionsMenuComponent.LABELS.SET_REPORT_DATE:
                this.openReportGroupDateModal();
                break;

            case SideBarReportGroupActionsMenuComponent.LABELS.EXPAND_ALL_REPORT_GROUPS:
                this.expandAllReportGroups(true);
                break;

            case SideBarReportGroupActionsMenuComponent.LABELS.COLLAPSE_ALL_REPORT_GROUPS:
                this.expandAllReportGroups(false);
                break;
            case PortfolioMenuItemsConstants.LABELS.ADD_PORTFOLIO:
                this.openAddPortfolioModal(PortfolioType.PORTFOLIO);
                break;
            case PortfolioMenuItemsConstants.LABELS.ADD_INDEX_RESEARCH:
                this.openAddPortfolioModal(PortfolioType.INDEX_RESEARCH);
                break;
            case PortfolioMenuItemsConstants.LABELS.ADD_CUSTOM_PORTFOLIO:
                this.openAddPortfolioModal(PortfolioType.CUSTOM);
                break;
            case PortfolioMenuItemsConstants.LABELS.ADD_WHAT_IF_PORTFOLIO:
                this.openAddPortfolioModal(PortfolioType.WHAT_IF);
                break;
            case SideBarReportGroupActionsMenuComponent.LABELS.ENABLE_MULTI_PORTFOLIO_ANALYSIS:
                this.openCreateMultiPortfolioAnalysisModalComponent(this.reportGroup);
                break;
        }
        this.telemetryClickService.reportGroupMenuBarClick(event.detail.element.label);
    }

    /**
     * Deletes directly if ctrl is pressed, Opens up a prompt otherwise
     */
    confirmToDeleteReportGroup(event: CustomEvent<AuxInlineMenuItemClickedDetailInterface>): boolean {
        AppUtils.alertNotification(event, AlertConstants.HEADER.DELETE_REPORT_GROUP, AlertConstants.BODY.DELETE_REPORT_GROUP, AlertConstants.BTN.DELETE, AlertConstants.BTN.CANCEL, this.deleteReportGroup, this.notificationService);
        return false; // To prevent redirection to home page
    }

    /**
     * delete the current report group from the workspace
     */
    deleteReportGroup = (): void => {
        WorkspaceStore.removeWorkpadAndUpdateCurrent(this.reportGroup, true);
        this.changeDetectorRef.markForCheck();
    };

    /**
     * Open report group date modal
     */
    openReportGroupDateModal(): void {
        this.appStore.openReportGroupDateModal$.next(this.reportGroup);
    }

    /**
     * Expand/Collapse all report groups
     */
    expandAllReportGroups(isExpand: boolean): void {
        WorkspaceStore.getWorkspace().getReportGroups().forEach(report => {
            report.isOpen = isExpand;
        });
    }

    /**
     * Opens the export options modal with the corresponding ExportConfig
     */
    openExportModal(type: string) {
        const exportComposite = new WorkpadExportComposite();
        exportComposite.workpad = this.reportGroup;
        if (type === ExportConstants.EXCEL) {
            exportComposite.exportConfig = new WorkpadExcelExportConfig();
            exportComposite.exportConfig.appendTimestamp = true;
        } else {
            exportComposite.exportConfig = new PDFExportConfig();
        }
        this.appStore.openExportOptionsModal$.next(exportComposite);
    }

    /**
     * Open add portfolio modal
     */
    openAddPortfolioModal(portfolioType: PortfolioType): void {
        this.portfolioType = portfolioType;
        this.isAddPortfolioModalOpen = true;
        this.isCreateMultiPortfolioAnalysisModalComponentOpen = false;
    }

    /**
     * Handle add portfolio modal open change
     */
    handleAddPortfolioModalOpenChange(): void {
        this.openAddPortfolioModal(PortfolioType.PORTFOLIO);
     }
 
     /**
      * Open add no portfolio modal group menu
      */
     openCreateMultiPortfolioAnalysisModalComponent(reportGroup: ReportGroup): void {
         const portfolioCount = this.reportGroup.portfolios.length;
 
         if (portfolioCount < 2) {
             this.isCreateMultiPortfolioAnalysisModalComponentOpen = true;
         } else {
             this.selectedReportGroup = reportGroup;
             this.isMultiPortfolioAnalysisSelectMenuComponentOpen = true;
         }
     }
}
