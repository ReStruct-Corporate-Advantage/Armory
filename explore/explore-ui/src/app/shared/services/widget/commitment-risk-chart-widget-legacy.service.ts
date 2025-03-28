import {Injectable} from '@angular/core';
import {AlertConstants, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {DataRequestConstants} from '@constants/data-request.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {ExploreResponse} from '@interfaces/response.interface';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import moment from 'moment';
import {AbstractChartsWidgetService} from './abstract-charts-widget.service';
import {Report} from '@models/workspace/report.model';
import {Notification} from '@models/widget/notification.model';
import {NotificationConstants} from '@constants/notification.constants';
import {cloneDeep, isEmpty, remove} from 'lodash';
import {
    CommitmentHorizonSelectedTab
} from '@models/widget/inputs/commitment-risk/commitment-horizon-selected-tab.model';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Service to retrieve data for the commitment risk chart widget
 */
@Injectable()
export class CommitmentRiskChartWidgetLegacyService extends AbstractChartsWidgetService {

    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.COMMITMENT_RISK_REQUEST, exploreDataRequestService, [WidgetConfigType.COMMITMENT_RISK_CHART_LEGACY], WidgetDataViewOption.NOT_APPLICABLE);
    }

    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget, isExportRequest?: boolean): void {
        // for commitment risk widget we have four charts and we send only one backend request for all four, in the request we have four different columns one column for each chart
        // to create time series data. But for exporting we would only require just one column data in exported file, so we remove all other columns that are not visible from export request.
        if (isExportRequest) {
            const columnTagVisible = widgetInputs.has(CommitmentHorizonSelectedTab.configType) ? (widgetInputs.get(CommitmentHorizonSelectedTab.configType) as CommitmentHorizonSelectedTab).selectedTab : 'market_val';
            // we are cloning it because we require column det modified just for the request, the original columnset for widget should remain intact.
            const columnSet = cloneDeep(widgetInputs.get(WidgetInputType.COLUMNS)) as ColumnSet;
            remove(columnSet.columns, column => {
                return column.columnTag !== columnTagVisible;
            });
            widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
        }
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
        params.timeSeriesRequest = true;
        // add legacy flag to distinguish from ACRM 2.0 in UI cache
        params.isLegacyRequest = true;
        return params;
    }

    protected processResponse(widget: Widget, requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse, widgetPayload: WidgetPayload): void {
        const seriesData = response.data?.data?.children;
        widgetPayload.widgetSpecificData = this.getWidgetSpecificData(seriesData);

        super.processResponse(widget, requestAdapterConfig, response, widgetPayload);
    }

    private getWidgetSpecificData(seriesData: any[]): any {
        if (!seriesData?.length) {
            return;
        }
        // get series title from the response
        const seriesTitles = [];
        for (const serie of seriesData[0].children) {
            seriesTitles.push(serie.title);
        }

        return {
            seriesTitles,
            timeInterval: this.getTimeIntervalInMonth(seriesData[1].title, seriesData[0].title)
        };
    }

    private getTimeIntervalInMonth(date1: string, date2: string): number {
        return moment(new Date(date1)).diff(moment(new Date(date2)), 'months');
    }

    /**
     * overridden method from abstract chart service for time series charts
     */
    protected checkForEmptySeriesResponse(response: ExploreResponse): boolean {
        return response.data.data.children && response.data.data.children.every(item => item.data.length > 0 && isEmpty(item.children));
    }
}
