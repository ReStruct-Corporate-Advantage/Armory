import type {} from 'cypress';
import {CommonLocators} from '../constants/common-locators';
import {AuxComponents} from './aux-components/ds.aux.enum';

class AddPortfolioModal {

    static readonly ADD_PORTFOLIO_MODAL = 'div[aria-label="Add Portfolio"]';

    addBtn = () => cy.get(AddPortfolioModal.ADD_PORTFOLIO_MODAL).contains('button', 'Add');

    portfolioSearchBtn = () => cy.get(AddPortfolioModal.ADD_PORTFOLIO_MODAL).find(AuxComponents.SEARCH_FIELD).find(CommonLocators.SEARCH_BUTTON);

    portfolioSearchInput = () => cy.get(AddPortfolioModal.ADD_PORTFOLIO_MODAL).find(AuxComponents.SEARCH_FIELD).shadow().find(CommonLocators.SEARCH_PORTFOLIOS_INPUT);

    searchPortfolio(portfolio: string) {
        this.portfolioSearchInput().should('be.visible').should('be.enabled').click().type(portfolio, {force: true});
        this.portfolioSearchBtn().click();
    }
}

export const addPortfolioModal = new AddPortfolioModal();
