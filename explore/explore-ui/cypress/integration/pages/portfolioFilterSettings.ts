import {CommonLocators} from '../constants/common-locators';
import {AuxComponents} from './aux-components/ds.aux.enum';

class PortfolioFilterSettings {

    static readonly EXPLORE_COLUMN_OPTION_COLUMN_SELECTOR = 'explore-column-option-column-selector';
    static readonly EXPLORE_SECTOR_ATTR_RULE_STATIC_COLUMN_FIELD = 'explore-sector-attribute-rule-static-column-field';
    private readonly APPLY_TO = '"Apply to"';

    portfolioFilterTabBtn = () => cy.get('span[title="Portfolio Filter"]');

    filterFavorite = () => cy.get('div.filter-favorite-container ' + AuxComponents.BUTTON);

    newBtn = () => cy.get(AuxComponents.BUTTON + '[label="New"]').shadow().find(CommonLocators.BUTTON);

    addConditionBtn = () => cy.get(AuxComponents.BUTTON + '[label="Add Condition"]').shadow().find(CommonLocators.BUTTON);

    customFilterInput = () => cy.get(PortfolioFilterSettings.EXPLORE_COLUMN_OPTION_COLUMN_SELECTOR).find('input[placeholder="Search"]');

    filterCheckboxSelect = () => cy.get(PortfolioFilterSettings.EXPLORE_SECTOR_ATTR_RULE_STATIC_COLUMN_FIELD).find('input[placeholder="Select"]');

    filterCheckboxDropDownIcon = () => cy.get(PortfolioFilterSettings.EXPLORE_SECTOR_ATTR_RULE_STATIC_COLUMN_FIELD).find(AuxComponents.ICON);

    doneBtn = () => cy.get('div[aria-label="Custom Filter Rule Logic"] aux-button[label="Done"]').shadow().find(CommonLocators.BUTTON);

    configuredFilterText = () => cy.get('explore-custom-sector-column-rule div.rule-text');

    normalizedCheckbox = () => cy.get(AuxComponents.CHECKBOX + '[label="Normalized"]');

    applyToDropDownBtn = () => cy.get('aux-select[label=' + this.APPLY_TO + ']').shadow().find(CommonLocators.BUTTON);

    applyToOptions = () => cy.get('div[aria-label=' + this.APPLY_TO + '] span');

    customFilterSelect(filter: string){
            cy.get(PortfolioFilterSettings.EXPLORE_COLUMN_OPTION_COLUMN_SELECTOR + ' aux-column-selector').find('div[data-id=' + filter + ']').click();
    }
    customFilterCheckboxInput(filter: string) {
        this.filterCheckboxDropDownIcon();
        this.filterCheckboxSelect().should('be.enabled').click({force: true}).type(filter, {force: true});
        cy.get('div[data-aux-display-value=' + filter + ']').click({ force: true });
    }
}

export const portfolioFilterSettings = new PortfolioFilterSettings();
