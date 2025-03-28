import {Component, OnInit} from '@angular/core';
import {BaseLiquiditySettingsComponent} from '../base-liquidity-settings.component';
import {LiquidityConstants} from '../../liquidity.constants';
import {head, isNil} from 'lodash';
import {CoreDefinitionStore, ExploreSelectOptionGroup, ExploreSelectOption} from '@blk/explore-ui-core';
import {PrecannedStressScenariosLiquiditySettings} from '../../models/precanned-stress-scenarios-liquidity-settings.model';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {GlobalStressMultiplier} from '../../models/global-stress-multiplier';

/**
 * Pre canned scenarios liquidity Setting a part of liquidity Setting column options
 */
@Component({
    selector: 'explore-column-option-precanned-stress-scenarios-liquidity-settings',
    templateUrl: './precanned-stress-scenarios-liquidity-settings.component.html',
    styleUrls: ['./precanned-stress-scenarios-liquidity-settings.component.scss']
})
export class PrecannedStressScenariosLiquiditySettingsComponent extends BaseLiquiditySettingsComponent<PrecannedStressScenariosLiquiditySettings> implements OnInit {
    isShowPrecannedScenarioSettings: boolean;
    // Precanned stress scenarios which can be applied as sector level shocks
    availablePrecannedStressScenarios: { label: string, value: string }[];
    // Precanned stress scenarios which can be applied as sector level shocks
    availableMultiplierTypes: { label: string, value: string }[];
    // Precanned stress scenario options
    preCannedStressScenarioOptions: ExploreSelectOptionGroup[];
    // Multiplier type options
    multiplierTypeOptions: ExploreSelectOptionGroup[];

    /**
     * Constructor
     */
    constructor() {
        super();
    }

    /**
     * Initialize all required fields
     */
    ngOnInit(): void {
        this.isShowPrecannedScenarioSettings = this.optionAttributes.get(LiquidityConstants.PRECANNED_STRESS_SCENARIO_SETTINGS);
        this.initializeAvailablePreCannedStressScenarios();
        this.initializeAvailableMultiplierTypeOptions();
        this.preCannedStressScenarioOptions = this.initializeOptions(this.availablePrecannedStressScenarios, this.underlyingLiquiditySettings.assetStressScenario);
        this.multiplierTypeOptions = this.initializeOptions(this.availableMultiplierTypes, this.underlyingLiquiditySettings.stressMultiplierType);
    }

    /**
     * Initialize available precanned stress scenarios
     */
    private initializeAvailablePreCannedStressScenarios(): void {
        this.availablePrecannedStressScenarios = [];
        this.availablePrecannedStressScenarios.push({label: LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO, value: LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO});
        CoreDefinitionStore.preCannedStressScenarios.forEach(scenario => {
            this.availablePrecannedStressScenarios.push({label: scenario.text, value: scenario.value});
        });
    }

    /**
     * Initialize available multiplier type options
     */
    private initializeAvailableMultiplierTypeOptions(): void {
        this.availableMultiplierTypes = [];
        this.availableMultiplierTypes.push({label: LiquidityConstants.DEFAULT_STRESS_MULTIPLIER_TYPE, value: LiquidityConstants.DEFAULT_STRESS_MULTIPLIER_TYPE});
        this.availableMultiplierTypes.push({label: GlobalStressMultiplier.FIXED_COST_MULTIPLIER_LABEL, value: LiquidityConstants.FIXED_COST_MULTIPLIER});
        this.availableMultiplierTypes.push({label: GlobalStressMultiplier.MARKET_IMPACT_MULTIPLIER_LABEL, value: LiquidityConstants.MARKET_IMPACT_MULTIPLIER});
        this.availableMultiplierTypes.push({label: GlobalStressMultiplier.MARKET_DEPTH_MULTIPLIER_LABEL, value: LiquidityConstants.MARKET_DEPTH_MULTIPLIER});
    }

    /**
     * Initialize options in the select option group
     */
    private initializeOptions(availableOptions: { label: string, value: string }[], param: string): [ExploreSelectOptionGroup] {
        const filtered = availableOptions.find(availableOption => availableOption.value === param);
        if (!filtered) {
            param = head(availableOptions).value;
        }

        return [new ExploreSelectOptionGroup(availableOptions.map(option =>
            new ExploreSelectOption(option.label, option.value, param === option.value)
        ))];
    }

    /**
     * On liability type changed
     */
    onPrecannedStressScenarioChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.assetStressScenario = (event.detail.value as AuxSelectOption).value;
        this.initializeOptions(this.availablePrecannedStressScenarios, this.underlyingLiquiditySettings.assetStressScenario);
    }

    /**
     * On redemption scenario changed
     */
    onMultiplierTypeChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.stressMultiplierType = (event.detail.value as AuxSelectOption).value;
        this.initializeOptions(this.availableMultiplierTypes, this.underlyingLiquiditySettings.stressMultiplierType);
    }
}
