import {ReportActionType} from '@enums/report-action-type.enum';

/**
 * Interface for ReportReload Information
 */
export interface ReportAction {
    hardRefresh?: boolean;
    bypassBrowserCache?: boolean;
    reportAction: ReportActionType; // determines whether we want to reload the report or cancel the reload.
    debugContext?: boolean;
}
