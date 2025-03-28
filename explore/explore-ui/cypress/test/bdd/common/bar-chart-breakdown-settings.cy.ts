import {And, Given} from 'cypress-cucumber-preprocessor/steps';
import {columnsTabPage} from '../../../integration/pages/widget-settings/chart-settings/columns-tab/columns-tab.page';
import {breakdownTabPage} from '../../../integration/pages/widget-settings/chart-settings/breakdown-tab/breakdown-tab.page';
import { widgetGalleryModalPage } from '../../../integration/pages/widget-gallary-modal.page';
import { newReportModal } from '../../../integration/pages/newReportModal';

Given(
    /^"([^"]*)" with column option is added to a report for portfolio "([^"]*)" with date "([^"]*)"$/,
    (testWidgetType: string, testPortfolio: string, testDate: string) => {
            cy.initializeMainPage(testPortfolio, testDate);
            cy.mockWidgetROEColumnLoading();
            newReportModal.generateReport();
            widgetGalleryModalPage.selectWidget(testWidgetType);
    });

And('I click measures tab', () => {
    columnsTabPage.clickMeasuresTab();
});

And('I select No breakdown radio option in Sector Breakdown', () => {
    breakdownTabPage.selectSectorNoBreakDownRadio();
});
And('I select No breakdown radio option in Stacked Breakdown', () => {
    breakdownTabPage.selectStackedNoBreakDownRadio();
});
