import type {} from 'cypress';
import {CommonLocators} from '../constants/common-locators';

class IntroPage {

    static readonly SEARCH_CONTAINER_DIV = 'div.search-field-container';

    portfolioSearchInput = () => cy.get(CommonLocators.SEARCH_PORTFOLIOS_INPUT);

    portfolioSearchBtn = () => cy.get(IntroPage.SEARCH_CONTAINER_DIV).find(CommonLocators.SEARCH_BUTTON);

    searchPortfolio(portfolio: string) {
        this.portfolioSearchInput().click().type(portfolio);
        this.portfolioSearchBtn().click();
    }
}

export const introPage = new IntroPage();
