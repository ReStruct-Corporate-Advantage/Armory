import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {PDFPageLayout} from '@enums/export/pdf-page-layout.enum';
import {BatchExportingStore} from '../../stores';
import {BatchExportComposite} from '@models/export/export-composite/batch-export-composite.model';

/**
 * Class to represent a PDF export
 */
export class PDFExportAction {
    exportComposite: ExportComposite; // ExportComposite model associated with this PDF export action
    pdfDoc: any; // jsPDF document
    headerText: string; // Text to print on the header of the PDF
    footerText: string; // Text to print on the footer of the PDF

    exportableElements: Element[] = []; // Collection of exportable HTML elements
    fileName: string; // File name for the pdf to be saved as

    linkedPDFExportAction: PDFExportAction;

    constructor(exportComposite: ExportComposite, pdfDoc: any, headerText: string, footerText: string, fileName: string) {
        this.exportComposite = exportComposite;
        this.pdfDoc = pdfDoc;
        this.headerText = headerText;
        this.footerText = footerText;
        this.fileName = fileName;
    }

    /**
     * Saves the pdf file with the file name
     */
    savePDF(logSave: boolean): void {
        this.getPDFDoc().save(this.fileName);
        if (logSave) {
            console.log('Saving PDF -', this.fileName);
        }
    }

    /**
     * Returns true if the PDF export is for a single element only
     * Single element would be report as-is or a single widget (from widget export)
     * If it's a report export that only has a single widget in it, that does NOT apply
     */
    exportSingleElementOnly(): boolean {
        return (this.exportComposite.exportConfig as PDFExportConfig).layout === PDFPageLayout.REPORT_AS_IS || !!this.exportComposite.widget;
    }

    linkPDFExportAction(logSave: boolean): void {
        const currentPDFExportAction = BatchExportingStore.getCurrentPDFExportAction();
        if (!(this.exportComposite instanceof BatchExportComposite) || !currentPDFExportAction) {
            return;
        }
        // If the exportComposite shares the same batchRow AND portfolio as the current PDFExportAction OR this is a merge in one file request
        // Link the PDFExportActions together so that we can pass along the pdfDoc
        if (currentPDFExportAction.exportComposite instanceof BatchExportComposite && (this.exportComposite.hasSameBatchRowConfigAndPortfolio(currentPDFExportAction.exportComposite) || (BatchExportingStore.currentBatchExportAction.batchReportConfig.mergeInOneFile && BatchExportingStore.currentBatchExportAction.batchReportConfig.getActivePDFBatchRowConfigs().indexOf(this.exportComposite.batchRow) > -1))) {
            this.linkedPDFExportAction = currentPDFExportAction;
        } else {
            // If there's no linkage needed, then the previous PDFExportAction (which at this point is still the "current") is done and we can save the pdf
            currentPDFExportAction.savePDF(logSave);
        }
    }

    getPDFDoc(): any {
        return this.linkedPDFExportAction ? this.linkedPDFExportAction.getPDFDoc() : this.pdfDoc;
    }
}
