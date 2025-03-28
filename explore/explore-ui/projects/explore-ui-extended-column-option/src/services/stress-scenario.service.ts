import {Inject, Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {
    HTTP_SERVICE_TOKEN,
    HttpServiceInterface,
} from '@blk/explore-ui-core';
import {ScenarioResponse} from '../interfaces/scenario-response.interface';
import {StressScenario} from '../models/stress-scenario.model';
import {isNil} from 'lodash';

@Injectable()
/**
 * Service for loading stress scenarios
 */
export class StressScenarioService {

    readonly FAILURE_STATUS = 'FAILURE';

    /**
     * constructor
     */
    constructor(@Inject(HTTP_SERVICE_TOKEN) private http2BmsService: HttpServiceInterface) {
    }

    /**
     * Gets the scenario list
     * @param lookBackDate string
     */
    fetchScenarios$(lookBackDate: string): Observable<ScenarioResponse[]> {
        return this.http2BmsService.post$('loadScenarios', {lookBackDate})
            .pipe(
                map((payload: any) => {
                    if (payload !== null && payload.data !== null) {
                        return payload.data;
                    }
                    throw Error();
                }),
            );
    }

    /**
     * Gets a single scenario based on scenario name and category
     */
    fetchScenario$(params: any): Observable<StressScenario> {
        return this.http2BmsService.post$('fetchScenario', params)
            .pipe(
                map((payload: any) => {
                    if (payload?.status !== this.FAILURE_STATUS) {
                        return !isNil(payload.data) ? new StressScenario(payload.data) : null;
                    }
                    throw Error();
                })
            );
    }

    /**
     * Save scenario
     */
    saveScenario$(params: any): Observable<any> {
        return this.http2BmsService.post$('saveScenario', params)
            .pipe(
                map((payload: any) => {
                    if (payload !== null && payload.data !== null) {
                        return payload.data;
                    }
                    throw Error();
                }),
            );
    }

    /**
     * url can be getFactorTree or getRiskFactorData
     */
    fetchSpecifiedScenarioData$(params: any, url: string): Observable<any> {
        return this.http2BmsService.post$(url, params)
            .pipe(
                map((response: any) =>  {
                    if (isNil(response?.data)) {
                        throw response?.message;
                    }
                    return response;
                }),
                catchError((err) => throwError(() => err)),
            );
    }

    fetchScenarioCategories$(scenarioCodes: string[]): Observable<any> {
        return this.http2BmsService.post$('fetchScenarioCategories', { scenarioCodes } )
            .pipe(
                map((response: any) =>  {
                    if (isNil(response?.data)) {
                        throw response?.message;
                    }
                    return response.data;
                }),
                catchError((err) => throwError(() => err)),
            );
    }
}
