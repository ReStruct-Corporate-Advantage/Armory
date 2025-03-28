import {Component} from '@angular/core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {MarginAnalyticsCassiniSettings} from '@models/widget/inputs/margin-analytics-cassini-settings.model';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {CoreDefinitionStore, ExploreSelectOption, ExploreSelectOptionGroup, TokenConstants} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import {MarginAnalyticsCalculationStyle} from '@enums/margin-analytics-calculation-style.enum';

/**
 * Component to select attrubution style and grouping model for margin analysis cassini widget
 */
@Component({
    selector: 'app-margin-analytics-cassini-settings',
    templateUrl: './margin-analytics-cassini-settings.component.html',
    styleUrls: ['./margin-analytics-cassini-settings.component.scss']
})
export class MarginAnalyticsCassiniSettingsComponent extends BaseWidgetSettingComponent<MarginAnalyticsCassiniSettings> {

    calculationStyleOptions: ExploreSelectOptionGroup[];

    groupingStyleOptions: ExploreSelectOptionGroup[];

    initializeComponent(): void {
        this.initializeCalculationStyleOptions();
        this.initializeGroupingStyleOptions();
        if (!this.widgetInput.calculationStyle) {
            this.widgetInput.calculationStyle = this.calculationStyleOptions[0].values[0].value;
        }
        if (!this.widgetInput.groupingStyle) {
            this.widgetInput.groupingStyle = this.groupingStyleOptions[0].values[0].value;
        }
    }

    /**
     * Initialize Calculation style selections
     */
    initializeCalculationStyleOptions() {
        this.calculationStyleOptions = [new ExploreSelectOptionGroup(MarginAnalyticsCalculationStyle.getAllCalculationStyles().filter(item => !!item.label).map(item =>
            new ExploreSelectOption(item.label, item.value, item.value === this.widgetInput.calculationStyle)
        ))];
    }

    /**
     * Initialize Grouping style selections
     */
    initializeGroupingStyleOptions() {
        const groupingStylesTokenValue: string = CoreDefinitionStore.tokens[TokenConstants.EXPLORE_MARGIN_ANALYTICS_GROUPING_STYLES];
        this.groupingStyleOptions = [new ExploreSelectOptionGroup()];
        if (groupingStylesTokenValue) {
            this.groupingStyleOptions[0].values = groupingStylesTokenValue.split(CommonConstants.COMMA_SEPARATOR).map(groupingModel => ({
                isSelected: this.widgetInput.groupingStyle === groupingModel,
                displayValue: groupingModel.replace('_', ' '),
                value: groupingModel
            }));
        }
    }

    /**
     * Update calculation style
     */
    onCalculationStyleChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.widgetInput.calculationStyle = (event.detail.value as AuxSelectOption).value;
    }

    /**
     * Update grouping style
     */
    onGroupingStyleChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.widgetInput.groupingStyle = (event.detail.value as AuxSelectOption).value;
    }

}
