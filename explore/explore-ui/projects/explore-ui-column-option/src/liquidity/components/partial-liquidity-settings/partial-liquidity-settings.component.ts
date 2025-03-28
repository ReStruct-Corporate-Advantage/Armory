import {
    AuxNumericStepperValueChangedDetailInterface,
    AuxRadioGroupChangedDetailInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {Component, OnInit} from '@angular/core';
import {isNil} from 'lodash';
import {PartialLiquiditySettings} from '../../models/partial-liquidity-settings.model';
import {LiquidityConstants} from '../../liquidity.constants';
import {BaseLiquiditySettingsComponent} from '../base-liquidity-settings.component';
import {ExploreSelectOption, ExploreSelectOptionGroup, ExploreRadioButton, ExploreNumericStepperGroup} from '@blk/explore-ui-core';

/**
 * partial Liquidation Setting as a part of liquidity settings in column options
 */
@Component({
    selector: 'explore-column-option-partial-liquidity-settings',
    templateUrl: './partial-liquidity-settings.component.html',
    styleUrls: ['./partial-liquidity-settings.component.scss']
})
export class PartialLiquiditySettingsComponent extends BaseLiquiditySettingsComponent<PartialLiquiditySettings> implements OnInit {

    liquidityConstraintGroup: ExploreNumericStepperGroup[];
    liquidationStrategyOptions: ExploreSelectOptionGroup[];
    liquidationConstraintOptions: ExploreRadioButton[];

    /**
     * initialise all options and data
     */
    ngOnInit(): void {
        this.liquidationStrategyOptions = [new ExploreSelectOptionGroup(LiquidityConstants.LIQUIDATION_STRATEGY_OPTIONS.map(liquidationStrategyOption =>
            new ExploreSelectOption(liquidationStrategyOption.title, liquidationStrategyOption.value, this.underlyingLiquiditySettings.liquidationStrategy === liquidationStrategyOption.value)
        ))];

        this.liquidationConstraintOptions = LiquidityConstants.LIQUIDATION_CONSTRAINT_OPTIONS.map(liquidationConstraintOption =>
            new ExploreRadioButton(liquidationConstraintOption.title, this.underlyingLiquiditySettings.liquidationConstraint === liquidationConstraintOption.value, false, liquidationConstraintOption.value)
        );

        this.liquidityConstraintGroup = [
            new ExploreNumericStepperGroup(this.underlyingLiquiditySettings.percentNavLiquidated),
            new ExploreNumericStepperGroup(this.underlyingLiquiditySettings.maxTransactionCost),
            new ExploreNumericStepperGroup(this.underlyingLiquiditySettings.maxMarketImpact),
            new ExploreNumericStepperGroup(this.underlyingLiquiditySettings.maxRatio),
        ];
    }

    /**
     * On liquidation strategy changed
     */
    onLiquidationStrategyChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.liquidationStrategy = (event.detail.value as AuxSelectOption).value;
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

        switch (index) {
            case 0: {
                this.underlyingLiquiditySettings.percentNavLiquidated = Number(stepperValue);
                break;
            }
            case 1: {
                this.underlyingLiquiditySettings.maxTransactionCost = Number(stepperValue);
                break;
            }
            case 2: {
                this.underlyingLiquiditySettings.maxMarketImpact = Number(stepperValue);
                break;
            }
            case 3: {
                this.underlyingLiquiditySettings.maxRatio = Number(stepperValue);
                break;
            }
        }
    }
}
