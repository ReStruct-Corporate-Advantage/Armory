import {DataRequestConstants} from '@constants/data-request.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {AbstractChartsWidgetService} from '@services/widget/abstract-charts-widget.service';
import {ScatterCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {WorkspaceStore} from '../../../stores';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';
import {CommonConstants} from '@constants/common.constants';
import {ChartWidgetInputConfigType, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {Injectable} from '@angular/core';

/**
 * Service to retrieve data for the Scatter Chart (aka Plot) widget
 */
@Injectable()
export class ScatterChartWidgetDataService extends AbstractChartsWidgetService {

    /**
     * Extracts given measure from the given widget inputs, and removes it from the widget inputs too.
     * @param measureName a key in the given widget input
     * @param widgetInputs widget inputs to extract from
     * @return removed measure
     */
    static removeMeasureColumnSet(measureName: string, widgetInputs: Map<string, WidgetInput>): ColumnSet {
        const measureColumnSet: ColumnSet = widgetInputs.get(measureName) as ColumnSet;
        widgetInputs.delete(measureName);

        return measureColumnSet;
    }

    /**
     * Creates a new instance with the given parameter
     * @param http2BmsService a service to use to 'talk' to the backend serrver
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.BASE, exploreDataRequestService, [WidgetConfigType.SCATTER], WidgetDataViewOption.SECTOR_VIEW);
    }

    /**
     * Adds columns to the given widgetInputs by combining the columns defined for X-axis, Y-axis
     * and if defined, for Size.
     * @param widgetInputs widget inputs to modify
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        // Extract 3 columns from the inputs
        const xAxisColumnSet: ColumnSet = ScatterChartWidgetDataService.removeMeasureColumnSet(WidgetInputType.X_AXIS_COLUMN, widgetInputs);
        const yAxisColumnSet: ColumnSet = ScatterChartWidgetDataService.removeMeasureColumnSet(WidgetInputType.Y_AXIS_COLUMN, widgetInputs);
        const sizeColumnSet: ColumnSet = ScatterChartWidgetDataService.removeMeasureColumnSet(WidgetInputType.SIZE_COLUMN, widgetInputs);

        // Create the columns collection
        const measureColumnSets = [xAxisColumnSet, yAxisColumnSet];
        if (sizeColumnSet && sizeColumnSet.columns && sizeColumnSet.columns.length) {
            measureColumnSets.push(sizeColumnSet);
        }

        // Create the resulting column collection and set it in the widget inputs
        const columnSetForWidgetInputs = new ColumnSet();
        for (const measureColumnSet of measureColumnSets) {
            // Take the first column from each set as there is only one column defined for each measure
            columnSetForWidgetInputs.columns.push(measureColumnSet.columns[0]);
        }

        widgetInputs.set(WidgetInputType.COLUMNS, columnSetForWidgetInputs);
    }

    protected customVizConfig(widget: Widget, widgetInputs: Map<string, WidgetInput>): ScatterCustomVizConfig {
        return {
            showGridLines: widget.displayInputs.get(CommonConstants.WIDGET_LEVEL_PROP_LIST[1]) ? (widget.displayInputs.get(CommonConstants.WIDGET_LEVEL_PROP_LIST[1]) as GridLines).showGridLines : false,
            groupByFirstLevel: widget.displayInputs.get(ChartWidgetInputConfigType.SCATTER_SETTINGS)['groupByFirstLevelData'],
            isComparisonMode: WorkspaceStore.getCurrentWorkpad()?.isCompareMode(WorkspaceStore.getCurrentReport().comparisonConfigId)
        };
    }
}
