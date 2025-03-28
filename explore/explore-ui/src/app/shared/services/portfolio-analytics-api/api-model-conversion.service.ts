import {Injectable} from '@angular/core';
import {Http2BmsService} from '@services/bms';
import {Observable} from 'rxjs';
import {HttpUtils} from '@utils/http.utils';
import {HttpParams} from '@angular/common/http';
import {WidgetServiceRegistry} from '@services/widget/widget-service-registry';
import {WorkspaceStore} from '@stores/workspace.store';
import {ApiRequestUtils} from '@utils/api-request.utils';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Widget} from '@models/widget/widget.model';
import {map} from 'rxjs/operators';
import {isNil} from 'lodash';

/**
 * Service responsible for converting explore models to API models
 */
@Injectable({
    providedIn: 'root'
})
export class ApiModelConversionService {

    constructor(private httpService: Http2BmsService, private widgetServiceRegistry: WidgetServiceRegistry) {
    }

    /**
     * Sends the requet to server with params
     *
     * @param widget
     * @param portfolio
     * @param spinnerMessage
     * @returns
     */
    convertExploreModelToApiModel$(generateApiRequest, spinnerMessage: string): Observable<any> {
        let params = new HttpParams();
        params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(params, spinnerMessage);
        return this.httpService.post$('generateApiRequest', generateApiRequest, params)
            .pipe(map((response) => {
                if (isNil(response.data)) {
                    throw new Error(response.message);
                }
                return response;
            }));
    }

    /**
     * Generates payload for the generateAPI call to BE
     * @param widget
     * @param portfolio
     */
    getGenerateApiRequestPayload(widget: Widget, portfolio: Portfolio): any {
        const service = this.widgetServiceRegistry.getService(widget.configType);
        const exploreDataRequest = service.createFinalDataRequest(widget,
            [portfolio],
            WorkspaceStore.getCurrentReport(),
            widget.dataStore.metaData.inputs);
        const generateApiRequest: any = {};
        generateApiRequest['widgetType'] = exploreDataRequest.requestParams[0].type;
        generateApiRequest['prismWebRequest'] = exploreDataRequest.requestParams[0];

        // post process request with favIds
        ApiRequestUtils.postProcessRequestParams(widget.dataStore.metaData, portfolio, generateApiRequest);
        return generateApiRequest;
    }
}
