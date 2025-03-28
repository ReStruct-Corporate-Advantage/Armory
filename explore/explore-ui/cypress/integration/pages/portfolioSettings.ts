import type {} from 'cypress';
import {CommonLocators} from '../constants/common-locators';
import {AuxComponents} from './aux-components/ds.aux.enum';

class PortfolioSettings {

    static readonly SPLIT_POSITIONS_BTN = 'span[title="Split Positions"]';

    portfolioSettingsBtn = () => cy.get('aux-menu-nav[label="Settings"]').shadow().find(CommonLocators.BUTTON);

    portfolioSettingsTabs = () => cy.get('div.portfolio-settings-content aux-tab-bar').shadow().find('aux-tab-bar-item');

    getSettingsTabText = (element) => cy.wrap(element).shadow().find('span.aux-tab-item__label-container');

    splitPositionsBtn = () => cy.get(PortfolioSettings.SPLIT_POSITIONS_BTN);

    allSplitSettings = () => cy.get('app-split-setting aux-checkbox-group').shadow().find('div.aux-checkbox-group__vertical-content');

    selectedSplitSettings = () => cy.get('app-split-setting aux-checkbox-group').shadow().find('div.aux-checkbox-group__vertical-content aux-checkbox[is-checked]');

    selectedSplitSettingText = (element) => cy.wrap(element).shadow().find(CommonLocators.SPAN);

    splitSettingCheckboxText = (element) => cy.wrap(element).find(AuxComponents.CHECKBOX).shadow().find(CommonLocators.SPAN);

}

export const portfolioSettings = new PortfolioSettings();
