import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {
    CoreDefinitionStore, ErrorTypeConstants, ExploreSelectOptionGroup,
    SubscribableComponent,
    TelemetryActionConstants,
    TelemetryService,
    TokenConstants,
    TokenUtils, UIErrorParameters
} from '@blk/explore-ui-core';
import {ModellingTableOption} from '@enums/modelling-table-option.enum';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {CommonConstants, CompositionConstants} from '../../../../constants';
import {ModellingType} from '@enums/modelling-type.enum';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Security} from '@interfaces/security.interface';
import {cloneDeep, isEmpty, isEqual} from 'lodash';
import {WorkspaceStore} from '../../../../stores';
import {AppStore} from '../../../../app.store';
import {RefreshCompositionConfig} from '@interfaces/refresh-composition-config.interface';
import {CompositionDataService} from '../services/composition-data.service';
import {takeUntil} from 'rxjs/operators';
import {ShowCompositionTableInterface} from '@interfaces/show-composition-table.interface';
import {CustomFilter} from '@blk/explore-ui-breakdown';
import {NotificationService} from '@services/notification';

/**
 * Component class for modelling table
 */
@Component({
    selector: 'app-modelling-table',
    templateUrl: './modelling-table.component.html',
    styleUrls: ['./modelling-table.component.scss']
})
export class ModellingTableComponent extends SubscribableComponent implements OnChanges {
    readonly OPTIMIZATION_WRONG_RISK_MODEL_ERROR = 'Optimization is not compatible with the STORM or STORM 2.0 equity risk models. It is recommended to use a BFRE equity risk model, which can be configured by going to the Risk Settings tab in the Settings panel and set the "Risk model" parameter to a BFRE risk model.';

    @Output() refreshComposition: EventEmitter<RefreshCompositionConfig & ShowCompositionTableInterface> = new EventEmitter<RefreshCompositionConfig>();
    @Input() portfolio: WhatIfPortfolio;
    @Input() compositionPayload: WidgetPayload;
    @Input() showCompositionTable: boolean;
    @Input() disableResetButton: boolean;
    @Input() disableProRataOption: boolean;
    @Output() resetComposition: EventEmitter<void> = new EventEmitter();
    @ViewChild('optimizationTypeDropdown', {static: false}) optimizationTypeDropdown;
    navigateToFeasibilityReport: boolean;
    portfolioInput: WhatIfPortfolio;
    ModellingTableOption = ModellingTableOption;
    ModellingType = ModellingType;
    selectedTableOption: ModellingTableOption;
    expandModellingContainer = false;
    showTableConfiguration = false;
    showTableConfigOption: boolean;
    modellingLabel: string;
    optimizationCases: ExploreSelectOptionGroup[];
    selectedOptimizationCase: string;
    isOptimizationEnabled = TokenUtils.isFeatureEnabled(TokenConstants.ENABLE_OPTIMIZATION);
    selectedSecurities = new Map<string, Security>();
    showUploadList: boolean;

    constructor(private changeDetectorRef: ChangeDetectorRef, private compositionDataService: CompositionDataService, private appStore: AppStore, private notificationService: NotificationService) {
        super();
    }

    /**
     * OnChanges hook
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.portfolio) {
            this.showTableConfigOption =
                this.portfolio.modellingType !== ModellingType.PORTFOLIO &&
                this.selectedTableOption !== ModellingTableOption.DETAILS &&
                this.selectedTableOption !== ModellingTableOption.OPTIMIZATION;

            this.modellingLabel = CompositionConstants.MODELLING_TABLE_TYPE_LABEL[this.portfolio.modellingType];
        }
        // show efficient panel if it is set to true
        this.appStore.showEfficientFrontierPanel
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((showEfficientPanel: boolean) => {
                if (showEfficientPanel) {
                    this.setModellingTableOption(ModellingTableOption.DETAILS);
                }
            });
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Track via telemetry click on buttons (optimize model, reset composition)
     */
    trackClickOnButton(userAction: string): void {
        TelemetryService.track(userAction, undefined);
    }

