import { And, Then, When } from "cypress-cucumber-preprocessor/steps";
import { expectedCollapsedTableData, expectedTableHeaders } from "../../../fixtures/testData/default-risk-and-exposure-table-data-snp100";
import { CypressCommonConstants } from "../../../integration/constants/cypress-common-constants";
import { ButtonIdentifierType, buttonPage } from "../../../integration/pages/aux-components/button.page";
import { datePickerPage } from "../../../integration/pages/aux-components/date-picker.page";
import { gridPage } from "../../../integration/pages/aux-components/grid.page";

When(/^I set the Explore portfolio date as "([^"]*)"$/, (option: string) => {
    datePickerPage.typeInDatePickerInput("Date", option);
});

When(/^I set the Explore portfolio date from calendar as "([^"]*)"$/, (dateString: string) => {
    const dateParts = dateString.split("/");
    datePickerPage.selectDateFromCalendar("Date", dateParts);
});

And('Reload Now Button Appears in the Explore', () => {
    buttonPage.getAuxButton("Reload Now", ButtonIdentifierType.LABEL).wait(3000).should('be.visible');
});

Then(/^The widget is reloaded with "([^"]*)" data and getPrismData request is sent with "([^"]*)" date$/, (option: string) => {
    gridPage.validateGridData(expectedTableHeaders, expectedCollapsedTableData);
});

When(/^Select calendar as "([^"]*)"$/, (option: string) => {
    datePickerPage.selectCountryCalendar(option);
});

And('I click on Reload Now Button', () => {
    cy.intercept('POST', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getPrismData?widgetId=*').as('prismRequest');
    buttonPage.clickAuxButton("Reload Now", ButtonIdentifierType.LABEL, null, true).wait(3000);
    buttonPage.getAuxButton("Reload Now", ButtonIdentifierType.LABEL).should('not.exist');
});

Then(/^Verify The date is changed to "([^"]*)" and Calendar to "([^"]*)" in date picker$/, (dateInput: string, country: string) => {
    cy.wait('@prismRequest', { timeout: 5000 }).then((interception) => {
        expect(interception.request.body.forDate).to.deep.equal(dateInput);
    });
    const dateAsArray = dateInput.split("/");
    buttonPage.getAuxButton("calendar", ButtonIdentifierType.ICON).should('be.visible').click({ force: true });
    datePickerPage.getCalendarYear().should('eq', dateAsArray[2]);
    datePickerPage.getCalendarMonth().should('eq', CypressCommonConstants.MonthCalendar.get(dateAsArray[0]));
    datePickerPage.getDateSelected().should('eq', dateAsArray[1].replace(/^0+/, ''));
    datePickerPage.getCountryCalendar().should('eq', country)

});