import {Injectable} from '@angular/core';
import {AlertConstants, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {DataRequestConstants} from '@constants/data-request.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {ColumnSet} from '@blk/explore-ui-column-option';
import legacyStatsColumns from '@assets/widget-configs/commitment-risk-stats-columns-legacy.json';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {Notification} from '@models/widget/notification.model';
import {NotificationConstants} from '@constants/notification.constants';

/**
 * Service to retrieve data for the commitment risk widget
 */
@Injectable()
export class CommitmentRiskWidgetLegacyService extends AbstractWidgetService {

    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.COMMITMENT_RISK_REQUEST, exploreDataRequestService, [WidgetConfigType.COMMITMENT_RISK_LEGACY], WidgetDataViewOption.NOT_APPLICABLE);
    }

    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        const columnSet = new ColumnSet(legacyStatsColumns);
        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
        widgetInputs.delete(WidgetInputType.BREAKDOWN_TREE);
    }

    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        const notification = super.validateInputs(widget, portfolio, report);
        if (notification) {
            return notification;
        }
        if (!widget.getCombinedInputs().get(WidgetInputType.FUND_CUSIP)) {
            return new Notification(`${NotificationConstants.PRIVATE_FUND_SELECTION_ERROR_MSG} ${AlertConstants.NOTIFICATION_STYLE.ERROR}`, NotificationConstants.PRIVATE_FUND_SELECTION_ERROR_MSG, AlertConstants.NOTIFICATION_STYLE.ERROR);
        }
        return null;
    }

    protected createWidgetRequestParams(widget: Widget, requestParams: any, portfolio: Portfolio, widgetInputs: Map<string, WidgetInput>, isExportRequest?: boolean, omitData?: boolean,
                                        isRisklessCashBucketEnabled?: boolean): any {
        const params = super.createWidgetRequestParams(widget, requestParams, portfolio, widgetInputs, isExportRequest, omitData, isRisklessCashBucketEnabled);
        // add legacy flag to distinguish from ACRM 2.0 in UI cache
        params.isLegacyRequest = true;
        return params;
    }
}
