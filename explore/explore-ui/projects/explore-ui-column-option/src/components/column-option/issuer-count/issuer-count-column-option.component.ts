import {Component} from '@angular/core';
import {IssuerCountColumnOption} from '../../../models/column-option/issuer-count-column-option.model';
import {AuxRadioInterface, AuxRadioGroupChangedDetailInterface} from '@blk/aladdin-angular-components';
import {BaseColumnTitleModifiableColumnOptionComponent} from '../base-column-title-modifiable-column-option.component';

@Component({
    selector: 'explore-issuer-count-column-option',
    templateUrl: './issuer-count-column-option.component.html'
})
export class IssuerCountColumnOptionComponent extends BaseColumnTitleModifiableColumnOptionComponent<IssuerCountColumnOption> {
    public static OPTION_KEY = IssuerCountColumnOption.CONFIG_TYPE;

    // Collection of options that the drop down can have
    displayOptions: AuxRadioInterface[] = [];

    /**
     * Sets selected item to the given one
     */
    setSelectedValue($event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        this.optionValue.value = $event.detail.value.eventData;
        this.updateColumnTitle();
    }

    /**
     * Gets the config type that this object is configuring.
     */
    getOptionValueConfigType(): string {
        return IssuerCountColumnOption.CONFIG_TYPE;
    }

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        if (!this.option) {
            return;
        }

        // Setup the options for the display.
        this.displayOptions = [
            {label: 'Direct issuer', checked: this.optionValue.value, disabled: false, eventData: true},
            {label: 'Parent issuer', checked: !this.optionValue.value, disabled: false, eventData: false}
        ];
    }
}
