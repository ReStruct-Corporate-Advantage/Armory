import {TestBed} from '@angular/core/testing';
import {HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {UserScenarioService} from './user-scenario.service';
import {HTTP_SERVICE_TOKEN} from '../../core/tokens';
import {UserScenariosConstants} from '../constants';
import {NamedScenario} from '../../definition/models/scenario/named-scenario.model';

describe('UserScenarioService', () => {
    let service: UserScenarioService;
    const lookBackDate = '2014-08-31';
    const userScenarioResponseMock: any = {
        data: {
            scenarioMap:
                {
                    userDefinedScenarios :
                        [{
                                scenName: 'JKSTDABS',
                                scenCode: 'JKSTDABS::DEV',
                            },
                            {
                                scenName: 'QDVAL',
                                scenCode: 'QDVAL::DEV',
                            }],
                    myScenarios: []
                }
        }
    };
    const http2BmsServiceStub = {
        post$: jest.fn((): Observable<any> => of(userScenarioResponseMock))
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [{provide: HTTP_SERVICE_TOKEN, useValue: http2BmsServiceStub}, UserScenarioService]
        });

        service = TestBed.inject(UserScenarioService);
    });

    afterEach(() => {
        http2BmsServiceStub.post$.mockClear();
    });


    it('fetchScenarios$', (done: any) => {
        service.fetchScenarios$(lookBackDate)
            .subscribe(response => {
                expect(http2BmsServiceStub.post$).toHaveBeenCalledWith('userScenarios', {lookBackDate}, new HttpParams());
                expect(response).not.toBe(null);
                expect(response.userDefinedScenarios).not.toBe(null);
                expect(response.userDefinedScenarios).toBeInstanceOf(Array);
                expect(response.userDefinedScenarios[0].scenName).toBe('JKSTDABS');
                expect(response.userDefinedScenarios[0].scenCode).toBe('JKSTDABS::DEV');
                expect(response.userDefinedScenarios[1].scenName).toBe('QDVAL');
                expect(response.userDefinedScenarios[1].scenCode).toBe('QDVAL::DEV');
                expect(response.myScenarios).not.toBeNull();
                done();
            });
    });


    it('fetchUserScenarios$', (done) => {
        const mockResponse = new Map<string, NamedScenario[]>();
        mockResponse.set(UserScenariosConstants.USER_DEFINED_SCENARIOS, [
            new NamedScenario({
                scenName: 'JKSTDABS',
                scenCode: 'JKSTDABS::DEV',
            }), new NamedScenario({
                scenName: 'QDVAL',
                scenCode: 'QDVAL::DEV',
            })]);
        mockResponse.set(UserScenariosConstants.MY_SCENARIOS, null);

        service.fetchUserScenarios$(lookBackDate)
            .subscribe(response => {
                expect(http2BmsServiceStub.post$).toHaveBeenCalledTimes(1);
                expect(response).not.toBeNull();
                expect(response).toEqual(mockResponse);
                done();
            });
    });

});
