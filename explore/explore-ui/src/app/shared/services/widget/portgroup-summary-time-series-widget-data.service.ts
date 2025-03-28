import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {WidgetConfigType, WidgetInput} from '@blk/explore-ui-core';
import {Widget} from '@models/widget/widget.model';
import {Injectable} from '@angular/core';
import {TimeSeriesWidgetDataService} from '@services/widget/time-series-widget-data.service';
import {TimeSeriesCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {ChartUtils} from '@utils/chart.utils';
import {Notification} from '@models/widget/notification.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {WidgetUtils} from '@utils/widget.utils';


@Injectable()
export class PortGroupSummaryTimeSeriesWidgetDataService extends TimeSeriesWidgetDataService {
    /**
     * Creates a new instance with the given parameter
     * @param exploreDataRequestService a service to use to "talk" to the backend server
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(exploreDataRequestService);
        this.widgetConfigTypes = [WidgetConfigType.PGS_TS];
    }

    /**
     * See AbstractWidgetService.getStaticWidgetRequestParams
     */
    getStaticWidgetRequestParams(): any {
        const staticWidgetReqParams = super.getStaticWidgetRequestParams();
        staticWidgetReqParams.isPortGroupSummaryRequest = 'Y';
        return staticWidgetReqParams;
    }

    /**
     * Validate the inputs for the time series chart to ensure that the request can be satisfied.
     */
    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        return WidgetUtils.validatePgsChartWidget(super.validateInputs(widget, portfolio, report), widget, portfolio.title, portfolio.fullName, report.comparisonConfigId);
    }

    /**
     * Responsible for widget specific configuration
     * e.g. table expanded state, soring model or chart specific axes
     */
    protected customVizConfig(widget: Widget, widgetInputs: Map<string, WidgetInput>): TimeSeriesCustomVizConfig {
        return {
            ...widget.dataStore.data?.customVizConfig,
            ...ChartUtils.getBarChartCustomVizConfigSettings(widget),
            ...super.customVizConfig(widget, widgetInputs)
        };
    }
}
