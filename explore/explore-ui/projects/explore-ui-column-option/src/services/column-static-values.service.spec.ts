import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ColumnStaticStringValue, HTTP_SERVICE_TOKEN} from '@blk/explore-ui-core';
import {of, throwError} from 'rxjs';

import {ColumnStaticValuesService} from './column-static-values.service';

describe('ColumnStaticValuesService', () => {
    let service: ColumnStaticValuesService;

    const http2BmsServiceStub = {
        get$: jest.fn()
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [{provide: HTTP_SERVICE_TOKEN, useValue: http2BmsServiceStub}, ColumnStaticValuesService]
        });
        service = TestBed.inject(ColumnStaticValuesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });


    describe('getColumnStaticValues$ Test', () => {

        it('should return value from cache', fakeAsync(() => {
            const curStaticValues = [new ColumnStaticStringValue({
                value: 'Value',
                desc: 'Desc',
                displayName: 'displayName',
            })];
            service.staticColumnValues.set('cur', curStaticValues);
            jest.spyOn(service['http2BmsService'], 'get$');
            service.getColumnStaticValues$('cur').subscribe(data => {
                expect(data).toEqual(curStaticValues);
            });
            tick();
            expect(service['http2BmsService'].get$).toHaveBeenCalledTimes(0);
        }));

        it('No value in cache', fakeAsync(() => {
            const secgroupStaticValues = [{
                value: 'BND',
                desc: 'Sec Group',
                displayName: 'BOND',
            }];
            jest.spyOn(service['http2BmsService'], 'get$').mockReturnValue(
                of({data: secgroupStaticValues})
            );
            service.getColumnStaticValues$('sec').subscribe(data => {
                expect(data).toEqual(secgroupStaticValues);
            });
            tick();
            expect(service.staticColumnValues.get('sec')).toEqual([new ColumnStaticStringValue(secgroupStaticValues[0])]);
        }));
    });

    describe('test getColumnStaticValuesForColumns$', () => {
        const columnStaticValues = [{
            value: 'BND',
            desc: 'Sec Group',
            displayName: 'BOND',
        }, {
            value: 'SEC',
            desc: 'Security',
            displayName: 'Security',
        }];
        const colTags = [ 'BRS_GOLD_1', 'BRS_GOLD_2', 'BRS_GOLD_3', 'BRS_GOLD_4' ];

        it('test getColumnStaticValuesForColumns$ for success', fakeAsync(() => {
            jest.spyOn(service, 'getColumnStaticValues$').mockImplementation(colTag => {
                if (colTag === colTags[0]) {
                    return of([columnStaticValues[0]]);
                }
                if (colTag === colTags[1]) {
                    return of(columnStaticValues);
                }
                return of([]);
            });
            let success = false;
            service.getColumnStaticValuesForColumns$(colTags).subscribe({
                next: data => {
                    expect(data).toEqual(columnStaticValues);
                    success = true;
                },
            });
            tick();
            expect(success).toBeTruthy();
        }));

        it('test getColumnStaticValuesForColumns$ for failure', fakeAsync(() => {
            jest.spyOn(service, 'getColumnStaticValues$').mockImplementation(colTag => {
                if (colTag === colTags[0]) {
                    return of([columnStaticValues[0]]);
                }
                if (colTag === colTags[1]) {
                    return throwError('Error occurred 1');
                }
                if (colTag === colTags[2]) {
                    return throwError('Error occurred 2');
                }
                if (colTag === colTags[3]) {
                    return of(columnStaticValues);
                }
                return of([]);
            });
            let success = true;
            service.getColumnStaticValuesForColumns$(colTags).subscribe({
                error: error => {
                    expect(error).toEqual('Error occurred 1');
                    success = false;
                },
            });
            tick();
            expect(success).toBeFalsy();
        }));
    });
});
