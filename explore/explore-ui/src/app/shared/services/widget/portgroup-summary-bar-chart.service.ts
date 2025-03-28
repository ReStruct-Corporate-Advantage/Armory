import {PortGroupSummaryService} from '@services/widget/portgroup-summary.service';
import {Injectable} from '@angular/core';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {NotificationService} from '@services/notification';
import {ChartWidgetInputConfigType, ResponseData, WidgetConfigType, WidgetInput} from '@blk/explore-ui-core';
import {Widget} from '@models/widget/widget.model';
import {ChartUtils} from '@utils/chart.utils';
import {isNil} from 'lodash';
import {FilterIncludeKey, QueryKey} from '@qbstr/data-cube';
import {PgsStackedBarChartSettingsModel} from '@models/widget/inputs/chart-settings/pgs-stacked-bar-chart-settings.model';
import {INCLUDES} from '@utils/qbstr';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {ExploreResponse} from '@interfaces/response.interface';
import {CommonConstants} from '@constants/common.constants';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {ColumnUtils} from '@utils/column.utils';

@Injectable()
export class PortGroupSummaryBarChartService extends PortGroupSummaryService {

    /**
     * Creates a new instance with the given parameter
     * @param exploreDataRequestService a service to use to "talk" to the backend server
     * @param notificationService
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService, protected notificationService: NotificationService) {
        super(exploreDataRequestService, notificationService);
        this.widgetConfigTypes = [WidgetConfigType.PGS_BAR];
    }

    protected processResponse(widget: Widget, requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse, widgetPayload: WidgetPayload, forDate?: string): void {
        if (ChartUtils.isPGSGraphingSpritelet(widget.configType) && ColumnUtils.hasAnyColumnBreakdown((widget.dataStore.metaData.inputs.get(CommonConstants.CONFIG_TYPE.COLUMNS) as ColumnSet)) && (widget.displayInputs.get(ChartWidgetInputConfigType.PGS_STACKED_BAR_CHART_SETTINGS) as PgsStackedBarChartSettingsModel)?.isStackedBarChart) {
            this.updateResponseForStackedPGSBarChart(requestAdapterConfig, response);
        }
        super.processResponse(widget, requestAdapterConfig, response, widgetPayload, forDate);
    }

    /**
     * Responsible for widget specific configuration
     * e.g. table expanded state, soring model or chart specific axes
     */
    protected customVizConfig(widget: Widget, widgetInputs: Map<string, WidgetInput>, portfolio?: string): any {
        if (!isNil(widget.dataStore?.data?.customVizConfig)) {
            const portfolioKeyIndex = widget.dataStore.data.customVizConfig.queryKeys.findIndex(qk => qk instanceof FilterIncludeKey && qk.field === PortGroupSummaryService.PORTFOLIO_COLUMN);
            const queryKeys = widget.dataStore.data.customVizConfig.queryKeys;
            let isStacked = false;
            if (ColumnUtils.hasAnyColumnBreakdown((widget.dataStore.metaData.inputs.get(CommonConstants.CONFIG_TYPE.COLUMNS) as ColumnSet))) { // Modify queryKeys to reflect stacked breakdown only if breakdown is applied
                if ((widget.displayInputs.get(ChartWidgetInputConfigType.PGS_STACKED_BAR_CHART_SETTINGS) as PgsStackedBarChartSettingsModel)?.isStackedBarChart) {
                    isStacked = true;
                    if (portfolioKeyIndex !== -1) {
                        // copy portfolio level info to last level as response with stacked breakdown will not have portfolio level
                        this.copySourceKeyToTargetKey(portfolioKeyIndex, portfolioKeyIndex + 1, queryKeys);
                    }
                } else {
                    isStacked = false;
                    if (portfolioKeyIndex !== -1) {
                        // copy last level info to portfolio level as response without stacked breakdown will have portfolio level
                        this.copySourceKeyToTargetKey(portfolioKeyIndex + 1, portfolioKeyIndex, queryKeys);
                    }
                }
            }
            widget.displayInputs.set(ChartWidgetInputConfigType.PGS_STACKED_BAR_CHART_SETTINGS, new PgsStackedBarChartSettingsModel({isStackedBarChart: isStacked}));
            return {
                ...widget.dataStore.data?.customVizConfig,
                ...this.getYAxisOverrideInputs(widgetInputs),
                ...ChartUtils.getBarChartCustomVizConfigSettings(widget),
                isStacked
            };
        }
        return super.customVizConfig(widget, widgetInputs, portfolio);
    }

