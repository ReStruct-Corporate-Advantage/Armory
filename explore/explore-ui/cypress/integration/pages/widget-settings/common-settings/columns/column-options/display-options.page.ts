import { CheckboxAction, CheckboxIdentifierType, checkboxPage } from "../../../../aux-components/checkbox.page";
import { numericStepperPage } from "../../../../aux-components/numeric-stepper.page";
import { radioPage } from "../../../../aux-components/radio.page";
import { textInputPage } from "../../../../aux-components/text-input.page";



class DisplayOptions {

     /**
     * Select radio
     */
     selectScalingRadioOption(label : string): void {
        radioPage.clickAuxRadio(label);
    }

    clickThousandsSeperatorCheckbox(actionType:CheckboxAction): void {
        checkboxPage.scrollAndClickAuxCheckbox(actionType,'Use thousands separator',  CheckboxIdentifierType.LABEL);
    }

    /**
     * Set number of periods in numeric stepper
     */
    setNumberOfDecimalPlaces(input: string): void {
        numericStepperPage.setInputInNumericStepper('Format', input);
    }

    typeInColumnTitleInput(input: string): void {
        textInputPage.typeInTextInput('Column title', input);
    }

}

export const displayOptions = new DisplayOptions();