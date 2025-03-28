import type {} from 'cypress';
import { buttonPage, ButtonIdentifierType } from './aux-components/button.page';

class NewReportModal {

    static readonly NEW_REPORT_MODAL = 'aux-modal[header="Add Report"]';

    reportNameInput = () => cy.get(NewReportModal.NEW_REPORT_MODAL).find('aux-text-input');

    enterReportName(reportName: string) {
        this.reportNameInput().should('be.visible').should('be.enabled').click().type(reportName, {force: true});
    }

    //Press next button to generate blank report and add widgets 
    generateReport() {
        buttonPage.clickAuxButton('Next', ButtonIdentifierType.LABEL, null, true);
    }

    newReportModalComponent = () => cy.get(NewReportModal.NEW_REPORT_MODAL);

}

export const newReportModal = new NewReportModal();