import {Injectable} from '@angular/core';
import {WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {DataRequestConstants} from '@constants/data-request.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {ColumnSet, CustomTitleColumnOption} from '@blk/explore-ui-column-option';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {ExploreDataRequest} from '@models/requests/explore-data-request.model';
import {ObjectUtils} from '@utils/object.utils';

/**
 * Service to retrieve data for the Look Through Summary widget
 */
@Injectable()
export class LookThroughSummaryService extends AbstractWidgetService {

    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.LOOK_THROUGH_SUMMARY_REQUEST, exploreDataRequestService, [WidgetConfigType.LOOK_THROUGH_SUMMARY], WidgetDataViewOption.NOT_APPLICABLE);
    }

    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>): void {
        const originalColumns = widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        if (!originalColumns) {
            return;
        }

        originalColumns.columns.forEach( (col) => {
            const customTitleOption = new CustomTitleColumnOption();
            customTitleOption.customTitle = col.columnTitle;
            col.optionValues.push(customTitleOption);
        });
    }

    public createFinalDataRequest(widget: Widget, portfolios: Portfolio[], report: Report, modifiedWidgetInputs: Map<string, WidgetInput>, isExportRequest?: boolean, omitData?: boolean): ExploreDataRequest {
        const finalRequest: ExploreDataRequest = super.createFinalDataRequest(widget, portfolios, report, modifiedWidgetInputs, isExportRequest, omitData);
        const ltReq = modifiedWidgetInputs.get(WidgetInputType.LT_SUMMARY_SETTING) as any;
        delete ltReq.columns;
        finalRequest.requestParams[0] = ObjectUtils.mergeObjectKeys(finalRequest.requestParams[0], ltReq);
        return finalRequest;
    }
}
