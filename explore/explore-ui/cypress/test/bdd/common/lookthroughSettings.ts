import {Given, Then, When} from 'cypress-cucumber-preprocessor/steps';
import {portfolioSettings} from '../../../integration/pages/portfolioSettings';
import {lookthroughSettings} from '../../../integration/pages/lookthroughSettings';
import { newReportModal } from '../../../integration/pages/newReportModal';
import { widgetGalleryModalPage } from '../../../integration/pages/widget-gallary-modal.page';

let portfolioSettingsData;

before(() => {
    cy.fixture('/testData/portfolioSettings.json').then(data => {
        portfolioSettingsData = data;
    });
});

Given('Portfolio is loaded for historical bussiness day', () => {
    cy.initializeMainPage('BGO', '20190611');
    cy.mockWidgetLoading();
    newReportModal.generateReport();
    widgetGalleryModalPage.closeModal();
});

When('Navigate to look-through settings', () => {
    // open portfolio settings
    portfolioSettings.portfolioSettingsBtn().click();
    lookthroughSettings.lookthroughSettingsTab().click();
});

When('look-through is disabled', () => {
    // open look-through settings
    lookthroughSettings.lookthroughSettingsTab().click();
});

Then('components should be disabled', () => {
    lookthroughSettings.proxiesCheckboxGroup().should('have.attr', 'is-disabled');
});

When('look-through is enabled', () => {
    // open look-through settings
    lookthroughSettings.lookthroughSettingsTab().click();
    lookthroughSettings.enableLTButton().click();
    lookthroughSettings.portfolioButton().click();
});

Then('components in look-through settings should be enabled', () => {
    lookthroughSettings.typeRadioGroup().each((item, index, list) => {
        expect(list).to.have.length(3);
        lookthroughSettings.settingsText(item).should('contain.text', list[index].attributes.getNamedItem('label').value);
    });
    lookthroughSettings.proxiesCheckboxGroup().should('not.have.attr', 'is-disabled');
    lookthroughSettings.availableSources().should('have.length', 2);
    lookthroughSettings.selectedSources().should('have.length', 2);
});

When('portfolio look-through is enabled', () => {
    // open look-through settings
    lookthroughSettings.lookthroughSettingsTab().click();
    lookthroughSettings.enableLTButton().click();
    lookthroughSettings.portfolioButton().click();
});


Then('desired proxies are enabled', () => {
    lookthroughSettings.enableLTButton().click();
    lookthroughSettings.portfolioButton().click();
    lookthroughSettings.selectedProxySettings().each((item, index, list) => {
        expect(list).to.have.length(3);
        lookthroughSettings.settingsText(item).should('contain.text', portfolioSettingsData.lookthroughProxies[index]);
    });
});

When('Available sources are changed', () => {
    // open look-through settings
    lookthroughSettings.lookthroughSettingsTab().click();
    lookthroughSettings.enableLTButton().click();
    lookthroughSettings.portfolioButton().click();
    lookthroughSettings.enableLTInheritanceButton();
    lookthroughSettings.availableSources().click({multiple: true});
    lookthroughSettings.rightButton().click();
});

Then('changed source settings are respected', () => {
    lookthroughSettings.selectedSources().should('have.length', 3);
    lookthroughSettings.availableSources().should('have.length', 1);
});
