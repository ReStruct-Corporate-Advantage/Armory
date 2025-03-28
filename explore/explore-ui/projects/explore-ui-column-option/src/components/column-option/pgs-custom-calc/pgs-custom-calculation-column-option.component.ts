import {CustomCalculationColumnOptionComponent} from "../custom-calculation/custom-calculation-column-option.component";
import {Component} from "@angular/core";
import {
    PgsCustomCalculationColumnOption
} from "../../../models/column-option/pgs-custom-calculation-column-option.model";

@Component({
    selector: 'explore-pgs-custom-calculation-column-option',
    templateUrl: './pgs-custom-calculation-column-option.component.html'
})
export class PgsCustomCalculationColumnOptionComponent extends CustomCalculationColumnOptionComponent {

    public static readonly OPTION_KEY = PgsCustomCalculationColumnOption.CONFIG_TYPE;

    protected getOptionValueConfigType(): string {
        return PgsCustomCalculationColumnOption.CONFIG_TYPE;
    }
}
