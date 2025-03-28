import {ExportComposite} from '@models/export/export-composite/export-composite.model';

/**
 * interface to check if export downloading is in progress or not
 */
export interface ExportDownloadingStatus {
    downloadInProgress: boolean;
    exportComposite: ExportComposite;
}
