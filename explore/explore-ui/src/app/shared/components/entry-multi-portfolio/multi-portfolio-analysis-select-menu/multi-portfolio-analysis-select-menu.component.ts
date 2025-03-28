import {
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {Component, Input, OnInit} from '@angular/core';
import {isNil} from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {CommonConstants} from '../../../../constants';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {WorkspaceStore} from '../../../../stores';
import {
    ExploreCheckbox,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    ModalDirective
} from '@blk/explore-ui-core';
import {ReportGroup} from '@models/workspace/report-group.model';

/**
 * Select Group Modal Portfolio Menu Component
 */
@Component({
    selector: 'app-multi-portfolio-analysis-select-menu',
    templateUrl: './multi-portfolio-analysis-select-menu.component.html',
    styleUrls: ['./multi-portfolio-analysis-select-menu.component.scss']
})
export class MultiPortfolioAnalysisSelectMenuComponent extends ModalDirective<boolean> implements OnInit {

    readonly APPLY_TEXT: string = CommonConstants.BUTTON_TEXT.APPLY;
    readonly CANCEL_TEXT: string = CommonConstants.BUTTON_TEXT.CANCEL;
    readonly multiPortfolioAnalysisText: string = CommonConstants.MULTI_PORTFOLIO_ANALYSIS_TEXT;
    readonly multiPortfolioAnalysisTextWarning: string = CommonConstants.MULTI_PORTFOLIO_ANALYSIS_TEXT_WARNING;

    // The comparison configuration for the current report.
    comparisonConfig: ComparisonConfig;

    // Flag used to control enabling the anchor setting.
    isComparisonListEmpty$ = new BehaviorSubject(true);
    isComparisonEnabled: boolean;
    isEditMode: boolean;
    isGroupSelected: boolean;
    isReportSelected: boolean;

    // Variables used to bind the checkbox/dropdown selection items.
    comparisonStackedData: ExploreCheckbox[] = [];
    anchorOptions: ExploreSelectOptionGroup[];
    reportGroupOptions: ExploreSelectOptionGroup[];
    reportOptions: ExploreSelectOptionGroup[];
    readonly NONE_ANCHOR_OPTION_LABEL = 'None';

    allPortfolios: Portfolio[];
    @Input() reportGroups: ReportGroup[] = [];
    @Input() selectedReportGroup: ReportGroup;


    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.isGroupSelected = false;
        this.isReportSelected = false;
        if (this.isDropdownEnabled) {
            this.constructReportGroupOptions();
            this.anchorOptions = [new ExploreSelectOptionGroup()];
            this.anchorOptions[0].values.push(new ExploreSelectOption(this.NONE_ANCHOR_OPTION_LABEL, this.NONE_ANCHOR_OPTION_LABEL, true));
            // set isComparisonListEmpty$ to false
            this.isComparisonListEmpty$.next(false);
            this.isComparisonEnabled = !this.isComparisonListEmpty$.getValue();
            this.updateAnchorEnableState();
        } else {
            this.isGroupSelected = true;
            this.allPortfolios = this.selectedReportGroup.getAllPortfolios();
            this.anchorOptions = [new ExploreSelectOptionGroup()];
            this.anchorOptions[0].values.push(new ExploreSelectOption(this.NONE_ANCHOR_OPTION_LABEL, this.NONE_ANCHOR_OPTION_LABEL, true));
            this.populateReportOptions();
            this.constructComparisonStackedData();
            this.constructAnchorOptions();
            // set isComparisonListEmpty$ to false
            this.isComparisonListEmpty$.next(false);
            this.isComparisonEnabled = !this.isComparisonListEmpty$.getValue();

            this.updateAnchorEnableState();
        }


    }

    get isDropdownEnabled(): boolean {
        return this.reportGroups && this.reportGroups.length > 0;
    }

    /**
     * Enable/Disable the anchor based on any items in the checkbox list being selected.
     */
    updateAnchorEnableState(): void {
        const isComparisonListEmpty = this.comparisonStackedData
            .filter((element: ExploreCheckbox) => element.checked)
            .length === 0;
        this.isComparisonListEmpty$.next(isComparisonListEmpty);
    }

    /**
     * Event when a check box state is changed.
     */
    onCheckboxGroupChanged(): void {
        this.updateAnchorEnableState();
        this.constructAnchorOptions();
    }

    /**
     * Event when the anchor portfolio is changed.
     */
    setSelectedAnchorValue(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        // Update the selected item.
        this.anchorOptions[0].values.forEach(item => item.isSelected = item.value === (event.detail.value as AuxSelectOption).value);
    }

    setSelectedReportGroupValue(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        // Update the selected item.
        const selectedValue = (event.detail.value as AuxSelectOption).value;
        this.reportGroupOptions[0].values.forEach(item => item.isSelected = item.value === selectedValue);
        // Map the selection to a real report group
        const workspace = WorkspaceStore.getWorkspace();
        if (workspace && workspace.workpads) {
            const reportGroup = workspace.workpads.find(workpad => {
                const reportGroupWorkpad = workpad as ReportGroup;
                return reportGroupWorkpad.id === selectedValue;
            }) as ReportGroup;

            if (reportGroup) {
                this.selectedReportGroup = reportGroup;
            } else {
                console.error('Report group not found');
            }
        }
        this.selectedReportGroup = workspace.workpads.find(workpad => {
            const reportGroupWorkpad = workpad as ReportGroup;
            return reportGroupWorkpad.id === this.reportGroupOptions[0].values.find(obj => obj.isSelected).value;
        }) as ReportGroup;
        this.populateReportOptions();
        this.constructComparisonStackedData();
        this.isGroupSelected = true;
    }

    /**
     * Construct report group options
     */
    constructReportGroupOptions(): void {
        if (isNil(this.comparisonConfig)) {
            this.comparisonConfig = new ComparisonConfig();
        }
        this.reportGroupOptions = [new ExploreSelectOptionGroup()];
        const workspace = WorkspaceStore.getWorkspace();
        if (workspace && workspace.workpads) {
            // Filter workpads that are instances of ReportGroup

            // Add filtered workpads to reportGroupOptions
            this.reportGroupOptions[0].values = this.reportGroups.map(reportGroup =>
                new ExploreSelectOption(reportGroup.title, reportGroup.id, this.comparisonConfig.portAnchorId === reportGroup.id)
            );
        }
    }

    /**
     * populate the report options based on the selected report group
     */
    populateReportOptions(): void {
        this.reportOptions = [new ExploreSelectOptionGroup()];
        this.reportOptions[0].values = this.selectedReportGroup.reports.map(report => new ExploreSelectOption(report.title, {
            comparisonConfigId: report.comparisonConfigId,
            reportId: report.id,
            reportKey: report.key
        }, null));
    }

    /**
     * Construct anchor options based on the selected report group
     */
    constructAnchorOptions(): void {
        this.anchorOptions = [new ExploreSelectOptionGroup()];
        this.anchorOptions[0].values.push(new ExploreSelectOption(this.NONE_ANCHOR_OPTION_LABEL, this.NONE_ANCHOR_OPTION_LABEL, true));
        if (this.selectedReportGroup) {
            this.selectedReportGroup.portfolios.forEach(portfolio => {
                const isChecked = this.comparisonStackedData.some(checkbox => checkbox.uid === portfolio.portId && checkbox.checked);
                if (isChecked) {
                    this.anchorOptions[0].values.push(new ExploreSelectOption(portfolio.portName, portfolio.portId, null));
                }
            });
        }
    }


    /**
     * Update anchor options based on the selected report group
     */
    updateAnchorOptions(selectedValue: number): void {
        this.anchorOptions = [new ExploreSelectOptionGroup()];
        this.anchorOptions[0].values.push(new ExploreSelectOption(this.NONE_ANCHOR_OPTION_LABEL, this.NONE_ANCHOR_OPTION_LABEL, true));
        if (this.selectedReportGroup) {
            this.updateComparisonConfigforAnchorOptions(this.selectedReportGroup, selectedValue);
            this.addCheckedPortfoliosToAnchorOptions(this.selectedReportGroup);
        }
    }


    private updateComparisonConfigforAnchorOptions(reportGroup: ReportGroup, selectedValue: number): void {
        const report = reportGroup.reports.find(report => report.comparisonConfigId === selectedValue);
        const oldComparisonConfig = this.comparisonConfig;
        const reportKey = report?.comparisonConfigId;
        if (reportGroup.comparisonConfigMap.size > 0) {
            this.comparisonConfig = reportGroup.comparisonConfigMap.get(reportKey) || oldComparisonConfig;
        }
    }

    private addCheckedPortfoliosToAnchorOptions(reportGroup: ReportGroup): void {
        reportGroup.portfolios.forEach(portfolio => {
            const isChecked = this.comparisonStackedData.some(checkbox => checkbox.uid === portfolio.portId && checkbox.checked);
            const isSelected = this.comparisonConfig.portAnchorId === portfolio.portId;
            if (isSelected) {
                // unselect the selected this.NONE_ANCHOR_OPTION_LABEL in the anchorOptions
                if (this.anchorOptions[0].values[0].value === this.NONE_ANCHOR_OPTION_LABEL) {
                    this.anchorOptions[0].values[0].isSelected = false;
                }
            }
            if (isChecked) {
                this.anchorOptions[0].values.push(new ExploreSelectOption(portfolio.portName, portfolio.portId, this.comparisonConfig.portAnchorId === portfolio.portId));
            }

        });
    }

    /**
     * Construct comparisonStackedData based on comparisonConfig, when no report is yet selected
     */
    constructComparisonStackedData(): void {
        this.allPortfolios = this.selectedReportGroup.portfolios;
        this.comparisonStackedData = this.allPortfolios.map((portfolio: Portfolio) => {
            return new ExploreCheckbox(portfolio.title || portfolio.portName, false, false, portfolio.portId);
        });
    }

    /**
     * Update comparisonStackedData based on comparisonConfig, this update makes sure if the user has already selected multi-modal analysis, it should be reflected here
     */
    updateComparisonStackedData(selectedValue: number): void {
        if (this.selectedReportGroup) {
            this.allPortfolios = this.selectedReportGroup.portfolios;
            const report = this.selectedReportGroup.reports.find(report =>
                report.comparisonConfigId === selectedValue
            );

            const reportKey = report.comparisonConfigId;

            // save the old this.comparisonConfig here
            const oldComparisonConfig = this.comparisonConfig;

            if (this.selectedReportGroup.comparisonConfigMap.size > 0) {
                this.comparisonConfig = this.selectedReportGroup.comparisonConfigMap.get(reportKey);
                // if this.comparisonConfig is not found, it should be the oldComparisonConfig
                if (!this.comparisonConfig) {
                    this.comparisonConfig = oldComparisonConfig;
                }
            }

        }

        this.updateComparisonStackedDataFromPortfolios();
        this.updateAnchorOptions(selectedValue);
    }


    private updateComparisonStackedDataFromPortfolios(): void {
        this.comparisonStackedData = this.allPortfolios.map((portfolio: Portfolio) => {
            const isSelected = this.comparisonConfig?.portComparisonList.length > 0 && this.comparisonConfig.portComparisonList.includes(portfolio.portId);
            return new ExploreCheckbox(portfolio.title || portfolio.portName, isSelected, false, portfolio.portId);
        });
        this.updateAnchorEnableState();
    }


    /*
    * Event when the report is changed
    */
    setSelectedReportValue(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        const selectedValue = (event.detail.value as AuxSelectOption).value.comparisonConfigId;
        this.reportOptions[0].values.forEach(item => {
            item.isSelected = item.value.comparisonConfigId === selectedValue;
        });
        this.constructAnchorOptions();

        // get the real report
        const realReport = this.selectedReportGroup.reports.find(report => report.key === (event.detail.value as AuxSelectOption).value.reportKey);
        // get the comparisonConfig from the reportGroup
        const reportKey = realReport.comparisonConfigId;
        this.comparisonConfig = this.selectedReportGroup.comparisonConfigMap.get(reportKey);
        if (!this.comparisonConfig) {
            this.comparisonConfig = new ComparisonConfig();
        }

        // need to update the comparisonConfig based on the selected report
        this.updateComparisonStackedData(selectedValue);
        this.isReportSelected = true;
    }

    /**
     * apply Compare modal
     */
    applyModal(): void {
        this.updateComparisonConfig();
        this.setSelectedAnchor();


        if (this.selectedReportGroup) {
            const selectedReport = this.getSelectedReport();
            if (selectedReport) {
                this.updateReportGroupComparisonConfig(this.selectedReportGroup, selectedReport);
                this.finalizeModal(this.selectedReportGroup);
            }
        }
    }


    private updateComparisonConfig(): void {
        this.comparisonConfig.portComparisonList = this.comparisonStackedData
            .filter((element: ExploreCheckbox) => element.checked)
            .map((element: ExploreCheckbox) => element.uid);
    }

    private setSelectedAnchor(): void {
        const selectedAnchor = !this.isComparisonListEmpty$.getValue() ? this.anchorOptions[0].values.find(obj => obj.isSelected) : undefined;
        this.comparisonConfig.portAnchorId = selectedAnchor ? selectedAnchor.value : undefined;
    }


    private getSelectedReport(): ExploreSelectOption | undefined {
        return this.reportOptions[0].values.find(obj => obj.isSelected);
    }

    private updateReportGroupComparisonConfig(reportGroup: ReportGroup, selectedReport: ExploreSelectOption): void {
        const realReport = reportGroup.reports.find(report => report.comparisonConfigId === selectedReport.value.comparisonConfigId);
        if (realReport) {
            reportGroup.comparisonConfigMap.set(realReport.comparisonConfigId, this.comparisonConfig);
        }
    }

    private finalizeModal(reportGroup: ReportGroup): void {
        const isCompareModeOn = !this.isComparisonListEmpty$.getValue();
        WorkspaceStore.validateWorkpadAndUpdate(reportGroup, null, null, null, true);
        this.closeModal(isCompareModeOn);
    }

    /**
     * Method to cancel changes in compare settings
     */
    cancelCompareChange(): void {
        this.closeModal();
    }

    /**
     * Close Select Group Modal Portfolio Menu Modal
     */
    closeSelectGroupModalPortfolioMenuModal(): void {
        this.isOpen = false;
    }
}
