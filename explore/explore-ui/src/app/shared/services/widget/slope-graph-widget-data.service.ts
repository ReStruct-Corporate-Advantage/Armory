import {DataRequestConstants} from '@constants/data-request.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {AbstractChartsWidgetService} from '@services/widget/abstract-charts-widget.service';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {WidgetConfigType, WidgetInput} from '@blk/explore-ui-core';
import {Injectable} from '@angular/core';

/**
 * Service to retrieve risk and exposure widget data
 */
@Injectable()
export class SlopeGraphWidgetDataService extends AbstractChartsWidgetService {

    /**
     * Creates a new instance with the given parameter
     * @param http2BmsService a service to use to 'talk' to the backend serrver
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.BASE, exploreDataRequestService, [WidgetConfigType.SLOPE_GRAPH], WidgetDataViewOption.SECTOR_VIEW);
    }

    /**
     * Does nothing as it does not require any of the inputs modification.
     * @param widgetInputs widget inputs to modify
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>): void {
        // Nothing to do
    }
}
