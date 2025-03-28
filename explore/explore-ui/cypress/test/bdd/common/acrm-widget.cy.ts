import {Then, When} from 'cypress-cucumber-preprocessor/steps';
import {scenariosTabPage} from '../../../integration/pages/widget-settings/acrm-settings/scenario-analysis-tab.page';
import {acrmWidgetPage, AcrmWidgetTabLabel} from '../../../integration/pages/widget/acrm-widget.page';
import {CheckboxAction} from '../../../integration/pages/aux-components/checkbox.page';
import {gridPage} from '../../../integration/pages/aux-components/grid.page';
import {
    expectedBaseTableHeaderCells,
    expectedBaseTableData,
    expectedBaseVsScenarioTableHeaderCells,
    expectedBaseVsScenarioTableData,
} from '../../../fixtures/testData/default-acrm-table-data';

When(/^I click "([^"]*)" from Scenario selection dropdown$/, (scenarioName: string) => {
    scenariosTabPage.selectScenario(scenarioName);
});

When(/^I click "([^"]*)" percentile radio button$/, (percentileRange: string) => {
    acrmWidgetPage.selectPercentileRangeRadio(percentileRange);
});

When(/^I click Base scenario checkbox \(([^"]*)\)$/, (actionType: CheckboxAction) => {
    acrmWidgetPage.clickBaseCheckbox(actionType);
});

When(/^I click Stress scenario checkbox \(([^"]*)\)$/, (actionType: CheckboxAction) => {
    acrmWidgetPage.clickStressScenarioCheckbox(actionType);
});

When(/^I click "([^"]*)" ACRM widget tab$/, (acrmWidgetTabLabel: AcrmWidgetTabLabel) => {
    acrmWidgetPage.clickAcrmWidgetTab(acrmWidgetTabLabel);
});

Then('Commitment Risk table widget should be displayed for base case', () => {
    // expectedGridData will be updated once aggrid cypress timing issue is fixed
    gridPage.validateGridData(expectedBaseTableHeaderCells, expectedBaseTableData);
});

Then('Commitment Risk table widget should be displayed for base vs scenario case', () => {
    // expectedGridData will be updated once aggrid cypress timing issue is fixed
    gridPage.validateGridData(expectedBaseVsScenarioTableHeaderCells, expectedBaseVsScenarioTableData);
});
