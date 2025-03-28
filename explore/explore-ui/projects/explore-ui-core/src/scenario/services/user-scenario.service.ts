import {HttpParams} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {HttpServiceInterface} from '../../core/http.service.interface';
import {HTTP_SERVICE_TOKEN} from '../../core/tokens';
import {UserScenariosConstants} from '../constants';
import {NamedScenario} from '../../definition/models/scenario/named-scenario.model';
import {Observable} from 'rxjs';
import {map, share} from 'rxjs/operators';

import {isEmpty} from 'lodash';

@Injectable()
/**
 * Service for loading user stress scenarios
 */
export class UserScenarioService {

    /**
     * constructor
     */
    constructor(@Inject(HTTP_SERVICE_TOKEN) private http2BmsService: HttpServiceInterface) {
    }

    /**
     * Gets the user defined and my scenarios
     * @param lookBackDate: Date
     */
    fetchScenarios$(lookBackDate: string): Observable<any> {
        return this.http2BmsService.post$('userScenarios', {lookBackDate}, new HttpParams())
            .pipe(
                map((payload: any) => {
                    if (payload !== null && payload.data !== null && Object.keys(payload.data).indexOf('scenarioMap') !== -1) {
                        return payload.data.scenarioMap;
                    }
                    return null;
                }),
                share()
            );
    }

    /**
     * Fetch Scenarios and convert them to NamedScenarios
     * @param lookBackDate: Date
     */
    fetchUserScenarios$(lookBackDate: string): Observable<Map<string, NamedScenario[]>> {
        return this.fetchScenarios$(lookBackDate).pipe(
            map(response => this.createNamedScenarios(response))
        );
    }

    private createNamedScenarios(scenarioMap: any): Map<string, NamedScenario[]> {
        const newScenarioMap = new Map<string, NamedScenario[]>();
        newScenarioMap.set(UserScenariosConstants.USER_DEFINED_SCENARIOS, null);
        newScenarioMap.set(UserScenariosConstants.MY_SCENARIOS, null);

        if (!isEmpty(scenarioMap)) {
            if (!isEmpty(scenarioMap.userDefinedScenarios)) {
                const userScenarios: NamedScenario[] = new Array<NamedScenario>();
                scenarioMap.userDefinedScenarios.forEach( scenario => userScenarios.push(new NamedScenario(scenario)));
                newScenarioMap.set(UserScenariosConstants.USER_DEFINED_SCENARIOS, userScenarios);
            }
            if (!isEmpty(scenarioMap.myScenarios)) {
                const myScenarios: NamedScenario[] = new Array<NamedScenario>();
                scenarioMap.myScenarios.forEach( scenario => myScenarios.push(new NamedScenario(scenario)));
                newScenarioMap.set(UserScenariosConstants.MY_SCENARIOS, myScenarios);
            }
        }
        return newScenarioMap;
    }
}
