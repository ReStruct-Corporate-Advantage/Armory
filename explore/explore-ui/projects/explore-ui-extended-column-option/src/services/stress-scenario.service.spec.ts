import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {HTTP_SERVICE_TOKEN} from '@blk/explore-ui-core';
import {StressScenarioService} from './stress-scenario.service';
import {of} from 'rxjs';
import {StressScenario} from '../models/stress-scenario.model';

describe('StressScenarioService', () => {
    let service: StressScenarioService;

    const http2BmsServiceStub = {
        post$: jest.fn()
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [{provide: HTTP_SERVICE_TOKEN, useValue: http2BmsServiceStub}, StressScenarioService]
        });
        service = TestBed.inject(StressScenarioService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('test fetchScenarios$', fakeAsync(() => {
        const actualData = [];

        jest.spyOn(service['http2BmsService'], 'post$').mockReturnValue(
            of({data: actualData})
        );
        const subscription = service.fetchScenarios$('03/15/2021').subscribe(data => {
            expect(data).toEqual(actualData);
        });
        tick();
        subscription.unsubscribe();
        expect(service['http2BmsService'].post$).toHaveBeenCalled();
    }));

    it('test fetchScenario$', fakeAsync(() => {
        const scenario = new StressScenario();
        scenario.scenName = 'a';

        jest.spyOn(service['http2BmsService'], 'post$').mockReturnValue(
            of({data: { scenName: scenario.scenName, scenType: scenario.scenType } })
        );
        const subscription = service.fetchScenario$({}).subscribe(data => {
            expect(data).toEqual(scenario);
        });
        tick();
        subscription.unsubscribe();
        expect(service['http2BmsService'].post$).toHaveBeenCalled();
    }));

    it('test saveScenario$', fakeAsync(() => {
        const data = { scenCode: 'ABC::xyz' };
        jest.spyOn(service['http2BmsService'], 'post$').mockReturnValue(
            of({ data })
        );
        const subscribeMethods =  {
            next: (responseData) => {
                expect(responseData).toEqual(data);
            },
        };
        jest.spyOn(subscribeMethods, 'next');
        const subscription = service.saveScenario$({}).subscribe(
            subscribeMethods
        );
        tick();
        subscription.unsubscribe();
        expect(service['http2BmsService'].post$).toHaveBeenCalled();
        expect(subscribeMethods.next).toHaveBeenCalled();
    }));

    it('test fetchSpecifiedScenarioData$', fakeAsync(() => {
        const data = { data: {} };
        jest.spyOn(service['http2BmsService'], 'post$').mockReturnValue(
            of({ data })
        );
        const subscribeMethods =  {
            next: (responseData) => {
                expect(responseData).toEqual({ data });
            },
        };
        jest.spyOn(subscribeMethods, 'next');
        const subscription = service.fetchSpecifiedScenarioData$({}, '').subscribe(
            subscribeMethods
        );
        tick();
        subscription.unsubscribe();
        expect(service['http2BmsService'].post$).toHaveBeenCalled();
        expect(subscribeMethods.next).toHaveBeenCalled();
    }));

    it('test fetchScenarioCategories$', fakeAsync(() => {
        const response: any = {
            data: {
                'ABC::XYZ': 'Aladdin Scenarios',
            }
        };
        jest.spyOn(service['http2BmsService'], 'post$').mockReturnValue(
            of(response)
        );
        const subscribeMethods =  {
            next: (responseData) => {
                expect(responseData).toEqual(response.data);
            },
        };
        jest.spyOn(subscribeMethods, 'next');
        const subscription = service.fetchScenarioCategories$([]).subscribe(
            subscribeMethods
        );
        tick();
        subscription.unsubscribe();
        expect(service['http2BmsService'].post$).toHaveBeenCalled();
        expect(subscribeMethods.next).toHaveBeenCalled();
    }));
});
