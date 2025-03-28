import {BatchReportingTestUtils} from '@services/batch-reporting/batch-reporting.service.spec';
import {BatchExportAction} from '@models/batch-reporting/batch-export-action.model';
import {BatchExportingStore} from '../../stores';
import {BehaviorSubject} from 'rxjs';
import {BatchRowConfig} from '@models/batch-reporting/batch-row-config.model';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {fakeAsync, tick} from '@angular/core/testing';

/**
 * Test class for BatchExportAction
 */
describe('Models/Batch Reporting', () => {
    describe('BatchExportAction tests', () => {

        /**
         * Tests exportSingleElementOnly method
         */
        it('Test moveNextBatchRow', fakeAsync( () => {
            BatchExportingStore.currentBatchRow$ = new BehaviorSubject<BatchRowConfig>(undefined);
            const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
            batchReport.batchRowConfigs.push(BatchReportingTestUtils.createDummyBatchRowConfig());

            const batchExportAction = new BatchExportAction(batchReport);

            expect(batchExportAction.remainingActiveBatchRows.length).toEqual(2);
            expect(batchExportAction.currentActiveBatchRow).toBeUndefined();

            batchExportAction.moveNextBatchRow();
            tick();
            expect(batchExportAction.remainingActiveBatchRows.length).toEqual(1);
            expect(batchExportAction.currentActiveBatchRow).toBe(batchReport.batchRowConfigs[0]);
            expect(BatchExportingStore.getCurrentBatchRow()).toBe(batchReport.batchRowConfigs[0]);
        }));

        it('Tests moveNextBatchRow with cancel', () => {
            const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
            batchReport.batchRowConfigs.push(BatchReportingTestUtils.createDummyBatchRowConfig());
            const batchExportAction = new BatchExportAction(batchReport);
            batchExportAction.canceled = true;
            jest.spyOn(batchExportAction.remainingActiveBatchRows, 'shift');
            jest.spyOn(BatchExportingStore.currentBatchRow$, 'next');

            batchExportAction.moveNextBatchRow();
            expect(batchExportAction.remainingActiveBatchRows.shift).not.toHaveBeenCalled();
            expect(BatchExportingStore.currentBatchRow$.next).not.toHaveBeenCalled();
        });

        it('Test splitExcelRowsForMergeInOneFileProcessing', () => {
            const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
            batchReport.batchRowConfigs.push(BatchReportingTestUtils.createDummyBatchRowConfig());
            const pdfBatchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
            pdfBatchRow.exportConfig = new PDFExportConfig();
            batchReport.batchRowConfigs.push(pdfBatchRow);
            const batchExportAction = new BatchExportAction(batchReport);

            const excelRows = batchExportAction.splitExcelRowsForMergeInOneFileProcessing();
            expect(excelRows.length).toEqual(2);
        });
    });
});
