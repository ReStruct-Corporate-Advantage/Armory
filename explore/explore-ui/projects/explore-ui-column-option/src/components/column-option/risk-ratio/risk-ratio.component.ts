import { Component } from '@angular/core';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {
    AuxSelectOption,
    AuxSelectOptionGroup,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {
    ExploreSelectOption,
    ExploreSelectOptionGroup
} from '@blk/explore-ui-core';
import {RiskRatioSettings, CoreRiskConstants} from '@blk/explore-ui-risk';
import {isUndefined} from 'lodash';

@Component({
    selector: 'explore-risk-ratio-column-option',
    templateUrl: './risk-ratio.component.html'
})
export class RiskRatioComponent extends BaseColumnOptionComponent<RiskRatioSettings> {

    static OPTION_KEY = 'riskRatioSettings';

    availableDenominators: AuxSelectOptionGroup[] = [];

    /**
     * Get the config type that this object is configuring.
     */
    getOptionValueConfigType(): string {
        return RiskRatioComponent.OPTION_KEY;
    }

    /**
     * Init the component.
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        this.availableDenominators = [ new ExploreSelectOptionGroup(CoreRiskConstants.RISK_RATIO_DENOMINATORS
            .map(denominator => new ExploreSelectOption(denominator.label, denominator.value, (denominator.value === this.optionValue.denominator || (isUndefined(this.optionValue.denominator) && denominator.value === 'BENCH'))))) ];
        if (isUndefined(this.optionValue.denominator)) {
            this.optionValue.denominator = CoreRiskConstants.RISK_RATIO_DENOMINATORS[0].value;
        }
    }

    onDenominatorChanged(ev: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        console.log(ev.detail.value);
        this.optionValue.denominator = (ev.detail.value as AuxSelectOption).value;
        console.log(this.optionValue);
    }

}
