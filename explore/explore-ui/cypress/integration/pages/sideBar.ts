import type {} from 'cypress';

class SideBar {

    static readonly PORTFOLIO_ACTIONS_BTN = 'div.portfolio-actions aux-icon';

    static readonly PORTFOLIO_ACTIONS_MENU = 'div.aux-overlay__menu-container ul';

    static readonly SIDE_BAR_PORTFOLIO_COMPONENT = 'app-side-bar-portfolio';

    static readonly SIDE_BAR_REPORT_GROUP_COMPONENT = 'app-side-bar-report-group';

    portfolioActionsBtn = () => cy.get(SideBar.PORTFOLIO_ACTIONS_BTN);

    portfolioActionsMenu = () => cy.get(SideBar.PORTFOLIO_ACTIONS_MENU);

    sideBarPortfolioComponent = () => cy.get(SideBar.SIDE_BAR_PORTFOLIO_COMPONENT);

    sideBarReportGroupComponent = () => cy.get(SideBar.SIDE_BAR_REPORT_GROUP_COMPONENT);

    selectPortfolioAction(option: string) {
        this.portfolioActionsBtn().click();
        this.portfolioActionsMenu().contains(option).click();
    }
}

export const sideBar = new SideBar();
