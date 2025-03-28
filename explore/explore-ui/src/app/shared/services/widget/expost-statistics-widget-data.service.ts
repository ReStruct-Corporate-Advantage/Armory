import {DataRequestConstants} from '../../../constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {AbstractExpostWidgetDataService} from '@services/widget/abstract-expost-widget-data.service';
import {ExploreResponse} from '@interfaces/response.interface';
import {ExpostStatsRequestAdapterConfig, RequestAdapterConfig} from '@interfaces/request.interface';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ColumnConfig, ColumnConstants, ColumnDefinition, CoreColumnUtils, UseType, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet, DataFormatter, FormatAndScaleFactory} from '@blk/explore-ui-column-option';
import {Injectable} from '@angular/core';

/**
 * Service to retrieve data for the Expost Statistics widget
 */
@Injectable()
export class ExpostStatisticsWidgetDataService extends AbstractExpostWidgetDataService {

    /**
     * Creates a new instance with the given parameter
     * @param exploreDataRequestService a service to use to 'talk' to the backend server
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.EXPOST_STATS_DATA, exploreDataRequestService, [WidgetConfigType.EXPOST_STATS], WidgetDataViewOption.NOT_APPLICABLE);
    }

    /**
     * return identifierColumn for expost-stat widget
     */
    getIdentifierColumn() {
        return ColumnConstants.PNL_CUSIP_IDENTIFIER_COLUMN;
    }

    /**
     * Does nothing
     * @param widgetInputs widget inputs to modify
     * @param widget a widget to modify the inputs for
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        // Nothing to do
    }

    /**
     * AbstractWidgetService.createRequestConfig(Map<string, WidgetInput>, Widget, ExploreResponse, any)
     */
    protected createRequestConfig(widgetInputs: Map<string, WidgetInput>, widget: Widget, response: ExploreResponse, request: any): RequestAdapterConfig {
        const responseColumns = response.data.columns;
        const visualizationColumns = [];
        responseColumns.forEach((col: string) => {
            visualizationColumns.push({
                columnTag: null,
                columnKey: col,
                columnTitle: null,
                dataType: null,
                isHidden: false,
                isSubtotalable: false,
                formatter: null
            });
        });
        const secDescCol = ColumnConfig.createColumn(ColumnConstants.COLUMN_TAG.SEC_DESC, UseType.ALL);
        visualizationColumns[0].columnTitle = secDescCol.columnTitle;

        const widgetColumnFormatters = new Map<string, DataFormatter>();
        const widgetColumns = widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        widgetColumns.columns.forEach((column: ColumnConfig) => {
            const columnDefinition: ColumnDefinition = CoreColumnUtils.getColumnDefByTagAndUse(column.columnTag, column.positionColumnType);
            const formatter: DataFormatter = FormatAndScaleFactory.getFormatterToUse(columnDefinition.columnFormat, column.optionValues);
            widgetColumnFormatters.set(column.columnKey, formatter);
        });

        const portfolioName = this.getPortfolioName(request);

        // Create request config
        return new (class implements ExpostStatsRequestAdapterConfig {
            columns = visualizationColumns;
            columnFormatters = widgetColumnFormatters;
            portfolio = portfolioName;
        })();
    }

}
