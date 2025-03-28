import {And} from 'cypress-cucumber-preprocessor/steps';
import {CheckboxAction} from '../../../integration/pages/aux-components/checkbox.page';
import {axisTabPage} from '../../../integration/pages/widget-settings/chart-settings/axis-tab/axis-tab.page';

// Y AXIS TITLE OVERRIDE TEST
And(/^I click hide axis title checkbox on primary axis \(([^"]*)\)$/, (actionType: CheckboxAction) => {
    axisTabPage.clickHideAxisTitleCheckbox(actionType);
});
And('I type in "TITLE UPDATED" on Primary axis override text input', () => {
    axisTabPage.typeInAxisOverrideTextInput('TITLE UPDATED');
});

// Y AXIS BOUND TEST
And('I type in "0" on Minimum bound input mask', () => {
    axisTabPage.typeInMinBoundInputMask('0');
});
And('I type in "60" on Maximum bound input mask', () => {
    axisTabPage.typeInMaxBoundInputMask('60');
});
And('I type in "30" on Interval input mask', () => {
    axisTabPage.typeInIntervalBoundInputMask('30');
});
