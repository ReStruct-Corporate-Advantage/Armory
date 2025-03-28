import {And} from 'cypress-cucumber-preprocessor/steps';
import {selectValueFromAuxSelect} from '../../../integration/pages/sharedElements';
import {
    returnsChartFormatTabPage,
} from '../../../integration/pages/widget-settings/chart-settings/format-tab/returns-chart-format-tab.page';
import {
    returnsChartPerformanceSettingsTabPage
} from '../../../integration/pages/widget-settings/chart-settings/performance-settings-tab/returns-chart-performance-settings-tab.page';
import {CheckboxAction} from '../../../integration/pages/aux-components/checkbox.page';

const testNumberOfPeriod = '2';
const testFrequency = 'Quarter';

And('I click performance settings tab', () => {
    returnsChartPerformanceSettingsTabPage.clickPerformanceSettingsTab(testNumberOfPeriod, testFrequency);
});

And(/^I change frequency is to "([^"]*)"$/, (frequency: string) => {
    selectValueFromAuxSelect('#frequencySelect', frequency);
});

And(/^I change number of periods to "([^"]*)"$/, (numberOfPeriods: string) => {
    returnsChartPerformanceSettingsTabPage.setNumberOfPeriodsNumericStepper(numberOfPeriods);
});

And('I uncheck all other columns beside portfolio column', () => {
    // By default, all checkboxes are checked.
    // Check off all columns beside Port.
    returnsChartFormatTabPage.clickBenchCheckbox(CheckboxAction.UNCHECK);
    returnsChartFormatTabPage.clickActiveCheckbox(CheckboxAction.UNCHECK);
    returnsChartFormatTabPage.clickPortCumCheckbox(CheckboxAction.UNCHECK);
    returnsChartFormatTabPage.clickBenchCumCheckbox(CheckboxAction.UNCHECK);
    returnsChartFormatTabPage.clickActiveCumCheckbox(CheckboxAction.UNCHECK);
});

And(/^I change time period interval to "([^"]*)"$/, (timePeriodInterval: string) => {
    selectValueFromAuxSelect('#timePeriodIntervalSelect', timePeriodInterval);
});
