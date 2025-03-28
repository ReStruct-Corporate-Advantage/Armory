import {Injectable} from '@angular/core';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {WidgetConfigType, WidgetInput} from '@blk/explore-ui-core';
import {Widget} from '@models/widget/widget.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {DataRequestConstants} from '@constants/data-request.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';

@Injectable()
export class DiversificationScoreWidgetDataService extends AbstractWidgetService {

    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.DIVERSIFICATION_SCORE_TIME_SERIES_DATA, exploreDataRequestService, [WidgetConfigType.DIVERSIFICATION_TS, WidgetConfigType.DIVERSIFICATION_TS], WidgetDataViewOption.HOLDINGS_VIEW);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected modifyWidgetInputsForRequest(_widgetInputs: Map<string, WidgetInput>, _widget: Widget, _isExportRequest?: boolean): void {
        // Do nothing
    }

}
