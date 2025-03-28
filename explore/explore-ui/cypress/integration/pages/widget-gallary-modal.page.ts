import {sharedElements} from './sharedElements';
import {buttonPage, ButtonIdentifierType} from './aux-components/button.page';
import {AuxComponents} from './aux-components/ds.aux.enum';

class WidgetGalleryModalPage {
    /**
     * Get the chartsTab from the widget modal to add the widget
     */
    getChartsTab = (): Cypress.Chainable<JQuery> => cy.get('label.aux-segmented-control__right-button--regular');

    /**
     * Add widget with widgetName
     */
    addWidget(widgetName: string, isCharts?: boolean): void {
        buttonPage.clickAuxButton('Widget', ButtonIdentifierType.LABEL, null, true);
        if (isCharts) {
            this.getChartsTab().click();
        }
        cy.get('aux-card').contains(widgetName).parent('div').find(AuxComponents.BUTTON).click({force: true});
        buttonPage.clickAuxButton('closeModalBtn', ButtonIdentifierType.ID);
        sharedElements.loadingSpinner().should('not.exist');
    }

    selectWidget(widgetName: string, isCharts?: boolean): void {
        if (isCharts) {
            this.getChartsTab().click();
        }
        cy.get('aux-card').contains(widgetName).parent('div').find(AuxComponents.BUTTON).click({force: true});
        buttonPage.clickAuxButton('closeModalBtn', ButtonIdentifierType.ID);
        sharedElements.loadingSpinner().should('not.exist');
    }

    closeModal(): void {
        buttonPage.clickAuxButton('closeModalBtn', ButtonIdentifierType.ID);
        sharedElements.loadingSpinner().should('not.exist');
    }
}

export const widgetGalleryModalPage = new WidgetGalleryModalPage();
