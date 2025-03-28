import {
    AlertConstants,
    ChartWidgetInputConfigType,
    CoreDefinitionStore,
    ErrorTypeConstants,
    ResponseData,
    TokenConstants,
    UIErrorParameters,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {DataRequestConstants} from '@constants/data-request.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {ExploreResponse} from '@interfaces/response.interface';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Notification} from '@models/widget/notification.model';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {AbstractChartsWidgetService} from '@services/widget/abstract-charts-widget.service';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {TimeSeriesCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {every, isEmpty, isNil} from 'lodash';
import {CommonConstants} from '@constants/common.constants';
import {Injectable} from '@angular/core';
import {WorkspaceStore} from '@stores/workspace.store';
import {ExploreDataRequest} from '@models/requests/explore-data-request.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {ComboChartColumnSettings} from '@models/widget/inputs/chart-settings/combo-chart-column-settings.model';

/**
 * Service to retrieve data for the time series widget
 */
@Injectable()
export class TimeSeriesWidgetDataService extends AbstractChartsWidgetService {
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(
            DataRequestConstants.DATA_REQUEST_URL.TIMESERIES_BASE,
            exploreDataRequestService,
            [WidgetConfigType.TIME_SERIES],
            WidgetDataViewOption.SECTOR_VIEW
        );
    }

    /**
     * Creates the data request
     */
    public createFinalDataRequest(widget: Widget, portfolios: Portfolio[], report: Report, modifiedWidgetInputs: Map<string, WidgetInput>, isExportRequest?: boolean, omitData?: boolean): ExploreDataRequest {
        const request = super.createFinalDataRequest(widget, portfolios, report, modifiedWidgetInputs, isExportRequest, omitData);
        request.isTimeSeries = true;
        // Extract exposureDate from portfolio.datePicker.date
        const exposureDate = portfolios[0].datePicker.date;

        // Add exposureDate to all entries in requestParams
        request.requestParams.forEach((param: any) => {
            param.exposureDate = exposureDate;
        });
        return request;
    }

    /**
     * In a time series chart we are only interested in the first level of the breakdown, so grab it out and strip it.
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        let breakdown: Breakdown = AbstractWidgetService.getBreakdown(widgetInputs, WidgetInputType.BREAKDOWN_TREE);
        if (breakdown && !breakdown.isEmpty()) {
            breakdown = Breakdown.deepCloneAndOptionalStripToSpecifiedLevel(breakdown, 1);
            widgetInputs.set(WidgetInputType.BREAKDOWN_TREE, breakdown);
        } else {
            // If there is no breakdown then just remove it from the inputs.
            widgetInputs.delete(WidgetInputType.BREAKDOWN_TREE);
        }
    }

        /**
     * Validate the inputs for the time series chart to ensure that the request can be satisfied.
     */
    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        // If it's comparison, then we need to validate that all portfolios in the comparison are the same
        // This is to ensure the comparison makes sense in a time series context
        if (WorkspaceStore.getCurrentWorkpad()?.isCompareMode(report.comparisonConfigId)) {
            // Check for matching dates
            const comparisonConfig = WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.get(report.comparisonConfigId);
            let hasWhatIfPort = false;
            const datesMatch = every(comparisonConfig.portComparisonList, portId => {
                const port = WorkspaceStore.getCurrentWorkpad().getAllPortfolios().find(p => p.portId === portId);
                // NOTE: For relative dates, all portfolio dates get parsed prior to sending requests, so just checking datePicker.date is sufficient
                if (port instanceof WhatIfPortfolio) {
                    // We can also check for what-if portfolios
                    hasWhatIfPort = true;
                }
                return port.datePicker.date === portfolio.datePicker.date;
            });
            // What-if portfolios are not currently supported with time series comparison
            if (hasWhatIfPort) {
                return Notification.createErrorNotification(AlertConstants.NOTIFICATION.WHAT_IF_PORTFOLIO_NOT_SUPPORTED.TIME_SERIES_COMPARISON, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_VALIDATE_INPUTS_TIME_SERIES_ERROR);
            }
            if (!datesMatch) {
                return Notification.createErrorNotification(AlertConstants.NOTIFICATION.TIME_SERIES_COMPARISON_NON_MATCHING_DATES, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_VALIDATE_INPUTS_TIME_SERIES_ERROR);
            }

            // The total # used in a time series multi-port comparison request is just the total number of time periods
            const numberOfTimePeriods = (widget.dataStore.metaData.inputs.get(TimeSeriesSettings.INPUT_CONFIG_NAME) as TimeSeriesSettings)?.periods;

            // Get max # of time periods for time series comparison request. Default to 60
            const maxTimePeriods = CoreDefinitionStore.tokens[TokenConstants.EXPLORE_MAX_NUMBER_OF_TIME_SERIES_COMPARISON_DATA_POINTS]
                ? parseInt(CoreDefinitionStore.tokens[TokenConstants.EXPLORE_MAX_NUMBER_OF_TIME_SERIES_COMPARISON_DATA_POINTS], 10)
                : 60;
            if (numberOfTimePeriods > maxTimePeriods) {
                return Notification.createErrorNotification(AlertConstants.NOTIFICATION.TIME_SERIES_COMPARISON_EXCEEDS_MAX_NUMBER_OF_DATA_POINTS, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_VALIDATE_INPUTS_TIME_SERIES_ERROR);
            }
        }

        return super.validateInputs(widget, portfolio, report);
    }

    /**
     * This is overwritten by false for timeseries and return widgets for error message
     */
    supportsPointInTimePortfolio(): boolean {
        return false;
    }

    /**
     * Responsible for widget specific configuration
     * e.g. table expanded state, soring model or chart specific axes
     */
    protected customVizConfig(widget: Widget, widgetInputs: Map<string, WidgetInput>): TimeSeriesCustomVizConfig {
        const timeSeriesSettings = widgetInputs.get(TimeSeriesSettings.INPUT_CONFIG_NAME) as TimeSeriesSettings;
        const comboChartColSettings = widget.displayInputs.get(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS) as ComboChartColumnSettings;
        return {
            ...this.getYAxisOverrideInputs(widgetInputs),
            showGridLines: widget.displayInputs.get(CommonConstants.WIDGET_LEVEL_PROP_LIST[1]) ? (widget.displayInputs.get(CommonConstants.WIDGET_LEVEL_PROP_LIST[1]) as GridLines).showGridLines : false,
            showTotal: timeSeriesSettings && timeSeriesSettings.includeTotalValues,
            showBaseline: timeSeriesSettings && timeSeriesSettings.showBaseline,
            dateFormat: timeSeriesSettings.dateFormat,
            showDataMarker: timeSeriesSettings && timeSeriesSettings.showDataMarker,
            comboChartColumns: comboChartColSettings?.columns
        };
    }

    /**
     * Processes given response so that it can be displayed in a chart widget
     * @see createDataCube
     */
    protected processResponse(widget: Widget, requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse, widgetPayload: WidgetPayload): void {
        if (response.data?.data?.children) {
            // remove empty data points so that they don't plot on the chart
            response.data.data.children = this.removeEmptyDataPoints(response.data.data.children);
        }
        // If this is comparison mode for time series, then we need to check which sectors for each port series we need to render
        if (requestAdapterConfig.isCompareMode) {
            widgetPayload.widgetSpecificData = {sectorsToShowForPort: response.data['sectorsToShowForPort']};
        }
        super.processResponse(widget, requestAdapterConfig, response, widgetPayload);
    }

    /**
     * Remove empty data points as we don't want to plot them on the chart
     */
    private removeEmptyDataPoints(children: ResponseData[]) {
        const data = [];
        children.forEach((child: ResponseData) => {
            if (child.children || child.data.some(childData => !(isNil(childData) && childData !== 0))) {
                data.push(child);
            }
        });
        return data;
    }

    /**
     * overridden method from abstract chart service for time series charts
     */
    protected checkForEmptySeriesResponse(response: ExploreResponse): boolean {
        return response.data.data.children && response.data.data.children.every(item => item.data.length > 0 && item.data.every(x => isNil(x)) && isEmpty(item.children));
    }
}
