import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {PDFExportAction} from '@models/export/pdf-export-action.model';
import {PDFPageLayout} from '@enums/export/pdf-page-layout.enum';
import {Widget} from '@models/widget/widget.model';
import {BatchExportComposite} from '@models/export/export-composite/batch-export-composite.model';
import {BatchExportingStore} from '../../stores';
import {BatchReportingTestUtils} from '@services/batch-reporting/batch-reporting.service.spec';
import {BatchExportAction} from '@models/batch-reporting/batch-export-action.model';

/**
 * Test class for PDFExportAction
 */
describe('Models/Export', () => {
    beforeAll(() => {
        BatchExportingStore.init();
    });

    describe('PDFExportAction tests', () => {

        /**
         * Tests exportSingleElementOnly method
         */
        it('exportSingleElementOnly test', () => {
            const exportComposite = new ExportComposite();
            exportComposite.exportConfig = new PDFExportConfig();

            const pdfExportAction = new PDFExportAction(exportComposite, null, '', '', '');
            // Should be true because the exportConfig layout is report as-is
            expect(pdfExportAction.exportSingleElementOnly()).toBeTruthy();

            (exportComposite.exportConfig as PDFExportConfig).layout = PDFPageLayout.W1X1;
            // Should be false because the exportConfig layout is not report as-is and there is no widget to export
            expect(pdfExportAction.exportSingleElementOnly()).toBeFalsy();

            exportComposite.widget = new Widget();
            // Should be true because the exportComposite has a widget to export (which means it must be export widget)
            expect(pdfExportAction.exportSingleElementOnly()).toBeTruthy();
        });

        describe('Test linkPDFExportAction', () => {

            it('Test linkPDFExportAction with no BatchExportComposite', () => {
                const exportComposite = new ExportComposite();
                exportComposite.exportConfig = new PDFExportConfig();

                const pdfExportAction = new PDFExportAction(exportComposite, null, '', '', '');
                pdfExportAction.linkPDFExportAction();
                expect(pdfExportAction.linkedPDFExportAction).toBeUndefined();
            });

            it('Test linkPDFExportAction with no currentPDFExportAction', () => {
                const exportComposite = new BatchExportComposite();
                exportComposite.exportConfig = new PDFExportConfig();

                const pdfExportAction = new PDFExportAction(exportComposite, null, '', '', '');
                BatchExportingStore.currentPDFExportAction$.next(null);
                pdfExportAction.linkPDFExportAction();
                expect(pdfExportAction.linkedPDFExportAction).toBeUndefined();
            });

            it('Test linkPDFExportAction with currentPDFExportAction', () => {
                const currentBatchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
                const currentExportComposite = new BatchExportComposite();
                currentExportComposite.batchRow = currentBatchRow;
                const dummyCurrentAction = new PDFExportAction(currentExportComposite, null, '', '', '');
                BatchExportingStore.currentPDFExportAction$.next(dummyCurrentAction);

                const exportComposite = new BatchExportComposite();
                exportComposite.batchRow = currentBatchRow;
                exportComposite.exportConfig = new PDFExportConfig();

                const pdfExportAction = new PDFExportAction(exportComposite, null, '', '', '');

                pdfExportAction.linkPDFExportAction();
                expect(pdfExportAction.linkedPDFExportAction).toBe(dummyCurrentAction);
            });

            it('Test linkPDFExportAction with Batch mergeInOneFile and no match', () => {
                const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
                batchReport.mergeInOneFile = true;
                const currentBatchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
                currentBatchRow.exportConfig = new PDFExportConfig();
                batchReport.batchRowConfigs.push(currentBatchRow);

                BatchExportingStore.currentBatchExportAction = new BatchExportAction(batchReport);

                const currentExportComposite = new BatchExportComposite();
                currentExportComposite.exportConfig = new PDFExportConfig();
                currentExportComposite.batchRow = currentBatchRow;
                const dummyCurrentAction = new PDFExportAction(currentExportComposite, {save: () => {}}, '', '', '');
                BatchExportingStore.currentPDFExportAction$.next(dummyCurrentAction);

                const exportComposite = new BatchExportComposite();
                // Create the exportComposite with a different BatchRowConfig
                exportComposite.batchRow = BatchReportingTestUtils.createDummyBatchRowConfig();

                const pdfExportAction = new PDFExportAction(exportComposite, null, '', '', '');

                pdfExportAction.linkPDFExportAction();
                expect(pdfExportAction.linkedPDFExportAction).toBeUndefined();
            });

            it('Test linkPDFExportAction with Batch mergeInOneFile', () => {
                const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
                batchReport.mergeInOneFile = true;
                const currentBatchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
                currentBatchRow.exportConfig = new PDFExportConfig();
                batchReport.batchRowConfigs.push(currentBatchRow);

                BatchExportingStore.currentBatchExportAction = new BatchExportAction(batchReport);

                const currentExportComposite = new BatchExportComposite();
                currentExportComposite.exportConfig = new PDFExportConfig();
                currentExportComposite.batchRow = currentBatchRow;
                const dummyCurrentAction = new PDFExportAction(currentExportComposite, null, '', '', '');
                BatchExportingStore.currentPDFExportAction$.next(dummyCurrentAction);

                const exportComposite = new BatchExportComposite();
                // Create the exportComposite with a different BatchRowConfig
                exportComposite.batchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
                exportComposite.batchRow.exportConfig = new PDFExportConfig();
                batchReport.batchRowConfigs.push(exportComposite.batchRow);

                const pdfExportAction = new PDFExportAction(exportComposite, null, '', '', '');

                pdfExportAction.linkPDFExportAction();
                expect(pdfExportAction.linkedPDFExportAction).toBe(dummyCurrentAction);
            });
        });

        describe('Test getPDFDoc', () => {
            it('Test getPDFDoc with no link', () => {
                const dummyDoc = {};
                const pdfExportAction = new PDFExportAction(null, dummyDoc, '', '', '');
                expect(pdfExportAction.getPDFDoc()).toBe(dummyDoc);
            });

            it('Test getPDFDoc with link', () => {
                const dummyDoc = {};
                const pdfExportAction = new PDFExportAction(null, null, '', '', '');
                pdfExportAction.linkedPDFExportAction = new PDFExportAction(null, dummyDoc, '', '', '');
                expect(pdfExportAction.getPDFDoc()).toBe(dummyDoc);
            });
        });

    });
});