    /**
     * Update response to be suitable for PGS stacked bar chart
     * @param requestAdapterConfig
     * @param response
     * @private
     */
    private updateResponseForStackedPGSBarChart(requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse) {
        const colIndexMap: Map<string, number> = new Map();
        const columnToBreakDownColumnMap: Map<string, string[]> = new Map();
        // for all split columns, create a map of column key to split columns i.e. pct_nav -> [pct_nav|Total, pct_nav|Equity, pct_nav|Fixed Income]
        for (const col of response.data.columns.filter(column => column.includes(CommonConstants.COLUMN_KEY_SPLITTER))) {
            const columnKey = col.split(CommonConstants.COLUMN_KEY_SPLITTER)[0];
            if (columnToBreakDownColumnMap.has(columnKey)) {
                columnToBreakDownColumnMap.get(columnKey).push(col);
            } else {
                columnToBreakDownColumnMap.set(columnKey, [col]);
                // keep track of columnIndex to which we'll be adding the child values
                colIndexMap.set(columnKey, response.data.columns.indexOf(col));
            }
        }
        // get new column list without split columns
        const newColumns = response.data.columns.filter(column => !columnToBreakDownColumnMap.has(column.split(CommonConstants.COLUMN_KEY_SPLITTER)[0]) || column === columnToBreakDownColumnMap.get(column.split(CommonConstants.COLUMN_KEY_SPLITTER)[0])[0]);
        this.convertColumnBreakdownToRowBreakdownForLeafNodes(response.data.data, columnToBreakDownColumnMap, colIndexMap, response.data.columns);
        // modify requestConfig for cube to reflect updated list of columns
        requestAdapterConfig.splitColumns = requestAdapterConfig.splitColumns.filter(column => newColumns.includes(column.columnKey));
    }

    /**
     * Converts column breakdown values to rows which is required for PGS stacked bar chart
     * @param data
     * @param columnToBreakDownColumnMap
     * @param colIndexMap
     * @param columns
     * @private
     */
    private convertColumnBreakdownToRowBreakdownForLeafNodes(data: ResponseData, columnToBreakDownColumnMap: Map<string, string[]>, colIndexMap: Map<string, number>, columns: string[]) {
        if (!isNil(data.children)) {
            // Recursively go to leaf node
            data.children.forEach(child => this.convertColumnBreakdownToRowBreakdownForLeafNodes(child, columnToBreakDownColumnMap, colIndexMap, columns));
        } else {
            // for leaf node, add as many children as there are split columns of one specific column
            data.title = data.data[columns.indexOf(PortGroupSummaryService.PORTFOLIO_COLUMN)];
            // do this for all split columns
            columnToBreakDownColumnMap.forEach((values) => {
                for (const value of values) {
                    if (value.includes('Total')) {
                        continue;
                    }
                    // if we have already added children for this column, then add the data to the existing child
                    const addedChildren = isNil(data.children) ? undefined : data.children.find(child => child.title === value.split(CommonConstants.COLUMN_KEY_SPLITTER)[1]);
                    this.createChildAndUpdateData(addedChildren, data, columns, colIndexMap, value);
                }
            });
        }
    }

    /**
     * Create child which will be added to leaf node
     * @param addedChildren
     * @param data
     * @param columns
     * @param colIndexMap
     * @param value
     * @private
     */
    private createChildAndUpdateData(addedChildren: ResponseData, data: ResponseData, columns: string[], colIndexMap: Map<string, number>, value: string): void {
        // create new child if not already existing other-wise grab the existing child data
        const breakdownData = isNil(addedChildren) ? new Array<any>(columns.length) : addedChildren?.data;
        if (!isNil(data.data[columns.indexOf(value)])) {
            // assign updated values to newly created child/already created child
            breakdownData[colIndexMap.get(value.split(CommonConstants.COLUMN_KEY_SPLITTER)[0])] = data.data[columns.indexOf(value)];
        }
        const breakDownChild: ResponseData = {
            title: value.split(CommonConstants.COLUMN_KEY_SPLITTER)[1],
            data: breakdownData
        };

        // only add if it is not present already, otherwise duplicate entry will be added
        if (isNil(addedChildren)) {
            // add child to leaf node
            data.children = [...(isNil(data.children) ? [] : data.children), breakDownChild];
        }
    }

    /**
     * Copies sourceKey value to targetKey based on index provided
     * @param sourceKeyIndex
     * @param targetKeyIndex
     * @param queryKeys
     * @private
     */
    private copySourceKeyToTargetKey(sourceKeyIndex: number, targetKeyIndex: number, queryKeys: QueryKey[]) {
        if (!isNil(queryKeys[sourceKeyIndex]?.[INCLUDES]?.[0])) {
            queryKeys[targetKeyIndex][INCLUDES] = queryKeys[sourceKeyIndex][INCLUDES];
            queryKeys[sourceKeyIndex][INCLUDES] = [undefined];
        }
    }
}
