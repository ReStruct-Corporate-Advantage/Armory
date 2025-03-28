import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {BatchExportComposite} from '@models/export/export-composite/batch-export-composite.model';

/**
 * ExportComposite model that holds multiple BatchExportComposites
 * Used for merge in one file exports
 */
export class MultiRowBatchExportComposite extends ExportComposite {
    batchExportComposites: BatchExportComposite[];
}
