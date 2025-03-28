import {Component} from '@angular/core';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {MissingDataHandlingColumnOptionModel} from '../../../models/column-option/missing-data-handling-column-option.model';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {isNil} from 'lodash';

@Component({
    selector: 'explore-missing-data-handling-column-option',
    templateUrl: './missing-data-handling-column-option.component.html'
})
export class MissingDataHandlingColumnOptionComponent extends BaseColumnOptionComponent<MissingDataHandlingColumnOptionModel> {
    public static OPTION_KEY = MissingDataHandlingColumnOptionModel.CONFIG_TYPE;

    label: string;

    data: AuxRadioInterface[];

    /**
     * Sets selected item to the given one
     */
    onRadioGroupChanged(event: AuxRadioInterface): void {
        this.optionValue.missingDataHandling = event.eventData;
    }

    /**
     * Gets the config type that this object is configuring.
     */
    getOptionValueConfigType(): string {
        return MissingDataHandlingColumnOptionModel.CONFIG_TYPE;
    }

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        if (!this.option) {
            return;
        }
        const columnOptionAttributes = this.option.columnOptionAttributes[0];
        this.label = columnOptionAttributes.title;
        if (isNil(this.optionValue.missingDataHandling)) {
            this.optionValue.missingDataHandling = columnOptionAttributes.defaultValue.value;
        }
        this.data = columnOptionAttributes.values.map((attributeValue) => {
            return {
                label: attributeValue.label,
                eventData: attributeValue.value,
                checked: attributeValue.value === this.optionValue.missingDataHandling
            };
        });
    }
}
