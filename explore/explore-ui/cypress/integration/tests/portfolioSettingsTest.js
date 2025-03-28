import {portfolioSettings} from '../pages/portfolioSettings'

describe('Test Portfolio Settings', function() {

    let portfolioSettingsData;
    const testPortfolio = 'BGO';

    before(() => {
        cy.fixture('/testData/portfolioSettings.json').then(data => {
            portfolioSettingsData = data;
        })
    })

    beforeEach(() => {
        cy.mockApplicationLoading();
        cy.loadApplication();
        cy.mockPortfolioLoading(testPortfolio);
        cy.loadPortfolio(testPortfolio);
        cy.changeDate('06/11/2019');
    })

    it('Validate Portfolio Settings tabs are displayed', function() {
        // open portfolio settings
        portfolioSettings.portfolioSettingsBtn().click();
        // verify different tabs in portfolio settings
        portfolioSettings.portfolioSettingsTabs().each((item, index, list) => {
            expect(list).to.have.length(5);
            portfolioSettings.getSettingsTabText(item).should('contain.text', portfolioSettingsData.portfolioSettingsTabs[index]);
        });
    });


    it('Validate Split Settings options are displayed', function() {
        // open portfolio settings
        portfolioSettings.portfolioSettingsBtn().click();
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
});
