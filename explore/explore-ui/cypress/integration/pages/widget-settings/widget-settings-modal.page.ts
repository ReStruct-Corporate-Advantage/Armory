import {buttonPage, ButtonIdentifierType} from '../aux-components/button.page';

class WidgetSettingsModalPage {

    getWidgetSettingsModalHeader = (widgetTypeLabel: WidgetTypeLabel): Cypress.Chainable<JQuery> => cy.get('span.title-padding-left').contains(`Widget Type: ${widgetTypeLabel}`);

    /**
     * Click 'Done' button from widget settings modal
     */
    clickDoneButton(): Cypress.Chainable<JQuery> {
        return buttonPage.clickAuxButton('Done', ButtonIdentifierType.LABEL, null, true);
    }
}

export enum WidgetTypeLabel {
    BAR_CHART = 'Bar Chart',
    RETURN_ANALYSIS_CHART = 'Return Analysis Chart',
    RISK_AND_EXPOSURE = 'Risk and Exposure'
}

export const widgetSettingsModalPage = new WidgetSettingsModalPage();
