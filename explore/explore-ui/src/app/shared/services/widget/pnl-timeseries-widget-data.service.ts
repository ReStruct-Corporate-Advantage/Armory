import {Injectable} from '@angular/core';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {DataRequestConstants} from '@constants/data-request.constants';
import {AlertConstants, ErrorTypeConstants, WidgetConfigType, WidgetInput} from '@blk/explore-ui-core';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {Widget} from '@models/widget/widget.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {Notification} from '@models/widget/notification.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {ExploreResponse} from '@interfaces/response.interface';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';

@Injectable()
export class PnlTimeseriesWidgetDataService extends AbstractWidgetService {
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.PNL_TS_DATA, exploreDataRequestService, [WidgetConfigType.PNL_TS, WidgetConfigType.MCVAR_PNL_TS], WidgetDataViewOption.HOLDINGS_VIEW);
    }

    protected modifyWidgetInputsForRequest(_widgetInputs: Map<string, WidgetInput>, _widget: Widget, _isExportRequest?: boolean): void {
        // Do nothing
    }

    getStaticWidgetRequestParams(): any {
        const staticWidgetReqParams = super.getStaticWidgetRequestParams();
        staticWidgetReqParams.isPortGroupSummaryRequest = 'Y';
        return staticWidgetReqParams;
    }

    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        let notification = super.validateInputs(widget, portfolio, report);
        if (!notification) {
            const comparisonConfigId = report.comparisonConfigId;
            if (WorkspaceStore.getCurrentWorkpad()?.isCompareMode(comparisonConfigId)) { // Comparison mode is not supported for PGS chart widgets
                notification = Notification.createWarningNotification(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.PNL_TS, ErrorTypeConstants.UI_VALIDATION_ERROR);
            }
        }
        return notification;
    }

    /**
     * Processes the given response and assigns the processed data to the attributes in the given widget payload
     *
     * @param widget a widget on whose behalf the request to the backend server was made
     * @param requestAdapterConfig some parts of the request that are required in order to process the response
     * @param response a response to process
     * @param widgetPayload a payload to be used to render the data in the widget
     * @param _forDate string
     */
    protected processResponse(widget: Widget, requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse, widgetPayload: WidgetPayload, _forDate?: string): void {
        const fundCusip = widget.dataStore.metaData.inputs.get(FundCusip.configType) as FundCusip;
        if (fundCusip) {
            // this widget was added from Risk and Exposure widget, so we need to set the portfolio to the fund cusip to show in total row
            requestAdapterConfig.portfolio = fundCusip.cusip;
        }
        const {cube, breakdownLevels} = this.createCube(requestAdapterConfig, response);
        widgetPayload.cube = cube;
        widgetPayload.breakdownLevels = breakdownLevels;
    }
}
