import {
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface,
    AuxToggleChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {Component, OnInit} from '@angular/core';
import {PortfolioService} from '@services/portfolio';
import {cloneDeep, isNil} from 'lodash';
import {BehaviorSubject, forkJoin} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CommonConstants} from '../../../constants';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {WorkspaceStore} from '../../../stores';
import {AppUtils} from '@utils/app.utils';
import {AppStore} from '../../../app.store';
import {ReportActionType} from '@enums/report-action-type.enum';
import {
    ExploreCheckbox,
    ExplorePortfolioTypeEnum,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    ModalDirective,
    TelemetryActionConstants,
    TelemetryComparisonModeTrackingParameters,
    TelemetryService
} from '@blk/explore-ui-core';

/**
 * Modal component for comparing portfolios
 * Construct comparisonStackedData and anchorStackData
 * Update comparisonConfig of a report based on user selections
 *
 * @example
 *  <ng-container *ngIf="isCompareModalOpen">
 *      <app-compare-modal [isOpen]="isCompareModalOpen"
 *                         (modalClosed)="closeCompareModal()">
 *      </app-compare-modal>
 *  </ng-container>
 */
@Component({
    selector: 'app-compare-modal',
    templateUrl: './compare-modal.component.html',
    styleUrls: ['./compare-modal.component.scss']
})
export class CompareModalComponent extends ModalDirective<boolean> implements OnInit {

    readonly APPLY_TEXT: string = CommonConstants.BUTTON_TEXT.APPLY;
    readonly CANCEL_TEXT: string = CommonConstants.BUTTON_TEXT.CANCEL;

    // The comparison configuration for the current report.
    comparisonConfig: ComparisonConfig;

    // Flag used to control enabling the anchor setting.
    isComparisonListEmpty$ = new BehaviorSubject(true);
    isComparisonEnabled: boolean;
    isEditMode: boolean;

    // Variables used to bind the checkbox/dropdown selection items.
    comparisonStackedData: ExploreCheckbox[];
    anchorOptions: ExploreSelectOptionGroup[];
    readonly NONE_ANCHOR_OPTION_LABEL = 'None';

    allPortfolios: Portfolio[];

    // interimComparisonState is used to preserve the state when compare mode is toggled off.
    interimComparisonState: { comparisonStackedData: ExploreCheckbox[], anchorOptions: ExploreSelectOptionGroup[] };

    constructor(private appStore: AppStore, private portfolioService: PortfolioService) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        const reportKey = WorkspaceStore.getCurrentReport().comparisonConfigId;
        this.comparisonConfig = WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.get(reportKey);
        this.isEditMode = !isNil(this.comparisonConfig);
        if (isNil(this.comparisonConfig)) {
            this.comparisonConfig = new ComparisonConfig();
        }
        this.allPortfolios = WorkspaceStore.getCurrentWorkpad().getAllPortfolios();
        this.constructTelemetryData();
        // construct comparisonStackedData based on comparisonConfig
        this.comparisonStackedData = this.allPortfolios.map((portfolio: Portfolio) => {
            const isSelected = this.comparisonConfig.portComparisonList.length > 0 && this.comparisonConfig.portComparisonList.includes(portfolio.portId);
            return new ExploreCheckbox(portfolio.title || portfolio.portName, isSelected, false, portfolio.portId);
        });

        // construct anchorStackedData based on comparisonConfig
        this.anchorOptions = [new ExploreSelectOptionGroup()];
        this.anchorOptions[0].values.push(new ExploreSelectOption(this.NONE_ANCHOR_OPTION_LABEL, this.NONE_ANCHOR_OPTION_LABEL, isNil(this.comparisonConfig.portAnchorId)));
        this.allPortfolios.forEach((portfolio: Portfolio) => {
            this.anchorOptions[0].values.push(new ExploreSelectOption(portfolio.title, portfolio.portId, this.comparisonConfig.portAnchorId === portfolio.portId));
        });

        this.updateAnchorEnableState();

