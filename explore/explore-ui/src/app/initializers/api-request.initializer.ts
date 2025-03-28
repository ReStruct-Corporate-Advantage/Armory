import {ApiRequestFactory} from '../factories/api-request.factory';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {
    ComputePortfolioAnalyticsRequest,
    ComputePortfolioPerformanceAttributionRequest,
    ComputePortfolioSummaryAnalyticsRequest,
    ComputePortfolioTimeSeriesAnalyticsRequest,
    ComputePortfolioFactorAnalyticsRequest
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/reporting/v1/portfolio_analytics_api_pb';

/**
 * Maps values in explore to the corresponding API enums
 */
export class ApiRequestInitializer {

    /**
     * Register which widgets can have API requests generated from them
     */
    static registerWidgetApiRequestTypes() {
        ApiRequestFactory.registerWidgetApiRequestType(WidgetConfigType.RISK_EXPOSURE, ComputePortfolioAnalyticsRequest);
        ApiRequestFactory.registerWidgetApiRequestType(WidgetConfigType.PGS, ComputePortfolioSummaryAnalyticsRequest);
        ApiRequestFactory.registerWidgetApiRequestType(WidgetConfigType.TIME_SERIES, ComputePortfolioTimeSeriesAnalyticsRequest);
        ApiRequestFactory.registerWidgetApiRequestType(WidgetConfigType.RETURNS, ComputePortfolioPerformanceAttributionRequest);
        ApiRequestFactory.registerWidgetApiRequestType(WidgetConfigType.PRA, ComputePortfolioFactorAnalyticsRequest);
    }
}
