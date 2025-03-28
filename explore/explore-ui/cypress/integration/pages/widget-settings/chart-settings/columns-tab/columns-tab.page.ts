import {tabBarPage} from '../../../aux-components/tab-bar.page';
import {inlineMenuPage} from '../../../aux-components/inline-menu.page';
import {ButtonIdentifierType, buttonPage} from '../../../aux-components/button.page';

class ColumnsTabPage {
    static readonly COLUMNS_TAB_LABEL = 'Columns';
    static readonly MEASURES_TAB_LABEL = 'Measures';


    /**
     * Click Columns tab from the main tabs on the widget settings modal
     */
    clickColumnsTab(): void {
        tabBarPage.clickAuxTab(ColumnsTabPage.COLUMNS_TAB_LABEL);
    }
    
    /**
     * Click Measures tab from the main tabs on the widget settings modal
     */
    clickMeasuresTab(): void {
        tabBarPage.clickAuxTab(ColumnsTabPage.MEASURES_TAB_LABEL);
    }

}

class ColumnsSelector {
    /**
     * Enter column name in search box
     */
    searchColumn(columnName: string): void {
        cy.get('aux-search-field').find('input[placeholder="Search"]').type(columnName);
    }

    /**
     * Get the title of column options
     */
    getColumnOptionsTitle(): Cypress.Chainable<string> {
        return cy.get('.column-option-title').invoke('text');
    }

    selectColumnInTreeList(columnName: string): void {
        cy.get('.aux-column-selector__source-parent-container')
            .get('.aux-advanced-tree-list__list-item')
            .filter((index, element) => {
                return element.textContent.trim() === columnName;
            })
            .dblclick();
    }

    addColumnToTarget(columnName: string): void {
        this.searchColumn(columnName);
        this.selectColumnInTreeList(columnName);
    }

    checkIfColumnIsPresentInTarget(columnName: string, retries = 3): Cypress.Chainable<boolean> {
        return cy
            .get('.aux-column-selector__target-parent-container')
            .get('.aux-advanced-tree-list__list-item')
            .filter((index, element) => {
                return element.textContent.trim() === columnName;
            })
            .then((elements) => {
                if (elements.length > 0) {
                    return Cypress.Promise.resolve(true);
                } else if (retries > 0) {
                    // Retry after a delay
                    cy.wait(1000); // Wait for 1 second
                    return this.checkIfColumnIsPresentInTarget(columnName, retries - 1);
                } else {
                    return Cypress.Promise.resolve(false);
                }
            });
    }

    selectColumnInTarget(columnName: string): void {
        this.getColumnInTarget(columnName).click();
    }

    getColumnInTarget(columnName: string): Cypress.Chainable<JQuery> {
        return cy
            .get('.aux-column-selector__target-parent-container')
            .get('.aux-advanced-tree-list__list-item')
            .filter((index, element) => {
                return element.textContent.trim() === columnName;
            });
    }

    /**
     * Select a column option
     */
    selectColumnOption(option: string): void {
        cy.get('.aux-accordion-expansion-panel__header-button').contains(option).click();
    }

    /**
     * Check if column options are visible
     */
    checkIfColumnOptionsAreVisible(option: string): Cypress.Chainable<JQuery<HTMLElement>> {
        return cy.get('aux-accordion-expansion-panel[is-expanded]').within(() => {
            return buttonPage
                .getAuxButton('Copy ' + option.toLowerCase(), ButtonIdentifierType.LABEL)
                .scrollIntoView()
                .should('be.visible')
                .then(() => {
                    return Cypress.Promise.resolve(true);
                });
        });
    }

    cloneColumn(columnName: string): void {
        // right click on the column in target list
        this.getColumnInTarget(columnName).rightclick();
        // wait for context menu to display and Click clone in context menu
        inlineMenuPage.clickAuxOverflowMenu('Clone column');
    }

    checkIfColumnIsCloned(columnName: string): Cypress.Chainable<boolean> {
        return cy
            .get('.aux-column-selector__target-parent-container')
            .get('.aux-advanced-tree-list__list-item')
            .then((elements) => {
                const lastElement = elements[elements.length - 1];
                return Cypress.Promise.resolve(lastElement.textContent === columnName);
            });
    }
}

export const columnsTabPage = new ColumnsTabPage();
export const columnsSelector = new ColumnsSelector();
