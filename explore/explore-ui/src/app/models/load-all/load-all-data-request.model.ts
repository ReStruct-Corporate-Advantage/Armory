import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {Widget} from '@models/widget/widget.model';

/**
 * Model representation of a Queued Request for Load All
 */
export class LoadAllDataRequest {
    portfolio: Portfolio;
    report: Report;
    widget: Widget;
    workpadPortfolios: Portfolio[];

    /**
     * Constructor
     */
    constructor(portfolio: Portfolio, report: Report, widget: Widget, workpadPortfolios?: Portfolio[]) {
        this.portfolio = portfolio;
        this.report = report;
        this.widget = widget;
        // We need portfolios from the workpad in case of multi-port comparison requests
        this.workpadPortfolios = workpadPortfolios;
    }
}
