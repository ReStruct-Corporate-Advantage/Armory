import {CommonLocators} from '../constants/common-locators';

class LookthroughSettings {
    static readonly LOOKTHROUGH_SETTINGS_BTN = 'span[title="Look-Through"]';

    static readonly ADVANCED_TREE_LIST_ITEM = 'div.aux-advanced-tree-list__list-item';

    static readonly PROXIES_CHECKBOX = 'aux-checkbox-group[label="Security type/proxies"]';

    lookthroughSettingsTab = () => cy.get(LookthroughSettings.LOOKTHROUGH_SETTINGS_BTN);

    enableLTButton = () => cy.get('aux-toggle[label="Enable look-through"]');

    typeRadioGroup = () => cy.get('aux-radio-group[label=" for"]').shadow().find('aux-radio');

    portfolioButton = () => cy.get('aux-radio[label="Portfolio"]');

    proxiesCheckboxGroup = () => cy.get(LookthroughSettings.PROXIES_CHECKBOX);

    selectedProxySettings = () => cy.get(LookthroughSettings.PROXIES_CHECKBOX).shadow().find('div.aux-checkbox-group__vertical-content aux-checkbox[is-checked]');

    settingsText = (element) => cy.wrap(element).shadow().find(CommonLocators.SPAN);

    enableLTInheritanceButton = () => cy.get('aux-toggle[id="ltInheritance"]');

    rightButton = () => cy.get('div.center-panel aux-button[icon="arrow-right"]').shadow().find(CommonLocators.BUTTON);

    availableSources = () => cy.get('aux-advanced-tree-list[id="source"]').shadow().find(LookthroughSettings.ADVANCED_TREE_LIST_ITEM);

    selectedSources = () => cy.get('aux-advanced-tree-list[id="target"]').shadow().find(LookthroughSettings.ADVANCED_TREE_LIST_ITEM);
}

export const lookthroughSettings = new LookthroughSettings();
