import {Component} from '@angular/core';
import {ValueXXColumnOption} from '../../../models/column-option/value-x-x-column-option.model';
import {ColumnOptionUtils} from '../../../utils';
import {GenericNumericStepperComponent} from '../../generic-numeric-stepper/generic-numeric-stepper.component';

@Component({
    selector: 'explore-value-x-x-column-option',
    templateUrl: '../../generic-numeric-stepper/generic-numeric-stepper.component.html'
})
export class ValueXXColumnOptionComponent extends GenericNumericStepperComponent<ValueXXColumnOption> {
    public static OPTION_KEY = ValueXXColumnOption.CONFIG_TYPE;

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return ValueXXColumnOption.CONFIG_TYPE;
    }

    /**
     * Callback when the value has been changed
     */
    onValueChanged(ev: CustomEvent): void {
        super.onValueChanged(ev);
        ColumnOptionUtils.updateColumnTitle(this.column, this.optionValue, this.widgetType);
        this.columnOptionUpdated$.next({column: this.column, isSaveUpdate: false});
    }
}
