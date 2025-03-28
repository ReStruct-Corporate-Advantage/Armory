import {Component, Input, OnInit} from '@angular/core';
import {isNil} from 'lodash';
import {AuxRadioGroupChangedDetailInterface} from '@blk/aladdin-angular-components';
import {ExploreRadioButton} from '@blk/explore-ui-core';
import {LiquidityConstants} from '../../../liquidity.constants';
import {LiquidityColumnOption} from '../../../../models/column-option/liquidity-column-option.model';

/**
 * Esma Unit liquidity Settings component for ESMA columns for column option
 */
@Component({
    selector: 'explore-column-option-esma-unit-liquidity-settings',
    templateUrl: './esma-unit-liquidity-settings.component.html',
    styleUrls: ['./esma-unit-liquidity-settings.component.scss']
})
export class EsmaUnitLiquiditySettingsComponent implements OnInit {

    @Input() liquiditySettings: LiquidityColumnOption;
    @Input() optionAttributes: Map<string, boolean>;

    unitOptions: ExploreRadioButton[];

    /**
     * Initialize all required fields
     */
    ngOnInit() {
        const availableUnitOptions: { value: string, title: string }[] = this.optionAttributes.get(LiquidityConstants.UNIT_STANDALONE) ? LiquidityConstants.STANDALONE_UNIT_OPTIONS : LiquidityConstants.CONTRIBUTION_UNIT_OPTIONS;
        this.unitOptions = availableUnitOptions.map(option =>
            new ExploreRadioButton(option.title, this.liquiditySettings.unitLiquiditySettings === option.value, false, option.value)
        );
    }

    /**
     * On unit changed
     */
    onUnitChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.liquiditySettings.unitLiquiditySettings = event.detail.value.eventData;
    }
}
