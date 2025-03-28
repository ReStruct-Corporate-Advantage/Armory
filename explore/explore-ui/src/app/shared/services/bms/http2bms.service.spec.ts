import {fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {Http2BmsService} from './http2bms.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {of, throwError} from 'rxjs';
import {delay} from 'rxjs/operators';
import {NotificationService} from '@services/notification';
import {UserSessionInfoMap} from '@models/widget/user-session-info-map.model';
import {RequestConstants} from '@constants/request.constants';
import {LongRunningHandlerService} from '@services/long-running-operations';

describe('Http2BmsService', () => {
    let http2BmsService: Http2BmsService;
    let httpClient: HttpClient;
    const httpGetMockFn = jest.fn();
    const httpPostMockFn = jest.fn();

    const httpMock = {
        get: httpGetMockFn,
        post: httpPostMockFn
    };

    const notificationServiceStub = {
        warning: jest.fn(),
        showDialog$: jest.fn(() => of({})),
        showToastr$: jest.fn(() => of({})),
        openDialog: jest.fn(),
        showUserSessionInfoMap$: jest.fn(() => of(undefined)),
        getCurrentUserSessionInfoMap: jest.fn(() => new UserSessionInfoMap()),
        pushLatestUserSessionInfoMap: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: HttpClient, useValue: httpMock},
                {provide: NotificationService, useValue: notificationServiceStub}
            ]
        });
        http2BmsService = TestBed.inject(Http2BmsService);
        httpClient = TestBed.inject(HttpClient);
    });

    it('should be created', () => {
        expect(http2BmsService).toBeTruthy();
    });

    it('Test calculate wait time', () => {
        expect(http2BmsService['calculateWaitTime'](1)).toEqual(1000);
        expect(http2BmsService['calculateWaitTime'](10)).toEqual(1000);
        expect(http2BmsService['calculateWaitTime'](11)).toEqual(5000);
        expect(http2BmsService['calculateWaitTime'](20)).toEqual(5000);
        expect(http2BmsService['calculateWaitTime'](21)).toEqual(10000);
        expect(http2BmsService['calculateWaitTime'](30)).toEqual(10000);
        expect(http2BmsService['calculateWaitTime'](31)).toEqual(30000);
    });
    it('Test is long running reponse', () => {
        expect(http2BmsService['isLongRunningResponse']({})).toBeFalsy();
        expect(http2BmsService['isLongRunningResponse'](null)).toBeFalsy();
        expect(
            http2BmsService['isLongRunningResponse']({status: 'test'})
        ).toBeFalsy();
        expect(
            http2BmsService['isLongRunningResponse']({status: 'LONG_RUNNING'})
        ).toBeTruthy();
    });
    it('Test Get', waitForAsync(() => {
        httpGetMockFn.mockReturnValue(
            of([
                {
                    output: {data: 'Test'},
                    return_val: 'SUCCESS'
                }
            ]).pipe(delay(500))
        );
        http2BmsService.get$('TestCommand').subscribe(data => {
            expect(data).toEqual({data: 'Test'});
        });
    }));
    it('Test Get', waitForAsync(() => {
        httpGetMockFn.mockReturnValue(
            of([
                {
                    output: {data: 'Test'},
                    return_val: 'SUCCESS'
                }
            ]).pipe(delay(500))
        );
        http2BmsService.get$('TestCommand', undefined).subscribe(data => {
            expect(data).toEqual({data: 'Test'});
        });
    }));

    it('Test Get Error Response', waitForAsync(() => {
        httpGetMockFn.mockReturnValue(
            of([
                {
                    message: 'Request Failed',
                    return_val: 'FAILURE',
                    output: null
                }
            ]).pipe(delay(500))
        );
        expect(http2BmsService.get$('TestCommand').toPromise()).rejects.toThrow(
            'Request Failed'
        );
    }));

    it('Test Get Error Response large response message', waitForAsync(() => {
        httpGetMockFn.mockReturnValue(
            of([
                {
                    message: 'Large message replaced with error body while getting data for risk & exposure',
                    return_val: 'FAILURE',
                    output: null
                }
            ]).pipe(delay(500))
        );
        expect(http2BmsService.get$('TestCommand').toPromise()).rejects.toThrow(
            'This report exceeds our maximum response size limit.'
        );
    }));

    it('Test Http Error Response', waitForAsync(() => {
        httpGetMockFn.mockReturnValue(
            throwError(new Error('Error Occured')).pipe(delay(500))
        );
        expect(http2BmsService.get$('TestCommand').toPromise()).rejects.toThrow(
            'Error Occured'
        );
    }));

    it('Test UserThrottle notification service', waitForAsync(() => {
        httpGetMockFn.mockReturnValue(
            of([
                {
                    output: {
                        status: 'LONG_RUNNING',
                        userinfo: {serverId: 'test1', timestamp: 1234, queuedRequests: 1, runningRequests: 1}
                    },
                    return_val: 'SUCCESS'
                }
            ]).pipe(delay(2000))
        );
        jest.spyOn<any>(
            http2BmsService,
            'handleLongRunningRequest$'
        ).mockImplementation(() =>
            of({data: 'Test'})
        );
        http2BmsService.get$('TestCommand').subscribe(data => {
            expect(notificationServiceStub.pushLatestUserSessionInfoMap).toHaveBeenCalledTimes(1);
        });


    }));

    it('Test Long Running Response Handling', waitForAsync(() => {
        httpGetMockFn.mockReturnValue(
            of([
                {
                    output: {status: 'LONG_RUNNING'},
                    return_val: 'SUCCESS'
                }
            ]).pipe(delay(500))
        );
        jest.spyOn<any>(
            http2BmsService,
            'handleLongRunningRequest$'
        ).mockImplementation(() =>
            of({data: 'Test'})
        );
        http2BmsService.get$('TestCommand', new HttpParams()).subscribe(data => {
            expect(data).toEqual({data: 'Test'});
            expect(http2BmsService['handleLongRunningRequest$']).toHaveBeenCalled();
        });
    }));

    it('Test Handle Long Running Request',
        <any>fakeAsync(() => {
            jest.spyOn<any>(
                http2BmsService,
                'getRequest$'
            ).mockImplementation(
                () => of({data: 'Test'})
            );
            http2BmsService['handleLongRunningRequest$'](
                {status: 'LONG_RUNNING', message: '1234-56789'},
                {},
                '1234',
                undefined
            ).subscribe(data => {
                expect(data).toEqual({data: 'Test'});
            });
            tick(1000);
            tick();
            let reqParams = new HttpParams();
            reqParams = reqParams.set(RequestConstants.ORIGINAL_DATA_REQUEST_ID_PARAM, '1234').set(RequestConstants.LONG_RUNNING_STATUS_ID_PARAM, '1234-56789');
            expect(http2BmsService['getRequest$']).toBeCalledWith(
                'longRunningRequest',
                reqParams,
                2
            );
        })
    );

    it('Test Handle Long Running Request with combined LRO',
        <any>fakeAsync(() => {
            jest.spyOn<any>(
                LongRunningHandlerService,
                'addLongRunningRequest$'
            );
            http2BmsService.useCombinedLRO = true;
            http2BmsService['handleLongRunningRequest$'](
                {status: 'LONG_RUNNING', message: '1234-56789'},
                {},
                '1234',
                undefined
            ).subscribe(data => {
                expect(data).toEqual({data: 'Test'});
            });
            tick(1000);
            tick();
            let reqParams = new HttpParams();
            reqParams = reqParams.set(RequestConstants.ORIGINAL_DATA_REQUEST_ID_PARAM, '1234').set(RequestConstants.LONG_RUNNING_STATUS_ID_PARAM, '1234-56789');
            expect(LongRunningHandlerService.addLongRunningRequest$).toBeCalledWith(
                '1234-56789',
                {},
                '1234',
                null
            );
            http2BmsService.useCombinedLRO = false;
            LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.clear();
        })
    );

    it('Test checkLongRunningRequestStatuses', ((done) => {
        httpPostMockFn.mockReturnValue(
            of([{return_val: 'SUCCESS', output: {data: [{}]}}])
        );
        http2BmsService['checkLongRunningRequestStatuses']().subscribe(x => {
            expect(x).toEqual([]);
        });
        done();
    }));

    it('Test handleLROResponse', () => {
        const response = {
            data: ['123']
        };
        http2BmsService['handleLROResponse'](response);
        expect(LongRunningHandlerService.longRunningRetryCount).toEqual(0);
    });

    it('Test enableCombinedLRO', () => {
        jest.spyOn(http2BmsService, 'checkLongRunningRequestStatuses').mockReturnValue(of(true));
        expect(http2BmsService.useCombinedLRO).toBeFalsy();
        http2BmsService.enableCombinedLRO();
        expect(http2BmsService.useCombinedLRO).toBeTruthy();
        expect(http2BmsService['checkLongRunningRequestStatuses']).toHaveBeenCalled();
    });

    it('Test post$ with callback', (done) => {
        httpPostMockFn.mockReturnValue(
            of([{return_val: 'SUCCESS', output: {data: [{}]}}]).pipe(delay(5))
        );

        const callbackFn = jest.fn();

        http2BmsService.post$('url', {}, new HttpParams(), callbackFn).subscribe(response => {
            expect(callbackFn).toHaveBeenCalled();
            done();
        });
    });
});
