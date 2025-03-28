import {AuxNumericStepperValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {isNil} from 'lodash';
import {LiquidityConstants} from '../../liquidity.constants';
import {BaseLiquiditySettingsComponent} from '../base-liquidity-settings.component';
import {QuantitativeTieringLiquiditySettings} from '../../models/quantitative-tiering-liquidity-settings.model';

@Component({
    selector: 'explore-column-option-quantitative-tiering-liquidity-settings',
    templateUrl: './quantitative-tiering-liquidity-settings.component.html',
    styleUrls: ['./quantitative-tiering-liquidity-settings.component.scss']
})
/**
 * Quantitative tiering liquidity Settings component as a part of liquidity settings in column options
 */
export class QuantitativeTieringLiquiditySettingsComponent extends BaseLiquiditySettingsComponent<QuantitativeTieringLiquiditySettings> implements OnInit {
    private static readonly MIN_DAYS_MAX_VALUE = 365;

    @Output() updateTitle = new EventEmitter<void>();

    minDaysMaxValue: number;
    showQuantitativeHeader: boolean;

    /**
     * Initialize required fields
     */
    ngOnInit(): void {
        this.showQuantitativeHeader = !(this.optionAttributes.get(LiquidityConstants.LIQUIDATION_SETTINGS)
            || this.optionAttributes.get(LiquidityConstants.REDEMPTION_SETTINGS));

        this.setMinDaysMaxValue();
    }

    /**
     * Set maximum limit for minDays stepper value
     */
    private setMinDaysMaxValue(): void {
        this.minDaysMaxValue = this.underlyingLiquiditySettings.maxDays < QuantitativeTieringLiquiditySettingsComponent.MIN_DAYS_MAX_VALUE ? (this.underlyingLiquiditySettings.maxDays - 1) : QuantitativeTieringLiquiditySettingsComponent.MIN_DAYS_MAX_VALUE;
    }

    /**
     * On min days changed
     */
    onMinDaysChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.minDays = Number(event.detail.value);

        this.updateTitle.emit();
    }

    /**
     * On max days changed
     */
    onMaxDaysChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.maxDays = Number(event.detail.value);
        this.setMinDaysMaxValue();

        this.updateTitle.emit();
    }
}
