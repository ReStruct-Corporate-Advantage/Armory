/**
 * contains report related info captured while tracking events via telemetry
 */
export class ReportContextParameters {
    reportTitle: string;
    reportId: number|string;
    reportOwner: string;

    constructor(reportTitle?: string, reportId?: number|string, reportOwner?: string) {
        this.reportTitle = reportTitle;
        this.reportId = reportId;
        this.reportOwner = reportOwner;
    }
}
