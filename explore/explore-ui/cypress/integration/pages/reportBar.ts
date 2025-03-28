import type {} from 'cypress';

class ReportBar {

    blankReportBtn = () => cy.contains('Blank Report', { timeout: 30000 });

}

export const reportBar = new ReportBar();
