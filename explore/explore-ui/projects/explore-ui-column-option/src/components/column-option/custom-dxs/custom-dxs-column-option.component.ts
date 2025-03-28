import {Component} from '@angular/core';
import {isUndefined} from 'lodash';
import {
    AuxRadioInterface,
    AuxNumericStepperValueChangedDetailInterface,
    AuxCheckboxChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {CustomDxsColumnOption} from '../../../models/column-option/custom-dxs-column-option.model';
import {BaseColumnTitleModifiableColumnOptionComponent} from '../base-column-title-modifiable-column-option.component';

/**
 * Component for the custom dxs column options.
 * It will be dynamically created in the container object of column-option component.
 */
@Component({
    selector: 'explore-custom-dxs-column-option',
    templateUrl: './custom-dxs-column-option.component.html',
    styleUrls: ['./custom-dxs-column-option.component.scss']
})
export class CustomDxsColumnOptionComponent extends BaseColumnTitleModifiableColumnOptionComponent<CustomDxsColumnOption> {
    static OPTION_KEY = 'dxsColumnOptions';

    spreadTypeAttribute: any;

    // spread type display options for aux-radio-group
    spreadTypeDisplayOptions: AuxRadioInterface[] = [];

    spreadLimitFloorTitle: string;
    spreadLimitCapTitle: string;
    useDurationForEurGovBondTitle: string;

    /**
     * Init the component.
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        if (!this.option) {
            return;
        }
        this.spreadTypeAttribute = this.option.columnOptionAttributes[0];
        this.spreadLimitFloorTitle = this.option.columnOptionAttributes[1].title;
        this.spreadLimitCapTitle = this.option.columnOptionAttributes[2].title;
        this.useDurationForEurGovBondTitle = this.option.columnOptionAttributes[3].title;

        // Get the default value from the spread type attribute
        if (isUndefined(this.optionValue.isOasBased)) {
            this.optionValue.isOasBased = this.spreadTypeAttribute.defaultValue.value;
        }
        this.updateColumnTitle();
        this.spreadTypeDisplayOptions = [
            {label: this.spreadTypeAttribute.values[1].label, checked: !this.optionValue.isOasBased, disabled: false},
            {label: this.spreadTypeAttribute.values[0].label, checked: this.optionValue.isOasBased, disabled: false}
        ];
    }

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return CustomDxsColumnOption.CONFIG_TYPE;
    }

    /**
     * Update the column title as per the selected spread type
     */
    spreadTypeChange(): void {
        this.optionValue.isOasBased = this.spreadTypeDisplayOptions[1].checked;
        this.updateColumnTitle();
    }

    /**
     * Update the column option floor value
     */
    onFloorValueChangedHandler(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        this.optionValue.floor = Number(event.detail.value);
    }

    /**
     * Update the column option cap value
     */
    onCapValueChangedHandler(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        this.optionValue.cap = Number(event.detail.value);
    }

    /**
     * Update the column option checkbox value
     */
    updateDxsColumnOptionsCheckbox(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.optionValue.useDurationForEuroGovtBonds = event.detail.value.checked;
    }
}
