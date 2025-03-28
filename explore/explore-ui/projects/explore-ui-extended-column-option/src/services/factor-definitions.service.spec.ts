import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ColumnDefinition, HTTP_SERVICE_TOKEN} from '@blk/explore-ui-core';
import {of} from 'rxjs';

import {FactorDefinitionsService} from './factor-definitions.service';

describe('FactorDefinitionsService', () => {
    let service: FactorDefinitionsService;

    const http2BmsServiceStub = {
        post$: jest.fn()
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [{provide: HTTP_SERVICE_TOKEN, useValue: http2BmsServiceStub}, FactorDefinitionsService]
        });
        service = TestBed.inject(FactorDefinitionsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('test fetchFactorDefinitions$', fakeAsync(() => {
        const col = new ColumnDefinition();
        col.columnTag = 'factor1';
        col.title = 'factor 1';

        const colDef = new ColumnDefinition(col);
        colDef.columnDesc = colDef.columnTag + '::' + colDef.title;

        const actualData = [ colDef ];

        jest.spyOn(service['http2BmsService'], 'post$').mockReturnValue(
            of({data: actualData})
        );
        const subscription = service.fetchFactorDefinitions$('cur').subscribe(data => {
            expect(data).toEqual(actualData);
        });
        tick();
        subscription.unsubscribe();
        expect(service['http2BmsService'].post$).toHaveBeenCalled();
    }));

    it('test fetchFactorDefinitionsForFactorShocks$', fakeAsync(() => {
        const col = { columnTag: 'factor1', shockUnit: 'bps' };
        const actualData = [ col ];
        const expectedData = [
            { colTag: col.columnTag, shockUnit: col.shockUnit }
        ];

        jest.spyOn(service['http2BmsService'], 'post$').mockReturnValue(
            of({data: actualData})
        );
        const subscription = service.fetchFactorDefinitionsForFactorShocks$([ 'x' ], 'y').subscribe(data => {
            expect(data).toEqual(expectedData);
        });
        tick();
        subscription.unsubscribe();
        expect(service['http2BmsService'].post$).toHaveBeenCalled();
    }));
});
