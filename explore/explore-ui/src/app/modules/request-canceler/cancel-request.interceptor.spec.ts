import {TestBed} from '@angular/core/testing';
import {HTTP_INTERCEPTORS, HttpInterceptor, HttpParams, HttpResponse} from '@angular/common/http';
import {CancelRequestInterceptor} from './cancel-request.interceptor';
import {BatchExportingStore, WorkspaceStore} from '../../stores';
import {BehaviorSubject, of} from 'rxjs';
import {RequestCancelerStore} from './store/request-canceler.store';
import {RequestConstants} from '@constants/request.constants';

describe('cancel request interceptor tests', () => {
    let interceptorInstance: HttpInterceptor;
    const request = {params: new HttpParams({fromObject: {widgetId: '1'}}), body: {requestId: '123'}};
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: CancelRequestInterceptor,
                    multi: true
                }]
        });
        interceptorInstance = getInterceptorInstance(TestBed.inject(HTTP_INTERCEPTORS), CancelRequestInterceptor);
        BatchExportingStore.init();
    });

    it('Interceptor should be initialized', () => {
        expect(interceptorInstance).toBeDefined();
    });

    /**
     * Scenario: When the response is received and the requestID is present in requestsToCancel
     */
    it('Interceptor should be nullify the response', (done) => {
        const response: HttpResponse<any> = new HttpResponse({body: [{'data': {'data': [null, null, null], 'rowId': 1}, output: {status: 'SUCCESS'}}]});
        const next: any = {handle: responseHandle => {}};
        jest.spyOn(next, 'handle').mockReturnValue(of(response));
        WorkspaceStore.widgetLoadingStatusMap.set(1, new BehaviorSubject<boolean>(false));
        RequestCancelerStore.requestsToCancel.add('123');
        interceptorInstance.intercept(request as any, next).subscribe((payload: HttpResponse<any>) => {
            expect(payload.body[0].message).toEqual('CANCELLED_RESPONSE');
            expect(RequestCancelerStore.requestsToCancel.size).toEqual(0);
            expect(RequestCancelerStore.inProgressRequests.size).toEqual(0);
            done();
        });
    });

    /**
     * Scenario: When the request is not cancelled - Stop the widget Loading
     */
    it('When the request is not cancelled - stop widget Loading', (done) => {
        const response: HttpResponse<any> = new HttpResponse({body: [{'data': {'data': [null, null, null], 'rowId': 1}, output: {status: 'SUCCESS'}}]});
        const next: any = {handle: responseHandle => {}};
        jest.spyOn(next, 'handle').mockReturnValue(of(response));
        WorkspaceStore.widgetLoadingStatusMap.set(1, new BehaviorSubject<boolean>(false));
        interceptorInstance.intercept(request as any, next).subscribe(() => {
            expect(WorkspaceStore.widgetLoadingStatusMap.get(1).value).toBeFalsy();
            expect(RequestCancelerStore.inProgressRequests.size).toEqual(0);
            done();
        });
    });

    /**
     * Scenario: When the widget request is not in the map
     */
    it('Test when no widget is found in widgetLoadingStatusMap', (done) => {
        const response: HttpResponse<any> = new HttpResponse({body: [{'data': {'data': [null, null, null], 'rowId': 1}, output: {status: 'SUCCESS'}}]});
        const next: any = {handle: responseHandle => {}};
        jest.spyOn(next, 'handle').mockReturnValue(of(response));
        WorkspaceStore.widgetLoadingStatusMap.delete(1);
        interceptorInstance.intercept(request as any, next).subscribe(() => {
            expect(WorkspaceStore.widgetLoadingStatusMap.size).toEqual(0);
            expect(next.handle).toHaveBeenCalled();
            done();
        });
    });

    /**
     * Scenario: When the long running request is cancelled
     */
    it('When the long running request is cancelled', (done) => {
        const longRunningRequest = {params: new HttpParams({fromObject: {[RequestConstants.LONG_RUNNING_STATUS_ID_PARAM]: '123'}})};
        const response: HttpResponse<any> = new HttpResponse({body: [{'data': {'data': {'data': [null, null, null], 'rowId': 1}}, output: {status: 'SUCCESS'}}]});
        const next: any = {handle: responseHandle => {}};
        RequestCancelerStore.requestsToCancel.add('123');
        RequestCancelerStore.longRunningRequestIdToWidgetId.set('123', 1);
        RequestCancelerStore.inProgressRequests.set(1, ['123']);
        jest.spyOn(next, 'handle').mockReturnValue(of(response));
        WorkspaceStore.widgetLoadingStatusMap.set(1, new BehaviorSubject<boolean>(false));
        interceptorInstance.intercept(longRunningRequest as any, next).subscribe((payload: HttpResponse<any>) => {
            expect(payload.body[0].message).toEqual('CANCELLED_RESPONSE');
            expect(WorkspaceStore.widgetLoadingStatusMap.get(1).value).toBeFalsy();
            expect(RequestCancelerStore.longRunningRequestIdToWidgetId.size).toEqual(0);
            expect(RequestCancelerStore.inProgressRequests.size).toEqual(0);
            done();
        });
    });

    /**
     * Scenario: When the long running request is not cancelled - stop widget loading
     */
    it('When the long running request is not cancelled- stop widget loading', (done) => {
        const longRunningRequest = {params: new HttpParams({fromObject: {[RequestConstants.LONG_RUNNING_STATUS_ID_PARAM]: '123'}})};
        const mockedResponse: any = {body: [{'data': {'data': {'data': [null, null, null], 'rowId': 1}}, output: {status: 'SUCCESS'}}]};
        const response: HttpResponse<any> = new HttpResponse(mockedResponse);
        const next: any = {handle: responseHandle => {}};
        RequestCancelerStore.longRunningRequestIdToWidgetId.set('123', 1);
        RequestCancelerStore.inProgressRequests.set(1, ['123']);
        jest.spyOn(next, 'handle').mockReturnValue(of(response));
        WorkspaceStore.widgetLoadingStatusMap.set(1, new BehaviorSubject<boolean>(false));
        interceptorInstance.intercept(longRunningRequest as any, next).subscribe((payload: HttpResponse<any>) => {
            expect(payload).toStrictEqual(response);
            expect(WorkspaceStore.widgetLoadingStatusMap.get(1).value).toBeFalsy();
            expect(RequestCancelerStore.longRunningRequestIdToWidgetId.size).toEqual(0);
            expect(RequestCancelerStore.inProgressRequests.size).toEqual(0);
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
