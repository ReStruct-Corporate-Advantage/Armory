import {Component, Input, OnInit} from '@angular/core';
import {isNil} from 'lodash';
import {
    AuxCheckboxChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {ExploreCheckbox} from '@blk/explore-ui-core';
import {LiquidityConstants} from '../../../liquidity.constants';
import {BaseLiquiditySettingsComponent} from '../../base-liquidity-settings.component';
import {EsmaLiquidationFundLiquiditySettings} from '../../../models/esma-liquidity-settings/esma-liquidation-fund-liquidity-settings.model';
import {LiquidityColumnOption} from '../../../../models/column-option/liquidity-column-option.model';

/**
 * Esma fund liquidity settings component
 */
@Component({
    selector: 'explore-column-option-esma-liquidation-fund-liquidity-settings',
    templateUrl: './esma-liquidation-fund-liquidity-settings.component.html',
    styleUrls: ['./esma-liquidation-fund-liquidity-settings.component.scss']
})
export class EsmaLiquidationFundLiquiditySettingsComponent extends BaseLiquiditySettingsComponent<EsmaLiquidationFundLiquiditySettings> implements OnInit {

    private static readonly SETTLEMENT_PERIOD = 'Settlement period';
    private static readonly NOTICE_PERIOD = 'Notice period';

    isShowFundSettings: boolean;

    includeOptions: ExploreCheckbox[];

    @Input()
    liquidityColumnOption: LiquidityColumnOption;

    /**
     * initialize all required fields
     */
    ngOnInit(): void {
        this.isShowFundSettings = this.isOptionsPresent(LiquidityConstants.HAS_FUND_SETTINGS);
        // if esmaLiquidationFundLiquiditySettings is not present and we need to show fundSettings means old favourite
        if (this.isShowFundSettings && !this.liquidityColumnOption.esmaLiquidationFundLiquiditySettings) {
            // initalize object
            this.underlyingLiquiditySettings = new EsmaLiquidationFundLiquiditySettings();
            // assign back to liquidity settings
            this.liquidityColumnOption.esmaLiquidationFundLiquiditySettings = this.underlyingLiquiditySettings;
            // if esmaLiquidationHeaderLiquiditySettings is present set includeFundSettlementPeriodFlag
            if (this.liquidityColumnOption.esmaLiquidationHeaderLiquiditySettings) {
                this.underlyingLiquiditySettings.includeFundSettlementPeriodFlag = this.liquidityColumnOption.esmaLiquidationHeaderLiquiditySettings.includeSettlementPeriodFlag;
            }
        }

        this.includeOptions = [
            new ExploreCheckbox(EsmaLiquidationFundLiquiditySettingsComponent.SETTLEMENT_PERIOD, this.underlyingLiquiditySettings.includeFundSettlementPeriodFlag, false, null, true),
            new ExploreCheckbox(EsmaLiquidationFundLiquiditySettingsComponent.NOTICE_PERIOD, this.underlyingLiquiditySettings.includeFundNoticePeriodFlag, false, null, true)
        ];
    }

    /**
     * On include option changed
     */
    onIncludeOptionsChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        const checked = event.detail.value.checked;
        switch (event.detail.value.label) {
            case EsmaLiquidationFundLiquiditySettingsComponent.SETTLEMENT_PERIOD:
                this.underlyingLiquiditySettings.includeFundSettlementPeriodFlag = checked;
                break;
            case EsmaLiquidationFundLiquiditySettingsComponent.NOTICE_PERIOD:
                this.underlyingLiquiditySettings.includeFundNoticePeriodFlag = checked;
                break;
        }
    }

    /**
     * Return true if value is there in optionAttributes else return false
     */
    private isOptionsPresent(value: string): boolean {
        return (this.optionAttributes && this.optionAttributes.has(value)) ? this.optionAttributes.get(value) : false;
    }
}
