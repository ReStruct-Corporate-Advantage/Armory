import {
    AuxNumericStepperValueChangedDetailInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface,
    AuxTextInputValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {Component, OnInit} from '@angular/core';
import {isEmpty, isNil} from 'lodash';
import {ExploreRadioButton, ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {LiquidityStore} from '../../liquidity.store';
import {LiquidityConstants} from '../../liquidity.constants';
import {SECLiquiditySettings} from '../../models/sec-liquidity-settings.model';
import {BaseLiquiditySettingsComponent} from '../base-liquidity-settings.component';

/**
 * Sec liquidity Setting component as a part of liquidity component
 */
@Component({
    selector: 'explore-column-option-sec-liquidity-settings',
    templateUrl: './sec-liquidity-settings.component.html',
    styleUrls: ['./sec-liquidity-settings.component.scss']
})
export class SecLiquiditySettingsComponent extends BaseLiquiditySettingsComponent<SECLiquiditySettings> implements OnInit {

    readonly SEC_LIQUIDITY_RATS: string = LiquidityConstants.SEC_LIQUIDITY_RATS;
    readonly SEC_LIQUIDITY_SCENARIO: string = LiquidityConstants.SEC_LIQUIDITY_SCENARIO;
    readonly SEC_LIQUIDITY_PERCENT_NAV: string = LiquidityConstants.SEC_LIQUIDITY_PERCENT_NAV;

    isShowDefaultAlternateScenario: boolean;

    defaultScenarioOptions: ExploreSelectOptionGroup[];
    secLiquidityOptions: ExploreRadioButton[];

    /**
     * initialize all the options required
     */
    ngOnInit(): void {
        this.initializeDefaultScenarioOptions();
        this.initializeSecLiquidityOptions();
    }

    /**
     * Initialize sec liquidity options
     */
    initializeSecLiquidityOptions() {
        this.secLiquidityOptions = LiquidityConstants.SEC_LIQUIDITY_OPTIONS.map(secLiquidityOption =>
            new ExploreRadioButton(secLiquidityOption.title, this.underlyingLiquiditySettings.secSetting === secLiquidityOption.value, false, secLiquidityOption.value, true)
        );

        this.secLiquidityOptions
            .find(secLiquidityOption => secLiquidityOption.eventData === this.SEC_LIQUIDITY_SCENARIO)
            .isRadioVisible = this.isShowDefaultAlternateScenario;
    }

    /**
     * Initialize default alternate scenario
     */
    private initializeDefaultScenarioOptions(): void {
        const availableScenarios: {} = this.underlyingLiquiditySettings.getAvailableScenarios(LiquidityStore.liquidityDefaults);

        this.isShowDefaultAlternateScenario = !isEmpty(availableScenarios);
        if (!this.isShowDefaultAlternateScenario) {
            return;
        }

        const options = Object.keys(availableScenarios).map(scenario => {
            return new ExploreSelectOption(availableScenarios[scenario], scenario, this.underlyingLiquiditySettings.scenario === scenario, !this.isShowDefaultAlternateScenario);
        });
        this.defaultScenarioOptions = [new ExploreSelectOptionGroup(options)];
    }

    /**
     * On SEC liquidity option changed
     */
    onSecLiquidityOptionChanged(secSelection: string): void {
        this.underlyingLiquiditySettings.secSetting = secSelection;
        this.initializeSecLiquidityOptions();
    }

    /**
     * On rats value changed
     */
    onRatsValueChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.rats = Number(event.detail.value);
    }

    /**
     * On percent nav changed
     */
    onPercentNavChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.secPercentNAV = Number(event.detail.value);
    }

    /**
     * On scenario changed
     */
    onScenarioChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.underlyingLiquiditySettings.scenario = (event.detail.value as AuxSelectOption).value;
    }
}
