import {TestBed} from '@angular/core/testing';
import {Store} from '@ngrx/store';
import {MockStore} from '@ngrx/store/testing';
import {of} from 'rxjs';

import {LoadingService} from './loading.service';
import * as fromLoading from '../store/loading.reducer';
import {LoadingMessageInfo} from '@models/loading-message-info.model';

describe('LoadingService', () => {
    let service: LoadingService;

    beforeAll( () => {
        TestBed.configureTestingModule({
            providers: [{provide: Store, useValue: MockStore}]
        });

        service = TestBed.inject(LoadingService);
        service['store'].select = jest.fn();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('facade test', () => {
        beforeEach( () => {
            jest.spyOn(service['store'], 'select')
                .mockImplementation( (selector) => {
                switch (selector) {
                    case fromLoading.getLoadingStatus:
                        return of(true);
                    case fromLoading.getCurrentLoadingMessage:
                        return of(new LoadingMessageInfo({message: 'Checking Access'}));
                    default:
                        return of(null);
                }
            });
        });

        it('should select the state from getLoadingStatus', () => {
            service.isLoading$();
            expect(service['store'].select).toHaveBeenCalled();
        });

        it('should select the state from getCurrentLoadingMessage', () => {
            service.getLoadingMessageInfo$();
            expect(service['store'].select).toHaveBeenCalled();
        });
    });
});

