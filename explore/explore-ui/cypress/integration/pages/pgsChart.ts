import type {} from 'cypress';

class PgsChart {
    cell = () => cy.get('div.ag-cell-value').contains('1,277,785');
    rootCell = () => cy.get('div.ag-cell-value').contains('10,680,524');
    barChartOption = () => cy.get('span[class="ag-menu-option-part ag-menu-option-text"').contains('Open Chart');
    levelBarChartOption = () => cy.get('span[class="ag-menu-option-part ag-menu-option-text"').contains('Bar chart at selected level');
    individualPortBarChartOption = () => cy.get('span[class="ag-menu-option-part ag-menu-option-text"').contains('Bar chart for all individual portfolios');
    portfolioCell = () => cy.get('span[class="ag-group-value"').contains('RUBICONAGA');
}

export const PgsChart = new PgsChart();
