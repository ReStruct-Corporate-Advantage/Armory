import {Component} from '@angular/core';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {RbcRegimeSettingsColumnOption} from '../../../models/column-option/rbc-regime-settings-column-option.model';
import {
    ExploreSelectOptionGroup,
    ExploreSelectOption,
    CoreDefinitionStore,
    RbcRegimeSettings,
    RbcRegimeRiskFactor
} from '@blk/explore-ui-core';
import {AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {isArray, cloneDeep, includes, some} from 'lodash';

/**
 * Class for Risk Based Capital Regime column options
 * User can select a regime and risk factors
 */
@Component({
    selector: 'explore-rbc-regime-settings-column-option',
    templateUrl: './rbc-regime-settings-column-option.component.html',
    styleUrls: ['./rbc-regime-settings-column-option.component.scss']
})
export class RbcRegimeSettingsColumnOptionComponent extends BaseColumnOptionComponent<RbcRegimeSettingsColumnOption> {
    public static OPTION_KEY = 'rbcRegimeSettingsColumnOption';
    static regimeToRiskFactors: Map<string, ExploreSelectOptionGroup[]> = new Map<string, ExploreSelectOptionGroup[]>();

    regimeOptions: ExploreSelectOptionGroup[];
    riskFactors: ExploreSelectOptionGroup[];
    isSingleSelectRiskFactor = false;
    showRiskFactorOptions: boolean;

    constructor() {
        super();
    }

    initializeComponent(): void {
        super.initializeComponent();
        if (!this.optionValue.regimeSelection) {
            this.optionValue.regimeSelection = new RbcRegimeSettings();
        }
        // If the column option has 'rbcRiskFactorSettings' in the columnOptionAttributes, show the risk factor options
        this.showRiskFactorOptions = some(this.option.columnOptionAttributes, attribute => attribute.key === RbcRegimeSettingsColumnOption.RBC_RISK_FACTOR_SETTINGS);
        this.optionValue.regimeSelection.isRegimeOnly = !this.showRiskFactorOptions;
        this.populateDropdownOptions();
        // Restrict the risk factor selection to single select for scatter plot widget (can expand on this boolean if needed)
        this.isSingleSelectRiskFactor = this.isSingleSelectOption();
    }

    /**
     * Get the config type that this object is configuring.
     */
    getOptionValueConfigType(): string {
        return RbcRegimeSettingsColumnOptionComponent.OPTION_KEY;
    }

    /**
     * Callback when user selects a regime from the dropdown
     */
    onRegimeSelected(regime: ExploreSelectOption): void {
        this.optionValue.regimeSelection.regime.regimeName = regime.displayValue;
        this.optionValue.regimeSelection.regime.regimeId = regime.value;
        // Update risk factor options based on the selected regime
        this.riskFactors = RbcRegimeSettingsColumnOptionComponent.regimeToRiskFactors.get(regime.value);
    }

    /**
     * Callback when user makes a change in the multi-select of risk factors for a regime
     */
    onRiskFactorChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.optionValue.regimeSelection.riskFactors = [];
        const items = isArray(event.detail.value) ? event.detail.value : [event.detail.value];
        items.forEach((selectedRiskFactor: ExploreSelectOption) => {
            if (!selectedRiskFactor) {
                return;
            }
            const riskFactor = new RbcRegimeRiskFactor();
            riskFactor.riskFactorName = selectedRiskFactor.displayValue;
            riskFactor.riskFactorId = selectedRiskFactor.value;
            this.optionValue.regimeSelection.riskFactors.push(riskFactor);
        });
    }

    /**
     * Populates the regime/risk factors dropdown options based on the RBC regime definitions
     */
    populateDropdownOptions(): void {
        this.regimeOptions = [new ExploreSelectOptionGroup()];
        const existingRegimeSelected = this.optionValue.isValid();
        const existingRiskFactors = existingRegimeSelected ? this.optionValue.regimeSelection.riskFactors.map(factor => factor.riskFactorId) : [];
        CoreDefinitionStore.rbcRegimeOptions.forEach((regimeInfo, regimeId) => {
            this.regimeOptions[0].values.push(new ExploreSelectOption(regimeInfo.regime.regimeName, regimeId, existingRegimeSelected && this.optionValue.regimeSelection.regime.regimeId === regimeId));
            const riskFactors = ExploreSelectOptionGroup.createSimpleSelectOptionGroup(regimeInfo.riskFactors.map(factor => factor.riskFactorId), regimeInfo.riskFactors.map(factor => factor.riskFactorName));
            if (existingRegimeSelected) {
                this.riskFactors = cloneDeep(riskFactors);
                for (const option of this.riskFactors[0].values) {
                    option.isSelected = includes(existingRiskFactors, option.value);
                }
            }
            RbcRegimeSettingsColumnOptionComponent.regimeToRiskFactors.set(regimeId, riskFactors);
        });
    }
}
