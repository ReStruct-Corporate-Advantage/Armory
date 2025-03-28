import { CommonLocators } from "../../../../constants/common-locators";
import { CheckboxIdentifierType, checkboxPage } from "../../../aux-components/checkbox.page";
import { ColorApplyType, colorPicker } from "../../../aux-components/color-picker.page";



class ConditionalFormatting {

    getCompareValue_Input = () => cy.get('#compareValue').shadow().find(CommonLocators.INPUT).should('be.enabled');

    openBackgGroundColorPickerAndFill(colorsValue: string): void {
        colorPicker.selectColor(ColorApplyType.FILL, colorsValue);
    }

    openFontTextPickerAndFill(colorsValue: string): void {
        colorPicker.selectColor(ColorApplyType.TEXT, colorsValue);
    }

    openColorAndTextPicker(colorsValue: string): void {
        const backgroundAndFontColors = colorsValue.split("/");
        colorPicker.setColorandText(ColorApplyType.FILL, backgroundAndFontColors[0]);
        colorPicker.setColorandText(ColorApplyType.TEXT, backgroundAndFontColors[1]);
    }

    showLevelOfData(label: string, actionType: string) {
        checkboxPage.scrollAndClickAuxCheckbox(actionType, label, CheckboxIdentifierType.LABEL);
    }

    typeInValueInput(input: string): void {
        this.getCompareValue_Input().type(input, { force: true });
    }

}

export const conditionalFormatting = new ConditionalFormatting();
