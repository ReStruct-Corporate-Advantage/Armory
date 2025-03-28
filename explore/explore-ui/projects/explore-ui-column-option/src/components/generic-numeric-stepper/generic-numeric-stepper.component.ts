import {Directive} from '@angular/core';
import {AuxNumericStepperValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {GenericValueColumnOption} from '../../models/column-option/generic-value-column-option.model';
import {BaseColumnOptionComponent} from '../column-option/base-column-option.component';

/**
 * Base class for any generic numeric stepper column option.
 */
@Directive()
export abstract class GenericNumericStepperComponent<T extends GenericValueColumnOption<number>> extends BaseColumnOptionComponent<GenericValueColumnOption<number>> {

    /**
     * The title to put on the dropdown.
     */
    title: string;

    /**
     * Value that the numeric stepper is showing.
     */
    value: number;

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        if (!this.option) {
            return;
        }

        // Generate the options to display.
        this.title = this.option.columnOptionAttributes[0].title;
        this.value = this.optionValue.value;
    }

    /**
     * The value in the spinner has been changed, so update the model.
     */
    onValueChanged(ev: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        this.optionValue.value = Number(ev.detail.value);
    }
}
