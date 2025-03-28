import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    EventEmitter,
    Inject,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {OptimizationSettingsService} from './service/optimization-settings.service';
import {OPTIMIZATION_SETTINGS_SERVICE} from './tokens/optimization-settings-service.token';
import {SettingsTab} from './models/settings-tab-data.model';
import {
    SETTING_NAME_INVESTMENT_UNIVERSE,
    SETTING_NAME_OBJECTIVES,
    SETTING_NAME_PARENT_CONFIG
} from '@optimization-settings/constants/settings-tab-metadata.constants';
import {isArray, isEmpty, isNil} from 'lodash';
import {NotificationService} from '@services/notification';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {ALL_TYPE, ONE_TYPE} from '@optimization-settings/constraints-settings/constants/sector-constraint.constants';
import {ObjectiveSettings} from '@models/portfolio/objectives/objective.settings.model';
import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';
import {CoreCommonConstants, ErrorTypeConstants, UIErrorParameters} from '@blk/explore-ui-core';
import {InvestmentUniverseSettings} from '@models/portfolio/investmentUniverse/investment-universe-settings.model';
import {InvestmentUniversePortfolio} from '@models/portfolio/investmentUniverse/investment-universe-portfolio.model';
import {InvestmentUniverseSecurity} from '@models/portfolio/investmentUniverse/investment-universe-security.model';
import {
    DUPLICATE_LABEL_MESSAGE, EMPTY_BREAKDOWN_SECTOR_CONSTRAINT_MESSAGE,
    EMPTY_FACTOR_TAG_OR_BLOCK_MESSAGE,
    EMPTY_FILTER_SECTOR_CONSTRAINT_MESSAGE,
    EMPTY_LABEL_MESSAGE,
    EMPTY_OBJECTIVE_MESSAGE,
    EMPTY_PORTFOLIO_MESSAGE,
    EMPTY_SECURITY_LIST_MESSAGE,
    EMPTY_UNIVERSE_MESSAGE,
    NO_DATE_RANGE_SELECTED,
    OPTIMIZATION_EFFICIENT_FRONTIER_CONFIG_ERROR,
    OPTIMIZATION_EFFICIENT_FRONTIER_SECTOR_CONFIG_ERROR
} from '@optimization-settings/constants/optimization-notification-messages.constants';
import {InvestmentUniverseItemBase} from '@models/portfolio/investmentUniverse/investment-universe-item-base.model';
import {OptimizationConstants} from '@constants/optimization.constants';
import {CompositionUtils} from '@utils/composition.utils';
import {
    StressScenarioDateRangeObjective
} from '@models/portfolio/objectives/stress-scenario-date-range-objective.model';
import {RiskParityCase} from '@enums/risk-parity-case.enum';
import {AuxTabBarItemInterface} from '@blk/aladdin-angular-components';
import {Breakdown} from '@blk/explore-ui-breakdown';

/**
 * This component creates a modal which is a container of several tabs. It expects SettingsTab array
 * to be provided by specific users/applications. Each individual SettingsTab has properties - name, component and inputs,
 * where name is the tab name , component is the one whose instance is to be created
 * and inputs provides a key value pair for the @Inputs properties to be provided in those components, where key is the input property
 * name and value is the value to be provided for those Input properties.
 */
