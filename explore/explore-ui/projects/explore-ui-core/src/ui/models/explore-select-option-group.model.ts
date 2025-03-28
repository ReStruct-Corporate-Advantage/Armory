import {AuxSelectOptionGroup} from '@blk/aladdin-angular-components';
import {ExploreSelectOption} from './explore-select-option.model';

/**
 * Explore Select Option Group
 */
export class ExploreSelectOptionGroup implements AuxSelectOptionGroup {
    values: ExploreSelectOption[] = [];
    label?: string;
    metadata?:{};

    /**
     * Created a list of ExploreSelectBox items given a string list.
     */
    static createSimpleSelectOptionGroup(values: string[], displayValues?: string[], selectedItem?: string): ExploreSelectOptionGroup[] {
        const selectItems: ExploreSelectOptionGroup[] = [
            new ExploreSelectOptionGroup()
        ];

        if (!displayValues) {
            displayValues = values;
        }
        if (values) {
            for (let i = 0; i < values.length; i++) {
                selectItems[0].values.push(new ExploreSelectOption(displayValues[i], values[i], selectedItem && selectedItem === values[i]));
            }
        }

        return selectItems;
    }

    /**
     * Construct the object
     */
    constructor(values?: ExploreSelectOption[], label?: string) {
        if (values) {
            this.values = values;
        }

        if (label) {
            this.label = label;
        }
    }
}
