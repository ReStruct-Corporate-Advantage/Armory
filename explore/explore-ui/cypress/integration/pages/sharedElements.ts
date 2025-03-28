import type {} from 'cypress';

class SharedElements {

    static readonly AUX_PROGRESS_INDICATOR_TYPE_LOADING = 'aux-progress-indicator[type="loading"]';

    closeNotificationBtn = () => cy.get('div.notification-container').find('aux-icon');

    loadingSpinner = () => cy.get(SharedElements.AUX_PROGRESS_INDICATOR_TYPE_LOADING, {timeout: 20000});
}

export const AUX_SELECT_FILTER_SIMPLE = 'filter-simple';
export const REGULAR_INTERVAL = 60000;

export const selectValueFromAuxSelect = (selector, value, type?): void => {
    // It caters for multiple and Simples
    cy.wait(500);
    cy.get(selector, { timeout: REGULAR_INTERVAL }).last().scrollIntoView().find('input').first().click({ force: true });
    if (type === AUX_SELECT_FILTER_SIMPLE) {
        cy.get(selector).find('input').first().should('not.be.disabled').type(value, { force: true });
    }
    if (value === 'Select none') {
        cy.get(`span[title="${value}"]`).last().should('be.visible');
        cy.get(`span[title="${value}"]`).last().click({ force: true });
    } else {
        cy.get(`[data-aux-display-value="${value}"]`, { timeout: REGULAR_INTERVAL })
            .last()
            .scrollIntoView()
            .should('be.visible');
        cy.get(`[data-aux-display-value="${value}"]`, { timeout: REGULAR_INTERVAL }).last().click({ force: true });
    }
};

export const auxButton = (selector, parentSelector?) => {
    if (parentSelector) {
        cy.get(parentSelector, { timeout: REGULAR_INTERVAL })
            .find(selector, { timeout: REGULAR_INTERVAL })
            .should('be.visible');
        cy.get(parentSelector).find(selector).find('button').last().click({ force: true });
    } else {
        cy.get(selector, { timeout: REGULAR_INTERVAL }).should('be.visible');
        cy.get(selector).find('button').first().click({ force: true });
    }
};

export const auxTypeahead = (selector: string, value: string, option: string) => {
    cy.get(selector, { timeout: cy.regularInterval }).find('input').should('be.visible');
    cy.get(selector, { timeout: cy.regularInterval }).find('input').clear({ force: true });
    cy.get(selector, { timeout: cy.regularInterval }).find('input').type(value, { force: true });
    cy.wait(2000);
    cy.get('body', { timeout: cy.extraLongInterval }).find(`div[title="${option}"]`).click({ force: true });
};

export const auxRadio = (selector: string, value: string) => {
    cy.get(selector, { timeout: cy.regularInterval })
        .find(`aux-radio[label="${value}"]`, { timeout: cy.regularInterval })
        .find('div[data-test="aux-radio"]', { timeout: cy.regularInterval })
        .find('label', { timeout: cy.regularInterval })
        .click({ force: true })
        .wait(SHORT_INTERVAL);
};

export const auxText = (selector, value, parentSelector?) => {
    if (parentSelector) {
        cy.get(parentSelector, { timeout: REGULAR_INTERVAL })
            .find(selector, { timeout: REGULAR_INTERVAL })
            .find('input')
            .should('be.visible')
            .should('not.be.disabled')
            .clear({ force: true });
        cy.get(parentSelector, { timeout: REGULAR_INTERVAL })
            .find(selector, { timeout: REGULAR_INTERVAL })
            .find('input')
            .type(value, { force: true })
            .should('have.value', value);
    } else {
        cy.get(selector, { timeout: REGULAR_INTERVAL })
            .find('input')
            .should('be.visible')
            .should('not.be.disabled')
            .clear({ force: true });
        cy.get(selector, { timeout: REGULAR_INTERVAL })
            .find('input')
            .type(value, { force: true })
            .should('have.value', value);
    }
};

export const auxCheckBox = (selector, select) => {
    cy.get(selector, { timeout: REGULAR_INTERVAL }).should('be.visible').should('not.be.selected');
    if (select) {
        cy.get(selector).find('[type="checkbox"]').check();
    } else {
        cy.get(selector).find('[type="checkbox"]').uncheck();
    }
};

export const getSelectedValueInAuxSelect=(selector) => {
    return cy.get(selector)
        .find('input.aux-select__input').invoke('attr', 'title');
}

export const sharedElements = new SharedElements();
