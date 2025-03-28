import {AuxCheckboxChangedDetailInterface} from '@blk/aladdin-angular-components';
import {Component} from '@angular/core';
import {EuroBondColumnOption} from '../../../models/column-option/euro-bond-column-option.model';
import {BaseColumnOptionComponent} from '../base-column-option.component';

/**
 * Component for the euro bond column options.
 * It will be dynamically created in the container object of column-option component.
 */
@Component({
    selector: 'explore-euro-bond-column-option',
    templateUrl: './euro-bond-column-option.component.html'
})
export class EuroBondColumnOptionComponent extends BaseColumnOptionComponent<EuroBondColumnOption> {
    static OPTION_KEY = 'DurationForEuroBond';
    useDurationForEurGovBondTitle: string;

    /**
     * Init the component.
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        if (!this.option) {
            return;
        }
        this.useDurationForEurGovBondTitle = this.option.columnOptionAttributes[0].title;
    }

    /**
     * Get the config type that this object is configuring.
     */
    getOptionValueConfigType(): string {
        return EuroBondColumnOption.CONFIG_TYPE;
    }

    /**
     * Update the column option checkbox value
     */
    updateEuroBondColumnOptionsCheckbox(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.optionValue.useDurationForEuroGovtBonds = event.detail.value.checked;
    }
}
