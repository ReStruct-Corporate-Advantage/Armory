import { And, Then, When } from 'cypress-cucumber-preprocessor/steps';
import {
    columnsSelector,
    columnsTabPage
} from '../../../integration/pages/widget-settings/chart-settings/columns-tab/columns-tab.page';

And('I click Columns tab', () => {
    columnsTabPage.clickColumnsTab();
});

And(/^I add column "([^"]*)"$/, (columnName: string) => {
    columnsSelector.addColumnToTarget(columnName);
});

Then(/^"([^"]*)" column is present in selected columns$/, (columnName: string) => {
    columnsSelector.checkIfColumnIsPresentInTarget(columnName).should('be.true');
});

And(/^"([^"]*)" column options are visible$/, (columnName: string) => {
    columnsSelector.getColumnOptionsTitle().should('eq', columnName + ' options');
});

When(/^I select column "([^"]*)"$/, (columnName: string) => {
    columnsSelector.selectColumnInTarget(columnName);
});

When(/^I clone "([^"]*)" column$/, (columnName: string) => {
    columnsSelector.cloneColumn(columnName);
});

Then(/^"([^"]*)" column is cloned in selected columns$/, (columnName: string) => {
    columnsSelector.checkIfColumnIsCloned(columnName ).should('be.true');
});

When(/^I select column option "([^"]*)"$/, (option: string) => {
    // Assuming there's a method in your page object to select a column option
    columnsSelector.selectColumnOption(option);
});

Then(/^"([^"]*)" options are visible$/, (option: string) => {
    // Assuming there's a method in your page object to check if column options are visible
    columnsSelector.checkIfColumnOptionsAreVisible(option);
});
