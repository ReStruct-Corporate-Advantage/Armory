import type {} from 'cypress';

/**
 * Core page utils
 */
export class CorePageUtils {

    /**
     * Get html element and return cypress chainable
     */
    static getElement(selector: string, parentSelectorContext?: string): Cypress.Chainable<JQuery> {
        if (parentSelectorContext) {
            return cy.get(parentSelectorContext).find(selector);
        }
        return cy.get(selector);
    }
}
