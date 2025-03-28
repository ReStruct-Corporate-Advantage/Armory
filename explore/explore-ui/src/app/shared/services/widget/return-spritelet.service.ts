/**
 * Service class for widget data related workflows
 */
import {DataRequestConstants} from '../../../constants';
import {AbstractReturnWidgetService} from '@services/widget/abstract-return-widget.service';
import {Widget} from '@models/widget/widget.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {Notification} from '@models/widget/notification.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {WidgetUtils} from '@utils/widget.utils';
import {
    ColumnConfig,
    ColumnConstants,
    UseType,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType,
    AlertConstants,
    ErrorTypeConstants,
    ResponseData
} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {Injectable} from '@angular/core';
import {WorkspaceStore} from '@stores/workspace.store';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {ExploreResponse} from '@interfaces/response.interface';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {isNil} from 'lodash';

/**
 * Service to retrieve risk and exposure widget data
 */
@Injectable()
export class ReturnSpriteletService extends AbstractReturnWidgetService {

    /**
     * Performance Details widget contains a static list of columns for each group.
     *  Each group has a specific main column as follows:
     *  P&L > 'Total'
     *  Contribution > 'Principal'
     *  Beginning > 'Begin Orig Face'
     *  Ending > 'End Orig Face'
     */
    static getPerformanceDetailsMainColumns(): Set<string> {
        return new Set<string>(['total_pnl', 'prin_contr', 'beg_origface', 'end_origface']);
    }

    /**
     * Creates a new instance with the given parameter
     * @param http2BmsService a service to use to 'talk' to the backend serrver
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.RETURNS_TIMESERIES_DATA, exploreDataRequestService, [WidgetConfigType.RETURNS_TIME_SERIES, WidgetConfigType.RETURNS_PERF_DETAIL, WidgetConfigType.RETURNS_MANAGER_SELECTION, WidgetConfigType.RETURNS_FX_ATTRIBUTION]);
    }

    /**
     * Validate the inputs for the time series chart to ensure that the request can be satisfied.
     */
    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        // This widget does not support comparison mode, so error out if this is enabled.
        if (WorkspaceStore.getCurrentWorkpad()?.isCompareMode(report.comparisonConfigId)) {
            return Notification.createWarningNotification(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.TIME_SERIES, ErrorTypeConstants.UI_VALIDATION_ERROR);
        }

        return super.validateInputs(widget, portfolio, report);
    }

    /**
     * Modified given inputs for the Returns data request
     * @see AbstractWidgetService.modifyWidgetInputsForRequest
     */
    modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        super.modifyWidgetInputsForRequest(widgetInputs, widget);

        if (WidgetConfigType.RETURNS_TIME_SERIES === widget.configType) {
            const columns = WidgetUtils.getTimeSeriesSpriteletColumns(widget.dataStore.parentDataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet);
            columns.columns.unshift(ColumnConfig.createColumn(ColumnConstants.DATE, UseType.ALL, ColumnConstants.DATE));
            widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, columns);
            widgetInputs.set(WidgetInputType.COLUMNS, columns);
        }
    }

    /**
     * Process the response from the server
     */
    protected processResponse(widget: Widget, requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse, widgetPayload: WidgetPayload, forDate?: string): void {
        super.processResponse(widget, requestAdapterConfig, response, widgetPayload, forDate);
        this.setCollapsableColumns(widgetPayload, response);
    }

    /**
     * Set the collapsableColumns to the widget payload based on the response data
     */
    private setCollapsableColumns(widgetPayload: WidgetPayload, response: ExploreResponse): void {
        const collapsableColumns = new Set<string>();
        const nonCollapsableColumnIndices = this.computeNonCollapsableIndices(response.data.data);
        response.data.columns.forEach((column, index) => {
            if (!nonCollapsableColumnIndices.has(index)) {
                collapsableColumns.add(column);
            }
        });

        widgetPayload.responseConfig.collapsableColumns = collapsableColumns;
    }

    /**
     * Recursively compute the indices of non-collapsable columns based on data values (data !== 0).
     */
    private computeNonCollapsableIndices(data: ResponseData, indices = new Set<number>()): Set<number> {
        data.data.forEach((value, index) => {
            if (value === 0 || value === '' || isNil(value)) {
                return;
            }
            indices.add(index);
        });
        data.children?.forEach(child => this.computeNonCollapsableIndices(child, indices));
        return indices;
    }
}
