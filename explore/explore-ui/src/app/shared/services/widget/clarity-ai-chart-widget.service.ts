import {DataRequestConstants} from '@constants/data-request.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {AbstractChartsWidgetService} from '@services/widget/abstract-charts-widget.service';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ErrorTypeConstants, UIErrorParameters, WidgetConfigType, WidgetInput} from '@blk/explore-ui-core';
import {Injectable} from '@angular/core';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {ExploreResponse} from '@interfaces/response.interface';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {Notification} from '@models/widget/notification.model';


/**
 * Service to retrieve data for the Clarity AI Chart widget
 */
@Injectable()
export class ClarityAiChartWidgetDataService extends AbstractChartsWidgetService {

    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.BASE, exploreDataRequestService, [WidgetConfigType.CLARITY], WidgetDataViewOption.HOLDINGS_VIEW);
    }

    /**
     * Initializes widget.showSettings to false.
     * @param widgetInputs Map<string, WidgetInput>
     * @param widget Widget
     */
     protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        widget.showSettings = false;
    }

    /**
     * Processes given response so that it can be displayed in a chart widget
     */
    protected processResponse(widget: Widget, requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse, widgetPayload: WidgetPayload): void {

        const errorMessage = this.noDataResponse(response);
        if (errorMessage) {
            widgetPayload.notification =  Notification.createErrorNotificationWithId('noDataInResponse', errorMessage);
            return;
        }

        const data = JSON.parse(response.data.data.data[0]);
        const summary = data.portfolio;
        const benchmark = data.benchmark;

        const notification = this.validateResponseData(summary, benchmark);
        if (notification !== null) {
            widgetPayload.notification = notification;
            return;
        }
        const serverlessData = {
          summary,
          benchmark,
          organizations: [],
        };

        widgetPayload.widgetSpecificData = serverlessData;
        widgetPayload.cube = new SimpleCube([]);
        widgetPayload.breakdownLevels = null;
    }

    /**
     *
     * @return static widget request parameters
     */
    getStaticWidgetRequestParams(): any {
        const staticWidgetRequestParams: any = {
            dataFormat: DataRequestConstants.DATA_FORMAT.CLARITY
        };

        if (this.widgetDataViewOption === WidgetDataViewOption.SECTOR_VIEW) {
            staticWidgetRequestParams.isSectorView = 'Y';
        }
        return staticWidgetRequestParams;
    }

    validateResponseData(summary: any, benchmark: any): any {
        let errorMessage = null;
        if ( summary.scores.length === 0 ) {
            errorMessage = 'No portfolio scores returned for Clarity data';
        } else if ( benchmark.scores.length === 0 ) {
            errorMessage = 'No benchmark scores returned for Clarity data';
        }
        if ( errorMessage !== null ) {
            return Notification.createErrorNotification(errorMessage, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_VALIDATE_RESPONSE_CLARITY_AI_ERROR);
        }
        return null;
    }

}
