import type { } from 'cypress';
import { CommonLocators } from '../../constants/common-locators';
import { CypressCommonConstants } from '../../constants/cypress-common-constants';
import { CorePageUtils } from '../core-page.utils';
import { getSelectedValueInAuxSelect, selectValueFromAuxSelect } from '../sharedElements';
import { ButtonIdentifierType, buttonPage } from './button.page';
import { AuxComponents } from './ds.aux.enum';
class DatePickerPage {

    static readonly YEAR_SELECTOR = 'aux-select.aux-calendar__header-years';
    static readonly MONTH_SELECTOR = 'aux-select.aux-calendar__header-months';

    getCalendarMonth = () => getSelectedValueInAuxSelect(DatePickerPage.MONTH_SELECTOR);

    getCalendarYear = () => getSelectedValueInAuxSelect(DatePickerPage.YEAR_SELECTOR);

    getDateSelected = () => cy.get('.aux-calendar__table').get('.aux-calendar__table-cell--selected').find(CommonLocators.BUTTON).invoke('attr', 'value');

    getCountryCalendar = () => cy.get('.aux-calendar__footer__label--text').invoke('text');

    /**
     * Get aux date input with label
     */
    getAuxDatePickerInput = (label: string, parentSelectorContext?: string): Cypress.Chainable<JQuery> => {
        const auxTextInputSelector = AuxComponents.DATE_PICKER + `[label="${label}"]`;
        return CorePageUtils.getElement(auxTextInputSelector, parentSelectorContext);
    }

    private getAuxDatePickerInputTypeable = (label: string, parentSelectorContext?: string): Cypress.Chainable<JQuery> => {
        return this.getAuxDatePickerInput(label, parentSelectorContext).shadow().find(CommonLocators.INPUT);
    }

    /**
     * Type in Date
     */
    typeInDatePickerInput(label: string, input: string, parentSelectorContext?: string): void {
        this.getAuxDatePickerInputTypeable(label, parentSelectorContext)
            .eq(0)
            .should('be.enabled')
            .click({ force: true, multiple: true })
            .type(input, { force: true })
            .type('{enter}')
            .then(() => {
                this.getAuxDatePickerInput(label, parentSelectorContext).eq(0).should('be.visible').wait(2000);
            });
    }

    /**
    * select Date from calendar
    */
    selectDateFromCalendar(label: string, input: string[], parentSelectorContext?: string): void {
        buttonPage.getAuxButton("calendar", ButtonIdentifierType.ICON).should('be.visible').click({ force: true });
        const monthSelected = CypressCommonConstants.MonthCalendar.get(input[0]);
        selectValueFromAuxSelect(DatePickerPage.YEAR_SELECTOR, input[2]);
        selectValueFromAuxSelect(DatePickerPage.MONTH_SELECTOR, monthSelected);
        cy.get('.aux-calendar__table').get(`button[value=${input[1]}]`).click();
    }
    
    /**
     * select country from calendar settings
     */
    selectCountryCalendar(option: string): void {
        buttonPage.getAuxButton("calendar", ButtonIdentifierType.ICON).click({ force: true }).should('be.visible');
        buttonPage.getAuxButton("settings", ButtonIdentifierType.ICON).eq(1).click({ force: true }).should('be.visible');
        cy.get('.aux-select__container.aux-select__container-left-label').get('.aux-select__input-wrapper').get('.aux-select__icon.sc-aux-icon-h.sc-aux-icon-s.hydrated.aux-select__icon').eq(2).click();
        cy.get('.aux-select__dropdown-container.aux-overlay__source').get(`span[title=${option}]`).click({ force: true });
    }
}

export const datePickerPage = new DatePickerPage();