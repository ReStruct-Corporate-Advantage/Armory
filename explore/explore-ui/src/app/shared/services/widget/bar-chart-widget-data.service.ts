import {Breakdown} from '@blk/explore-ui-breakdown';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {DataRequestConstants} from '@constants/data-request.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {AbstractChartsWidgetService} from '@services/widget/abstract-charts-widget.service';
import {BarCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {SortedColumns} from '@models/widget/inputs/sorted-columns/sorted-columns';
import {SortOrderColumnOptionModel} from '@models/columns/column-options/sort-order-column-option.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {
    ColumnConstants,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {Injectable} from '@angular/core';
import {ChartUtils} from '@utils/chart.utils';

/**
 * Service to retrieve data for the Bar Char widget
 */
@Injectable()
export class BarChartWidgetDataService extends AbstractChartsWidgetService {

    /**
     * Creates a new instance with the given parameter
     * @param http2BmsService a service to use to 'talk' to the backend server
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.BASE, exploreDataRequestService, [WidgetConfigType.BAR], WidgetDataViewOption.SECTOR_VIEW);
    }

    /**
     * Modifies some of the inputs, for instance a breakdown (see BarChartWidgetDataService.modifyBreakdown)
     * @param widgetInputs original widgetInputs
     */
    public static modifyWidgetInputs(widgetInputs: Map<string, WidgetInput>): void {
        const breakdown: Breakdown = AbstractWidgetService.getBreakdown(widgetInputs, WidgetInputType.BREAKDOWN_TREE);
        let stackedBreakdown: Breakdown = AbstractWidgetService.getBreakdown(widgetInputs, WidgetInputType.STACKED_BREAKDOWN_TREE);

        // Remove stacked breakdown from widget inputs
        widgetInputs.delete(WidgetInputType.STACKED_BREAKDOWN_TREE);

        // If the stacked breakdown is present, modify the breakdownTree input to have the stacked breakdown incorporated.
        // (This is because the request only expects one breakdown)
        if (stackedBreakdown) {
            // Get the clone that only has the first level
            stackedBreakdown = Breakdown.deepCloneAndOptionalStripToSpecifiedLevel(stackedBreakdown, 1);

            let breakdownToUse: Breakdown;
            if (breakdown) {
                breakdownToUse = Breakdown.deepCloneAndOptionalStripToSpecifiedLevel(breakdown, 1);

                // Combine breakdown with the stacked breakdown into one.
                // (That is 1st level of breakdown + 1st level of the stacked breakdown)
                breakdownToUse.append(stackedBreakdown);
            } else {
                // No breakdown defined, use stacked breakdown instead of it
                breakdownToUse = stackedBreakdown;
            }

            // Put modified breakdown into the widget inputs
            widgetInputs.set(WidgetInputType.BREAKDOWN_TREE, breakdownToUse);
        }

        // Apply sort orders to the widget columns
        this.applyWidgetSortingSettings(widgetInputs);
    }

    /**
     * Apply sort orders to the widget columns
     * @param widgetInputs original widgetInputs
     */
    static applyWidgetSortingSettings(widgetInputs: Map<string, WidgetInput>): void {
        const widgetColumns = widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;

        // Guardrail for no columns in the request
        if (widgetColumns && widgetColumns.columns.length) {

            // Check if there is a sorted column configured in the widget inputs
            // Grab the first one (there should only be one)
            const sortedCols = widgetInputs.get('sortedColumns') as SortedColumns;
            if (sortedCols && sortedCols.sortedColumns && sortedCols.sortedColumns.length) {
                // Find the corresponding column within the request params based on the columnKey
                let requestColumn = widgetColumns.columns.find(column => column.columnKey === sortedCols.sortedColumns[0].colId);
                // If you didn't find a matching column, default to the first one
                if (!requestColumn) {
                    requestColumn = widgetColumns.columns[0];
                }
                // clear out all previous sort orders
                widgetColumns.columns.forEach(col => {
                    col.optionValues = col.optionValues.filter(option => option.configType !== SortOrderColumnOptionModel.CONFIG_TYPE);
                });
                // Set the sort order onto that column
                requestColumn.optionValues.push(new SortOrderColumnOptionModel({sortOrder: sortedCols.sortedColumns[0].sort}));
            } else {
                // If there is no sorted column configured within the widget inputs, then set a default DESC onto the first column
                const col = widgetColumns.columns[0];
                if (!col.optionValues) {
                    col.optionValues = [];
                }
                col.optionValues.push(new SortOrderColumnOptionModel({ sortOrder: ColumnConstants.SORTING_ORDER.DESC_SORT_ORDER.VALUE}));
            }
        }

    }

    /**
     * Modifies some of the inputs, for instance a breakdown (see BarChartWidgetDataService.modifyBreakdown)
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        BarChartWidgetDataService.modifyWidgetInputs(widgetInputs);
    }

    protected customVizConfig(widget: Widget, widgetInputs: Map<string, WidgetInput>): BarCustomVizConfig {
        return {
            ...this.getYAxisOverrideInputs(widgetInputs),
            ...ChartUtils.getBarChartCustomVizConfigSettings(widget)
        };
    }
}
