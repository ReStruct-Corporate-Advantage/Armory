import {
    AuxCheckboxChangedDetailInterface,
    AuxNumericStepperValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {Component, Input, OnInit} from '@angular/core';
import {isNil} from 'lodash';
import {ExploreNumericStepperGroup} from '@blk/explore-ui-core';
import {LiquidityConstants} from '../../liquidity.constants';
import {BaseLiquiditySettingsComponent} from '../base-liquidity-settings.component';
import {StressLiquiditySettings} from '../../models/stress-liquidity-settings.model';

/**
 * Stress liquidity Setting a part of liquidity Setting column options
 */
@Component({
    selector: 'explore-column-option-stress-liquidity-settings',
    templateUrl: './stress-liquidity-settings.component.html',
    styleUrls: ['./stress-liquidity-settings.component.scss']
})
export class StressLiquiditySettingsComponent extends BaseLiquiditySettingsComponent<StressLiquiditySettings> implements OnInit {

    public static readonly STRESS_LIQUIDITY_FIXED_COST_LABEL: string = 'Bid-ask spread';
    public static readonly STRESS_LIQUIDITY_MARKET_IMPACT_LABEL: string = 'Volatility / OAS';
    public static readonly STRESS_LIQUIDITY_MARKET_DEPTH_LABEL: string = 'Market depth (ADV)';

    isShowStressLabel: boolean;
    isShowStressAnalysisVisible: boolean;
    isTcostStressFlagVisible: boolean;

    @Input() isJitaColumn: boolean;

    stressLiquidityGroup: ExploreNumericStepperGroup[];

    /**
     * Initialize all fields
     */
    ngOnInit(): void {
        this.isShowStressAnalysisVisible = this.optionAttributes.get(LiquidityConstants.STRESS_ANALYSIS_FLAG);
        this.isTcostStressFlagVisible = this.optionAttributes.get(LiquidityConstants.TCOST_STRESS_FLAG);

        this.isShowStressLabel = this.optionAttributes.get(LiquidityConstants.FIXED_COST_SHOCK)
            || this.optionAttributes.get(LiquidityConstants.MARKET_IMPACT_SHOCK)
            || this.optionAttributes.get(LiquidityConstants.MARKET_DEPTH_SHOCK);

        this.stressLiquidityGroup = [
            new ExploreNumericStepperGroup(
                isNil(this.underlyingLiquiditySettings.fixedCostMultiplier) ? StressLiquiditySettings.DEFAULT_FIXED_COST_MULTIPLIER : this.underlyingLiquiditySettings.fixedCostMultiplier, StressLiquiditySettingsComponent.STRESS_LIQUIDITY_FIXED_COST_LABEL, this.optionAttributes.get(LiquidityConstants.FIXED_COST_SHOCK)),
            new ExploreNumericStepperGroup(
                isNil(this.underlyingLiquiditySettings.marketImpactMultiplier) ? StressLiquiditySettings.DEFAULT_MARKET_IMPACT_MULTIPLIER : this.underlyingLiquiditySettings.marketImpactMultiplier, StressLiquiditySettingsComponent.STRESS_LIQUIDITY_MARKET_IMPACT_LABEL, this.optionAttributes.get(LiquidityConstants.MARKET_IMPACT_SHOCK)),
            new ExploreNumericStepperGroup(
                isNil(this.underlyingLiquiditySettings.marketDepthMultiplier) ? StressLiquiditySettings.DEFAULT_MARKET_DEPTH_MULTIPLIER : this.underlyingLiquiditySettings.marketDepthMultiplier, StressLiquiditySettingsComponent.STRESS_LIQUIDITY_MARKET_DEPTH_LABEL, this.optionAttributes.get(LiquidityConstants.MARKET_DEPTH_SHOCK))
        ];
    }

    /**
     * On stress liquidity value changed
     */
    onStressLiquidityValueChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>, label: string) {
        if (isNil(event)) {
            return;
        }

        const value = event.detail.value;
        switch (label) {
            case StressLiquiditySettingsComponent.STRESS_LIQUIDITY_FIXED_COST_LABEL: {
                this.underlyingLiquiditySettings.fixedCostMultiplier = Number(value);
                break;
            }
            case StressLiquiditySettingsComponent.STRESS_LIQUIDITY_MARKET_IMPACT_LABEL: {
                this.underlyingLiquiditySettings.marketImpactMultiplier = Number(value);
                break;
            }
            case StressLiquiditySettingsComponent.STRESS_LIQUIDITY_MARKET_DEPTH_LABEL: {
                this.underlyingLiquiditySettings.marketDepthMultiplier = Number(value);
                break;
            }
        }
    }

    /**
     * On stress analysis flag toggle
     */
    onStressAnalysisFlagToggle(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        if (!event) {
            return;
        }

        this.underlyingLiquiditySettings.stressAnalysisFlag = event.detail.value.checked;
    }

    /**
     * On tcostStressFlag
     */
    onTCostStressFlagToggle(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        if (!event) {
            return;
        }

        this.underlyingLiquiditySettings.tcostStressFlag = event.detail.value.checked;
    }

    /**
     * On assetStressScenraio change
     * @param assetStressScenario - selected asset stress scenario
     */
    onAssetStressScenarioChanged(assetStressScenario: string): void {
        if (LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO === assetStressScenario) {
            this.underlyingLiquiditySettings.assetStressScenario = undefined;
        } else {
            this.underlyingLiquiditySettings.assetStressScenario = assetStressScenario;
        }
    }
}
