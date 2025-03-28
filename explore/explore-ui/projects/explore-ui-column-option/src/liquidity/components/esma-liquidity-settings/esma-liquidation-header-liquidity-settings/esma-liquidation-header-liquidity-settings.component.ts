import {Component, OnInit} from '@angular/core';
import {isNil} from 'lodash';
import {
    AuxCheckboxChangedDetailInterface,
    AuxNumericStepperValueChangedDetailInterface,
    AuxRadioGroupChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {TokenConstants, TokenUtils, ExploreCheckbox, ExploreRadioButton} from '@blk/explore-ui-core';
import {LiquidityConstants} from '../../../liquidity.constants';
import {EsmaLiquidationHeaderLiquiditySettings} from '../../../models/esma-liquidity-settings/esma-liquidation-header-liquidity-settings.model';
import {BaseLiquiditySettingsComponent} from '../../base-liquidity-settings.component';

/**
 * Esma liquidation header component for ESMA columns for column option
 */
@Component({
    selector: 'explore-column-option-esma-liquidation-header-liquidity-settings',
    templateUrl: './esma-liquidation-header-liquidity-settings.component.html',
    styleUrls: ['./esma-liquidation-header-liquidity-settings.component.scss']
})
export class EsmaLiquidationHeaderLiquiditySettingsComponent extends BaseLiquiditySettingsComponent<EsmaLiquidationHeaderLiquiditySettings> implements OnInit {

    private static readonly TRANSACTION_COST = 'Transaction cost';
    private static readonly SETTLEMENT_PERIOD = 'Settlement period';
    private static readonly EQUITY_HEDGE_FUND_CASH = 'Equity hedge fund cash';

    private static readonly LIQUIDATION_OPTIONS = 'Liquidation options';
    private static readonly REDEMPTION_SETTINGS = 'Redemption settings';

    isNavMultiplier: boolean;

    isIncludeTransactionCost: boolean;
    isIncludeEquityHedgeFundCash: boolean;
    hasFundSettings: boolean;
    includeOptions: ExploreCheckbox[];

    isCapacityApproach: boolean;
    capacityApproachOptions: ExploreRadioButton[];
    showIncludeOptions: boolean;
    label: string;

    /**
     * Initialize all the options
     */
    ngOnInit(): void {
        this.isNavMultiplier = this.optionAttributes.get(LiquidityConstants.NAV_MULTIPLIER);

        this.isIncludeTransactionCost = this.optionAttributes.get(LiquidityConstants.INCLUDE_TRANSACTION_COST);
        this.isIncludeEquityHedgeFundCash = this.optionAttributes.get(LiquidityConstants.INCLUDE_EQUITY_HEDGE_FUND_CASH);
        this.hasFundSettings = this.optionAttributes.get(LiquidityConstants.HAS_FUND_SETTINGS);
        this.label = this.hasFundSettings ? EsmaLiquidationHeaderLiquiditySettingsComponent.REDEMPTION_SETTINGS : EsmaLiquidationHeaderLiquiditySettingsComponent.LIQUIDATION_OPTIONS;
        this.includeOptions = [
            new ExploreCheckbox(EsmaLiquidationHeaderLiquiditySettingsComponent.TRANSACTION_COST, this.underlyingLiquiditySettings.includeTransactionCostFlag, false, null, this.isIncludeTransactionCost)
        ];
        const disableSettlementPeriod = this.optionAttributes.get(LiquidityConstants.DISABLE_SETTLEMENT_PERIOD);
        if (!disableSettlementPeriod) {
            this.includeOptions.push(new ExploreCheckbox(EsmaLiquidationHeaderLiquiditySettingsComponent.SETTLEMENT_PERIOD, this.underlyingLiquiditySettings.includeSettlementPeriodFlag, false, null, !this.hasFundSettings));
        }

        if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_EQUITY_HEDGE_FUND_CASH)) {
            this.includeOptions.push(new ExploreCheckbox(EsmaLiquidationHeaderLiquiditySettingsComponent.EQUITY_HEDGE_FUND_CASH, this.underlyingLiquiditySettings.includeEquityHFCashFlag, false, null, this.isIncludeEquityHedgeFundCash));
        }

        this.isCapacityApproach = this.optionAttributes.get(LiquidityConstants.CAPACITY_APPROACH);
        this.capacityApproachOptions = LiquidityConstants.CAPACITY_APPROACH_OPTIONS.map(capacityApproachOption =>
            new ExploreRadioButton(capacityApproachOption.title, this.underlyingLiquiditySettings.capacityApproach === capacityApproachOption.value, false, capacityApproachOption.value)
        );
        this.showIncludeOptions = (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_EQUITY_HEDGE_FUND_CASH) && this.isIncludeEquityHedgeFundCash) || this.isIncludeTransactionCost || (!disableSettlementPeriod && !this.hasFundSettings);
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
     * On include options changed
     */
    onIncludeOptionsChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        const checked = event.detail.value.checked;
        switch (event.detail.value.label) {
            case EsmaLiquidationHeaderLiquiditySettingsComponent.TRANSACTION_COST:
                this.underlyingLiquiditySettings.includeTransactionCostFlag = checked;
                break;
            case EsmaLiquidationHeaderLiquiditySettingsComponent.SETTLEMENT_PERIOD:
                this.underlyingLiquiditySettings.includeSettlementPeriodFlag = checked;
                break;
            case EsmaLiquidationHeaderLiquiditySettingsComponent.EQUITY_HEDGE_FUND_CASH:
                this.underlyingLiquiditySettings.includeEquityHFCashFlag = checked;
                break;
        }
    }

    /**
     * On capacity approach changed
     */
    onCapacityApproachChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.capacityApproach = event.detail.value.eventData;
    }
}
