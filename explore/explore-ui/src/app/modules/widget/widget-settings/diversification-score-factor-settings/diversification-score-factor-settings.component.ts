import { Component } from '@angular/core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {
    DiversificationScoreFactorSettings
} from '@models/widget/inputs/chart-settings/diversification-score-factor-settings';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {
    DiversificationAdditionalAnalytics,
    DiversificationAdditionalAnalyticsUtil
} from '../../../../../../projects/explore-ui-column-option/src/enums/diversification-additional-analytics.enum';
import {
    AuxNumericStepperValueChangedDetailInterface, AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {isEmpty} from 'lodash';

@Component({
  selector: 'app-diversification-score-factor-settings',
  templateUrl: './diversification-score-factor-settings.component.html'
})
export class DiversificationScoreFactorSettingsComponent extends BaseWidgetSettingComponent<DiversificationScoreFactorSettings> {

    availableAdditionalAnalytics: ExploreSelectOptionGroup[];

    initializeComponent(): void {
        this.availableAdditionalAnalytics = [new ExploreSelectOptionGroup(
            Object.keys(DiversificationAdditionalAnalytics)
                .filter(key => isNaN(Number(key)))
                .map(key => new ExploreSelectOption(DiversificationAdditionalAnalyticsUtil.getDisplayName(DiversificationAdditionalAnalytics[key]), key, this.widgetInput.additionalAnalytics ? this.widgetInput.additionalAnalytics.indexOf(key) >= 0 : false))
        )];
    }

    onNumberOfRiskFactorChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        const value = event.detail.value;
        if (value) {
            this.widgetInput.numberOfRiskFactors = value;
        } else {
            this.widgetInput.numberOfRiskFactors = undefined;
        }
    }

    onAdditionalAnalyticsChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        const value = (event.detail.value as AuxSelectOption[]).map(item => item.value);
        if (isEmpty(value)) {
            this.widgetInput.additionalAnalytics = undefined;
        } else {
            this.widgetInput.additionalAnalytics = value;
        }
    }

}
