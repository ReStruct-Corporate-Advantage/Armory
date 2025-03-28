import {Component} from '@angular/core';
import {AuxSelectOption} from '@blk/aladdin-angular-components';
import {ExploreSelectOption, ExploreSelectOptionGroup, ColumnOptionAttribute} from '@blk/explore-ui-core';
import {AggregationColumnOption} from '../../../models/column-option/aggregation-column-option.model';
import {GenericDropDownComponent} from '../../generic-drop-down/generic-drop-down.component';

@Component({
    selector: 'explore-aggregation-column-option',
    templateUrl: '../../generic-drop-down/generic-drop-down.component.html'
})
/**
 * Column option component for aggregation column options
 */
export class AggregationColumnOptionComponent extends GenericDropDownComponent<AggregationColumnOption> {
    public static OPTION_KEY = 'aggregation';

    aggregationListAttribute: ColumnOptionAttribute;

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        this.aggregationListAttribute = this.option['columnOptionAttributes'][0];
        super.initializeComponent();
    }

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return AggregationColumnOption.CONFIG_TYPE;
    }

    /**
     * Overriding the method of GenericDropDownComponent
     * Gets the list of options and sorts them in the correct order.  Order should be:
     *  - Default
     *  - None
     *  - Rest in alphabetic order
     */
    populateDropDownOptions(): void {
        const options: AuxSelectOption[] = [];

        // Get the default item and add it first.
        const defaultValue: number = Number(this.aggregationListAttribute.defaultValue.value);
        const defaultOption = this.findAggregationItem(defaultValue);
        if (defaultOption) {
            options.push(defaultOption);
        }

        // Get the none item, has an id of 0, and add it next.  But only if the default is not already none.
        if (!defaultOption || defaultOption.value !== 0) {
            const noneOption = this.findAggregationItem(0);
            if (noneOption) {
                options.push(noneOption);
            }
        }

        // Filter out these options and sort the rest by name.
        const otherOptions: any[] = this.aggregationListAttribute.values.filter((option: any) => {
            return option.value !== defaultValue && option.value !== 0;
        });
        // Sorting other options based on their label
        otherOptions.sort((option1, option2) => (option1.label > option2.label) ? 1 : -1);
        otherOptions.forEach((option: any) => {
            options.push(option);
        });
        this.selectOptions = [new ExploreSelectOptionGroup()];
        options.forEach((option: any) => {
            this.selectOptions[0].values.push(new ExploreSelectOption(option.label, option.value, option.value === Number(this.optionValue.value)));
        });
    }

    /**
     * Finds the aggregation item for this number.
     */
    findAggregationItem(type: number): any {
        return this.aggregationListAttribute.values.find((option: any) => {
            return option.value === type;
        });
    }

}
