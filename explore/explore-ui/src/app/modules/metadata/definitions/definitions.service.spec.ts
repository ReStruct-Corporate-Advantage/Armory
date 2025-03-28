import {HttpParams} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {CalendarDateUtils, CommonUtils, CoreDefinitionStore} from '@blk/explore-ui-core';
import {Observable, of, throwError} from 'rxjs';
import {Http2BmsService} from '@services/bms';
import {DefinitionsStore} from '@stores/definitions.store';
import {MetadataModule} from '../metadata.module';
import {DefinitionsService} from './definitions.service';

import definitions from '../../../../../mocks/definitions.json';
import {first} from 'rxjs/operators';
import {URLConstants} from '@constants/url.constants';

describe('DefinitionsService', () => {
    let service: DefinitionsService;

    const http2BmsServiceStub = {
        get$: jest.fn((command: string, params: HttpParams): Observable<any> => of(definitions)),
        enableCombinedLRO: jest.fn(() => '')
    };

    const originalBlob = global.Blob;
    const originalResponse = global.Response;
    const originalCache = global.caches;

    const mockCache = {
        match: jest.fn().mockReturnValue(Promise.resolve(null)),
        put: jest.fn(),
        delete: jest.fn()
    };

    beforeEach(() => {
        global.Blob = jest.fn().mockImplementation((content, options) => {
            return {
                ...new originalBlob(content, options),
                text: jest.fn(() => Promise.resolve(JSON.stringify(content[0]))),
            };
        });

        global['caches'] = {
            open: jest.fn().mockResolvedValue(mockCache)
        } as any;

        global.Response = jest.fn().mockImplementation((body, init) => ({
            ...init,
            json: jest.fn().mockResolvedValue(body instanceof Blob ? JSON.parse(body.text()) : body),
        }));

        jest.spyOn(service['http2BmsService'], 'get$').mockImplementation(() => of({data: definitions}));
        jest.spyOn(CommonUtils, 'decompressResponse').mockReturnValue(definitions.ColumnDefinitions);

        jest.spyOn(service, 'storeDefinitionsInBrowserCache');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        global.Blob = originalBlob;
        global.Response = originalResponse;
        global['caches'] = originalCache;
    });

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [MetadataModule],
            providers: [{provide: Http2BmsService, useValue: http2BmsServiceStub}]
        });
        service = TestBed.inject(DefinitionsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('fetchColumnDefinitions$ Test', () => {
        it('should fetchColumnDefinitions$ and save them in columns and columnTagColumnsPairs - no browser cache enabled', done => {
            jest.spyOn(service['http2BmsService'], 'get$').mockImplementation(() => of({data: definitions}));
            jest.spyOn(CommonUtils, 'decompressResponse').mockReturnValue(definitions.ColumnDefinitions);

            service.fetchColumnDefinitions$().subscribe(() => {
                expect(CoreDefinitionStore.columns.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.columnTagColumnsPairs.size > 0).toBeTruthy();
                expect(CoreDefinitionStore.riskModelList.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.accountingConventions.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.praadaCannedAttributionMethods.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.accountingFactors.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.attributionFactors.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.tradeBasedFactors.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.sectorWeightings.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.attributionCalculatorMethods.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.customPivotPoint.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.sectorLevels.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.exposureModes.length > 0).toBeTruthy();
                expect(DefinitionsStore.currency.length > 0).toBeTruthy();
                expect(DefinitionsStore.exposureLookBackDate.length > 0).toBeTruthy();
                expect(DefinitionsStore.fundCharacteristicBreakdown).toBeUndefined();
                expect(DefinitionsStore.indexLookbackDate.length > 0).toBeTruthy();
                expect(CalendarDateUtils.maxSelectableDate.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.compareToCurrentDataType.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.multiOverrideDateType.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.overrideDateType.length > 0).toBeTruthy();
                expect(DefinitionsStore.optimizationConstraint.length > 0).toBeTruthy();
                expect(DefinitionsStore.optimizationObjective.length > 0).toBeTruthy();
                expect(DefinitionsStore.ltSecurityProxyType.length > 0).toBeTruthy();
                expect(DefinitionsStore.ltSecurityType.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.calendars.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.expostSamplingPeriod.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.expostStatisticPeriod.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.krdBucketDetail.length > 0).toBeTruthy();
                expect(DefinitionsStore.closedPositionAggregationType.length > 0).toBeTruthy();
                expect(DefinitionsStore.positionAggregationTypes.length > 0).toBeTruthy();
                expect(DefinitionsStore.splitPositionType.length > 0).toBeTruthy();
                expect(Object.keys(CoreDefinitionStore.defaultHorizon).length > 0).toBeTruthy();
                expect(CoreDefinitionStore.excludeFactorBlock.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.riskHorizon.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.namedScenarios.size > 0).toBeTruthy();
                expect(CoreDefinitionStore.allWeightingSchemes.length > 0).toBeTruthy();
                expect(CoreDefinitionStore.weightingSchemes.length > 0).toBeTruthy();
                expect(DefinitionsStore.rasCutoffDate).toBe('01/01/2022');
                expect(CoreDefinitionStore.scenarioLookBackDays ).toBe(180);
                expect(DefinitionsStore.topDownEligibleCols.length).toBe(1);
                done();
            });
        });

        it('should throwError if the payload holds empty data', () => {
            jest.spyOn(service['http2BmsService'], 'get$').mockImplementation(() => of({data: null}));
            jest.spyOn(console, 'error');
            service.fetchColumnDefinitions$().subscribe(() => {
                expect(console.error).toHaveBeenCalledWith('Failed to load column definitions data');
            }, () => throwError('Failed to load column definitions data'));
        });

        it('should return Error in Observable', () => {
            jest.spyOn(service['http2BmsService'], 'get$').mockImplementation(() => of(new Error('error')));
            const expectedResult = new Error('error');
            service.fetchColumnDefinitions$().subscribe(data => {
                expect(data).toEqual(expectedResult);
            });
        });
    });

    describe('fetchColumnDefinitions$ with browser cache enabled', () => {
        it('should fetchColumnDefinitions$ - token is not enabled', (done) => {
            CoreDefinitionStore.tokens.ExploreBrowserCacheEnabled = 'N';
            jest.spyOn(CommonUtils, 'getURLParam').mockImplementationOnce(fragment => fragment !== URLConstants.FORCE_FETCH_DEFINITIONS);
            // jest.spyOn(service, 'fetchDefinitionsFromServer$').mockImplementation(() => of({data: {...definitions, tokens: {ExploreBrowserCacheEnabled: 'N'}}}));
            jest.spyOn(service, 'fetchDefinitionsFromServer$').mockImplementation(() => of({data: definitions}));

            // first time fetchColumnDefinitions$ call - cache is not available.
            service.fetchColumnDefinitions$().pipe(first())
                .subscribe(() => {
                    expect(service['fetchDefinitionsFromServer$']).toHaveBeenCalled();
                    // second time fetchColumnDefinitions$ call - cache is not stored so fetching definition from server.
                    service.fetchColumnDefinitions$().pipe(first())
                        .subscribe(() => {
                            expect(service['fetchDefinitionsFromServer$']).toHaveBeenCalled();
                            done();
                        });
                });
        });

        it('should fetchColumnDefinitions$ - forceFetchDefinitions is added to the url', (done) => {
            CoreDefinitionStore.tokens.ExploreBrowserCacheEnabled = 'Y';
            jest.spyOn(service, 'fetchDefinitionsFromServer$').mockImplementation(() => of({data: definitions}));
            jest.spyOn(CommonUtils, 'getURLParam').mockImplementationOnce(fragment => fragment === URLConstants.FORCE_FETCH_DEFINITIONS);

            service.fetchColumnDefinitions$().pipe(first())
                .subscribe(() => {
                    expect(service['fetchDefinitionsFromServer$']).toHaveBeenCalled();
                    done();
                });
        });


        it('should fetchColumnDefinitions$ - cache is NOT available', (done) => {
            CoreDefinitionStore.tokens.ExploreBrowserCacheEnabled = 'Y';
            jest.spyOn(service, 'fetchDefinitionsFromServer$').mockImplementation(() => of({data: definitions}));
            jest.spyOn(CommonUtils, 'getURLParam').mockImplementationOnce(fragment => fragment !== URLConstants.FORCE_FETCH_DEFINITIONS);

            service.fetchColumnDefinitions$().pipe(first())
                .subscribe(() => {
                    expect(service['storeDefinitionsInBrowserCache']).toHaveBeenCalled();
                    done();
                });
        });

        it('should fetchColumnDefinitions$ - cache is available', (done) => {
            CoreDefinitionStore.tokens.ExploreBrowserCacheEnabled = 'Y';
            definitions.definitionsCacheTimestamp = '2024-04-18|7C10:16:19.158477';
            jest.spyOn(CommonUtils, 'getURLParam').mockImplementationOnce(fragment => fragment !== URLConstants.FORCE_FETCH_DEFINITIONS);
            jest.spyOn(service, 'fetchDefinitionsFromServer$').mockReturnValue(of({status: 'CACHE_VALIDATED'}));

            global['caches'] = {
                open: jest.fn().mockResolvedValue({
                    match: jest.fn().mockReturnValue(Promise.resolve(new Response({data: definitions}))),
                    put: jest.fn(),
                    delete: jest.fn()
                })
            } as any;

            service.fetchColumnDefinitions$().pipe(first())
                .subscribe(() => {
                    expect(service['storeDefinitionsInBrowserCache']).not.toHaveBeenCalled();
                    done();
                });
        });

        it('should test storeDefinitionsInBrowserCache', () => {
            mockCache.match.mockResolvedValueOnce(true);
            service['storeDefinitionsInBrowserCache']({data: definitions}, mockCache as any);
            expect(mockCache.put).toHaveBeenCalled();
        });
    });
});
