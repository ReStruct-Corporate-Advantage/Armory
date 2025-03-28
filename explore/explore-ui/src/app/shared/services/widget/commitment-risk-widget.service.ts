import {Injectable} from '@angular/core';
import {
    AlertConstants,
    ColumnConfig,
    ColumnConstants,
    ErrorTypeConstants,
    UIErrorParameters,
    UseType,
    WidgetConfigInput,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {DataRequestConstants} from '@constants/data-request.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {ExploreResponse} from '@interfaces/response.interface';
import {createTreeCube, DataCubeContext} from '@utils/qbstr';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {cloneDeep} from 'lodash';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {Notification} from '@models/widget/notification.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';

/**
 * Service to retrieve data for the commitment risk widget
 */
@Injectable()
export class CommitmentRiskWidgetService extends AbstractWidgetService {

    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.COMMITMENT_RISK_REQUEST, exploreDataRequestService, [WidgetConfigType.COMMITMENT_RISK], WidgetDataViewOption.NOT_APPLICABLE);
    }

    static checkUnsupportedWorkflows(portfolio: Portfolio, report: Report): Notification {
        if (WorkspaceStore.getCurrentWorkpad()?.isCompareMode(report.comparisonConfigId)) {
            return Notification.createErrorNotification(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.COMMITMENT_RISK, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_VALIDATE_INPUTS_COMMITMENT_RISK_ERROR);
        }
        if (portfolio.isCustomPortGroup()) {
            return Notification.createErrorNotification(AlertConstants.NOTIFICATION.CUSTOM_PORTGROUP_NOT_SUPPORT.COMMITMENT_RISK, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_VALIDATE_INPUTS_COMMITMENT_RISK_ERROR);
        }
        if (portfolio instanceof WhatIfPortfolio) {
            return Notification.createErrorNotification(AlertConstants.NOTIFICATION.WHAT_IF_PORTFOLIO_NOT_SUPPORTED.COMMITMENT_RISK, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_VALIDATE_INPUTS_COMMITMENT_RISK_ERROR);
        }
        return null;
    }

    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        const fundCusip = widgetInputs.get(WidgetInputType.FUND_CUSIP) as FundCusip;

        let columnSet = widgetInputs.get(WidgetInputType.COMMITMENT_RISK_TABLE_COLUMNS) as ColumnSet;
        if (fundCusip?.cusip) {
            // when viewing fund-level, create a copy of the columns and add percentile as the first column (will not be visible in column selector)
            columnSet = cloneDeep(columnSet);
            columnSet.columns = [ColumnConfig.createColumn(ColumnConstants.PERCENTILES, UseType.ALL, ColumnConstants.PERCENTILES), ...columnSet.columns];
        } else if (!fundCusip?.cusip && columnSet?.columns[0]?.columnTag !== ColumnConstants.SEC_DESC && columnSet?.columns[0]?.columnTag !== ColumnConstants.CUSIP) {
            // when viewing portfolio-level, if the first column is not security description or cusip, add security description column
            columnSet.columns = [ColumnConfig.createColumn(ColumnConstants.SEC_DESC, UseType.ALL, ColumnConstants.SEC_DESC), ...columnSet.columns];
        }

        // override the columns input to use the columns for the statistics table
        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
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

    getPortfolioName(request: any, isCompareMode?: boolean): string {
        // if viewing in fund mode, override portfolio name in root node of table with fund ticker
        return request.fundCusip || super.getPortfolioName(request, isCompareMode);
    }

    /**
     * Use TreeCube for commitment risk table, so overriding how the tree is created.
     */
    protected createCube(requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse): DataCubeContext {
        return createTreeCube(requestAdapterConfig, response);
    }

    /**
     * Get the WidgetConfigInput that contains the hidden columns
     * @param widgetConfigInputs
     * @protected
     */
    protected getColumnsWidgetConfigInput(widgetConfigInputs: WidgetConfigInput[]): WidgetConfigInput {
        return widgetConfigInputs.find((inputConfig) => inputConfig.inputName === WidgetInputType.COMMITMENT_RISK_TABLE_COLUMNS);
    }
}
