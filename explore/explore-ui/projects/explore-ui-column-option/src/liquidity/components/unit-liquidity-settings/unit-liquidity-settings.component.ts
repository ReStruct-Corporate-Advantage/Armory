import {AuxRadioGroupChangedDetailInterface} from '@blk/aladdin-angular-components';
import {Component, Input, OnInit} from '@angular/core';
import {isNil} from 'lodash';
import {ExploreRadioButton} from '@blk/explore-ui-core';
import {LiquidityColumnOption} from '../../../models/column-option/liquidity-column-option.model';
import {LiquidityConstants} from '../../liquidity.constants';

/**
 * Unit liquidity setting component part of liquidity setting in column options
 */
@Component({
    selector: 'explore-column-option-unit-liquidity-settings',
    templateUrl: './unit-liquidity-settings.component.html',
    styleUrls: ['./unit-liquidity-settings.component.scss']
})
export class UnitLiquiditySettingsComponent implements OnInit {

    @Input() liquiditySettings: LiquidityColumnOption;
    @Input() optionAttributes: Map<string, boolean>;

    unitOptions: ExploreRadioButton[];

    /**
     * initialize all required fields
     */
    ngOnInit(): void {
        const availableUnitOptions: { value: string, title: string }[] = this.optionAttributes.get('UNIT_STANDALONE') ? LiquidityConstants.STANDALONE_UNIT_OPTIONS : LiquidityConstants.CONTRIBUTION_UNIT_OPTIONS;
        this.unitOptions = availableUnitOptions.map(option => (
            new ExploreRadioButton(option.title, this.liquiditySettings.unitLiquiditySettings === option.value, false, option.value))
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
