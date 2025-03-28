import {And, Given, Then, When} from 'cypress-cucumber-preprocessor/steps';
import {sideBar} from '../../../integration/pages/sideBar';
import {sharedElements} from '../../../integration/pages/sharedElements';
import {addPortfolioModal} from '../../../integration/pages/addPortfolioModal';

const testPortfolio = 'BGO';

Given('Explore home page is launched', () => {
    cy.mockApplicationLoading();
    cy.loadApplication();
    cy.mockPortfolioLoading(testPortfolio);
});


When('Add Portfolio Modal is opened from side bar', () => {
    sideBar.selectPortfolioAction('Add Portfolio');
});

And('portfolio is added from modal', () => {
    addPortfolioModal.searchPortfolio(testPortfolio);
    sharedElements.loadingSpinner().should('not.exist');
    addPortfolioModal.addBtn().click();
});

Then('portfolio should get added to side bar', () => {
    sideBar.sideBarPortfolioComponent().should('exist');
    sideBar.sideBarPortfolioComponent().should('contain.text', testPortfolio);
});


When('create new group option is selected from side bar', () => {
    sideBar.selectPortfolioAction('Create New Group');
});

Then('new report group should get added to side bar', () => {
    sideBar.sideBarReportGroupComponent().should('exist');
    sideBar.sideBarReportGroupComponent().should('contain.text', 'My New Group');
});
