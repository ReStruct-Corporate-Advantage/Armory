import {ReportContextParameters} from '../report-context/report-context-parameters';
import {isObject} from 'lodash';

/**
 * TelemetryReportActionParameters captures different actions performed on a report
 * these actions are specified in actionType and include:
 * reload Widget, reload/cancel report, add widget, show footer and widget copy/paste
 */
export class TelemetryReportActionParameters {
    actionType: string;
    widgetTypes: string[];
    reportContext: ReportContextParameters;
    numberOfWidgets: number;
    isWhatIfPortfolio: boolean;


    /**
     * Constructor.
     */
    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize.
     */
    protected deserialize(data: any): void {
        // Get out of here if there is no data.
        if (!data) {
            return;
        }
        this.actionType = data.actionType;
        this.widgetTypes = data.widgetTypes;
        this.reportContext = new ReportContextParameters(data.reportTitle, data.reportId, data.reportOwner);
        this.numberOfWidgets = data.widgetTypes ? data.widgetTypes.length : 0;
        this.isWhatIfPortfolio = data.isWhatIfPortfolio;
    }
}
