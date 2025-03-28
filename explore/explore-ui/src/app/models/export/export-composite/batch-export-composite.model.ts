import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {BatchRowConfig} from '@models/batch-reporting/batch-row-config.model';

/**
 * Batch version of the ExportComposite
 */
export class BatchExportComposite extends ExportComposite {
    batchRow: BatchRowConfig;

    /**
     * Returns true if the passed BatchExportComposite shares the same BatchRowConfig and Portfolio
     */
    hasSameBatchRowConfigAndPortfolio(otherBatchExportComposite: BatchExportComposite): boolean {
        return this.batchRow === otherBatchExportComposite.batchRow && this.portfolio === otherBatchExportComposite.portfolio;
    }
}
