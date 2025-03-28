import {Workspace} from '@models/workspace/workspace.model';
import {ExcelExportComposite} from '@interfaces/excel-export-composite.interface';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';

/**
 * Export Composite model for Workspace exports
 */
export class WorkspaceExportComposite extends ExportComposite implements ExcelExportComposite {
    workspace: Workspace;

    /**
     * Gets the workpads at workspace level from WorkspaceExportComposite
     */
    getWorkpads(): BaseWorkpad[] {
        return this.workspace.workpads;
    }
}
