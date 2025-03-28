import {portfolioSettings} from '../../../integration/pages/portfolioSettings';
import {portfolioFilterSettings} from '../../../integration/pages/portfolioFilterSettings';
import {And, Given, Then, When} from 'cypress-cucumber-preprocessor/steps';
import {widgetGalleryModalPage} from '../../../integration/pages/widget-gallary-modal.page';
import {newReportModal} from '../../../integration/pages/newReportModal';

Given('Portfolio is loaded for historical bussiness day', () => {
    cy.initializeMainPage('BGO', '20190611');
    cy.mockWidgetLoading();
    newReportModal.generateReport();
    widgetGalleryModalPage.closeModal();
});

And('Navigate to portfolio filter settings', () => {
    // open portfolio settings
    portfolioSettings.portfolioSettingsBtn().click();
    portfolioFilterSettings.portfolioFilterTabBtn().click();
});

Then('Filter screen elements should be displayed correctly', () => {
    //filter favorite
    portfolioFilterSettings.filterFavorite().should('have.length', 3);
    portfolioFilterSettings.normalizedCheckbox().should('have.attr', 'is-disabled');
    portfolioFilterSettings.applyToDropDownBtn().click();
    portfolioFilterSettings.applyToOptions().should('have.length', 3);
});

When('User configure a custom filter rule', () => {
    cy.staticColumnValues();
    portfolioFilterSettings.addConditionBtn().click();
    portfolioFilterSettings.customFilterInput().should('be.visible').should('be.enabled').click().type('Security Group', {force: true});
    portfolioFilterSettings.customFilterSelect('sec_group_ALL');
    portfolioFilterSettings.customFilterCheckboxInput('ABS');
    portfolioFilterSettings.doneBtn().click();
});

Then('Filter is configured correctly', () => {
    portfolioFilterSettings.configuredFilterText().should('contain.text', 'Security Group Equals ABS');
});

//Validate New button
And('Filter can be reset using New button', () => {
    portfolioFilterSettings.newBtn().click();
    portfolioFilterSettings.configuredFilterText().should('contain.text', 'Double click to define custom filter');
});
