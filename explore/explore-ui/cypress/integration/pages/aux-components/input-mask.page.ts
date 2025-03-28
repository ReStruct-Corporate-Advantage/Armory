import type {} from 'cypress';
import {AuxComponents} from './ds.aux.enum';
import {CorePageUtils} from '../core-page.utils';
import {CommonLocators} from '../../constants/common-locators';

class InputMaskPage {
    /**
     * Get aux input mask with label
     */
    getAuxInputMask = (label: string, parentSelectorContext?: string): Cypress.Chainable<JQuery> => {
        const auxTextInputSelector = AuxComponents.INPUT_MASK + `[label="${label}"]`;
        return CorePageUtils.getElement(auxTextInputSelector, parentSelectorContext);
    }

    private getAuxTextInputTypeable = (label: string, parentSelectorContext?: string): Cypress.Chainable<JQuery> => {
        return this.getAuxInputMask(label, parentSelectorContext).shadow().find(CommonLocators.INPUT);
    }

    /**
     * Type in Text
     */
    typeInInput(label: string, input: string, parentSelectorContext?: string): void {
        this.getAuxTextInputTypeable(label, parentSelectorContext)
            .should('be.enabled')
            .click({force: true})
            .type(input, {force: true})
            .then(() => {
                this.getAuxInputMask(label, parentSelectorContext).should('be.visible').should('have.value', input);
            });
    }
}

export const inputMaskPage = new InputMaskPage();
