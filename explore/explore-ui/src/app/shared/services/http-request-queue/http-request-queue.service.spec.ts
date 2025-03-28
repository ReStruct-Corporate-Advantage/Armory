import {TestBed} from '@angular/core/testing';

import {HttpRequestQueueService} from './http-request-queue.service';
import {Http2BmsService} from '@services/bms';
import {HttpParams} from '@angular/common/http';
import {RequestConstants} from '@constants/request.constants';
import {delay} from 'rxjs/operators';
import {of} from 'rxjs';

describe('HttpRequestQueueService', () => {
    let service: HttpRequestQueueService;

    let http2bmsServiceMock;

    beforeEach(() => {
        http2bmsServiceMock = {
            post$: jest.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                {provide: Http2BmsService, useValue: http2bmsServiceMock},
            ]
        });
        service = TestBed.inject(HttpRequestQueueService);
    });

    it('queueRequest$ test', (done) => {
        const httpParams = new HttpParams();
        httpParams.set(RequestConstants.WIDGET_ID, '1');

        http2bmsServiceMock.post$ = () => of('1').pipe(delay(15));

        service.queueRequest$('url', {}, httpParams).subscribe((response) => {
            expect(response).toEqual('1');
            done();
        });
    });

    it('onInitialServerResponse test', () => {
        service['numberOfProcessingRequests'] = 5;

        service.onInitialServerResponse();

        expect(service['numberOfProcessingRequests']).toEqual(4);
    });

    it('clears widgetId from queue', () => {
        service['queue'] = [
            {widgetId: 1, url: 'url', data: {}, params: new HttpParams(), response$: null},
            {widgetId: 1, url: 'url', data: {}, params: new HttpParams(), response$: null},
            {widgetId: 1, url: 'url', data: {}, params: new HttpParams(), response$: null},
            {widgetId: 2, url: 'url', data: {}, params: new HttpParams(), response$: null},
        ];

        service.cancelQueuedRequest(2);

        expect(service['queue'].length).toEqual(3);
    });
});
