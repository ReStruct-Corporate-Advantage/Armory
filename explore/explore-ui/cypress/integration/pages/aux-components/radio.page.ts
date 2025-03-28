import type {} from 'cypress';
import {AuxComponents} from './ds.aux.enum';
import {CorePageUtils} from '../core-page.utils';

class RadioPage {
    /**
     * Get aux radio with label
     */
    getAuxRadio = (label: string, parentSelectorContext?: string): Cypress.Chainable<JQuery> => {
        const auxRadiotSelector = AuxComponents.RADIO + `[label="${label}"]`;
        return CorePageUtils.getElement(auxRadiotSelector, parentSelectorContext);
    };

    private getAuxRadioClickable = (label: string, parentSelectorContext?: string): Cypress.Chainable<JQuery> =>
        this.getAuxRadio(label, parentSelectorContext).contains(label);

    /**
     * Click aux radio with label
     */
    clickAuxRadio(label: string, parentSelectorContext?: string): void {
        this.getAuxRadioClickable(label, parentSelectorContext)
            .click()
            .then(() => {
                this.getAuxRadio(label).should('be.visible').should('have.attr', 'is-checked');
            });
    }
}

export const radioPage = new RadioPage();
