import {AbstractWidgetService} from './abstract-widget.service';
import {DataRequestConstants} from '../../../constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ExploreResponse} from '@interfaces/response.interface';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {WidgetUtils} from '@utils/widget.utils';
import {isEmpty, isNil} from 'lodash';
import {ColumnConfig, ColumnConstants, CommonUtils, UseType, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {Injectable} from '@angular/core';
import {DataCubeContext} from '@utils/qbstr';
import {Notification} from '@models/widget/notification.model';
import {NotificationService} from '@services/notification';

@Injectable()
export class PortGroupSummaryService extends AbstractWidgetService {
    static readonly PORTFOLIO_COLUMN = 'portfolio';
    /**
     * Creates a new instance with the given parameter
     * @param exploreDataRequestService a service to use to "talk" to the backend server
     * @param notificationService
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService, protected notificationService: NotificationService) {
        super(DataRequestConstants.DATA_REQUEST_URL.BASE, exploreDataRequestService, [WidgetConfigType.PGS], WidgetDataViewOption.NOT_APPLICABLE, notificationService);
    }

    /**
     * return identifierColumn for PGS Widget
     */
    getIdentifierColumn() {
        return ColumnConstants.PORTFOLIO_NAME_IDENTIFIER_COLUMN;
    }

    /**
     * See AbstractWidgetService.getStaticWidgetRequestParams
     */
    getStaticWidgetRequestParams(): any {
        const staticWidgetReqParams = super.getStaticWidgetRequestParams();
        staticWidgetReqParams.isPortGroupSummaryRequest = 'Y';
        return staticWidgetReqParams;
    }

    /**
     * See AbstractWidgetService.createRequestParams
     * Adds portfolio level performance settings for PGS widget
     */
    createRequestParams(report: Report, widget: Widget, portfolios: Portfolio[], widgetInputs: Map<string, WidgetInput>, isExportRequest?: boolean, omitData?: boolean): any {
        const requestParams = super.createRequestParams(report, widget, portfolios, widgetInputs, isExportRequest, omitData);
        portfolios.forEach((port: Portfolio, index: number) => {
            port.performanceSettings.addPortfolioPerformanceSettingsToPGSRequest(requestParams[index]);
        });

        return requestParams;
    }

    /**
     * Does nothing as it does not require any of the inputs modification.
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        // For the PGS widget we want to make sure there is a Portfolio Name column first.
        const originalColumns = widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        if (!originalColumns) {
            return;
        }

        // If there are no columns or the first column is not a portfolio name column then add it in.
        if (originalColumns.columns.length === 0 || originalColumns.columns[0].columnTag !== PortGroupSummaryService.PORTFOLIO_COLUMN) {
            const newColumns = new ColumnSet();
            newColumns.columns.push(ColumnConfig.createColumn(PortGroupSummaryService.PORTFOLIO_COLUMN, UseType.ALL, PortGroupSummaryService.PORTFOLIO_COLUMN + '_' + CommonUtils.generateUniqueIdAsString()));
            originalColumns.columns.forEach(col => newColumns.columns.push(col));
            widgetInputs.set(WidgetInputType.COLUMNS, newColumns);
        }
    }

    /**
     * adds a hidden port column if we ONLY have portfolio column with long name options enabled
     * @param requestColumns
     */
    private shouldAddHiddenPortColumnToPGS(requestColumns: WidgetInput[]): boolean {

        // get all port name columns
        const portNameCols: WidgetInput[] = requestColumns
            .filter(col => col?.['columnTag'] === PortGroupSummaryService.PORTFOLIO_COLUMN);

        // get all port name columns with short name
        // can have both flags set to true OR can have no option values (implicit case)
        const portNameColsWithShortName = portNameCols.filter(portNameCol => !portNameCol['optionValues'] ||
            (portNameCol['optionValues']['showShortNameForPortfolio'] && portNameCol['optionValues']['showShortNameForPortGroup']));

        // add hidden portfolio column if there are no columns with short name
        // NOTE: this is to cater for spritelet R&E widgets if we do not have a portfolio column with short name options
        return isEmpty(portNameColsWithShortName);
    }

    /**
     * Validate the inputs for the bar chart to ensure that the request can be satisfied.
     */
    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        return WidgetUtils.validatePgsChartWidget(super.validateInputs(widget, portfolio, report), widget, portfolio.title, portfolio.fullName, report.comparisonConfigId);
    }

    createRequestConfig(widgetInputs: Map<string, WidgetInput>, widget: Widget, response: ExploreResponse, request: any, isCompareMode: boolean): RequestAdapterConfig {
        return {
            columns: WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widgetInputs, widget.displayInputs, widget.configType, response, response.data.columnHeaderDetails),
            splitColumns: WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widgetInputs, widget.displayInputs, widget.configType, response, response.data.columnHeaderDetails, response.data.columns, response.data.splitColumnKeys),
            columnFilters: WidgetUtils.assembleDefaultFilterValues(widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet, response.data.columns),
            portfolio: this.getPortfolioName(request, isCompareMode, !!response.data?.data?.children),
            isCompareMode,
            widgetConfig: widget.configType
        };
    }

    getPortfolioName(request: any, isCompareMode: boolean, isPortGroup?: boolean) {
        if (isCompareMode || request.portfolio.indexOf(',') !== -1) {
            return super.getPortfolioName(request, isCompareMode);
        }
        const portfolioColumn = request.columns.find(col => col.columnTag === PortGroupSummaryService.PORTFOLIO_COLUMN);

        if (portfolioColumn?.optionValues) {
            if (isPortGroup) {
                return (portfolioColumn.optionValues.showShortNameForPortGroup) ? request.portfolio : request.fullPortfolioName;
            }
            return (portfolioColumn.optionValues.showShortNameForPortfolio || !request.fullPortfolioName) ? request.portfolio : request.fullPortfolioName;
        }
        return (!isNil(request.portfolioIdentifier) ? request.portfolioIdentifier : request.portfolio);
    }

    /**
     * Responsible for widget specific configuration
     * e.g. table expanded state, soring model or chart specific axes
     */
    protected customVizConfig(widget: Widget, widgetInputs: Map<string, WidgetInput>, portfolio?: string): any {
        return super.customVizConfig(widget, widgetInputs, portfolio);
    }

    /**
     * Function to create the data cube for this widget.
     * Added to prevent AG-GRID autoSizeColumns from auto sizing the first column.
     */
    protected createCube(requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse): DataCubeContext {
        // blank out the portfolio name in the first row/cell.
        response.data.data.data[0] = '';
        return super.createCube(requestAdapterConfig, response);
    }

    /**
     * Overridden method from Abstract widget service.
     * Here we are allowing the column with duplicate tag to be added if it's hidden portfolio column
     *
     * @param requestColumns
     * @param hiddenColumn
     * @protected
     */
    protected shouldAddHiddenColumnToRequestColumns(requestColumns: WidgetInput[], hiddenColumn: ColumnConfig): boolean {
        if (hiddenColumn.columnKey === ColumnConstants.PORTFOLIO_HIDDEN) {
            return this.shouldAddHiddenPortColumnToPGS(requestColumns);
        }

        return super.shouldAddHiddenColumnToRequestColumns(requestColumns, hiddenColumn);
    }
}
