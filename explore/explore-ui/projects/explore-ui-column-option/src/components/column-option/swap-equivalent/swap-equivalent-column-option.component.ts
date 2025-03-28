import {Component} from '@angular/core';
import {SwapEquivalentColumnOption} from '../../../models/column-option/swap-equivalent-column-option.model';
import {GenericNumericStepperComponent} from '../../generic-numeric-stepper/generic-numeric-stepper.component';

/**
 * Component for the swap equivalent column options.
 */
@Component({
    selector: 'explore-swap-equivalent-column-option',
    templateUrl: '../../generic-numeric-stepper/generic-numeric-stepper.component.html'
})
export class SwapEquivalentColumnOptionComponent extends GenericNumericStepperComponent<SwapEquivalentColumnOption> {
    public static OPTION_KEY = SwapEquivalentColumnOption.CONFIG_TYPE;

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return SwapEquivalentColumnOption.CONFIG_TYPE;
    }
}
