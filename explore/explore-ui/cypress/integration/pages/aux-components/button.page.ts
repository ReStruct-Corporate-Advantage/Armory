import type {} from 'cypress';
import {AuxComponents} from './ds.aux.enum';

class ButtonPage {

    /**
     * Click aux button
     */
    clickAuxButton(identifier: string, identifierType: ButtonIdentifierType, context?: Cypress.Chainable<JQuery>, forced?: boolean): Cypress.Chainable<JQuery> {
        return this.getAuxButton(identifier, identifierType, context).click({force: forced});
    }

    /**
     * Get aux button
     */
    getAuxButton(identifier: string, identifierType: ButtonIdentifierType, context?: Cypress.Chainable<JQuery>): Cypress.Chainable<JQuery> {
        const selector = this.getAuxButtonSelector(identifier, identifierType);
        if (context) {
            return context.find(selector);
        }
        return cy.get(selector);
    }

    private getAuxButtonSelector(identifier: string, identifierType: ButtonIdentifierType): string {
        if (identifierType === ButtonIdentifierType.ID) {
            return AuxComponents.ICON + `[id="${identifier}"]`;
        } else if (identifierType === ButtonIdentifierType.ICON) {
            return AuxComponents.ICON + `[type=${identifier}]`;
        } else if (identifierType === ButtonIdentifierType.LABEL) {
            return AuxComponents.BUTTON + `[label="${identifier}"]`;
        }
    }
}

export const buttonPage = new ButtonPage();

export enum ButtonIdentifierType {
    ID = 'ID',
    ICON = 'ICON',
    LABEL = 'LABEL'
}
