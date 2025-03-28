import {And} from 'cypress-cucumber-preprocessor/steps';
import {formatTabPage} from '../../../integration/pages/widget-settings/chart-settings/format-tab/format-tab.page';
import {CheckboxAction} from '../../../integration/pages/aux-components/checkbox.page';

// BASELINE TEST
And(/^I click baseline checkbox \(([^"]*)\)$/, (actionType: CheckboxAction) => {
    formatTabPage.clickBaselineCheckbox(actionType);
});

// GRID LINES TEST
And(/^I click grid lines checkbox \(([^"]*)\)$/, (actionType: CheckboxAction) => {
    formatTabPage.clickGridLinesCheckbox(actionType);
});

// ORIENTATION TEST
And('I select Horizontal radio option', () => {
    formatTabPage.selectHorizontalRadio();
});
And('I select Vertical radio option', () => {
    formatTabPage.selectVerticalRadio();
});