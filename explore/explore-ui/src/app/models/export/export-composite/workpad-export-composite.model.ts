import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {ExcelExportComposite} from '@interfaces/excel-export-composite.interface';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';

/**
 * Composite Object that is passed to ExportService
 */
export class WorkpadExportComposite extends ExportComposite implements ExcelExportComposite {

    workpad: BaseWorkpad;

    /**
     * Gets the workpads at reportGroup level from WorkpadExportComposite
     */
    getWorkpads(): BaseWorkpad[] {
        return this.workpad ? [this.workpad] : [];
    }
}
