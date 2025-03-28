import { And, Given, Then } from 'cypress-cucumber-preprocessor/steps';
import { expectedCollapsedTableDataforDisplayBasisPointScalingMarketValuePercentage, expectedCollapsedTableDataforDisplayBillions, expectedCollapsedTableDataforDisplayMillions, expectedCollapsedTableDataforDisplayNoneScaling, expectedCollapsedTableDataforDisplayNoneScalingMarketValuePercentange, expectedCollapsedTableDataforDisplayPercentScalingMarketValuePercentage, expectedCollapsedTableDataforDisplayThousands, expectedTableHeadersDisplaysettings, expectedTableHeadersDisplaysettingsBillions, expectedTableHeadersDisplaysettingsBonusPoints, expectedTableHeadersDisplaysettingsChangedColumnTitle, expectedTableHeadersDisplaysettingsMillions, expectedTableHeadersDisplaysettingsThousands, expectedTableHeadersMarketValuewithPercent } from '../../../fixtures/testData/display-settings-data-snp100';
import { CheckboxAction } from '../../../integration/pages/aux-components/checkbox.page';
import { gridPage } from '../../../integration/pages/aux-components/grid.page';
import { widgetGalleryModalPage } from '../../../integration/pages/widget-gallary-modal.page';
import { displayOptions } from '../../../integration/pages/widget-settings/common-settings/columns/column-options/display-options.page';
import { widgetPage } from '../../../integration/pages/widget/widget.page';
import { newReportModal } from '../../../integration/pages/newReportModal';

Given(
    /^"([^"]*)" with display options settings is added to a report for portfolio "([^"]*)" with date "([^"]*)"$/,
    (testWidgetType: string, testPortfolio: string, testDate: string) => {
            cy.initializeMainPage(testPortfolio, testDate);
            cy.mockWidgetLoading();
            cy.mockWidgetDisplayOptionLoading();
            newReportModal.generateReport();
            widgetGalleryModalPage.selectWidget(testWidgetType);
    });  

// ORIENTATION TEST
And(/^I select radio option for DisplaySettings "([^"]*)"$/, (label: string) => {
    displayOptions.selectScalingRadioOption(label);
});

And(/^I click thousands separator checkbox \(([^"]*)\)$/, (actionType: CheckboxAction) => {
    displayOptions.clickThousandsSeperatorCheckbox(actionType);
});

And(/^I change number of decimal places to "([^"]*)"$/, (numberOfPeriods: string) => {
    displayOptions.setNumberOfDecimalPlaces(numberOfPeriods);
});

Then('Risk and Exposure widget should be displayed with the scaling Millions data', () => {
    gridPage.validateGridData(expectedTableHeadersDisplaysettingsMillions, expectedCollapsedTableDataforDisplayMillions);
});

Then('Risk and Exposure widget should be displayed with the scaling None data', () => {
    gridPage.validateGridData(expectedTableHeadersDisplaysettings, expectedCollapsedTableDataforDisplayNoneScaling);
});

Then('Risk and Exposure widget should be displayed with the scaling Thousands data', () => {
    gridPage.validateGridData(expectedTableHeadersDisplaysettingsThousands, expectedCollapsedTableDataforDisplayThousands);
});

Then('Risk and Exposure widget should be displayed with the scaling Billions data', () => {
    gridPage.validateGridData(expectedTableHeadersDisplaysettingsBillions, expectedCollapsedTableDataforDisplayBillions);
});


Then('Risk and Exposure widget should be displayed with the changed column Title data', () => {
    gridPage.validateGridData(expectedTableHeadersDisplaysettingsChangedColumnTitle, expectedCollapsedTableDataforDisplayBillions);
});

Then('Risk and Exposure widget should be displayed with the scaling None data for Market Value %', () => {
    gridPage.validateGridData(expectedTableHeadersMarketValuewithPercent, expectedCollapsedTableDataforDisplayNoneScalingMarketValuePercentange);
});

Then('Risk and Exposure widget should be displayed with the scaling Percent data for Market Value %', () => {
    gridPage.validateGridData(expectedTableHeadersMarketValuewithPercent, expectedCollapsedTableDataforDisplayPercentScalingMarketValuePercentage);
});

Then('Risk and Exposure widget should be displayed with the scaling Basis Point data for Market Value %', () => {
    gridPage.validateGridData(expectedTableHeadersDisplaysettingsBonusPoints, expectedCollapsedTableDataforDisplayBasisPointScalingMarketValuePercentage);
});

And(/^I type in "([^"]*)" on ColumnTitle text input$/, (label: string) => {
    displayOptions.typeInColumnTitleInput(label);
});

And('Refresh the widget', () => {
    widgetPage.refreshWidget();
});
