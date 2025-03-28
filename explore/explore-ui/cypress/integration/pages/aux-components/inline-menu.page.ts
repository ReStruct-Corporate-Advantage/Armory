import type {} from 'cypress';
import {AuxComponents} from './ds.aux.enum';
import {CommonLocators} from '../../constants/common-locators';

class InlineMenuPage {

    overflowMenuButtonSelector = AuxComponents.INLINE_MENU + ' ' + AuxComponents.BUTTON + '.aux-widget__overflow-menu-aux-button[icon="ellipsis"]';
    overflowMenuSelector = CommonLocators.DIV + '.aux-overlay__menu-container ' + CommonLocators.UL;

    /**
     * Get aux overflow menu (accessible only after the overflow menu button is clicked)
     */
    private getAuxOverflowMenu = (): Cypress.Chainable<JQuery> => cy.get(this.overflowMenuSelector);

    /**
     * Get the overflow menu button from widget header (accessible only in the shrink view)
     */
    private getOverflowMenuButton = (context?: Cypress.Chainable<JQuery>): Cypress.Chainable<JQuery> => {
        if (context) {
            return context.find(this.overflowMenuButtonSelector);
        }
        return cy.get(this.overflowMenuButtonSelector);
    }

    clickAuxOverflowMenuButton(context?: Cypress.Chainable<JQuery>): Cypress.Chainable<JQuery> {
        return this.getOverflowMenuButton(context).click({force: true});
    }

    /**
     * Click aux overflow menu with label
     */
    clickAuxOverflowMenu(label: string): void {
        this.getAuxOverflowMenu().contains(label).click();
    }
}

export const inlineMenuPage = new InlineMenuPage();
