import type {} from 'cypress';
import {AuxComponents} from './ds.aux.enum';

class TabBarPage {

    /**
     * Get aux tab with label
     */
    private getAuxTab = (label: string): Cypress.Chainable<JQuery> => cy.get(AuxComponents.TAB_BAR_ITEM + `[label="${label}"]`);

    /**
     * Click aux tab with label
     */
    clickAuxTab(label: string): void {
        this.getAuxTab(label)
            .click()
            .then(() => {
                this.getAuxTab(label).should('have.attr', 'is-selected');
            });
    }
}

export const tabBarPage = new TabBarPage();
