import {Component, OnInit} from '@angular/core';
import {head, isNil} from 'lodash';
import {
    AuxCheckboxChangedDetailInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {CoreDefinitionStore, ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';

import {LiquidityConstants} from '../../../liquidity.constants';
import {BaseLiquiditySettingsComponent} from '../../base-liquidity-settings.component';
import {EsmaRedemptionLiquiditySettings} from '../../../models/esma-liquidity-settings/esma-redemption-liquidity-settings.model';

/**
 * Esma Redemption liquidity Settings component for ESMA columns for column option
 */
@Component({
    selector: 'explore-column-option-esma-redemption-liquidity-settings',
    templateUrl: './esma-redemption-liquidity-settings.component.html',
    styleUrls: ['./esma-redemption-liquidity-settings.component.scss']
})
export class EsmaRedemptionLiquiditySettingsComponent extends BaseLiquiditySettingsComponent<EsmaRedemptionLiquiditySettings> implements OnInit {

    private availableInvestorConcentrationScenarios: { label: string, value: string }[];
    private availableRedemptionScenarios: { label: string, value: string }[];

    isIncludeAdditionalCollateral: boolean;

    liabilityTypeOptions: ExploreSelectOptionGroup[];
    investorOptions: ExploreSelectOptionGroup[];
    redemptionOptions: ExploreSelectOptionGroup[];

    /**
     * initialize all required fields
     */
    ngOnInit(): void {
        this.liabilityTypeOptions = [new ExploreSelectOptionGroup(LiquidityConstants.LIABILITY_TYPE_OPTIONS.map(liabilityTypeOption =>
            new ExploreSelectOption(liabilityTypeOption.title, liabilityTypeOption.value, this.underlyingLiquiditySettings.liabilityType === liabilityTypeOption.value)
        ))];

        this.initializeAvailableRedemptionScenarios();
        this.initializeRedemptionScenario();

        this.isIncludeAdditionalCollateral = this.optionAttributes.get(LiquidityConstants.INCLUDE_ADDITIONAL_COLLATERAL);
    }

    /**
     * Initialize available redemption scenarios
     */
    private initializeAvailableRedemptionScenarios(): void {
        this.availableInvestorConcentrationScenarios = [];
        this.availableRedemptionScenarios = [];

        CoreDefinitionStore.investorConcentrationScenarios.forEach(scenario => {
            this.availableInvestorConcentrationScenarios.push({label: scenario.text, value: scenario.value});
        });

        CoreDefinitionStore.redemptionScenarios.forEach(redemptionScenario => {
            this.availableRedemptionScenarios.push({label: redemptionScenario.text, value: redemptionScenario.value});
        });
    }

    /**
     * Initialize redemption scenario dropdown wrt liability type
     */
    private initializeRedemptionScenario() {
        if (this.underlyingLiquiditySettings.liabilityType === LiquidityConstants.LIABILITY_TYPE_INVESTOR_DATA) {
            this.investorOptions = this.initializeRedemptionOptions(this.availableInvestorConcentrationScenarios);
        }

        if (this.underlyingLiquiditySettings.liabilityType === LiquidityConstants.LIABILITY_TYPE_REDEMPTION_SCENARIOS) {
            this.redemptionOptions = this.initializeRedemptionOptions(this.availableRedemptionScenarios);
        }
    }

    /**
     * Initialize redemption options
     */
    private initializeRedemptionOptions(availableOptions: { label: string, value: string }[]): [ExploreSelectOptionGroup] {
        const filtered = availableOptions.find(availableOption => availableOption.value === this.underlyingLiquiditySettings.redemptionScenario);
        if (!filtered) {
            this.underlyingLiquiditySettings.redemptionScenario = head(availableOptions).value;
        }

        return [new ExploreSelectOptionGroup(availableOptions.map(option =>
            new ExploreSelectOption(option.label, option.value, this.underlyingLiquiditySettings.redemptionScenario === option.value)
        ))];
    }

    /**
     * On liability type changed
     */
    onLiabilityTypeChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.liabilityType = (event.detail.value as AuxSelectOption).value;
        this.initializeRedemptionScenario();
    }

    /**
     * On redemption scenario changed
     */
    onRedemptionScenarioChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.redemptionScenario = (event.detail.value as AuxSelectOption).value;
    }

    /**
     * On additional collateral flag toggle
     */
    onAdditionalCollateralFlagToggle(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.includeAdditionalCollateralFlag = event.detail.value.checked;
    }
}
