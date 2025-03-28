import {DataRequestConstants} from '../../../constants';
import {AbstractReturnWidgetService} from '@services/widget/abstract-return-widget.service';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {
    ReturnsUtilityService,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType,
    ColumnConstants,
} from '@blk/explore-ui-core';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {ExploreResponse} from '@interfaces/response.interface';
import {createTreeCube, DataCubeContext} from '@utils/qbstr';
import {Injectable} from '@angular/core';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Service to retrieve returns data
 */
@Injectable()
export class ReturnAnalysisService extends AbstractReturnWidgetService {

    /**
     * Creates a new instance with the given parameter
     * @param exploreDataRequestService a service to use to 'talk' to the backend server
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.RETURNS_DATA, exploreDataRequestService, [WidgetConfigType.RETURNS, WidgetConfigType.RETURNS_DRILLDOWN_TIME_SERIES, WidgetConfigType.RETURNS_DRILLDOWN_PERF_DETAIL]);
    }

    /**
     * return compareToRequestURl for Return analysis Widget
     */
    getMultiPortCompareUrl(): string {
        return DataRequestConstants.DATA_REQUEST_URL.RETURNS_MULTI_PORT_COMPARE;
    }

    /**
     * return identifier column for Return analysis widget
     */
    getIdentifierColumn() {
        return ColumnConstants.PNL_CUSIP_IDENTIFIER_COLUMN;
    }

    /**
     * See AbstractWidgetService.createRequestParams
     * Remove TimePeriod Column Option from the request for RA Widget
     */
    createRequestParams(report: Report, widget: Widget, portfolios: Portfolio[], widgetInputs: Map<string, WidgetInput>, isExportService?: boolean, omitData?: boolean): any {
        const requestParams = super.createRequestParams(report, widget, portfolios, widgetInputs, isExportService, omitData);
        // Remove TimePeriod Column Option from the request.
        ReturnsUtilityService.removeTimePeriodFromColumnOptions(requestParams);
        ReturnsUtilityService.removeRedundantAttributionSettingsFromColumnOptions(requestParams, (widget.getCombinedInputs().get(WidgetInputType.COLUMNS) as ColumnSet).columns);
        return requestParams;
    }

    /**
     * For the returns widget we want to leverage the TReeCube, so overriding how the tree is created.
     */
    protected createCube(requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse): DataCubeContext {
        return createTreeCube(requestAdapterConfig, response);
    }
}
