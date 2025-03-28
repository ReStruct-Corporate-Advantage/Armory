import type {} from 'cypress';
import {AuxComponents} from './ds.aux.enum';

class NumericStepperPage {

    /**
     * Get aux numeric stepper with label
     */
    private getAuxNumericStepper = (label: string): Cypress.Chainable<JQuery> => cy.get(AuxComponents.NUMERIC_STEPPER + `[label="${label}"]`);

    /**
     * Set input in numeric stepper
     */
    setInputInNumericStepper(label: string, input: string): void {
        const numericStepperInput = this.getAuxNumericStepper(label).shadow().find('input');
        numericStepperInput
            .click()
            .clear()
            .then(() => {
                numericStepperInput.should('have.value', '');
                numericStepperInput
                    .click()
                    .type(input)
                    .then(() => {
                        numericStepperInput.should('have.value', input);
                    });
            });
    }
}

export const numericStepperPage = new NumericStepperPage();
