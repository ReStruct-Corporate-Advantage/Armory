import {Injectable} from '@angular/core';
import {WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
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
import {cloneDeep, isEmpty} from 'lodash';
import {
    CommitmentHorizonSelectedTab
} from '@models/widget/inputs/commitment-risk/commitment-horizon-selected-tab.model';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {CommitmentRiskScenario} from '@models/widget/inputs/commitment-risk/commitment-risk-scenario.model';
import {DefinitionsStore} from '@stores/definitions.store';
import {Report} from '@models/workspace/report.model';
import {CommitmentRiskWidgetService} from '@services/widget/commitment-risk-widget.service';
import {Notification} from '@models/widget/notification.model';

/**
 * Service to retrieve data for the commitment risk chart widget
 */
@Injectable()
export class CommitmentRiskChartWidgetService extends AbstractChartsWidgetService {

    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.COMMITMENT_RISK_REQUEST, exploreDataRequestService, [WidgetConfigType.COMMITMENT_RISK_CHART], WidgetDataViewOption.NOT_APPLICABLE);
    }

    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget, isExportRequest?: boolean): void {
        // get the chart columns and clone because it may get modified
        const columns = cloneDeep(widgetInputs.get(WidgetInputType.COMMITMENT_RISK_CHART_COLUMNS)) as ColumnSet;

        // for commitment risk widget we have four charts and we send only one backend request for all four, in the request we have four different columns one column for each chart
        // to create time series data. But for exporting we would only require just one column data in exported file, so we remove all other columns that are not visible from export request.
        if (isExportRequest) {
            const selectedChartColTag = (widgetInputs.get(CommitmentHorizonSelectedTab.configType) as CommitmentHorizonSelectedTab)?.selectedTab;
            // remove all columns that are not selected.  if no tab is selected, default to first tab
            columns.columns = [columns.columns.find(column => column.columnTag === selectedChartColTag) || columns.columns[0]];
        }
        // set the columns input to chart columns and delete the chart/table specific columns (widgetInputs map is a copy so fine to delete)
        widgetInputs.set(WidgetInputType.COLUMNS, columns);
        widgetInputs.delete(WidgetInputType.COMMITMENT_RISK_TABLE_COLUMNS);
        widgetInputs.delete(WidgetInputType.COMMITMENT_RISK_CHART_COLUMNS);
    }

    /**
     * Validates inputs
     * @see AbstractWidgetService.validateInputs
     */
    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        return CommitmentRiskWidgetService.checkUnsupportedWorkflows(portfolio, report) || super.validateInputs(widget, portfolio, report);
    }

    protected createWidgetRequestParams(widget: Widget, requestParams: any, portfolio: Portfolio, widgetInputs: Map<string, WidgetInput>, isExportRequest?: boolean, omitData?: boolean,
                                        isRisklessCashBucketEnabled?: boolean): any {
        const params = super.createWidgetRequestParams(widget, requestParams, portfolio, widgetInputs, isExportRequest, omitData, isRisklessCashBucketEnabled);
        params.timeSeriesRequest = true;
        return params;
    }

    protected processResponse(widget: Widget, requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse, widgetPayload: WidgetPayload): void {
        const seriesData = response.data?.data?.children;
        widgetPayload.widgetSpecificData = this.getWidgetSpecificData(seriesData, widget);

        super.processResponse(widget, requestAdapterConfig, response, widgetPayload);
    }

    private getWidgetSpecificData(seriesData: any[], widget: Widget): any {
        if (!seriesData?.length) {
            return;
        }
        // get series title from the response
        const seriesTitles = [];
        for (const serie of seriesData[0].children) {
            seriesTitles.push(serie.title);
        }

        // pass the user-friendly name of the scenario applied to the chart in widgetSpecificData
        const scenario = (widget.getCombinedInputs().get(WidgetInputType.COMMITMENT_RISK_SCENARIO) as CommitmentRiskScenario)?.scenario;
        const scenarioName = scenario ? DefinitionsStore.commitmentRiskStressScenarios.find(s => s.value === scenario)?.text : undefined;

        return {
            seriesTitles,
            timeInterval: this.getTimeIntervalInMonth(seriesData[1].title, seriesData[0].title),
            scenario: scenarioName
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
