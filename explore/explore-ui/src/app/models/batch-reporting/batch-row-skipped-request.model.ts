/**
 * Class that holds the widget/report/portfolio combo info of a skipped request within a batch
 */
export class BatchRowSkippedRequest {
    widget: string;
    report: string;
    portfolio: string;

    constructor(widget: string, report: string, portfolio: string) {
        this.widget = widget;
        this.report = report;
        this.portfolio = portfolio;
    }
}
