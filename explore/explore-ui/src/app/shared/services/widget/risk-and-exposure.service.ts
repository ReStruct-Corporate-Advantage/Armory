import {DataRequestConstants} from '../../../constants';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {createTreeCube, DataCubeContext} from '@utils/qbstr';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {ExploreResponse} from '@interfaces/response.interface';
import {
    AlertConstants, ColumnDefinition, CoreColumnUtils,
    ErrorTypeConstants,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {Injectable} from '@angular/core';
import {isNil} from 'lodash';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {Report} from '@models/workspace/report.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Notification} from '@models/widget/notification.model';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {ColumnSet, LibColumnUtils} from '@blk/explore-ui-column-option';
import {PortfolioCacheKey} from '@models/portfolio/portfolio-cache-key.model';
import {PortfolioStore} from '@stores/portfolio.store';
import {PortfolioOverrideInput} from '@models/widget/inputs/portfolio-override-input.model';
import {NotificationService} from '@services/notification';
import {CashflowDownloadSettings} from '@models/widget/inputs/cashflow-download-settings.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';

/**
 * Service to retrieve risk and exposure widget data
 */
@Injectable()
export class RiskAndExposureService extends AbstractWidgetService {

    /**
     * Creates a new instance with the given parameter
     * @param exploreDataRequestService a service to use to 'talk' to the backend server
     * @param notificationService notificationService to be used
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService, protected notificationService: NotificationService) {
        super(DataRequestConstants.DATA_REQUEST_URL.BASE, exploreDataRequestService, [WidgetConfigType.RISK_EXPOSURE], WidgetDataViewOption.HOLDINGS_VIEW, notificationService);
    }

    /**
     * Does nothing as it does not require any of the inputs modification.
     * @param widgetInputs Widget inputs to modify
     * @param widget The widget this request is being created for.
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        // Nothing to do
    }


    /**
     * Add Security Contribution widget specific fields to request
     */
    protected createWidgetRequestParams(widget: Widget, requestParams: any, portfolio: Portfolio, widgetInputs: Map<string, WidgetInput>, isExportRequest?: boolean, omitData?: boolean,
                                        isRisklessCashBucketEnabled?: boolean): any {
        const widgetRequestParams = super.createWidgetRequestParams(widget, requestParams, portfolio, widgetInputs, isExportRequest, omitData, isRisklessCashBucketEnabled);
        // check if we need to override benchmark and currency
        if (portfolio.portName !== widgetRequestParams.portfolio && (widget.dataStore.metaData.inputs.get(PortfolioOverrideInput.PORTFOLIO_OVERRIDE_INPUT) as PortfolioOverrideInput)?.updateBenchAndCurrency) {
            // check if cache contains requested portfolio details
            const requestedPortCacheKey: PortfolioCacheKey = new PortfolioCacheKey(widgetRequestParams.portfolio.toUpperCase(), portfolio.datePicker.date, false, true);
            const requestedPortInfoObject: any = PortfolioStore.getPortfolioInfoFromCache(requestedPortCacheKey);
            // if requested portfolio found in cache
            if (requestedPortInfoObject) {
                this.updateRequestParamsForBenchmark(widgetRequestParams, requestedPortInfoObject.data);
            }
        }
        const cashFlowDownloadSettings = widgetInputs.get(CashflowDownloadSettings.configType) as CashflowDownloadSettings;

        if (cashFlowDownloadSettings?.cashFlowDownload) {
            (widgetRequestParams[WidgetInputType.COLUMNS] as any[])
                ?.filter(col => cashFlowDownloadSettings.hiddenColumns.includes(col.columnTag))
                .forEach(col => {
                    col.visible = false;
                });
        }


        return widgetRequestParams;
    }

    /**
     * update the benchmark and currency info for requested portfolio
     * @param requestParams
     * @param requestedPortfolio
     * @protected
     */
    protected updateRequestParamsForBenchmark(requestParams: any, requestedPortfolio: any) {
        const portfolio = new Portfolio();
        portfolio.deserialize(requestedPortfolio);
        portfolio.updateBenchmarks();
        if (portfolio.benchmark) {
            requestParams.benchSelection = portfolio.benchmark.type;
            requestParams.benchOrder = portfolio.benchmark.order;
            requestParams.benchmark = portfolio.benchmark.name;
            requestParams.benchmarkFullName = portfolio.benchmark.portfolio ? portfolio.benchmark.portfolio.fullName : portfolio.benchmark.name;
        }
        requestParams.currency = portfolio.currency;
    }

    /**
     * For the R&E widget we want to leverage the TReeCube, so overriding how the tree is created.
     */
    protected createCube(requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse): DataCubeContext {
        return createTreeCube(requestAdapterConfig, response);
    }

    /**
     * Overridden noDataResponse method
     */
    protected noDataResponse(response: ExploreResponse): string {
        const errorMessage = super.noDataResponse(response);

        if (errorMessage) {
            return errorMessage;
        }

        const isDataPresent = this.determineIfDataPresent(response);

        if (!isDataPresent) {
            return isNil(response.message) ? 'No data is available for the selected date' : 'No data in the response, response.message =' + response.message;
        }
    }

    protected determineIfDataPresent(response: ExploreResponse): boolean {
        return (response.data.data ? (response.data.data.data.filter(item => !isNil(item)).length > 0)
            || (!isNil(response.data.data.children) && this.checkForValidSeriesResponse(response.data.data.children)) : false);
    }

    /**
     * check to find whether any children is having data
     */
    protected checkForValidSeriesResponse(children: any[]): boolean {
        let isDataPresent = false;
        for (const child of children) {
            isDataPresent = child.data?.filter(x => !isNil(x)).length > 0 || (!isNil(child.children) && this.checkForValidSeriesResponse(child.children));
            if (isDataPresent) {
                break;
            }
        }

        return isDataPresent;
    }

    /**
     * override of validateInputs method from parent class for risk & exposure widget
     */
    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        const notification: Notification = super.validateInputs(widget, portfolio, report);
        if (!!notification) {
            // return the notification, if we receive any, from the parent class
            return notification;
        }

        const breakdown: WidgetInput = widget.getCombinedInputs().get(CoreRiskConstants.CONFIG_TYPE.BREAKDOWN);
        if (breakdown instanceof Breakdown && breakdown.hasPortfolioNameColumn()) {
            // if we have portfolio name/full name column present in breakdown, then check if we have a style column present
            const columnSet: WidgetInput = [...widget.getCombinedInputs().values()].find(widgetInput => widgetInput instanceof ColumnSet);
            if (columnSet instanceof ColumnSet && columnSet.columns?.some(column => LibColumnUtils.isStyleColumn(column.columnTag))) {
                // return error notification if we do have a style column with portfolio name column in breakdown
                return Notification.createErrorNotification('Style columns are not supported with Portfolio Name breakdown');
            }
        }

        const isCreditVaRColumnsPresent = this.isCreditVaRColumnsPresent(widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet);

        if (portfolio.isCustomPortGroup() && isCreditVaRColumnsPresent) {
            return Notification.createErrorNotification(AlertConstants.NOTIFICATION.CUSTOM_PORTGROUP_NOT_SUPPORT.CREDIT_VAR, ErrorTypeConstants.UI_VALIDATION_ERROR);
        }
        if (portfolio instanceof WhatIfPortfolio && isCreditVaRColumnsPresent) {
            return Notification.createErrorNotification(AlertConstants.NOTIFICATION.WHAT_IF_PORTFOLIO_NOT_SUPPORTED.CREDIT_VAR, ErrorTypeConstants.UI_VALIDATION_ERROR);
        }

        return null;
    }

    private isCreditVaRColumnsPresent(columnSet: ColumnSet): boolean {
        if (!(columnSet?.columns)) {
            return false;
        }
        const colIdx = columnSet.columns.findIndex(column => {
            const colDef: ColumnDefinition = CoreColumnUtils.getColumnDefByTagAndUse(column.columnTag, column.positionColumnType);
            return colDef?.isCreditVaRColumn();
        });
        return colIdx !== -1;
    }
}
