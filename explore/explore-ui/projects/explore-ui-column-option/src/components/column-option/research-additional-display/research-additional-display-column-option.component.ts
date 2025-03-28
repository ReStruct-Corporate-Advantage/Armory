import {Component} from '@angular/core';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {ResearchAdditionalDisplayColumnOption} from '../../../models/column-option/research-additional-display-column-option.model';
import {BaseColumnOptionComponent} from '../base-column-option.component';

/**
 * Component for the research additional display column options.
 * It will be dynamically created in the container object of column-option component.
 */
@Component({
    selector: 'explore-research-additional-display-column-option',
    templateUrl: './research-additional-display-column-option.component.html'
})
export class ResearchAdditionalDisplayColumnOptionComponent extends BaseColumnOptionComponent<ResearchAdditionalDisplayColumnOption> {

    static OPTION_KEY = 'researchAdditionalDisplayOption';

    displayOptions: AuxRadioInterface[] = [];

    /**
     * Init the component.
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        if (!this.option) {
            return;
        }

        // Setup the options for the display.
        this.displayOptions = [
            {label: 'Full list name', checked: !this.optionValue.showMembership, disabled: false},
            {label: 'Membership', checked: this.optionValue.showMembership, disabled: false}
        ];
    }

    /**
     * Get the config type that this object is configuring.
     */
    getOptionValueConfigType(): string {
        return ResearchAdditionalDisplayColumnOption.CONFIG_TYPE;
    }

    /**
     * Sets selected item to the given one
     */
    setSelectedValue() {
        this.optionValue.showMembership = this.displayOptions[1].checked;
    }
}
