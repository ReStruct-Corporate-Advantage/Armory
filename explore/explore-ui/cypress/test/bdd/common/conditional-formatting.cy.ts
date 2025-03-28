import { And, Then } from 'cypress-cucumber-preprocessor/steps';
import { expectedCollapsedTableData, expectedExpandAllTableData, expectedTableHeaders } from '../../../fixtures/testData/default-risk-and-exposure-table-data-snp100';
import { ButtonIdentifierType, buttonPage } from '../../../integration/pages/aux-components/button.page';
import { gridPage } from '../../../integration/pages/aux-components/grid.page';
import { selectValueFromAuxSelect } from '../../../integration/pages/sharedElements';
import { conditionalFormatting } from "../../../integration/pages/widget-settings/common-settings/columns/conditional-formatting.page";


And(/^I select "([^"]*)" in the rule dropdown$/, (dropDownValue: string) => {
    selectValueFromAuxSelect('#comparisonTypeSelect', dropDownValue);
});

And(/^I select "([^"]*)" in color field$/, (dropDownValue: string) => {
    selectValueFromAuxSelect('#updateColorTypeSelect', dropDownValue);
});

And(/^I click on background color picker to select the color "([^"]*)"$/, (colorValue: string) => {
    conditionalFormatting.openBackgGroundColorPickerAndFill(colorValue);
});

And(/^I click on font text picker to select the color "([^"]*)"$/, (colorValue: string) => {
    conditionalFormatting.openFontTextPickerAndFill(colorValue);
});

And(/^I click on color and text picker to select the color "([^"]*)"$/, (colorValue: string) => {
    conditionalFormatting.openColorAndTextPicker(colorValue);
});

And(/^I click "([^"]*)" checkbox \(([^"]*)\)$/, (label: string, actionType: string) => {
    conditionalFormatting.showLevelOfData(label, actionType);
});

And('I click on Add Rule button', () => {
    buttonPage.clickAuxButton("Rule", ButtonIdentifierType.LABEL, null, true);
});

And(/^I enter "([^"]*)" in the value field$/, (value: string) => {
    conditionalFormatting.typeInValueInput(value);
});

Then('Risk and Exposure should be displayed with conditional formatting applied', () => {
    gridPage.validateGridData(expectedTableHeaders, expectedCollapsedTableData);
});





