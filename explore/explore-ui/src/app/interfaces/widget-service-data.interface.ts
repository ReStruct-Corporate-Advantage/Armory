import {ExploreResponse} from '@interfaces/response.interface';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {Widget} from '@models/widget/widget.model';

/**
 * @param widget a widget that needs the data
 * @param portfolio a portfolio to request the data for
 * @param report a report that the widget is part of
 * @param allPortfolios will have list of all portfolios in the workpad being processed
 * @param omitData - flag to omit data
 * @param isBatchExport - flag if this request is for a batch export
 * @param hardRefresh - Indicates if the cache should be bypassed for this request.
 * @param bypassBrowserCache - Indicates if the browser cache should be bypassed for this request.
 * @param debugContext  - flag to enable debug context
 * @param customizeResponse - function to customize the response
 */
export interface WidgetServiceData {
    widget: Widget;
    portfolio: Portfolio;
    report: Report;
    allPortfolios?: Portfolio[];
    omitData?: boolean;
    isBatchExport?: boolean;
    hardRefresh?: boolean;
    bypassBrowserCache?: boolean;
    debugContext?: boolean;
    customizeResponse?: (response: ExploreResponse) => ExploreResponse;
}
