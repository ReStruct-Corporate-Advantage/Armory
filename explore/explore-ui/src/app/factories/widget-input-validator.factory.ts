import {BaseWidgetInputValidator} from '@models/widget-input-validator/base-widget-input-validator.model';

export class WidgetInputValidatorFactory {
    private static inputValidator: Map<string, any> = new Map<string, any>();

    /**
     * Registers a input validator with the factory.
     */
    static registerInputValidator(configType: string, validator: any): void {
        WidgetInputValidatorFactory.inputValidator.set(configType, validator);
    }

    /**
     * Gets the input validator from the map with configType
     */
    static getInputValidator(configType: string): BaseWidgetInputValidator {
        return WidgetInputValidatorFactory.inputValidator.get(configType);
    }
}
