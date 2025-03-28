import {DataRequestConstants} from '@constants/data-request.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {AbstractChartsWidgetService} from '@services/widget/abstract-charts-widget.service';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {WidgetConfigType, WidgetInput} from '@blk/explore-ui-core';
import {Injectable} from '@angular/core';

/**
 * Service to retrieve data for the Pie Chart widget
 */
@Injectable()
export class PieChartWidgetDataService extends AbstractChartsWidgetService {

    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.BASE, exploreDataRequestService, [WidgetConfigType.PIE], WidgetDataViewOption.SECTOR_VIEW);
    }

    /**
     * Modify the widget inputs for if there is any custom handling for this service.
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        // TODO implement
    }
}
