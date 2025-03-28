import {
    AuxTabBarItemSelectedDetailInterface,
    AuxTextInputValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {BenchmarkConstants, CommonConstants} from '../../constants';
import {NotificationService} from '@services/notification';
import {cloneDeep, isEmpty} from 'lodash';
import {WorkspaceStore} from '../../stores';
import {CompositionDataService} from '../main/composition-modelling/services/composition-data.service';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {AppStore} from '../../app.store';
import {CustomFilter} from '@blk/explore-ui-breakdown';
import {
    CoreCommonConstants,
    EventType,
    TelemetryActionConstants,
    TelemetryGenericEventParameters,
    TelemetryService,
    TokenConstants,
    TokenUtils
} from '@blk/explore-ui-core';
import {LookthroughConstants} from '@blk/explore-ui-look-through-settings';
import {DecisionBenchmarkService} from '@services/widget/decision-benchmark-service';
import {NotificationConstants} from '@constants/notification.constants';
import {MultiManagerUtils} from '@utils/multi-manager.utils';


/**
 * Portfolio Settings Modal Component
 *
 * @example
 *
 *  <ng-container *ngIf="isPortfolioSettingsModalOpen">
 *      <app-portfolio-settings-modal [isOpen]="isPortfolioSettingsModalOpen"
 *                                    (modalClosed)="closePortfolioSettingsModal()"
 *                                    [portfolio]="portfolioSettingsInput">
 *      </app-portfolio-settings-modal>
 *  </ng-container>
 */
@Component({
    selector: 'app-portfolio-settings-modal',
    templateUrl: './portfolio-settings-modal.component.html',
    styleUrls: ['./portfolio-settings-modal.component.scss']
})
export class PortfolioSettingsModalComponent implements OnInit {
    // variables to control modal open/close event
    @Input() isOpen: boolean;
    @Input() showEpnlSettings = false;
    @Input() skipClearWidgetContent = false;
    @Output() modalClosed = new EventEmitter();
    @Input() isBatch?: boolean;

    @Input() portfolio: Portfolio;
    // passable flag to make reload prompt invocation configurable
    @Input() triggerWidgetReloadEvents = true;
    clonedPortfolio: Portfolio;
    showPositionModes = false;
    selectedOption = '0';
    isWhatIfPortfolio: boolean;
    populatedName: string;
    showFilterScalingOptions: boolean;
    showAdvancedAttributionSettings: boolean;
    displaySettingsOnDone = new TelemetryGenericEventParameters(EventType.PORTFOLIO_INPUT_DONE_EVENT);
    isMultiManagerEnabled: boolean;

    readonly RISK_SETTINGS = 'Risk Settings';
    readonly SPLIT_POSITION = 'Split Positions';
    readonly PORTFOLIO_FILTER = 'Portfolio Filter';
    readonly PERFORMANCE_SETTINGS = 'Performance Settings';
    readonly MULTI_MANAGER = 'Multi Manager';
    readonly EPNL_SETTINGS = 'EPNL Settings';
    readonly LOOK_THROUGH: string = LookthroughConstants.LOOK_THROUGH_CONST.LT_WITH_CAPITAL_L;
    readonly BENCH_AGGREGATE: string = BenchmarkConstants.BENCH_AGGREGATE;
    readonly APPLY_TEXT: string = CommonConstants.BUTTON_TEXT.APPLY;
    readonly CANCEL_TEXT: string = CommonConstants.BUTTON_TEXT.CANCEL;

    portfolioSettingsTabData = [
        {
            'label': this.SPLIT_POSITION,
            'uid': '0'
        },
        {
            'label': this.LOOK_THROUGH,
            'uid': '1'
        },
        {
            'label': this.PORTFOLIO_FILTER,
            'uid': '2'
        },
        {
            'label': this.RISK_SETTINGS,
            'uid': '3'
        },
        {
            'label': this.PERFORMANCE_SETTINGS,
            'uid': '4'
        }
    ];

    constructor(private notificationService: NotificationService, private compositionDataService: CompositionDataService, private appStore: AppStore, private decisionBenchmarkService: DecisionBenchmarkService) {
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.isMultiManagerEnabled = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_MULTI_MANAGER);
        if(this.isMultiManagerEnabled){
            this.portfolioSettingsTabData.push({
                'label': this.MULTI_MANAGER,
                'uid': '6'
            });
        }
        this.populatedName = this.portfolio.getDisplayTitle();
        this.clonedPortfolio = cloneDeep(this.portfolio);
        this.showPositionModes = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_POSITION_MODES);
        this.showFilterScalingOptions = true;
        if (this.showEpnlSettings) {
            this.portfolioSettingsTabData.push({
                'label': this.EPNL_SETTINGS,
                'uid': '5'
            });
        }
        this.showAdvancedAttributionSettings = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ADVANCED_ATTRIBUTION_SETTINGS);
    }

    /**
     * Close portfolioSettings widgets modal
     */
    closeModal(apply?: boolean): void {
        if (apply) {
            // Validate the decision level configuration for Multi Manager
            const isValidDecisionLevelConfig = MultiManagerUtils.isValidDecisionBenchConfig(this.clonedPortfolio.decisionLevelsConfig?.decisionBenchMap, this.clonedPortfolio.decisionLevelsConfig?.allSectorPaths);
            if(this.isMultiManagerEnabled && !isValidDecisionLevelConfig){
                this.notificationService.error(NotificationConstants.INCOMPLETE_DECISION_BENCHMARKS);
                return;
            }

            // Populate the original state of widget inputs for telemetry
            this.populateTelemetryParametersForPortfolioInputs(true);

            const oldFilter = this.portfolio.filter;
            this.portfolio.cloneChangesInPortLevelSettings(this.clonedPortfolio);
            this.portfolio.title = this.clonedPortfolio.title;
            if (!this.isBatch) {
                this.compositionDataService.applyInputAfterCompositionRuleValidation(this.portfolio as WhatIfPortfolio, oldFilter, this.executeUpdate);
                WorkspaceStore.updateCurrentPortfolio(this.portfolio);
            }
            if (this.triggerWidgetReloadEvents) {
                this.notificationService.invokeWidgetReloadPrompt();
            }

            // Populate the original state of widget inputs for telemetry
            this.populateTelemetryParametersForPortfolioInputs(false);

            if (this.displaySettingsOnDone.details.size > 0) {
                // Track telemetry only if the details map is populated
                TelemetryService.track(TelemetryActionConstants.GENERIC_EVENT, this.displaySettingsOnDone);
            }
        }

        // Overwrite the selection at time of Apply/Cancel
        // Every time will open setting split-Setting tab would be the selected one
        this.selectedOption = '0';
        this.isOpen = false;
        this.modalClosed.emit();
    }

    /**
     * populates telemetry parameters for portfolio inputs
     * original inputs are always tracked and new inputs are tracked only if there is a change.
     */
    private populateTelemetryParametersForPortfolioInputs(isOriginal: boolean): void {
        try {
            for (const [key, value] of Object.entries(this.portfolio.performanceSettings.getTrackableProperties())) {
                const widgetInputKey = 'PerformanceSettings_' + key;
                const original = widgetInputKey + '_' + CoreCommonConstants.ORIGINAL;
                if (isOriginal) {
                    this.displaySettingsOnDone.details.set(original, value?.toString() ?? '');
                } else {
                    if (this.displaySettingsOnDone.details.get(original) === value?.toString() || (this.displaySettingsOnDone.details.get(original) === '' && isEmpty(value))) {
                        this.displaySettingsOnDone.details.delete(original);
                    } else {
                        this.displaySettingsOnDone.details.set(widgetInputKey, value?.toString() ?? '');
                    }
                }
            }
        } catch (e) {
            console.log('Error populating the telemetry parameters in the portfolio object ', e);
        }
    }

    /**
     * Function to update portfolio settings, clear widget contents and Load composition data for portfolio for any
     * filter change.
     */
    executeUpdate = (oldFilter: CustomFilter): void => {
        if (!this.skipClearWidgetContent && WorkspaceStore.getWorkspace() && WorkspaceStore.getCurrentWorkpad()) {
            if (!oldFilter.equals(this.clonedPortfolio.filter) && this.portfolio instanceof WhatIfPortfolio) {
                this.appStore.clearHoldingChangesAndRefreshComposition$.next(this.portfolio);
            }
        }
    }

    /**
     * Event handler for change in the name of portfolio
     */
    onValueChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.clonedPortfolio.title = event.detail.value;
    }

    /**
     * Event handler for onTabSelected event. Decides the view to be shown
     */
    onTabSelected(event: CustomEvent<AuxTabBarItemSelectedDetailInterface>): void {
        if (!event) {
            return;
        }

        this.selectedOption = event.detail.uid;
    }

    /**
     * Update the apply filter drop down selection
     */
    updateApplyFilter(value: string): void {
        this.clonedPortfolio.applyFilterTo = value;
    }
}
