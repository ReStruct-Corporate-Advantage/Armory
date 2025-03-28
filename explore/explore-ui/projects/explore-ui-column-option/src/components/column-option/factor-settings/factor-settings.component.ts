import { Component } from '@angular/core';

import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';

import {BaseColumnOptionComponent} from '../base-column-option.component';
import {ColumnOptionConstants} from '../../../constants';
import {FactorSettingsColumnOption} from '../../../models/column-option/factor-settings-column-option.model';
import {
    AuxNumericStepperValueChangedDetailInterface, AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {isUndefined} from 'lodash';
import {DiversificationAdditionalAnalytics, DiversificationAdditionalAnalyticsUtil} from '../../../enums/diversification-additional-analytics.enum';

@Component({
  selector: 'lib-factor-settings',
  templateUrl: './factor-settings.component.html'
})
export class FactorSettingsComponent extends BaseColumnOptionComponent<FactorSettingsColumnOption> {

    static OPTION_KEY = 'factorSettingsColumnOption';

    availableAdditionalAnalytics: ExploreSelectOptionGroup[];

    protected getOptionValueConfigType(): string {
        return FactorSettingsComponent.OPTION_KEY;
    }

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        this.availableAdditionalAnalytics = [new ExploreSelectOptionGroup(
        Object.keys(DiversificationAdditionalAnalytics)
            .filter(key => isNaN(Number(key)))
            .map(key => new ExploreSelectOption(DiversificationAdditionalAnalyticsUtil.getDisplayName(DiversificationAdditionalAnalytics[key]), key, this.optionValue.additionalAnalytics ? this.optionValue.additionalAnalytics.indexOf(key) >= 0 : false))
        )];
    }

    onNumberOfRiskFactorChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        const value = event.detail.value;
        if (value) {
            this.optionValue.numberOfRiskFactors = value;
        } else {
            this.optionValue.numberOfRiskFactors = undefined;
        }
    }

    onAdditionalAnalyticsChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        const value = (event.detail.value as AuxSelectOption[]).map(item => item.value);
        if (isUndefined(value) || value.length === 0) {
            this.optionValue.additionalAnalytics = undefined;
        } else {
            this.optionValue.additionalAnalytics = value;
        }
    }

}
