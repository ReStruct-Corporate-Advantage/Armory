import {TestBed} from '@angular/core/testing';
import {HTTP_INTERCEPTORS, HttpInterceptor, HttpParams, HttpRequest, HttpResponse} from '@angular/common/http';
import {of} from 'rxjs';
import {RequestEnablerInterceptor} from './request-enabler.interceptor';
import {CommonUtils} from '@blk/explore-ui-core';


describe('fallBackToGPX request interceptor tests', () => {
    let interceptorInstance: HttpInterceptor;
    const paramMap : Map<string, string> = new Map([['loadCuratedReports', 'false'], ['fallBackToGPX', 'true']]);
    jest.spyOn(CommonUtils, 'getAllURLParams').mockReturnValue(paramMap);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: RequestEnablerInterceptor,
                    multi: true
                }]
        });
        interceptorInstance = getInterceptorInstance(TestBed.inject(HTTP_INTERCEPTORS), RequestEnablerInterceptor);

    });

    it('Interceptor should be initialized', () => {
        expect(interceptorInstance).toBeDefined();
    });

    /**
     * Scenario: When the request method is post
     */
    it('Interceptor should add the fallBackToGPX token in body in POST request', (done) => {
        const request: HttpRequest<any> = new HttpRequest('POST', '', {requestId: '123'});
        const response: HttpResponse<any> = new HttpResponse({});
        const next: any = {
            handle: () => {
            }
        };
        jest.spyOn(next, 'handle').mockReturnValue(of(response));

        interceptorInstance.intercept(request as HttpRequest<any>, next).subscribe(() => {
            const params = new HttpParams();
            params.set('map', null);
            expect(next['handle']).toHaveBeenCalledWith(new HttpRequest('POST', '', {
                requestId: '123',
                fallBackToGPX: 'true'
            }, {params: params}));
            done();
        });
    });

    /**
     * Scenario: When the request method is get
     */
    it('Interceptor should add the fallBackToGPX token in the params in Get request', (done) => {
        const request: HttpRequest<any> = new HttpRequest('GET', '', {params: new HttpParams()});
        const response: HttpResponse<any> = new HttpResponse({});
        const next: any = {
            handle: () => {
            }
        };
        jest.spyOn(next, 'handle').mockReturnValue(of(response));

        interceptorInstance.intercept(request as HttpRequest<any>, next).subscribe(() => {
            const params = new HttpParams().set('fallBackToGPX', 'true');
            const req: HttpRequest<any> = new HttpRequest('GET', '', {params: params});
            expect(next['handle']).toHaveBeenCalledWith(req);
            done();
        });
    });

});

export function getInterceptorInstance(interceptors: HttpInterceptor[], requiredType: any): HttpInterceptor {
    let searchedInterceptor: HttpInterceptor = null;
    interceptors.forEach((interceptor: HttpInterceptor) => {
        if (interceptor instanceof requiredType) {
            searchedInterceptor = interceptor;
        }
    });
    return searchedInterceptor;
}
