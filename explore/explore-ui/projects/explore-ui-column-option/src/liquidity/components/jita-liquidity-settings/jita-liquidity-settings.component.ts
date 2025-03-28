import {Component, OnInit} from '@angular/core';
import {isNil, some} from 'lodash';
import {
    AuxCheckboxChangedDetailInterface,
    AuxCheckboxGroupChangedDetailInterface,
    AuxNumericStepperValueChangedDetailInterface,
    AuxRadioGroupChangedDetailInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface,
} from '@blk/aladdin-angular-components';
import {JITALiquiditySettings} from '../../models/jita-liquidity-settings.model';
import {LiquidityConstants} from '../../liquidity.constants';
import {ExploreSelectOption, ExploreSelectOptionGroup, ExploreRadioButton, ExploreNumericStepperGroup, ExploreCheckbox} from '@blk/explore-ui-core';
import {BaseGlobalStressMultiplierComponent} from '../base-global-stress-multiplier-component';


/**
 * Esma liquidation header component for ESMA columns for column option
 */
@Component({
    selector: 'jita-liquidity-settings',
    templateUrl: './jita-liquidity-settings.component.html',
    styleUrls: ['./jita-liquidity-settings.component.scss']
})
export class JITALiquiditySettingsComponent extends BaseGlobalStressMultiplierComponent<JITALiquiditySettings> implements OnInit {

    isNavMultiplier: boolean;
    label: string;

    liquidityConstraintGroup: ExploreNumericStepperGroup[];
    liquidationStrategyOptions: ExploreSelectOptionGroup[];
    liquidationConstraintOptions: ExploreRadioButton[];
    liquidationBucketOptions: ExploreRadioButton[];
    isShowNAVPercentLiquidatedOption: boolean;

    aggregationOptions: ExploreSelectOptionGroup[];
    includeAggregation: boolean;
    includeAdditionalAggregation: boolean;
    disableBucketOptions: boolean;

    disableStressTestingSettings: boolean;
    stressTestingOptions: ExploreCheckbox[];

    includeLiquidationUnit: boolean;
    liquidationUnitOptions: ExploreRadioButton[];

    isModifiedLiquidationStrategy: boolean;
    maxIlliquidTypeOptions: ExploreRadioButton[];

    private static readonly LIQUIDATION_OPTIONS = 'Liquidation options';
    private static readonly MARKET_VALUE: string = 'Market value';
    private static readonly NOTIONAL_MARKET_VALUE: string = 'Notional market value';
    private static readonly SECTOR_LEVEL: string = 'Sector level';
    private static readonly GLOBAL_LEVEL: string = 'Global level';
    readonly MAX_ILLIQUID_TYPE_ABS: string = LiquidityConstants.MAX_ILLIQUID_TYPE_ABS;
    readonly MAX_ILLIQUID_TYPE_REL: string = LiquidityConstants.MAX_ILLIQUID_TYPE_REL;


    /**
     * Initialize all the options
     */
    ngOnInit(): void {
        const MODIFIED_LIQUIDATION_STRATEGIES: string[] = LiquidityConstants.JITA_MODIFIED_LIQUIDATION_STRATEGY_OPTIONS
            .map(liquidationStrategy => liquidationStrategy.value);
        this.isModifiedLiquidationStrategy = some(MODIFIED_LIQUIDATION_STRATEGIES, modifiedLiquidationStrategy => this.underlyingLiquiditySettings.liquidationStrategy === modifiedLiquidationStrategy) && this.optionAttributes.get(LiquidityConstants.SHOW_ILLIQUID_PARAMETERS);

        this.isNavMultiplier = this.optionAttributes.get(LiquidityConstants.NAV_MULTIPLIER);

        this.isShowNAVPercentLiquidatedOption = this.optionAttributes.get(LiquidityConstants.SHOW_PERCENT_NAV_LIQUIDATED);
        this.liquidationStrategyOptions = [
            new ExploreSelectOptionGroup(
                LiquidityConstants.WATERFALL_LIQUIDATION_STRATEGY_OPTIONS
                    .map(strategy => new ExploreSelectOption(strategy.title, strategy.value, this.underlyingLiquiditySettings.liquidationStrategy === strategy.value))
            )
        ];
        const constraintOptions = this.isShowNAVPercentLiquidatedOption ? LiquidityConstants.JITA_LIQUIDATION_CONSTRAINT_OPTIONS : [];
        this.liquidationConstraintOptions = constraintOptions
            .map(option => new ExploreRadioButton(option.title, this.underlyingLiquiditySettings.liquidationConstraint === option.value, false, option.value)
        );
        this.liquidityConstraintGroup = [];
        if (this.isShowNAVPercentLiquidatedOption) {
            this.liquidityConstraintGroup.push(new ExploreNumericStepperGroup(this.underlyingLiquiditySettings.percentNavLiquidated));
        }

        this.includeAggregation = this.optionAttributes.get(LiquidityConstants.AGGREGATION);
        this.includeAdditionalAggregation = this.optionAttributes.get(LiquidityConstants.ADDITIONAL_AGGREGATION);

        const aggOptions: { value: string, title: string }[] = [];
        if (this.includeAggregation) {
            aggOptions.push(...LiquidityConstants.AGGREGATION_OPTIONS);
        }
        if (this.includeAdditionalAggregation) {
            aggOptions.push(...LiquidityConstants.ADDITIONAL_AGGREGATION_OPTIONS);
        }
        const exploreSelectOptions = aggOptions.map(aggregationOption => new ExploreSelectOption(aggregationOption.title, aggregationOption.value, this.underlyingLiquiditySettings.aggregation === aggregationOption.value));
        this.aggregationOptions = [new ExploreSelectOptionGroup(exploreSelectOptions)];

        this.disableBucketOptions = this.optionAttributes.get(LiquidityConstants.DISABLE_BUCKET_OPTIONS);
        this.liquidationBucketOptions = LiquidityConstants.LIQUIDATION_BUCKET_OPTIONS.map(liquidationBucketOption =>
            new ExploreRadioButton(liquidationBucketOption.title, this.underlyingLiquiditySettings.liquidationBucketMeth === liquidationBucketOption.value, false, liquidationBucketOption.value)
        );
        this.includeLiquidationUnit = this.optionAttributes.get(LiquidityConstants.LIQUIDATION_UNIT);
        this.liquidationUnitOptions = [
            new ExploreRadioButton(JITALiquiditySettingsComponent.MARKET_VALUE, !this.underlyingLiquiditySettings.useNotionalAmtLiq, false, false),
            new ExploreRadioButton(JITALiquiditySettingsComponent.NOTIONAL_MARKET_VALUE, this.underlyingLiquiditySettings.useNotionalAmtLiq, false, true)
        ];
        this.disableStressTestingSettings = this.optionAttributes.get(LiquidityConstants.DISABLE_STRESS_TESTING_SETTINGS);
        this.stressTestingOptions = [
            new ExploreCheckbox(JITALiquiditySettingsComponent.SECTOR_LEVEL, this.underlyingLiquiditySettings.sectorLevelStressTestingFlag, false),
            new ExploreCheckbox(JITALiquiditySettingsComponent.GLOBAL_LEVEL, this.underlyingLiquiditySettings.globalLevelStressTestingFlag, false)
        ];
        this.label = JITALiquiditySettingsComponent.LIQUIDATION_OPTIONS;

        this.maxIlliquidTypeOptions = LiquidityConstants.MAX_ILLIQUID_TYPE_OPTIONS.map(maxIlliquidTypeOption =>
            new ExploreRadioButton(maxIlliquidTypeOption.title, this.underlyingLiquiditySettings.illiquidMaxFormat === maxIlliquidTypeOption.value, false, maxIlliquidTypeOption.value)
        );

        this.initializeStressMultiplierGroup(this.underlyingLiquiditySettings.globalStressMultiplier);
    }

