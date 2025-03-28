import {Component, Input, OnInit} from '@angular/core';
import {isNil} from 'lodash';
import {Subject} from 'rxjs';
import {
    AuxNumericStepperValueChangedDetailInterface,
    AuxRadioGroupChangedDetailInterface,
    AuxSelectSelectionChangedDetailInterface,
    AuxSelectOption
} from '@blk/aladdin-angular-components';
import {ExploreRadioButton, ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {LiquidityConstants} from '../../../liquidity.constants';
import {PartialLiquiditySettings} from '../../../models/partial-liquidity-settings.model';
import {BaseLiquiditySettingsComponent} from '../../base-liquidity-settings.component';

/**
 * Esma partial liquidity settings component for ESMA columns for column option
 */
@Component({
    selector: 'explore-column-option-esma-partial-liquidity-settings',
    templateUrl: './esma-partial-liquidity-settings.component.html',
    styleUrls: ['./esma-partial-liquidity-settings.component.scss']
})
export class EsmaPartialLiquiditySettingsComponent extends BaseLiquiditySettingsComponent<PartialLiquiditySettings> implements OnInit {

    liquidationBucketOptions: ExploreRadioButton[];
    liquidationStrategyOptions: ExploreSelectOptionGroup[];
    disableBucketOptions: boolean;

    // to update EsmaLiquidationFooterLiquiditySettingsComponent on LiquidatedStrategyChanged from EsmaPartialLiquiditySettingsComponent
    @Input() liquidityStrategy$: Subject<string>;

    /**
     * initialize all required fields
     */
    ngOnInit() {
        this.initLiquidationStrategy();
        this.disableBucketOptions = this.optionAttributes.get(LiquidityConstants.DISABLE_BUCKET_OPTIONS);
        this.liquidationBucketOptions = LiquidityConstants.LIQUIDATION_BUCKET_OPTIONS.map(liquidationBucketOption =>
            new ExploreRadioButton(liquidationBucketOption.title, this.underlyingLiquiditySettings.liquidationBucketMeth === liquidationBucketOption.value, false, liquidationBucketOption.value)
        );
    }

    /**
     * Initialize liquidation Strategy value with waterfall if it's not initialized
     */
    initLiquidationStrategy() {
        const waterfallLiquidationStrategyOptions: ExploreSelectOption[] = LiquidityConstants.WATERFALL_LIQUIDATION_STRATEGY_OPTIONS.map(liquidityStrategyOption =>
            new ExploreSelectOption(liquidityStrategyOption.title, liquidityStrategyOption.value, this.underlyingLiquiditySettings.liquidationStrategy === liquidityStrategyOption.value)
        );

        const nonModifiedLiquidationStrategyOptions: ExploreSelectOption[] = LiquidityConstants.ESMA_NON_MODIFIED_LIQUIDATION_STRATEGY_OPTIONS.map(liquidityStrategyOption =>
            new ExploreSelectOption(liquidityStrategyOption.title, liquidityStrategyOption.value, this.underlyingLiquiditySettings.liquidationStrategy === liquidityStrategyOption.value)
        );

        const modifiedLiquidationStrategyOptions: ExploreSelectOption[] = LiquidityConstants.ESMA_MODIFIED_LIQUIDATION_STRATEGY_OPTIONS.map(liquidityStrategyOption =>
            new ExploreSelectOption(liquidityStrategyOption.title, liquidityStrategyOption.value, this.underlyingLiquiditySettings.liquidationStrategy === liquidityStrategyOption.value)
        );

        const modifiedLiquidationStrategiesOnly: boolean = this.optionAttributes.get(LiquidityConstants.MODIFIED_LIQUIDATION_STRATEGIES_ONLY);
        const showWaterFallStrategiesOnly: boolean = this.optionAttributes.get(LiquidityConstants.SHOW_WATERFALL_STRATEGIES_ONLY);
        const availableLiquidationStrategyOptions: ExploreSelectOption[] = [];
        if(showWaterFallStrategiesOnly) {
            availableLiquidationStrategyOptions.push(...waterfallLiquidationStrategyOptions);
        } else {
            availableLiquidationStrategyOptions.push(...modifiedLiquidationStrategiesOnly
                ? modifiedLiquidationStrategyOptions
                : nonModifiedLiquidationStrategyOptions.concat(modifiedLiquidationStrategyOptions));
        }

        this.liquidationStrategyOptions = [new ExploreSelectOptionGroup(availableLiquidationStrategyOptions)];
    }

    /**
     * On percent nav liquidated changed
     */
    onPercentNavLiquidatedChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.percentNavLiquidated = Number(event.detail.value);
    }

    /**
     * On liquidated strategy changed
     */
    onLiquidatedStrategyChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.liquidationStrategy = (event.detail.value as AuxSelectOption).value;
        this.liquidityStrategy$.next(this.underlyingLiquiditySettings.liquidationStrategy);
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
}
