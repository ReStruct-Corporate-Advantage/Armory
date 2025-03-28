import {Component} from '@angular/core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {CommitmentRiskGrouping} from '@models/widget/inputs/commitment-risk/commitment-risk-grouping.model';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {DefinitionsStore} from '@stores/definitions.store';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';

/**
 * Displays the "Group By" setting for Commitment Risk Widget
 */
@Component({
    selector: 'app-commitment-risk-grouping',
    templateUrl: './commitment-risk-grouping.component.html',
    styleUrls: ['./commitment-risk-grouping.component.scss']
})
export class CommitmentRiskGroupingComponent extends BaseWidgetSettingComponent<CommitmentRiskGrouping> {

    public readonly GROUPING_LABEL: string = 'Group By';

    groupingSelectOptions: ExploreSelectOptionGroup[] = [];

    initializeComponent(): void {
        const noneOption = new ExploreSelectOption('None', undefined, !this.widgetInput.groupBy);
        const groupingOptions = DefinitionsStore.commitmentRiskGroupingModels
        .map(({ text, value }) => new ExploreSelectOption(text, value, value === this.widgetInput.groupBy))
        .sort((a, b) => a.displayValue.localeCompare(b.displayValue));

        this.groupingSelectOptions = [
            new ExploreSelectOptionGroup([noneOption]),
            new ExploreSelectOptionGroup(groupingOptions)
        ];
    }

    /**
     * Updates groupBy when selection is changed
     */
    updateGrouping(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.widgetInput.groupBy = (event.detail.value as AuxSelectOption).value;
    }
}
