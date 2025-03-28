/**
 * Service class for widget data related workflows
 */
import {DataRequestConstants} from '../../../constants';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {AbstractChartsWidgetService} from '@services/widget/abstract-charts-widget.service';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {HeatMapCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';
import {
    ChartWidgetInputConfigType,
    WidgetConfigType,
    WidgetDisplayInputConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {Injectable} from '@angular/core';
import { SortedColumnsX } from '@models/widget/inputs/chart-settings/sorted-columns-x.model';
import { SortedColumnsY } from '@models/widget/inputs/chart-settings/sorted-columns-y.model';
import {ColorScale} from '@models/widget/inputs/chart-settings/color-scale.model';


/**
 * Service to retrieve data for the Heat Map widget
 */
@Injectable()
export class HeatMapWidgetDataService extends AbstractChartsWidgetService {

    /**
     * Creates a new instance with the given parameter
     * @param http2BmsService a service to use to 'talk' to the backend serrver
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.BASE, exploreDataRequestService, [WidgetConfigType.HEATMAP], WidgetDataViewOption.SECTOR_VIEW);
    }

    /**
     * Modifies breakdown related inputs
     * @param widgetInputs widget inputs to modify
     * @param widget a widget to modify the inputs for
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        // Extract X- and Y- breakdowns
        let xAxisBreakdown = AbstractWidgetService.getBreakdown(widgetInputs, WidgetInputType.BREAKDOWN_TREE);
        const yAxisBreakdown = AbstractWidgetService.getBreakdown(widgetInputs, WidgetInputType.COLUMN_BREAKDOWN_TREE);

        // Remove column breakdown input as we don't want to send it in the request
        widgetInputs.delete(WidgetInputType.COLUMN_BREAKDOWN_TREE);

        if (!xAxisBreakdown && !yAxisBreakdown) {
            // No non-empty breakdowns have been given - remove breakdown tree input (should it exists at all)
            widgetInputs.delete(WidgetInputType.BREAKDOWN_TREE);
            // Nothing else to do
            return;
        }

        // Clone X breakdown and strip to the first level
        if (xAxisBreakdown) {
            xAxisBreakdown = Breakdown.deepCloneAndOptionalStripToSpecifiedLevel(xAxisBreakdown, 1);
        }

        let breakdownForRequest: Breakdown;
        if (xAxisBreakdown) {
            // BreakdownX has been specified - use X (already stripped to the first level above)
            breakdownForRequest = xAxisBreakdown;

            if (yAxisBreakdown) {
                // BreakdownY has been specified too along with BreakdownX - merge Y into X
                breakdownForRequest.append(yAxisBreakdown);
            }
        } else {
            // BreakdownX has not been specified, breakdownY has - use Y as is
            breakdownForRequest = yAxisBreakdown;
        }

        // Replace breakdown tree input with the constructed breakdown
        widgetInputs.set(WidgetInputType.BREAKDOWN_TREE, breakdownForRequest);
    }

    protected customVizConfig(widget: Widget, widgetInputs: Map<string, WidgetInput>): HeatMapCustomVizConfig {
        const {format, midpoint, colors} = (widget.displayInputs.get(ChartWidgetInputConfigType.COLOR_SCALE) as ColorScale);
        return {
            showGridLines: (widget.displayInputs.get(WidgetDisplayInputConfigType.SHOW_GRID_LINES) as GridLines)?.showGridLines,
            sortedColumnsX: (widgetInputs.get(ChartWidgetInputConfigType.SORTED_COLUMNS_X) as SortedColumnsX)?.sortedColumns,
            sortedColumnsY: (widgetInputs.get(ChartWidgetInputConfigType.SORTED_COLUMNS_Y) as SortedColumnsY)?.sortedColumns,
            isXAxis: AbstractWidgetService.getBreakdown(widget.dataStore.metaData.inputs, WidgetInputType.BREAKDOWN_TREE) !== undefined,
            isYAxis: AbstractWidgetService.getBreakdown(widget.dataStore.metaData.inputs, WidgetInputType.COLUMN_BREAKDOWN_TREE) !== undefined,
            colorScaleFormat: format,
            colorScaleMidpoint: midpoint,
            colorScaleColors: colors
        };
    }
}