        this.isComparisonEnabled = !this.isComparisonListEmpty$.getValue();
    }

    onComparisonToggleChanged(event: CustomEvent<AuxToggleChangedDetailInterface>): void {
        if (event.detail.value) {
            this.isComparisonEnabled = event.detail.value.checked;
        }
        if (!this.isComparisonEnabled) {
            // If comparison mode is toggled off, keep comparisonStackedData and anchorOptions in the interim state.
            this.interimComparisonState = {
                comparisonStackedData: cloneDeep(this.comparisonStackedData),
                anchorOptions: cloneDeep(this.anchorOptions)
            };
            this.comparisonStackedData.forEach(exploreCheckbox => exploreCheckbox.checked = false);
            this.anchorOptions[0].values.forEach(exploreSelectOption => exploreSelectOption.isSelected = exploreSelectOption.displayValue === this.NONE_ANCHOR_OPTION_LABEL);
        } else if (this.interimComparisonState) {
            // If comparison mode is toggled on, and interim state is available, retrieve the values from there.
            this.comparisonStackedData = this.interimComparisonState.comparisonStackedData;
            this.anchorOptions = this.interimComparisonState.anchorOptions;
            this.interimComparisonState = null;
        }
    }

    /**
     * Constructs telemetry data
     */
    constructTelemetryData(cancelAction?: boolean): TelemetryComparisonModeTrackingParameters {
        // init empty maps
        const widgetsComparedCountMappings = new Map<string, number>();
        const portfolioTypeCountMappings = new Map<string, number>();
        // populate widget type to count map
        for (const reportWidget of WorkspaceStore.getCurrentReport().widgets) {
            if (isNil(widgetsComparedCountMappings.get(reportWidget.configType))) {
                widgetsComparedCountMappings.set(reportWidget.configType, 1);
            } else {
                const newCount = widgetsComparedCountMappings.get(reportWidget.configType) + 1;
                widgetsComparedCountMappings.set(reportWidget.configType, newCount);
            }
        }
        // populate portfoliotype to count map
        for (const port of WorkspaceStore.getCurrentWorkpad().getAllPortfolios()) {
            const portfolioType = ExplorePortfolioTypeEnum[port.getTelemetricPortfolioType()];
            if (isNil(portfolioTypeCountMappings.get(portfolioType))) {
                portfolioTypeCountMappings.set(portfolioType, 1);
            } else {
                const newCount = portfolioTypeCountMappings.get(portfolioType) + 1;
                portfolioTypeCountMappings.set(portfolioType, newCount);
            }
        }
        const telemetryComparisonModeTrackingParameters = new TelemetryComparisonModeTrackingParameters();
        telemetryComparisonModeTrackingParameters.anchorUsed = !isNil(this.comparisonConfig.portAnchorId);
        telemetryComparisonModeTrackingParameters.widgetsComparedCountMappings = widgetsComparedCountMappings;
        telemetryComparisonModeTrackingParameters.portfolioTypeCountMappings = portfolioTypeCountMappings;
        telemetryComparisonModeTrackingParameters.portfoliosCompared = this.comparisonConfig.portComparisonList.length;
        telemetryComparisonModeTrackingParameters.editMode = this.isEditMode;
        telemetryComparisonModeTrackingParameters.changeApplied = !cancelAction;
        return telemetryComparisonModeTrackingParameters;
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
    }

    /**
     * Event when the anchor portfolio is changed.
     */
    setSelectedAnchorValue(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        // Update the selected item.
        this.anchorOptions[0].values.forEach(item => item.isSelected = item.value === (event.detail.value as AuxSelectOption).value);
    }

    /**
     * apply Compare modal
     */
    applyModal(event: CustomEvent): void {
        // update comparisonConfig based on user selection
        this.comparisonConfig.portComparisonList = this.comparisonStackedData
            .filter((element: ExploreCheckbox) => element.checked)
            .map((element: ExploreCheckbox) => element.uid);

        // Set the selected anchor.
        // We should only check this if the user has actually selected some things to compare.
        const selectedAnchor = !this.isComparisonListEmpty$.getValue() ? this.anchorOptions[0].values.find(obj => obj.isSelected) : undefined;
        this.comparisonConfig.portAnchorId = selectedAnchor ? selectedAnchor.value : undefined;
        WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.set(WorkspaceStore.getCurrentReport().comparisonConfigId, this.comparisonConfig);
        // Before fetching the widget data with comparison, we need to make sure all portfolio that are being compared are updated.
        this.updatePortsInComparison(event);
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.COMPARISON_MODE, this.constructTelemetryData());
    }

    /**
     * Method to cancel changes in compare settings
     */
    cancelCompareChange(): void {
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.COMPARISON_MODE, this.constructTelemetryData(true));
        this.closeModal();
    }

    /**
     * Update portfolios in comparison list before fetching the widget data
     */
    private updatePortsInComparison(event: CustomEvent): void {
        const observableQueue = [];
        for (const port of this.allPortfolios) {
            if (this.comparisonConfig.portComparisonList.includes(port.portId)) {
                observableQueue.push(this.portfolioService.fetchPortfolioInformation$(port, { isLightVersion: true, includeMandate: true }));
            }
        }
        const isCompareModeOn = !this.isComparisonListEmpty$.getValue();

        if (observableQueue.length) {
            forkJoin(observableQueue)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(() => {
                    this.refreshWidgets(event);
                    // Close the screen.
                    this.closeModal(isCompareModeOn);
                });
        } else {
            this.refreshWidgets(event);
            // Close the screen.
            this.closeModal(isCompareModeOn);
        }
    }

    /**
     * Refresh all Widget View
     * @param event
     */
    refreshWidgets(event: CustomEvent) {
        this.appStore.reportActionSubject$.next({
            hardRefresh: AppUtils.isCtrlPressed(event),
            reportAction: ReportActionType.RELOAD_REPORT
        });
    }
}
