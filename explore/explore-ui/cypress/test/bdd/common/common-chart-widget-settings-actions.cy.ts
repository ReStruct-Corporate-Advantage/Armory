import {And} from 'cypress-cucumber-preprocessor/steps';
import {axisTabPage} from '../../../integration/pages/widget-settings/chart-settings/axis-tab/axis-tab.page';
import {ChartTypeLabel, formatTabPage} from '../../../integration/pages/widget-settings/chart-settings/format-tab/format-tab.page';
import {columnsTabPage} from '../../../integration/pages/widget-settings/chart-settings/columns-tab/columns-tab.page';
import {CheckboxAction} from '../../../integration/pages/aux-components/checkbox.page';
import {breakdownTabPage} from '../../../integration/pages/widget-settings/chart-settings/breakdown-tab/breakdown-tab.page';

And('I click format tab', () => {
    formatTabPage.clickFormatTab();
});

And('I click axis tab', () => {
    axisTabPage.clickAxisTab();
});

And('I click columns tab', () => {
    columnsTabPage.clickColumnsTab();
});

And('I click breakdown tab', () => {
    breakdownTabPage.clickBreakdownTab();
});

// MARKER TEST
And(/^I select chart type "([^"]*)" for column "([^"]*)"$/, (comboChartType: ChartTypeLabel, columnIndex: number) => {
    formatTabPage.selectChartType(comboChartType, columnIndex);
});

And(/^I click secondary axis checkbox for column "([^"]*)" \(([^"]*)\)$/, (columnMeasureIndex: number, actionType: CheckboxAction) => {
    formatTabPage.clickSecondaryAxis(columnMeasureIndex, actionType);
});
