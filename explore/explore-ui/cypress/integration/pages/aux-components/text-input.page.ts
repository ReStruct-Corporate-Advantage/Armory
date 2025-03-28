import type {} from 'cypress';
import {AuxComponents} from './ds.aux.enum';
import {CorePageUtils} from '../core-page.utils';
import {CommonLocators} from '../../constants/common-locators';

class TextInputPage {
    /**
     * Get aux text input with label
     */
    getAuxTextInput = (label: string, parentSelectorContext?: string): Cypress.Chainable<JQuery> => {
        const auxTextInputSelector = AuxComponents.TEXT_INPUT + `[label="${label}"]`;
        return CorePageUtils.getElement(auxTextInputSelector, parentSelectorContext);
    }

    private getAuxTextInputTypeable = (label: string, parentSelectorContext?: string): Cypress.Chainable<JQuery> => {
        return this.getAuxTextInput(label, parentSelectorContext).shadow().find(CommonLocators.INPUT);
    }

    /**
     * Type in Text
     */
    typeInTextInput(label: string, input: string, parentSelectorContext?: string): void {
        this.getAuxTextInputTypeable(label, parentSelectorContext)
            .should('be.enabled')
            .click({force: true})
            .type(input, {force: true})
            .then(() => {
                this.getAuxTextInput(label, parentSelectorContext).should('be.visible').should('have.value', input);
            });
    }
}

export const textInputPage = new TextInputPage();
