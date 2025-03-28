import {And, Given, Then, When} from 'cypress-cucumber-preprocessor/steps';
import {portfolioSettings} from '../../../integration/pages/portfolioSettings';
import {widgetGalleryModalPage} from '../../../integration/pages/widget-gallary-modal.page';
import {newReportModal} from '../../../integration/pages/newReportModal';

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

When('Navigate to portfolio settings', () => {
    // open portfolio settings
    portfolioSettings.portfolioSettingsBtn().click();
});

Then('all the tabs in portfolio settings should be displayed', () => {
    // verify different tabs in portfolio settings
    portfolioSettings.portfolioSettingsTabs().each((item, index, list) => {
        expect(list).to.have.length(5);
        portfolioSettings.getSettingsTabText(item).should('contain.text', portfolioSettingsData.portfolioSettingsTabs[index]);
    });
});

And('select the Split Settings tab', () => {
    // open portfolio settings
    portfolioSettings.splitPositionsBtn().click();
});

Then('all the split settings should be displayed correctly', () => {
    // verify all split settings
    portfolioSettings.allSplitSettings().each((item, index, list) => {
        expect(list).to.have.length(10);
        portfolioSettings.splitSettingCheckboxText(item).should('contain.text', portfolioSettingsData.splitSettingsAllOptions[index]);
    });
    // verify checked split settings
    portfolioSettings.selectedSplitSettings().each((item, index, list) => {
        portfolioSettings.selectedSplitSettingText(item).should('contain.text', portfolioSettingsData.splitSettingsCheckedOptions[index]);
    });
});