@Component({
    selector: 'app-optimization-settings-modal',
    templateUrl: './optimization-settings-modal.component.html',
    styleUrls: ['./optimization-settings-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizationSettingsModalComponent implements OnInit, AfterViewInit {
    @Input() isOpen: boolean;
    @Input() type: string;
    @Input() subType: string;
    @Input() isRiskParitySettingsModal: boolean;
    @Input() riskParityCase: RiskParityCase;

    @Output() modalClosed = new EventEmitter<boolean>();

    @ViewChild('settingsTabsContainer', {read: ViewContainerRef}) settingsTabsContainer: ViewContainerRef;

    components: any[];
    settingsTabs: SettingsTab[];
    activeIndex: number;
    modalHeader: string;

    settingsTabData: AuxTabBarItemInterface[];

    constructor(
        @Inject(OPTIMIZATION_SETTINGS_SERVICE) private optimizationSettingsService: OptimizationSettingsService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private cdRef: ChangeDetectorRef,
        public notificationService: NotificationService
    ) {}

    ngOnInit() {
        this.modalHeader = this.isRiskParitySettingsModal ? OptimizationConstants.RISK_PARITY_SETTINGS_TITLE : OptimizationConstants.NEW_OPTO_SETTINGS_TITLE;
        this.settingsTabs = this.isRiskParitySettingsModal ? this.optimizationSettingsService.loadRiskParitySettings() : this.optimizationSettingsService.loadSettings();
        const activeIndex: number = this.settingsTabs.findIndex((settingsTab: SettingsTab) => settingsTab.type === this.type);
        this.activeIndex = activeIndex === -1 ? 0 : activeIndex;
        this.settingsTabData = this.settingsTabs.map((settingsTab: SettingsTab, index: number) => {
           return {label: settingsTab.name, uid: index.toString()};
        });
    }

    ngAfterViewInit() {
        this.updateComponent(this.activeIndex);
    }

    /**
     * Method invoked on tab switch
     */
    onTabSelected(event: CustomEvent): void {
        this.activeIndex = Number(event.detail.uid);
        this.updateComponent(this.activeIndex);
    }

    updateComponent(tabIndex: number) {
        this.settingsTabsContainer.clear();
        const componentFactory: ComponentFactory<any> = this.componentFactoryResolver.resolveComponentFactory(
            this.settingsTabs[tabIndex].component
        );
        const componentRef: ComponentRef<any> = this.settingsTabsContainer.createComponent(componentFactory);
        const settingsTab = this.settingsTabs[tabIndex];
        settingsTab.inputs.forEach((value: any, key: string) => {
            componentRef.instance[key] = value;
        });
        if (settingsTab.subTypeInput) {
            componentRef.instance[settingsTab.subTypeInput] = this.subType;
        }
        this.cdRef.detectChanges();
    }

    closeModal(isSave: boolean): void {
        let hasChanges = false;
        if (isSave) {
            if (!this.isRiskParitySettingsModal) {
                const errorMessageForConstraints: string = this.validateConstraints(this.settingsTabs[2].inputs.get(SETTING_NAME_PARENT_CONFIG));
                const errorMessageForObjectives: string = this.validateObjectives(this.settingsTabs[1].inputs.get(SETTING_NAME_OBJECTIVES));
                const errorMessageForInvestmentUniverse: string = this.validateInvestmentUniverse(this.settingsTabs[0].inputs.get(SETTING_NAME_INVESTMENT_UNIVERSE));
                let errorMessage: string;
                if (!isEmpty(errorMessageForInvestmentUniverse)) {
                    errorMessage = errorMessageForInvestmentUniverse;
                } else if (!isEmpty(errorMessageForObjectives)) {
                    errorMessage = errorMessageForObjectives;
                } else if (!isEmpty(errorMessageForConstraints)) {
                    errorMessage = errorMessageForConstraints;
                }
                // show relevant error message
                if (!isEmpty(errorMessage)) {
                    this.notificationService.error(errorMessage, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CLOSE_MODAL_ERROR);
                    return;
                }
                hasChanges = this.optimizationSettingsService.saveSettings(this.settingsTabs);
            } else {
                hasChanges = this.optimizationSettingsService.saveRiskParitySettings(this.settingsTabs, this.riskParityCase);
            }
        }
        this.isOpen = false;
        this.modalClosed.emit(hasChanges);
    }

    /**
     * validate Investment universe
     */
    private validateInvestmentUniverse(investmentUniverseSettings: InvestmentUniverseSettings): string {
        if (!investmentUniverseSettings || !investmentUniverseSettings.investmentUniverse
            || isEmpty(investmentUniverseSettings.investmentUniverse.filter(item => item.enabled))) {

            return EMPTY_UNIVERSE_MESSAGE;
        }

        for (const investmentUniverseItem of investmentUniverseSettings.investmentUniverse) {
            if (isEmpty(investmentUniverseItem.label)) {
                return EMPTY_LABEL_MESSAGE;
            } else if (investmentUniverseItem instanceof InvestmentUniversePortfolio && isEmpty(investmentUniverseItem.portfolio)) {
                return EMPTY_PORTFOLIO_MESSAGE;
            } else if (investmentUniverseItem instanceof InvestmentUniverseSecurity && isEmpty(investmentUniverseItem.securities)) {
                return EMPTY_SECURITY_LIST_MESSAGE;
            }
        }

        const nonFrozenEnabledItems: InvestmentUniverseItemBase[] = investmentUniverseSettings.investmentUniverse.filter(item => !item.isFrozen && item.enabled);
        const enabledAdditionalPorts: InvestmentUniverseItemBase[] = nonFrozenEnabledItems.filter(item => item instanceof InvestmentUniversePortfolio);
        const enabledAdditionalAssets: InvestmentUniverseItemBase[] = nonFrozenEnabledItems.filter(item => item instanceof InvestmentUniverseSecurity);
        if (new Set(enabledAdditionalPorts.map(item => item.label)).size < enabledAdditionalPorts.length
            || new Set(enabledAdditionalAssets.map(item => item.label)).size < enabledAdditionalAssets.length) {
            return DUPLICATE_LABEL_MESSAGE;
        }
    }

    /**
     * validate optimization objectives
     */
    private validateObjectives(objectiveSettings: ObjectiveSettings): string {
        if (!objectiveSettings) {
            return CoreCommonConstants.EMPTY_STRING;
        }

        if (!isEmpty(objectiveSettings.portfolioObjectives)) {
            if (!isEmpty(objectiveSettings.portfolioObjectives.filter(objective => objective instanceof StressScenarioDateRangeObjective && !objective.isDateRangeValid()))) {
                return NO_DATE_RANGE_SELECTED;
            }
            return objectiveSettings.portfolioObjectives.every((portfolioObjective: PortfolioObjective) =>
                portfolioObjective.key !== CoreCommonConstants.EMPTY_STRING
            ) ? CoreCommonConstants.EMPTY_STRING : EMPTY_OBJECTIVE_MESSAGE;
        }

        return CoreCommonConstants.EMPTY_STRING;
    }

    /**
     * validate optimization constraints
     */
    private validateConstraints(optimizationSettings: OptimizationSettings): string {
        if (!optimizationSettings) {
            return CoreCommonConstants.EMPTY_STRING;
        }

        const efficientConstraintErrorMsg = this.validateEfficientEnabledConstraints(optimizationSettings);
        if (efficientConstraintErrorMsg !== CoreCommonConstants.EMPTY_STRING) {
            return efficientConstraintErrorMsg;
        }

        const factorConstraintErrorMsg = this.validateFactorConstraints(optimizationSettings);
        if (factorConstraintErrorMsg !== CoreCommonConstants.EMPTY_STRING) {
            return factorConstraintErrorMsg;
        }

        return this.validateSectorConstraints(optimizationSettings);
    }

    /**
     * validate sector constraints
     */
    private validateSectorConstraints(optimizationSettings: OptimizationSettings): string {
        if (!isEmpty(optimizationSettings.sectorConstraints)) {
            for (const secConstraint of optimizationSettings.sectorConstraints) {
                const {sectorConstraintType, filter, breakdownTree} = secConstraint.optionValues;
                if (
                    (sectorConstraintType === ONE_TYPE && (isNil(filter) || filter.isFilterEmpty())) ||
                    (sectorConstraintType === ALL_TYPE && new Breakdown(breakdownTree)?.isEmpty())
                ) {
                    return sectorConstraintType === ONE_TYPE ? EMPTY_FILTER_SECTOR_CONSTRAINT_MESSAGE : EMPTY_BREAKDOWN_SECTOR_CONSTRAINT_MESSAGE;
                }
            }
        }
        return CoreCommonConstants.EMPTY_STRING;
    }

    /**
     * validate the factor constraint
     * @param optimizationSettings
     * @private
     */
    private validateFactorConstraints(optimizationSettings: OptimizationSettings): string {
        if (!isEmpty(optimizationSettings.factorConstraints)) {
            const constraintsWithTagOrBlock: Constraint[] = optimizationSettings.factorConstraints
                .filter(constraint => isEmpty(constraint.optionValues.quickFactorBlock) &&
                    (!constraint.optionValues.factorTagList || isEmpty(constraint.optionValues.factorTagList.trim())));
            if (!isEmpty(constraintsWithTagOrBlock)) {
                return EMPTY_FACTOR_TAG_OR_BLOCK_MESSAGE;
            }
        }
        return CoreCommonConstants.EMPTY_STRING;
    }

    /**
     * validate the efficient enabled constraints
     * @param optimizationSettings
     * @private
     */
    private validateEfficientEnabledConstraints(optimizationSettings: OptimizationSettings): string {
        if (!isEmpty(optimizationSettings.efficientEnabledConstraints)) {
            if (optimizationSettings.efficientEnabledConstraints.size > 1) {
                return OPTIMIZATION_EFFICIENT_FRONTIER_CONFIG_ERROR;
            }
            const constraint: Constraint = [...optimizationSettings.efficientEnabledConstraints][0];
            let constraintValue = constraint.optionValues.ConstraintValue;
            // check if lower or upper bound is efficient enabled
            if (constraint.optionValues.ConstraintLowerBound || constraint.optionValues.ConstraintUpperBound) {
                const lowerBounds = constraint.optionValues.ConstraintLowerBound;
                const upperBounds = constraint.optionValues.ConstraintUpperBound;
                // show error if efficient frontier is enabled for both lower and upper bound
                if (CompositionUtils.checkIfBothBoundsInEfficientFormat(lowerBounds, upperBounds)) {
                    return OPTIMIZATION_EFFICIENT_FRONTIER_SECTOR_CONFIG_ERROR;
                }
                // validate if lower or upper bound is efficient enabled
                constraintValue = isArray(lowerBounds) || CompositionUtils.validateIfStringIsEffFrontColonFormat(lowerBounds) ? lowerBounds : upperBounds;
            }

            if (!constraint.enabled) {
                optimizationSettings.isEfficientFrontierEnabled = false;
                return CoreCommonConstants.EMPTY_STRING;
            }

            // if we reach here then it means we have only one valid efficient frontier constraint so mark isEfficientFrontierEnabled as true
            optimizationSettings.isEfficientFrontierEnabled = true;
            if (isArray(constraintValue)) {
                optimizationSettings.iterationType = OptimizationConstants.PRE_DEFINED_ITERATION_TYPE;
                optimizationSettings.iterations = constraintValue.length;
            } else {
                optimizationSettings.iterationType = OptimizationConstants.MANUAL_ITERATION_TYPE;
                optimizationSettings.iterations = 10;
            }
        } else { // mark isEfficientFrontierEnabled as false since there is no constraint which is efficient enabled
            optimizationSettings.isEfficientFrontierEnabled = false;
        }
        return CoreCommonConstants.EMPTY_STRING;
    }
}
