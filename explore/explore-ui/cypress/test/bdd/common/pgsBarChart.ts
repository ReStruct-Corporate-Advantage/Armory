import {Given, When, Then} from 'cypress-cucumber-preprocessor/steps';
import {reportBar} from '../../../integration/pages/reportBar';
import {PgsChart} from '../../../integration/pages/pgsChart';
import {widgetPage} from '../../../integration/pages/widget/widget.page';
import {widgetGalleryModalPage} from '../../../integration/pages/widget-gallary-modal.page';

const testPortfolio = 'RUBICONAGA';

Given('PGS widget is added for any portfolio with default settings', () => {
    cy.mockApplicationLoading();
    cy.loadApplication();
    cy.mockPortfolioLoading(testPortfolio);
    cy.loadPortfolio(testPortfolio);
    cy.changeDate('09/04/2018');
    cy.mockWidgetLoading();
    reportBar.blankReportBtn().click();
    widgetGalleryModalPage.addWidget('Portfolio Group Summary', false);
});

When('Right click on cell corresponding to a column', () => {
    PgsChart.cell().rightclick();
    PgsChart.barChartOption().click();
    PgsChart.levelBarChartOption().click();
});

Then('Bar chart should be displayed for the selected column', () => {
    widgetPage.setWidgetHeightAndWidth('Bar Chart', 467, 928);
    widgetPage.refreshWidget();
    cy.matchChartSnapshot('pgsBarChart_baseline', widgetPage.getChartWithinWidget('Bar Chart'));
});

When('Right click on cell corresponding to a row', () => {
    PgsChart.rootCell().rightclick();
    PgsChart.barChartOption().click();
    PgsChart.individualPortBarChartOption().click();
});

Then('Bar chart should be displayed for all columns', () => {
    widgetPage.setWidgetHeightAndWidth('Bar Chart', 467, 928);
    widgetPage.refreshWidget();
    cy.matchChartSnapshot('pgsAllColumnsBarChart_baseline', widgetPage.getChartWithinWidget('Bar Chart'));
});

When('Right click on cell corresponding to a column on portfolio cell', () => {
    PgsChart.portfolioCell().rightclick();
    PgsChart.barChartOption().click();
    PgsChart.levelBarChartOption().click();
});

Then('Bar chart should be displayed for all column for selected level', () => {
    widgetPage.setWidgetHeightAndWidth('Bar Chart', 467, 928);
    widgetPage.refreshWidget();
    cy.matchChartSnapshot('pgsIndividualBarChart_baseline', widgetPage.getChartWithinWidget('Bar Chart'));
});

When('Right click on cell corresponding to a column on portfolio cell and open at individual level', () => {
    PgsChart.portfolioCell().rightclick();
    PgsChart.barChartOption().click();
    PgsChart.individualPortBarChartOption().click();
});

Then('Bar chart should be displayed for all columns for all individual portfolios', () => {
    widgetPage.setWidgetHeightAndWidth('Bar Chart', 467, 928);
    widgetPage.refreshWidget();
    cy.matchChartSnapshot('pgsIndividualAllColumnsBarChart_baseline', widgetPage.getChartWithinWidget('Bar Chart'));
});
