import {Component} from '@angular/core';
import {ActiveTypeUtils} from '../../../enums';
import {ActiveCalculationColumnOption} from '../../../models/column-option/active-calculation-column-option.model';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';

@Component({
    selector: 'explore-active-calculation-column-option',
    templateUrl: './active-calculation-column-option.component.html'
})
export class ActiveCalculationColumnOptionComponent extends BaseColumnOptionComponent<ActiveCalculationColumnOption> {
    public static OPTION_KEY = 'activeCalculationColumnOption';

    // Collection of options that the drop down can have
    selectOptions: ExploreSelectOptionGroup[];

    // Option title that we show for Drop Down column
    displayTitle: string;

    /**
     * Sets selected item to the given one
     */
    setSelectedValue(item: ExploreSelectOption): void {
        this.optionValue.activeType = item.value;
    }

    /**
     * Gets the config type that this object is configuring.
     */
    getOptionValueConfigType(): string {
        return ActiveCalculationColumnOption.CONFIG_TYPE;
    }

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        if (!this.option) {
            return;
        }

        this.selectOptions = [new ExploreSelectOptionGroup()];
        // Add the options to the select box.
        const activeTypes = ActiveTypeUtils.getAllActiveTypes();
        activeTypes.forEach((item: {value: string, label: string }) => {
            this.selectOptions[0].values.push(new ExploreSelectOption(item.label, item.value, item.value === this.optionValue.activeType));
        });

        const optionAttributes = this.option.columnOptionAttributes && this.option.columnOptionAttributes[0];
        this.displayTitle = optionAttributes.title;
    }
}
