import {Given, Then, When} from 'cypress-cucumber-preprocessor/steps';
import {portfolioInputPanel} from '../../../integration/pages/portfolioInputPanel';
import {selectValueFromAuxSelect} from '../../../integration/pages/sharedElements';
import { newReportModal } from '../../../integration/pages/newReportModal';
import { widgetGalleryModalPage } from '../../../integration/pages/widget-gallary-modal.page';

Given('Portfolio is loaded for historical bussiness day', () => {
    cy.initializeMainPage('BGO', '20190611');
    cy.mockWidgetLoading();
    newReportModal.generateReport();
    widgetGalleryModalPage.closeModal();
});

When('select another currency', () => {
    selectValueFromAuxSelect('#currencyDropdown', 'CAD');
});

Then('verify portfolio currency should be changed to selected currency', () => {
    // verify portfolio benchmark is changed to secondary benchmark
    portfolioInputPanel.currencySelectText().invoke('attr', 'title')
        .should('eq', 'CAD');
});
