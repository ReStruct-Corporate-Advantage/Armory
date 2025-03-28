import {Given} from 'cypress-cucumber-preprocessor/steps';
import {widgetGalleryModalPage} from '../../../integration/pages/widget-gallary-modal.page';
import { newReportModal } from '../../../integration/pages/newReportModal';

Given(
    /^"([^"]*)" with default settings is added to a report for portfolio "([^"]*)" with date "([^"]*)"$/,
    (testWidgetType: string, testPortfolio: string, testDate: string) => {
        cy.initializeMainPage(testPortfolio, testDate);
        cy.mockWidgetLoading();
        newReportModal.generateReport();
        widgetGalleryModalPage.selectWidget(testWidgetType);
    });



