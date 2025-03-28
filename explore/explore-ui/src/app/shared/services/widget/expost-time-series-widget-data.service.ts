import {DataRequestConstants} from '../../../constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {AbstractExpostWidgetDataService} from '@services/widget/abstract-expost-widget-data.service';
import {cloneDeep} from 'lodash';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ExPostTimeSeriesCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {ExpostTimeSeriesSettings} from '@models/expostSettings/expost-time-series-settings.model';
import {
    ChartWidgetInputConfigType,
    ColumnConfig,
    ColumnConstants,
    UseType,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {Injectable} from '@angular/core';
import {SecondaryAxis} from '@models/widget/inputs/chart-settings/secondary-axis.model';

/**
 * Service to retrieve data for the Expost Time Series widget
 */
@Injectable()
export class ExpostTimeSeriesWidgetDataService extends AbstractExpostWidgetDataService {

    /**
     * Creates a new instance with the given parameter
     * @param exploreDataRequestService a service to use to 'talk' to the backend server
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.EXPOST_TIME_SERIES_DATA, exploreDataRequestService, [WidgetConfigType.EXPOST_TIME_SERIES], WidgetDataViewOption.NOT_APPLICABLE);
    }

    /**
     * Adds date as the first column to the column set in widget inputs..
     * @param widgetInputs widget inputs to modify
     * @param widget a widget to modify the inputs for
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        const columns = cloneDeep(widgetInputs.get(WidgetInputType.COLUMNS)) as ColumnSet;
        const dateCol = ColumnConfig.createColumn(ColumnConstants.DATE, UseType.ALL, ColumnConstants.DATE);
        columns.columns.unshift(dateCol);
        widgetInputs.set(WidgetInputType.COLUMNS, columns);
    }

    /**
     * Responsible for widget specific configuration
     * e.g. table expanded state, soring model or chart specific axes
     */
    protected customVizConfig(widget: Widget, widgetInputs: Map<string, WidgetInput>): ExPostTimeSeriesCustomVizConfig {
        const expostTimeSeriesSettings = widgetInputs.get(ExpostTimeSeriesSettings.EXPOST_TIME_SERIES_SETTINGS) as ExpostTimeSeriesSettings;
        const secondaryAxis = widget.displayInputs.get(ChartWidgetInputConfigType.SECONDARY_AXIS_COLUMN) as SecondaryAxis;
        const expostSettings = expostTimeSeriesSettings.expostSettings;
        return {
            ...this.getYAxisOverrideInputs(widgetInputs),
            samplingPeriod: expostSettings.samplingPeriod.timePeriodName,
            statisticPeriod: expostSettings.statisticPeriods[0].timePeriodName,
            secondaryYAxis: secondaryAxis && typeof secondaryAxis.secondaryAxisColumn === 'string' ? secondaryAxis.secondaryAxisColumn : undefined,
        };
    }
}
