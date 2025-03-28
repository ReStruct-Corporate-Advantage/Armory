import {CustomCalculationColumnOption} from "./custom-calculation-column-option.model";

export class PgsCustomCalculationColumnOption extends CustomCalculationColumnOption {

    public static CONFIG_TYPE = 'PgsCustomCalculation';

    get configType(): string {
        return PgsCustomCalculationColumnOption.CONFIG_TYPE;
    }
}
