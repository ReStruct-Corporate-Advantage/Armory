import type { } from 'cypress';
import { AuxComponents } from './ds.aux.enum';
import { CommonLocators } from '../../constants/common-locators';
import { ButtonIdentifierType, buttonPage } from './button.page';
import { selectValueFromAuxSelect } from '../sharedElements';

class ColorPicker {

    private readonly AUX_SELECT_INPUT = '.aux-select__input-container-small';
    private readonly AUX_COLOR_PICKER_WRAPPER = '.aux-color-picker-wrapper';
    private readonly APPLY = 'Apply'

    getInputForR = () => cy.get(AuxComponents.INPUT_MASK + `[prefix-label="R"]`);
    getInputForG = () => cy.get(AuxComponents.INPUT_MASK + `[prefix-label="G"]`);
    getInputForB = () => cy.get(AuxComponents.INPUT_MASK + `[prefix-label="B"]`);

    openColorPickerContainer(type: ColorApplyType, colorsValue: string) {
        buttonPage.getAuxButton(type, ButtonIdentifierType.ICON).should('be.visible').click({ force: true });
        selectValueFromAuxSelect(this.AUX_SELECT_INPUT, colorsValue);
    }


    selectColor(type: ColorApplyType, colorsValue: string) {
        const colorValue = colorsValue.split(",");
        this.openColorPickerContainer(type, colorValue[0]);
        cy.get(this.AUX_COLOR_PICKER_WRAPPER).within(($e1) => {
            this.getInputForR().find(CommonLocators.INPUT).should('be.enabled').click({ force: true }).type(colorValue[1], { force: true });
            this.getInputForG().find(CommonLocators.INPUT).should('be.enabled').click({ force: true }).type(colorValue[2], { force: true });
            this.getInputForB().find(CommonLocators.INPUT).should('be.enabled').click({ force: true }).type(colorValue[3], { force: true });
            buttonPage.getAuxButton(this.APPLY, ButtonIdentifierType.LABEL).should('be.visible').click({ force: true });
        })
    }

    setColorandText(type: ColorApplyType, colorsValue: string) {
        const colorValue = colorsValue.split(",");
        this.openColorPickerContainer(type, colorValue[0]);
        this.getInputForR().eq(1).find(CommonLocators.INPUT).should('be.enabled').click({ force: true }).type(colorValue[1], { force: true });
        this.getInputForG().eq(1).find(CommonLocators.INPUT).should('be.enabled').click({ force: true }).type(colorValue[2], { force: true });
        this.getInputForB().eq(1).find(CommonLocators.INPUT).should('be.enabled').click({ force: true }).type(colorValue[3], { force: true });
        buttonPage.getAuxButton(this.APPLY, ButtonIdentifierType.LABEL).eq(2).should('be.visible').click({ force: true });
    }
}

export enum ColorApplyType {
    FILL = 'fill',
    TEXT = 'text'
}

export const colorPicker = new ColorPicker();

