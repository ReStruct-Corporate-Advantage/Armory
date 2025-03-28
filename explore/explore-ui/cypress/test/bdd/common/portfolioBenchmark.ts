import {Given, Then, When} from 'cypress-cucumber-preprocessor/steps';
import {portfolioInputPanel} from '../../../integration/pages/portfolioInputPanel';
import {selectValueFromAuxSelect} from '../../../integration/pages/sharedElements';
import { newReportModal } from '../../../integration/pages/newReportModal';
import { widgetGalleryModalPage } from '../../../integration/pages/widget-gallary-modal.page';

Given('Portfolio is loaded for historical bussiness day', () => {
    cy.initializeMainPage('BGO', '20190611');
    cy.mockWidgetLoading();
    newReportModal.generateReport();
    widgetGalleryModalPage.closeModal();
});

When('select secondary benchmark', () => {
    selectValueFromAuxSelect('#benchmarkSelect', 'Secondary (MSACWLDNET)');
});

When('select other benchmark', () => {
    selectValueFromAuxSelect('#benchmarkSelect', 'Other');
    portfolioInputPanel.searchBenchmarkPortfolio('CBBGOOWB');
});

Then('verify portfolio benchmark should be changed to secondary benchmark', () => {
    // verify portfolio benchmark is changed to secondary benchmark
    portfolioInputPanel.benchmarkSelectText().should('contain.text', 'Secondary (MSACWLDNET)');
});

Then('verify portfolio benchmark should be changed to other benchmark', () => {
    // verify portfolio benchmark is changed to other portfolio benchmark
    portfolioInputPanel.selectedBenchmarkLabel().invoke('text').then((text) => {
        const trimmedText = text.trim();
        cy.wrap(trimmedText).should('eq', 'CBBGOOWB');
    });
});
