import {DataRequestConstants} from '../../../constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {AbstractChartsWidgetService} from '@services/widget/abstract-charts-widget.service';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {TreemapCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {WorkspaceStore} from '../../../stores';
import {ChartWidgetInputConfigType, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {Injectable} from '@angular/core';
import {ColorScale} from '@models/widget/inputs/chart-settings/color-scale.model';

/**
 * Service to retrieve data for the Heat Map widget
 */
@Injectable()
export class TreeMapWidgetDataService extends AbstractChartsWidgetService {

    /**
     * Creates a new instance with the given parameter
     * @param http2BmsService a service to use to 'talk' to the backend serrver
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.BASE, exploreDataRequestService, [WidgetConfigType.TREEMAP], WidgetDataViewOption.SECTOR_VIEW);
    }

    /**
     * - Extracts specified by the columnSetName column set from the given widgetInputs
     * - Adds the first column in the extracted column set to the given columnSetToAddTo
     * - Removes specified by the columnSetName column set from the given widgetInputs
     * @param widgetInputs widget inputs to extract the column set from
     * @param columnSetName the name of the column set to extract from the widget inputs
     * @param columnSetToAddTo a column set to add the extracted column to
     */
    private static extractColumnAndAdd(widgetInputs: Map<string, WidgetInput>, columnSetName: string, columnSetToAddTo: ColumnSet): void {
        // Extract specified column set from the widgetInputs
        const columnSet: ColumnSet = widgetInputs.get(columnSetName) as ColumnSet;
        // Add the first column in the extracted column set to the given column set
        columnSetToAddTo.columns.push(columnSet.columns[0]);
        // Remove the specified column set from the widgetInputs
        widgetInputs.delete(columnSetName);
    }

    /**
     * Modifies columns related inputs
     * @param widgetInputs widget inputs to modify
     * @param widget a widget to modify the inputs for
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        // Create a column set and add size and colour columns to it
        const columnSet: ColumnSet = new ColumnSet();
        TreeMapWidgetDataService.extractColumnAndAdd(widgetInputs, WidgetInputType.SIZE_COLUMN_ALT_NAME, columnSet);
        TreeMapWidgetDataService.extractColumnAndAdd(widgetInputs, WidgetInputType.COLOUR_COLUMN, columnSet);

        // Add created column set to the inputs
        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
    }

    protected customVizConfig(widget: Widget, widgetInputs: Map<string, WidgetInput>): TreemapCustomVizConfig {
        const {format, midpoint, colors} = (widget.displayInputs.get(ChartWidgetInputConfigType.COLOR_SCALE) as ColorScale);
        return {
            isComparisonMode: WorkspaceStore.getCurrentWorkpad()?.isCompareMode(WorkspaceStore.getCurrentReport().comparisonConfigId),
            colorScaleFormat: format,
            colorScaleMidpoint: midpoint,
            colorScaleColors: colors
        };
    }
}
