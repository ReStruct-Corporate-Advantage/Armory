import {BaseWorkpad} from '@models/workspace/base-workpad.model';

/**
 * Export Composite model for Workspace and reportGroup exports
 */
export interface ExcelExportComposite {

    /**
     * get all workpads
     */
    getWorkpads(): BaseWorkpad[];
}

export function isExcelExportComposite(object: any): object is ExcelExportComposite {
    return 'getWorkpads' in object;
}
