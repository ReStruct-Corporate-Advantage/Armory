import {BatchReportConfig} from '@models/batch-reporting/batch-report-config.model';
import {BatchRowConfig} from '@models/batch-reporting/batch-row-config.model';
import {BatchExportingStore} from '../../stores';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {CoreDefinitionStore, TokenConstants} from '@blk/explore-ui-core';

/**
 * Class to represent a Batch Export
 */
export class BatchExportAction {
    batchReportConfig: BatchReportConfig; // Full Batch report object
    remainingActiveBatchRows: BatchRowConfig[] = []; // Collection of remaining active batch rows. When processing a batch export, we'll remove these one by one
    currentActiveBatchRow: BatchRowConfig; // The current batch row that is processing
    canceled: boolean; // Flag whether this Batch is canceled or not

    constructor(batchReportConfig: BatchReportConfig) {
        this.batchReportConfig = batchReportConfig;
        this.remainingActiveBatchRows = batchReportConfig.getActiveBatchRowConfigs();
    }

    /**
     * Takes the first BatchRowConfig in the remaining active batch rows and sets it as the current row
     */
    moveNextBatchRow(): void {
        if (this.canceled) {
            return;
        }
        const delay = CoreDefinitionStore.tokens[TokenConstants.EXPLORE_BATCH_DELAY]
            ? parseInt(CoreDefinitionStore.tokens[TokenConstants.EXPLORE_BATCH_DELAY], 10)
            : 0;
        setTimeout(() => {
            this.currentActiveBatchRow = this.remainingActiveBatchRows.shift();
            BatchExportingStore.currentBatchRow$.next(this.currentActiveBatchRow);
        }, delay);

    }

    /**
     * Removes Excel BatchRowConfigs from the remainingActiveBatchRows
     */
    splitExcelRowsForMergeInOneFileProcessing(): BatchRowConfig[] {
        const excelRows: BatchRowConfig[] = [];
        const pdfRows: BatchRowConfig[] = [];
        for (const batchRow of this.remainingActiveBatchRows) {
            if (batchRow.exportConfig instanceof ExcelExportConfig) {
                excelRows.push(batchRow);
            } else {
                pdfRows.push(batchRow);
            }
        }
        // Set the PDF rows as the remaining batch rows as they get processed in a separate manner
        this.remainingActiveBatchRows = pdfRows;
        return excelRows;
    }
}
