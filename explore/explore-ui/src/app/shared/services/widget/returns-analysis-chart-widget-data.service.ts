/**
 * Service class for widget data related workflows
 */
import {ExploreResponse, ExploreResponseConfig} from '@interfaces/response.interface';
import {DataRequestConstants} from '../../../constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {AbstractChartsWidgetService} from '@services/widget/abstract-charts-widget.service';
import {Notification} from '@models/widget/notification.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {ReturnChartStyleSettingsModel} from '@models/widget/inputs/chart-settings/return-chart-style-settings.model';
import {CumulativeReturnColumnOption} from '@models/columns/column-options/cumulative-return-column-option.model';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {cloneDeep} from 'lodash';
import {ReturnsChartCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {
    ColumnConstants,
    ResponseData,
    ReturnsUtilityService,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType,
    AlertConstants,
    ErrorTypeConstants, UIErrorParameters, ChartWidgetInputConfigType, PerformanceConstants
} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {Injectable} from '@angular/core';
import {WorkspaceStore} from '@stores/workspace.store';
import {
    TimePeriodInterval,
    TimePeriodIntervalSettings
} from '@models/widget/inputs/chart-settings/time-period-interval-settings.model';

/**
 * Service to retrieve data for the Returns Analysis Chart widget
 */
@Injectable()
export class ReturnsAnalysisChartWidgetDataService extends AbstractChartsWidgetService {

    /**
     * Creates a new instance with the given parameter
     * @param http2BmsService a service to use to 'talk' to the backend serrver
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.RETURNS_TIMESERIES_DATA, exploreDataRequestService, [WidgetConfigType.RETURN_ANALYSIS_CHART], WidgetDataViewOption.HOLDINGS_VIEW);
    }

    /**
     * return identifierColumn for Return analysis Chart Widget
     */
    getIdentifierColumn() {
        return ColumnConstants.PORTFOLIO_NAME_IDENTIFIER_COLUMN;
    }

    /**
     * Creates a column with the given column tag, adds cumulative option to it and then adds the newly created
     * column to the given column set
     * @param columnSet a column set to add the newly created column to
     * @param columnTag a column tag to create the new column with
     * @param columnKey a column key to create the new column with, defaults to column tag if not given
     */
    private static createColumnWithCumulativeOptionAndAdd(columnSet: ColumnSet, columnTag: string, columnKey?: string): void {
        const column = columnSet.createColumnAndAdd(columnTag, columnKey);

        const cumulativeReturn = new CumulativeReturnColumnOption();
        column.optionValues.push(cumulativeReturn);
    }

    /**
     * See AbstractWidgetService.createRequestParams
     * Remove TimePeriod Column Option from the request for RA Widget
     */
    createRequestParams(report: Report, widget: Widget, portfolios: Portfolio[], widgetInputs: Map<string, WidgetInput>, isExportService?: boolean, omitData?: boolean): any {
        const requestParams = super.createRequestParams(report, widget, portfolios, widgetInputs, isExportService, omitData);
        // Keep the exposure mode so we can set it on the request later
        const exposureMode = requestParams[0][PerformanceConstants.EXPOSURE_MODE];
        ReturnsUtilityService.removeRedundantAttributionSettings(requestParams[0]);
        if (exposureMode) {
            requestParams[0][PerformanceConstants.EXPOSURE_MODE] = exposureMode;
        }
        return requestParams;
    }


    /**
     * Validates inputs
     * @see AbstractWidgetService.validateInputs
     */
    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        if (WorkspaceStore.getCurrentWorkpad()?.isCompareMode(report.comparisonConfigId)) {
            return Notification.createErrorNotification(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.RETURNS_CHART, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_VALIDATE_RETURN_ANALYSIS_ERROR);
        }

        return super.validateInputs(widget, portfolio, report);
    }

    /**
     * Adds columns to the given widget inputs
     * @see AbstractWidgetService.modifyWidgetInputsForRequest
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        const columnSet = new ColumnSet();

        // Add the date as the first column
        columnSet.createColumnAndAdd(ColumnConstants.DATE);

        // Get the settings and convert them to the columns
        const settings: ReturnChartStyleSettingsModel = widgetInputs.get(ChartWidgetInputConfigType.RETURN_CHART_STYLE_SETTINGS) as ReturnChartStyleSettingsModel;

        if (settings.showPortfolio) {
            columnSet.createColumnAndAdd(ColumnConstants.PORTFOLIO_TOTAL_RETURN);
        }
        if (settings.showBenchmark) {
            columnSet.createColumnAndAdd(ColumnConstants.BENCH_TOTAL_RETURN);
        }
        if (settings.showActive) {
            columnSet.createColumnAndAdd(ColumnConstants.ACTIVE_TOTAL_RETURN);
        }
        if (settings.showPortfolioCumulative) {
            ReturnsAnalysisChartWidgetDataService.createColumnWithCumulativeOptionAndAdd(columnSet, ColumnConstants.PORTFOLIO_TOTAL_RETURN, ColumnConstants.PORTFOLIO_TOTAL_RETURN_CUMULATIVE);
        }
        if (settings.showBenchmarkCumulative) {
            ReturnsAnalysisChartWidgetDataService.createColumnWithCumulativeOptionAndAdd(columnSet, ColumnConstants.BENCH_TOTAL_RETURN, ColumnConstants.BENCH_TOTAL_RETURN_CUMULATIVE);
        }
        if (settings.showActiveCumulative) {
            ReturnsAnalysisChartWidgetDataService.createColumnWithCumulativeOptionAndAdd(columnSet, ColumnConstants.ACTIVE_TOTAL_RETURN, ColumnConstants.ACTIVE_TOTAL_RETURN_CUMULATIVE);
        }

        // Add columns to the widget inputs
        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
    }

    /**
     * Processes given response so that it can be displayed in a chart widget
     * @see createDataCube
     */
    protected processResponse(widget: Widget, requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse, widgetPayload: WidgetPayload): void {
        super.processResponse(widget, requestAdapterConfig, this.getPlottableResponse(response), widgetPayload);
    }

    /**
     * converts returns response to time-series chart compatible response
     */
    private getPlottableResponse(response: ExploreResponse): ExploreResponse {
        const plottableResponse: ExploreResponseConfig & { data: ResponseData } = cloneDeep(response.data);
        plottableResponse.data.children.forEach(child => {
            child.title = child.data[0];
            child.data.shift();
        });
        delete plottableResponse.data.data;
        plottableResponse.columns.shift();
        return {data: plottableResponse};
    }

    /**
     * Responsible for widget specific configuration
     * e.g. table expanded state, soring model or chart specific axes
     */
    protected customVizConfig(widget: Widget, widgetInputs: Map<string, WidgetInput>): ReturnsChartCustomVizConfig {
        const returnsChartSettings = widgetInputs.get(ChartWidgetInputConfigType.RETURN_CHART_STYLE_SETTINGS) as ReturnChartStyleSettingsModel;
        const timePeriodIntervalSettings = widget.displayInputs.get(ChartWidgetInputConfigType.TIME_PERIOD_INTERVAL_SETTINGS) as TimePeriodIntervalSettings;
        return {
            ...this.getYAxisOverrideInputs(widgetInputs),
            dateFormat: returnsChartSettings.dateFormat,
            showBaseline: returnsChartSettings.showBaseline,
            showDataMarker: returnsChartSettings.showDataMarker,
            timePeriodInterval: timePeriodIntervalSettings?.timePeriodInterval || TimePeriodInterval.DAILY
        };
    }
}
