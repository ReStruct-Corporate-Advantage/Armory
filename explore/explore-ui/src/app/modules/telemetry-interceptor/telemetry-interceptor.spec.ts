import {HTTP_INTERCEPTORS, HttpInterceptor, HttpParams, HttpRequest, HttpResponse} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {getInterceptorInstance} from '../request-canceler/cancel-request.interceptor.spec';
import {Store} from '@ngrx/store';
import {TelemetryInterceptor} from './telemetry-interceptor';
import {
    TelemetryActionConstants,
    TelemetryService,
} from '@blk/explore-ui-core';
import {of} from 'rxjs';

describe('Telemetry interceptor tests', () => {
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
                    useClass: TelemetryInterceptor,
                    multi: true
                },
                {
                    provide: Store,
                    useValue: storeStub
                }]
        });
        interceptorInstance = getInterceptorInstance(TestBed.inject(HTTP_INTERCEPTORS), TelemetryInterceptor);

        jest.resetAllMocks();
    });

    it('should add id and log event', done => {
        const params = new HttpParams({
            fromObject: {
                [TelemetryActionConstants.ADD_REQUEST_ID_TO_TELEMETRY_PAYLOAD]: true,
                [TelemetryActionConstants.USER_BEHAVIOUR.INVESTMENT_UNIVERSE]: 'investmentUniverseTelemetryPayload',
                [TelemetryActionConstants.USER_BEHAVIOUR.RUN_OPTIMIZATION]: 'optimizationRunTelemetryPayload'
            }
        });
        const request: HttpRequest<any> = new HttpRequest('POST', '', {requestId: '12345', investmentUniverseTelemetryPayload: {requestId: null}, optimizationRunTelemetryPayload: {requestId: null}}, {params});
        const telemetryTrackSpy = jest.spyOn(TelemetryService, 'track');
        const next: any = {handle: jest.fn(() => of(new HttpResponse({body: [{output: {status: 'LONG_RUNNING'}}]})))};
        interceptorInstance.intercept(request, next).subscribe((payload: HttpResponse<any>) => {
            expect(telemetryTrackSpy).toHaveBeenLastCalledWith(TelemetryActionConstants.USER_BEHAVIOUR.RUN_OPTIMIZATION, expect.anything());
            done();
        });
    });

    it('should not log event', done => {
        const params = new HttpParams({
            fromObject: {
                [TelemetryActionConstants.ADD_REQUEST_ID_TO_TELEMETRY_PAYLOAD]: false,
                [TelemetryActionConstants.USER_BEHAVIOUR.INVESTMENT_UNIVERSE]: 'investmentUniverseTelemetryPayload',
                [TelemetryActionConstants.USER_BEHAVIOUR.RUN_OPTIMIZATION]: 'optimizationRunTelemetryPayload'
            }
        });
        const request: HttpRequest<any> = new HttpRequest('POST', '', {requestId: '12345', investmentUniverseTelemetryPayload: {requestId: null}, optimizationRunTelemetryPayload: {requestId: null}}, {params});
        const telemetryTrackSpy = jest.spyOn(TelemetryService, 'track');
        const next: any = {handle: jest.fn(() => of(new HttpResponse({body: [{output: {status: 'LONG_RUNNING'}}]})))};
        interceptorInstance.intercept(request, next).subscribe((payload: HttpResponse<any>) => {
            expect(telemetryTrackSpy).not.toHaveBeenCalled();
            done();
        });
    });
});