    /**
     * Set the selected modelling table option
     */
    setModellingTableOption(option: number): void {
        // if user clicks on optimize model and STORM risk model is selected, throw notification error
        if ((option === 2 || option === 4) && CoreDefinitionStore.riskModelList?.filter(model => model.label.toUpperCase().includes(CommonConstants.STORM)).map(model => model.value).includes(this.portfolio.portfolioRiskSettings?.exposureRiskSettings?.riskModel)) {
            this.notificationService.error(this.OPTIMIZATION_WRONG_RISK_MODEL_ERROR, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SET_MODELLING_TABLE_OPTION_ERROR);
            return;
        }
        this.selectedTableOption = option;
        switch (option) {
            case 2:
                this.trackClickOnButton(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_OPTIMIZE_MODEL);
            case 3:
            case 4:
                this.showTableConfigOption = false;
                break;
        }
    }

    /**
     * Reset Composition Button Action
     */
    resetButton(): void {
        this.trackClickOnButton(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_RESET_COMPOSITION);
        this.resetComposition.emit();
    }

    /**
     * callback to show composition table
     */
    showCompositionTableCallback(compositionCallbackParams?: ShowCompositionTableInterface): void {
        this.refreshComposition.emit({portfolio: this.portfolio,
            ...compositionCallbackParams});
        // We don't want to remove add-cash, add-security templates or optimization on composition refresh
        if (this.selectedTableOption !== ModellingTableOption.ADD_SECURITY_OPTION
            && this.selectedTableOption !== ModellingTableOption.CASH_OPTION
            && this.selectedTableOption !== ModellingTableOption.OPTIMIZATION) {
            this.resetModellingTableOption();
        }
    }

    /**
     * Reset the selected modelling table option
     */
    resetModellingTableOption(goToFeasibilityReport?: boolean): void {
        // If selected securities have been set we need to clear them before closing the window.
        if (!isEmpty(this.selectedSecurities)) {
            this.selectedSecurities.clear();
        }
        this.navigateToFeasibilityReport = goToFeasibilityReport;
        this.selectedTableOption = goToFeasibilityReport ? ModellingTableOption.DETAILS : null;
        this.showTableConfigOption = this.portfolio.modellingType !== ModellingType.PORTFOLIO;
    }

    /**
     * Toggle showing and hiding of the table configuration and init the settings
     */
    toggleTableConfiguration(): void {
        this.showTableConfiguration = !this.showTableConfiguration;
        // Passing cloneDeep copy to modelling-setting for apply/cancel
        this.portfolioInput = cloneDeep(this.portfolio);
        // TODO: this method will extend further when modelling functionality gets implemented
    }

    toggleExpansion(): void {
        this.expandModellingContainer = !this.expandModellingContainer;
        // TODO: this method will extend further when modelling functionality gets implemented
        AppStore.expandModellingSubject$.next(this.expandModellingContainer);
    }

    /**
     * apply setting based on user action either apply or cancel
     * @param apply
     */
    applySetting(apply?: boolean) {
        if (apply) {
            const oldFilter = this.portfolio.compositionSetting.compositionFilter;
            this.portfolio.cloneChangesInPortLevelSettings(this.portfolioInput);
            this.compositionDataService.applyInputAfterCompositionRuleValidation(this.portfolio as WhatIfPortfolio, oldFilter, this.executeUpdate);
        }
        // Toggle table configuration to go back to explore-table UI
        this.toggleTableConfiguration();
    }

    /**
     * Function to update portfolio settings, clear widget contents and Load composition data for portfolio for any
     * filter change.
     */
    executeUpdate = (oldFilter: CustomFilter): void => {
        WorkspaceStore.replaceCurrentPortfolio(this.portfolio);
        this.refreshComposition.emit({
            portfolio: this.portfolio,
            showNotification: isEqual(oldFilter, this.portfolio.filter)
        });
    }

    /**
     * we want to clear out the securities when portfolio is switched
     * rather than calling clear we want to assign new reference and call change detection cycle
     * as without this table hidden property does not work as expected
     */
    clearSecurities() {
        this.selectedSecurities = new Map<string, Security>();
        this.changeDetectorRef.detectChanges();
    }
}