    /**
     * On liquidation strategy changed
     */
    onLiquidationStrategyChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.liquidationStrategy = (event.detail.value as AuxSelectOption).value;
        if ((event.detail.value as AuxSelectOption).value === LiquidityConstants.JITA_MODIFIED_LIQUIDATION_STRATEGY_WATERFALL && this.optionAttributes.get(LiquidityConstants.SHOW_ILLIQUID_PARAMETERS)) {
            this.isModifiedLiquidationStrategy = true;
        }
    }

    /**
     * On liquidation constraint changed
     */
    onLiquidationConstraintChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.liquidationConstraint = event.detail.value.eventData;
    }

    /**
     * On liquidation constraint value changed
     */
    onLiquidationConstraintValueChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>, index: number) {
        if (isNil(event)) {
            return;
        }
        const stepperValue = event.detail.value;
        if (index === 0) {
            this.underlyingLiquiditySettings.percentNavLiquidated = Number(stepperValue);
        }
    }

    /**
     * On nav multiplier changed
     */
    onNavMultiplierChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.navMultiplier = Number(event.detail.value);
    }

    /**
     * On aggregation changed
     */
    onAggregationChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.aggregation = (event.detail.value as AuxSelectOption).value;
    }

    /**
     * On liquidation bucket meth changed
     */
    onLiquidationBucketMethChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.liquidationBucketMeth = event.detail.value.eventData;
    }

    /**
     * On liquidation unit changed
     */
    onLiquidationUnitChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.useNotionalAmtLiq = event.detail.value.eventData;
    }

    /**
     * On stress testing options changed
     */
    onStressTestingOptionsChanged(event: CustomEvent<AuxCheckboxGroupChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }
        this.underlyingLiquiditySettings.sectorLevelStressTestingFlag = event.detail.value[0].checked;
        this.underlyingLiquiditySettings.globalLevelStressTestingFlag = event.detail.value[1].checked;
    }

    /**
     * On illiquid enabled flag changed
     */
    onIlliquidEnabledFlagChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        if (!isNil(event)) {
            this.underlyingLiquiditySettings.illiquidEnabledFlag = event.detail.value.checked;

            this.underlyingLiquiditySettings.illiquidMaxFormat = this.underlyingLiquiditySettings.illiquidMaxFormat || LiquidityConstants.MAX_ILLIQUID_TYPE_ABS;
            this.maxIlliquidTypeOptions.forEach(maxIlliquidTypeOption => maxIlliquidTypeOption.checked = this.underlyingLiquiditySettings.illiquidMaxFormat === maxIlliquidTypeOption.eventData);
        }
    }

    /**
     * On max illiquid format changed
     */
    onMaxIlliquidFormatChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>) {
        if (!isNil(event)) {
            this.underlyingLiquiditySettings.illiquidMaxFormat = event.detail.value.eventData;
        }
    }

    /**
     * On rel illiquid max changed
     */
    onRelIlliquidMaxChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        if (!isNil(event)) {
            this.underlyingLiquiditySettings.relIlliquidMax = Number(event.detail.value);
        }
    }

    /**
     * On abs illiquid max changed
     */
    onAbsIlliquidMaxChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        if (!isNil(event)) {
            this.underlyingLiquiditySettings.absIlliquidMax = Number(event.detail.value);
        }
    }

    /**
     * On illiquid def changed
     */
    onIlliquidDefChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        if (!isNil(event)) {
            this.underlyingLiquiditySettings.illiquidDef = Number(event.detail.value);
        }
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
