import type {} from 'cypress';
import {AuxComponents} from './ds.aux.enum';

class CheckboxPage {

    /**
     * Scroll into view and click aux checkbox
     */
    scrollAndClickAuxCheckbox(actionType: string, identifier: string, identifierType: CheckboxIdentifierType, context?: Cypress.Chainable<JQuery>): void {
        const auxCheckbox = checkboxPage.getAuxCheckBox(identifier, identifierType, context);
        auxCheckbox
            .scrollIntoView()
            .should('be.visible')
            .then(() => {
                checkboxPage.clickAuxCheckbox(auxCheckbox, actionType);
            });
    }

    /**
     * Click aux checkbox
     */
    private clickAuxCheckbox(auxCheckbox: any, actionType: string): void {
        auxCheckbox.then((checkbox) => {
            auxCheckbox.shadow().find('label')
                .should('not.be.disabled')
                .click()
                .then(() => {
                    if (actionType === CheckboxAction.CHECK) {
                        cy.get(checkbox).should('be.visible').should('have.attr', 'is-checked');
                    } else {
                        cy.get(checkbox).should('be.visible').should('not.have.attr', 'is-checked');
                    }
                });
        });
    }

    /**
     * Get aux checkbox
     */
    private getAuxCheckBox(identifier: string, identifierType: CheckboxIdentifierType, context?: Cypress.Chainable<JQuery>, contextSelector?: string): Cypress.Chainable<JQuery> {
        const selector = this.getAuxCheckBoxSelector(identifier, identifierType);
        if (contextSelector) {
            return cy.get(contextSelector).find(selector);
        }
        if (context) {
            return context.find(selector);
        }
        return cy.get(selector);
    }

    private getAuxCheckBoxSelector(identifier: string, identifierType: CheckboxIdentifierType): string {
        return AuxComponents.CHECKBOX + `[${identifierType === CheckboxIdentifierType.ID ? 'id' : 'label'}="${identifier}"]`;
    }
}

export enum CheckboxAction {
    CHECK = 'CHECK',
    UNCHECK = 'UNCHECK'
}

export enum CheckboxIdentifierType {
    ID = 'ID',
    LABEL = 'LABEL'
}


export const checkboxPage = new CheckboxPage();
