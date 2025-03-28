import {Component, OnInit} from '@angular/core';
import {UserMetaDataStore} from '@stores/user-meta-data.store';
import {WorkspaceStore} from '@stores/workspace.store';
import {ReportGroup} from '@models/workspace/report-group.model';
import {CommonConstants, UserPreference} from '../../constants';
import {takeUntil} from 'rxjs/operators';
import {ClickElemConstants, SubscribableComponent, TokenConstants, TokenUtils} from '@blk/explore-ui-core';
import {AuxInlineMenuItemClickedDetailInterface} from '@blk/aladdin-angular-components';
import {NotificationService} from '@services/notification';
import {TelemetryClickService} from '@services/telemetry/telemetry-click.service';
import {PortfolioMenuItemsConstants} from '@constants/portfolio-menu-items.constants';
import {PortfolioType} from '../../shared/components/add-portfolio-modal/portfolio-type.enum';

/**
 * Side Bar Component
 *
 * @example
 *  <app-side-bar slot="drawer"></app-side-bar>
 */
@Component({
    selector: 'app-side-bar',
    templateUrl: './side-bar.component.html',
    styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent extends SubscribableComponent implements OnInit {

    isOpen = true;
    isCreateMultiPortfolioAnalysisModalComponentOpen = false;
    isCreateGroupModalPortfolioMenuOpen = false;
    isMultiPortfolioAnalysisSelectMenuComponentOpen = false;
    isAddPortfolioModalOpen = false;
    portfolioMenuOptions: any;
    displayFullPortfolioName = false;
    portfolioType: PortfolioType;
    reportGroups: ReportGroup[];
    readonly reportGrpBtnLabel = CommonConstants.BUTTON_TEXT.REPORT_GROUP;
    readonly applyText = CommonConstants.BUTTON_TEXT.CREATE_GROUP;
    readonly cancelText = CommonConstants.BUTTON_TEXT.CANCEL;

    constructor(private notificationService: NotificationService, private telemetryClickService: TelemetryClickService) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        // Subscribe to any changes in the nav bar preference changing.
        UserMetaDataStore.getPreferenceSubject(UserPreference.NAVIGATION_DRAWER_OPEN)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(value => {
                this.isOpen = value === 'true';
            }
        );
        UserMetaDataStore.getPreferenceSubject(UserPreference.DISPLAY_FULL_PORTFOLIO_NAME)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(value => {
                    this.displayFullPortfolioName = value === 'true';
                    this.updatePortfolioMenuOptions();
                }
            );
    }

    updatePortfolioMenuOptions() {
        this.portfolioMenuOptions = [
            [
                {label: PortfolioMenuItemsConstants.LABELS.ADD_PORTFOLIO}
            ],
            [
                {label: PortfolioMenuItemsConstants.LABELS.ADD_WHAT_IF_PORTFOLIO},
                {label: PortfolioMenuItemsConstants.LABELS.ADD_CUSTOM_PORTFOLIO},
                {label: PortfolioMenuItemsConstants.LABELS.ADD_INDEX_RESEARCH}
            ],
            [
                {label: PortfolioMenuItemsConstants.LABELS.CREATE_NEW_GROUP},
                {label: PortfolioMenuItemsConstants.LABELS.ENABLE_MULTI_PORTFOLIO_ANALYSIS}
            ],
            [
                {label: this.displayFullPortfolioName ? PortfolioMenuItemsConstants.LABELS.SHOW_PORTFOLIO_TICKER : PortfolioMenuItemsConstants.LABELS.SHOW_PORTFOLIO_FULL_NAME}
            ]
        ];
        if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_EXPOSURE_BASED_PORT)) {
            // add exposure based portfolio menu item to the second row
            this.portfolioMenuOptions[1].push({label: PortfolioMenuItemsConstants.LABELS.ADD_EXPOSURE_BASED_PORTFOLIO});
        }
    }

    /**
     * Method is triggered on clicking Add Report Group button to create new Report Group
     */
    createReportGroup(): void {
        const reportGroup = new ReportGroup();
        reportGroup.isOpen = true;
        reportGroup.isUserCreated = true;
        reportGroup.editMode = true;
        this.notificationService.success('Report Group added! Drag portfolios into your report group to view shared reports.');
        WorkspaceStore.getWorkspace().addWorkpads(reportGroup);
        this.telemetryClickService.reportGroupClick(this.reportGrpBtnLabel, ClickElemConstants.SOURCE.SIDE_BAR);
    }

    /**
     * Event when the side bar is opened.
     */
    onDrawerClosed(): void {
        UserMetaDataStore.setPreferenceValue(UserPreference.NAVIGATION_DRAWER_OPEN, 'false');
    }

    /**
     * Event when the side bar is closed.
     */
    onDrawerOpened(): void {
        UserMetaDataStore.setPreferenceValue(UserPreference.NAVIGATION_DRAWER_OPEN, 'true');
    }

    /**
     * Method is triggered when any of menu is clicked/selected
     */
    onMenuClicked(event: CustomEvent<AuxInlineMenuItemClickedDetailInterface>): void {
        switch (event.detail.element.label) {
            case PortfolioMenuItemsConstants.LABELS.SHOW_PORTFOLIO_FULL_NAME:
                this.displayFullPortfolioName = true;
                UserMetaDataStore.setPreferenceValue(UserPreference.DISPLAY_FULL_PORTFOLIO_NAME, this.displayFullPortfolioName.toString());
                break;
            case PortfolioMenuItemsConstants.LABELS.SHOW_PORTFOLIO_TICKER:
                this.displayFullPortfolioName = false;
                UserMetaDataStore.setPreferenceValue(UserPreference.DISPLAY_FULL_PORTFOLIO_NAME, this.displayFullPortfolioName.toString());
                break;
            case PortfolioMenuItemsConstants.LABELS.CREATE_NEW_GROUP:
                this.createReportGroup();
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
            case PortfolioMenuItemsConstants.LABELS.ENABLE_MULTI_PORTFOLIO_ANALYSIS:
                if (this.hasReportGroupWorkpad()) {
                    this.openSelectGroupModalPortfolioMenuModal();
                } else {
                    this.openCreateMultiPortfolioAnalysisModalComponent();
                }
                break;
        }
        this.telemetryClickService.sideBarPortfoliosMenuBarClick(event.detail.element.label);
    }


    /**
     * Open add portfolio modal
     */
    openAddPortfolioModal(portfolioType: PortfolioType): void {
        this.portfolioType = portfolioType;
        this.isAddPortfolioModalOpen = true;
    }

    /**
     * Close add portfolio modal
     */
    closeAddPortfolioModal(): void {
        this.isAddPortfolioModalOpen = false;
    }

    /**
     * function to open the No Group Modal Portfolio Menu Modal
     */
    openCreateMultiPortfolioAnalysisModalComponent(): void {
        this.isCreateMultiPortfolioAnalysisModalComponentOpen = true;
    }

    /**
     * function to open the Select Group Modal Portfolio Menu Modal
     */
    openSelectGroupModalPortfolioMenuModal(): void {
        this.reportGroups = WorkspaceStore.getWorkspace().getReportGroups();
        this.isMultiPortfolioAnalysisSelectMenuComponentOpen = true;
    }


    /**
     * Close No Group Modal Portfolio Menu Modal
     */
    closeCreateMultiPortfolioAnalysisModalComponent(): void {
        this.isCreateMultiPortfolioAnalysisModalComponentOpen = false;
    }

    /**
     * Close Create Group Modal Portfolio Menu Modal
     */
    closeCreateGroupModalPortfolioMenuModal(): void {
        this.isCreateGroupModalPortfolioMenuOpen = false;
    }

    /**
     * Close Select Group Modal Portfolio Menu Modal
     */
    closeMultiPortfolioAnalysisSelectMenuComponent(): void {
        this.isMultiPortfolioAnalysisSelectMenuComponentOpen = false;
    }

    /**
     * function to open the Create Group Modal Portfolio Menu Modal
     */
    createGroupModal(): void {
        this.isCreateGroupModalPortfolioMenuOpen = true;
        this.isCreateMultiPortfolioAnalysisModalComponentOpen = false;
    }

    /**
     * Determine if the current workspace has a report group workpad
     */
    hasReportGroupWorkpad(): boolean {
        const workspace = WorkspaceStore.getWorkspace();
        if (!workspace || !workspace.workpads) {
          return false;
        }

        const reportGroups = workspace.getReportGroups();
        return reportGroups.length > 0;
    }

}
