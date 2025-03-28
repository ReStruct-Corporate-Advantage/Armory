import {CancelService} from '@services/cancel/cancel.service';
import {TestBed} from '@angular/core/testing';
import {Http2BmsService} from '@services/bms';
import {of} from 'rxjs';

describe('CancelService Test', () => {
    let service: CancelService;

    const http2BmsServiceStub = {
        post$: jest.fn(() => of({}))
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: Http2BmsService, useValue: http2BmsServiceStub}
            ]
        });
        service = TestBed.inject(CancelService);
    });

    it('Test cancelAll', () => {
        service.cancelAll();
        expect(http2BmsServiceStub.post$).toHaveBeenCalledTimes(1);
    });

});
