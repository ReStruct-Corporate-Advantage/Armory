import {HTTP_INTERCEPTORS, HttpInterceptor, HttpParams, HttpResponse} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {getInterceptorInstance} from '../request-canceler/cancel-request.interceptor.spec';
import {LoadingInterceptor} from './loading.interceptor';
import {of, throwError} from 'rxjs';
import {Store} from '@ngrx/store';
import {CoreRequestConstants} from '@blk/explore-ui-core';
import {RequestConstants} from '@constants/request.constants';

describe('loading interceptor tests', () => {
    let interceptorInstance: HttpInterceptor;
    const storeStub = {
        dispatch: jest.fn(() => {
        })
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: LoadingInterceptor,
                    multi: true
                },
                {
                    provide: Store,
                    useValue: storeStub
                }]
        });
        interceptorInstance = getInterceptorInstance(TestBed.inject(HTTP_INTERCEPTORS), LoadingInterceptor);

        jest.resetAllMocks();
    });

    it('should not add or remove loading message if it s a long-running request', done => {
        const request: any = {params: new HttpParams()};
        const next: any = {handle: jest.fn(() => of(new HttpResponse({body: [{output: {status: 'LONG_RUNNING'}}]})))};
        request.params = request.params.set(CoreRequestConstants.LOADING_MESSAGE, 'abc');
        request.params = request.params.set(RequestConstants.LONG_RUNNING_STATUS_ID_PARAM, '126');
        interceptorInstance.intercept(request as any, next).subscribe(() => done());
        expect(interceptorInstance['store'].dispatch).toHaveBeenCalledTimes(0);
    });

    it('should add and remove loading message if it s a normal request', done => {
        const request: any = {params: new HttpParams()};
        const next: any = {handle: jest.fn(() => of(new HttpResponse({body: [{output: {status: 'SUCCESS'}}]})))};
        request.params = request.params.set(CoreRequestConstants.LOADING_MESSAGE, 'abc');
        interceptorInstance.intercept(request as any, next).subscribe(() => done());
        expect(interceptorInstance['store'].dispatch).toHaveBeenCalledTimes(2);
    });

    it('should add and remove loading message if it s a normal request - when response body is not an array', done => {
        const request: any = {params: new HttpParams()};
        const next: any = {handle: jest.fn(() => of(new HttpResponse({body: {}})))};
        request.params = request.params.set(CoreRequestConstants.LOADING_MESSAGE, 'abc');
        interceptorInstance.intercept(request as any, next).subscribe(() => done());
        expect(interceptorInstance['store'].dispatch).toHaveBeenCalledTimes(2);
    });

    it('should add and remove loading message if it s a normal request - when there is error response', done => {
        const request: any = {params: new HttpParams()};
        const next: any = {handle: jest.fn(() => throwError(new Error()))};
        request.params = request.params.set(CoreRequestConstants.LOADING_MESSAGE, 'abc');
        interceptorInstance.intercept(request as any, next).subscribe({
            next: null,
            error: () => done()
        });
        expect(interceptorInstance['store'].dispatch).toHaveBeenCalledTimes(2);
    });
});
