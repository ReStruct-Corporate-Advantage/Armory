import {Component, OnInit} from '@angular/core';
import {isEmpty, isNil} from 'lodash';
import {AuxNumericStepperValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {LiquidityConstants} from '../../liquidity.constants';
import {GeneralLiquiditySettings} from '../../models/general-liquidity-settings.model';
import {BaseLiquiditySettingsComponent} from '../base-liquidity-settings.component';

/**
 * General liquidity Settings as a part of liquidity settings in column option
 */
@Component({
    selector: 'explore-column-option-general-liquidity-settings',
    templateUrl: './general-liquidity-settings.component.html',
    styleUrls: ['./general-liquidity-settings.component.scss']
})
export class GeneralLiquiditySettingsComponent extends BaseLiquiditySettingsComponent<GeneralLiquiditySettings> implements OnInit {

    isShowHorizonStepper: boolean;
    isShowParticipationRate: boolean;
    isShowAdvanceParticipationRate: boolean;

    /**
     * Initialize boolean for html rendering
     */
    ngOnInit(): void {
        this.isShowHorizonStepper = this.optionAttributes.get(LiquidityConstants.HORIZON);
        this.isShowParticipationRate = this.optionAttributes.get(LiquidityConstants.PARTICIPATION_RATE);
        this.isShowAdvanceParticipationRate = this.optionAttributes.get(LiquidityConstants.ADV_PARTICIPATION_RATE);
    }

    /**
     * On horizon changed
     */
    onHorizonChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.horizon = Number(event.detail.value);
    }

    /**
     * On adv participation rate changed
     */
    onAdvParticipationRateChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.advParticipationRate = Number(event.detail.value);
    }

    /**
     * On advance participation rate equity changed
     */
    onAdvParticipationRateEquityChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.advParticipationRateEquity = Number(event.detail.value);
    }

    /**
     * On advance participation rate other changed
     */
    onAdvParticipationRateOtherChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.advParticipationRateOther = Number(event.detail.value);
    }
}
