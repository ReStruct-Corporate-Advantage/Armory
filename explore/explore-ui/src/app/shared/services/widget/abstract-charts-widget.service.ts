import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {ExploreResponse} from '@interfaces/response.interface';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {createDataCube} from '@utils/qbstr';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {isNil} from 'lodash';
import {WidgetConfigType} from '@blk/explore-ui-core';

/**
 * Base class for the chart widget data servicess
 */
export abstract class AbstractChartsWidgetService extends AbstractWidgetService {

    /**
     * Creates a new instance with the given parameter
     * @see constructor in AbstractWidgetService
     */
    protected constructor(protected baseUrl: string, protected exploreDataRequestService: ExploreDataRequestService, protected widgetConfigTypes: WidgetConfigType[], protected widgetDataViewOption: WidgetDataViewOption) {
        super(baseUrl, exploreDataRequestService, widgetConfigTypes, widgetDataViewOption);
    }

    /**
     * Processes given response so that it can be displayed in a chart widget
     * @see createDataCube
     */
    protected processResponse(widget: Widget, requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse, widgetPayload: WidgetPayload): void {
        const {cube, breakdownLevels} = createDataCube(requestAdapterConfig, response, '', false);
        widgetPayload.cube = cube;
        widgetPayload.breakdownLevels = breakdownLevels;
    }

    /**
     * Overridden noDataResponse method
     */
    protected noDataResponse(response: ExploreResponse): string {
        const errorMessage = super.noDataResponse(response);
        if (errorMessage) {
            return errorMessage;
        }

        let isDataMissing = false;
        if (response.data && response.data.data) {
            if (isNil(response.data.data.children) && response.data.data.data.every(item => isNil(item))) {
                isDataMissing = true;
            } else if (this.checkForEmptySeriesResponse(response)) {
                isDataMissing = true;
            }
        }
        if (isDataMissing) {
            return isNil(response.message) ? 'No data is available for the selected date' : 'No data in the response, response.message =' + response.message;
        }
    }

    /**
     * check to find whether response.data.data.children are valid
     */
    protected checkForEmptySeriesResponse(response: ExploreResponse): boolean {
        return response.data.data.children?.every(item => item.data.length > 0 && item.data.every(x => isNil(x)));
    }
}
