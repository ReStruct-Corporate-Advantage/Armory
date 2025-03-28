import type {} from 'cypress';
import {CommonLocators} from '../constants/common-locators';

class PortfolioInputPanel {

    static readonly AUX_DATE_PICKER = 'aux-date-picker';

    static readonly AUX_DATE_INPUT = 'aux-date-input';

    benchmarkSelectText = () => cy.get('#benchmarkSelect').shadow().find(CommonLocators.BUTTON);

    currencySelectText = () => cy.get('#currencyDropdown').shadow().find(CommonLocators.INPUT);

    benchmarkPortfolioSearchInput = () => cy.get(CommonLocators.SEARCH_PORTFOLIOS_INPUT);

    selectedBenchmarkLabel = () => cy.get('div.other-bench-container').find('div.portfolio-title-text');

    benchmarkPortfolioSearchBtn = () => cy.get('div.search-field-container').find(CommonLocators.SEARCH_BUTTON);

    searchBenchmarkPortfolio(portfolio: string) {
        this.benchmarkPortfolioSearchInput().should('be.visible').click().should('be.enabled').type(portfolio, {force: true});
        this.benchmarkPortfolioSearchBtn().click();
    }

    dateInput = () => cy.get(PortfolioInputPanel.AUX_DATE_PICKER).shadow().find(PortfolioInputPanel.AUX_DATE_INPUT).shadow().find(CommonLocators.INPUT);
}

export const portfolioInputPanel = new PortfolioInputPanel();
