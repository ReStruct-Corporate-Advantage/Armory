import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {TestBed} from '@angular/core/testing';
import {ExploreCachingService} from '@services/widget-data/explore-caching.service';
import {Http2BmsService} from '@services/bms';
import {ExploreDataRequest} from '@models/requests/explore-data-request.model';
import {DataRequestConstants} from '@constants/data-request.constants';
import {BehaviorSubject, of, throwError} from 'rxjs';
import {ExploreResponse} from '@interfaces/response.interface';
import {BatchExportingStore} from '../../../stores';
import {BatchContainerStatus} from '@enums/batch-reporting/batch-container-status.enum';
import {RequestCancelerStore} from '../../../modules/request-canceler/store/request-canceler.store';
import {HttpRequestQueueService} from '@services/http-request-queue/http-request-queue.service';

describe('ExploreDataRequestService Test', () => {
    let service: ExploreDataRequestService;
    let widgetDataRequest: ExploreDataRequest;
    let exploreCachingServiceStub;
    let httpToBmsServiceStub;
    let httpRequestQueueServiceStub;
    beforeAll(() => {
        exploreCachingServiceStub = {
            getDataFromCache$: jest.fn(),
            deleteDataFromCache: jest.fn(),
            addDataToCache: jest.fn()
        };

        httpToBmsServiceStub = {
            post$: jest.fn()
        };

        httpRequestQueueServiceStub = {
            queueRequest$: jest.fn()
        };

        widgetDataRequest = new ExploreDataRequest([{
            'title': 'Pie Chart',
            'columns': [{
                'columnKey': 'cusip',
                'columnTag': 'cusip',
                'positionColumnType': 'ALL',
                'title': 'CUSIP',
                'identifierColumn': true
            }, {
                'columnTag': 'pct_notional_val',
                'columnKey': 'pct_notional_val_0',
                'positionColumnType': 'PORT',
                'title': 'Notional Market Value %'
            }],
            'type': 'pie',
            'breakdownTree': '{"breakdown":{"breakdownTitle":"Barclays Four Pillar","subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"Barclays Four Pillar Sectors (gp_BARCSECT4P) - Level 1","columnTag":"grsector`gp_BARCSECT4P`1","dataType":"STRING"},"subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"Barclays Four Pillar Sectors (gp_BARCSECT4P) - Level 2","columnTag":"grsector`gp_BARCSECT4P`2","dataType":"STRING"},"subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"Barclays Four Pillar Sectors (gp_BARCSECT4P) - Level 3","columnTag":"grsector`gp_BARCSECT4P`3","dataType":"STRING"},"subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"Barclays Four Pillar Sectors (gp_BARCSECT4P) - Level 4","columnTag":"grsector`gp_BARCSECT4P`4","dataType":"STRING"}}]}]}]}]},"title":"Barclays Four Pillar"}',
            'filter': null,
            'normalizedWidgetFilter': null,
            'riskFactorBreakdown': '',
            'createNestedNoneBuckets': true,
            'createNestedOtherBuckets': true,
            'layout': 'Report 2',
            'todayDate': '03/11/2016',
            'portfolioRiskSettings': {},
            'isAnchorPortfolio': false,
            'performanceSettings': {'cannedAttributionMethod': 'FIXED_INCOME_DXS'},
            'compositionFilter': null,
            'portfolio': 'IP',
            'fullPortfolioName': 'International Paper Defined Benefit Account',
            'portfolioIdentifier': 'IP',
            'forDate': '03/10/2016',
            'currency': 'USD',
            'holidayCalendar': 'GreenPkg',
            'includeAliasPortfolios': false,
            'filterTargetType': 'BOTH',
            'benchmark': 'LEH_AGG',
            'benchSelection': 'RISK',
            'benchOrder': 1,
            'isLookthroughEnabled': 'N',
            'ltSecurityTypes': '',
            'ltSecurityProxyTypes': '',
            'lookthroughRules': [],
            'splitPositionTypes': 'XC,XF,XH,XS,SW,O',
            'isSectorView': 'Y'
        }]);

        RequestCancelerStore.removeRequestFromRequestToCancel = jest.fn();
        TestBed.configureTestingModule({
            providers: [
                {provide: ExploreCachingService, useValue: exploreCachingServiceStub},
                {provide: Http2BmsService, useValue: httpToBmsServiceStub},
                {provide: HttpRequestQueueService, useValue: httpRequestQueueServiceStub}
            ]
        });

        service =  TestBed.inject(ExploreDataRequestService);
    });

    it('getData - duplicate request', (done: any) => {
        ExploreDataRequestService.inProgressRequests.set('cacheKey1', widgetDataRequest);
        widgetDataRequest.widgetId = 12345;
        widgetDataRequest['cacheKey'] = 'cacheKey1';
        service.getData$(widgetDataRequest, false, DataRequestConstants.DATA_REQUEST_URL.BASE).subscribe((response: ExploreResponse) => {
            expect(RequestCancelerStore.removeRequestFromRequestToCancel).toHaveBeenCalled();
            expect(response.message).toBe(DataRequestConstants.DUPLICATE_REQUEST);
            done();
        });
    });

    it('getData - hard refresh', (done: any) => {
        jest.resetAllMocks();
        widgetDataRequest.widgetId = 12345;
        widgetDataRequest['cacheKey'] = 'cacheKey2';
        widgetDataRequest.hardRefresh = true;
        jest.spyOn(service, 'requestDataFromServer$').mockImplementation(() => {
            return of('');
        });
        jest.spyOn(exploreCachingServiceStub, 'deleteDataFromCache');
        jest.spyOn(exploreCachingServiceStub, 'getDataFromCache$');

        service.getData$(widgetDataRequest, false, DataRequestConstants.DATA_REQUEST_URL.BASE).subscribe(() => {
            expect(service.requestDataFromServer$).toHaveBeenCalledWith(widgetDataRequest.requestParams[0], expect.anything(), DataRequestConstants.DATA_REQUEST_URL.BASE);
            expect(exploreCachingServiceStub.deleteDataFromCache).toHaveBeenCalled();
            expect(exploreCachingServiceStub.getDataFromCache$).not.toHaveBeenCalled();
            done();
        });
    });

    it('getData - bypass browser cache', (done: any) => {
        jest.resetAllMocks();
        widgetDataRequest.widgetId = 12345;
        widgetDataRequest['cacheKey'] = 'cacheKey3';
        widgetDataRequest.hardRefresh = false;
        jest.spyOn(service, 'requestDataFromServer$').mockImplementation(() => {
            return of('');
        });
        jest.spyOn(exploreCachingServiceStub, 'deleteDataFromCache');
        jest.spyOn(exploreCachingServiceStub, 'getDataFromCache$');

        service.getData$(widgetDataRequest, true, DataRequestConstants.DATA_REQUEST_URL.BASE, true).subscribe(() => {
            expect(service.requestDataFromServer$).toHaveBeenCalledWith({multiRequests: widgetDataRequest.requestParams}, expect.anything(), DataRequestConstants.DATA_REQUEST_URL.BASE);
            expect(exploreCachingServiceStub.deleteDataFromCache).toHaveBeenCalled();
            expect(exploreCachingServiceStub.getDataFromCache$).not.toHaveBeenCalled();
            done();
        });
    });

    it('getData - from cache', (done: any) => {
        jest.resetAllMocks();
        widgetDataRequest.hardRefresh = false;
        widgetDataRequest.widgetId = 12345;
        widgetDataRequest['cacheKey'] = 'cacheKey4';
        jest.spyOn(service, 'requestDataFromServer$');
        jest.spyOn(exploreCachingServiceStub, 'getDataFromCache$').mockImplementation(() => {
            return of({originalColumns: [], data: {}});
        });
        jest.spyOn(ExploreCachingService, 'getColumnKeyDiffMapping').mockImplementation(() => {
            const map = new Map<string, string>();
            map.set('1', '1');
            return map;
        });
        jest.spyOn(ExploreCachingService, 'updateKeysInResponse').mockImplementation();

        service.getData$(widgetDataRequest, false, DataRequestConstants.DATA_REQUEST_URL.BASE).subscribe(() => {
            expect(service.requestDataFromServer$).not.toHaveBeenCalled();
            expect(exploreCachingServiceStub.getDataFromCache$).toHaveBeenCalled();
            expect(ExploreCachingService.getColumnKeyDiffMapping).toHaveBeenCalled();
            expect(ExploreCachingService.updateKeysInResponse).toHaveBeenCalled();
            done();
        });
    });

    it('getData - load all Reports', (done: any) => {
        jest.resetAllMocks();
        widgetDataRequest.hardRefresh = false;
        widgetDataRequest.widgetId = 12345;
        widgetDataRequest['cacheKey'] = 'cacheKey6';
        jest.spyOn(service, 'requestDataFromServer$');
        jest.spyOn(exploreCachingServiceStub, 'getDataFromCache$').mockImplementation(() => {
            return of({originalColumns: [], data: {}});
        });
        jest.spyOn(ExploreCachingService, 'getColumnKeyDiffMapping').mockImplementation(() => {
            const map = new Map<string, string>();
            map.set('1', '1');
            return map;
        });

        // pass omit data flag as true
        service.getData$(widgetDataRequest, false, DataRequestConstants.DATA_REQUEST_URL.BASE, false, true).subscribe(() => {
            expect(ExploreDataRequestService.widgetRequestMap.size).toEqual(0);
            expect(service.requestDataFromServer$).not.toHaveBeenCalled();
            expect(exploreCachingServiceStub.getDataFromCache$).toHaveBeenCalled();
            expect(widgetDataRequest.requestParams[0].dataFormat).toEqual(DataRequestConstants.DATA_FORMAT.NO_DATA);
            done();
        });
    });


    it('clear data from cache', () => {
        jest.resetAllMocks();
        jest.spyOn(exploreCachingServiceStub, 'deleteDataFromCache');
        service.clearDataFromCache(widgetDataRequest);
        expect(exploreCachingServiceStub.deleteDataFromCache).toHaveBeenCalledWith(widgetDataRequest);
    });

    it('requestDataFromServer$ - success scenario', (done: any) => {
        BatchExportingStore.init();
        jest.restoreAllMocks();
        widgetDataRequest.isBatchExport = true;
        widgetDataRequest.widgetId = 12345;
        widgetDataRequest.reportTitle = 'Report 1';
        widgetDataRequest.widgetTitle = 'Risk and Exposure';
        widgetDataRequest.workspaceTitle = 'RSP Ticket';
        widgetDataRequest.workspaceOwner = '_Admin';
        widgetDataRequest['cacheKey'] = 'cacheKey5';
        jest.spyOn(exploreCachingServiceStub, 'addDataToCache').mockImplementation();
        jest.spyOn(service, 'removeRequestFromInProgress');
        jest.spyOn(httpToBmsServiceStub, 'post$').mockImplementation(() => {
            return of({});
        });

        service.requestDataFromServer$(widgetDataRequest.requestParams[0], widgetDataRequest, DataRequestConstants.DATA_REQUEST_URL.BASE).subscribe(() => {
            expect(httpToBmsServiceStub.post$).toHaveBeenCalled();
            expect(service.removeRequestFromInProgress).toHaveBeenCalled();
            expect(exploreCachingServiceStub.addDataToCache).toHaveBeenCalled();
            done();
        });
    });

    it('requestDataFromServer$ - error scenario', (done: any) => {
        jest.restoreAllMocks();
        widgetDataRequest.isBatchExport = true;
        widgetDataRequest.widgetId = 12345;
        widgetDataRequest.reportTitle = 'Report 1';
        widgetDataRequest.widgetTitle = 'Risk and Exposure';
        widgetDataRequest.workspaceTitle = 'RSP Ticket';
        widgetDataRequest.workspaceOwner = '_Admin';
        widgetDataRequest['cacheKey'] = 'cacheKey5';
        jest.spyOn(service, 'removeRequestFromInProgress');
        jest.spyOn(httpToBmsServiceStub, 'post$').mockImplementation(() => {
            return throwError('');
        });

        service.requestDataFromServer$(widgetDataRequest.requestParams[0], widgetDataRequest, DataRequestConstants.DATA_REQUEST_URL.BASE).subscribe(() => {
        }, error => {
            expect(httpToBmsServiceStub.post$).toHaveBeenCalled();
            expect(service.removeRequestFromInProgress).toHaveBeenCalled();
            done();
        });
    });

    it('getData - from cache for exportRequest', (done: any) => {
        BatchExportingStore.init();
        jest.resetAllMocks();
        widgetDataRequest.isBatchExport = true;
        widgetDataRequest.hardRefresh = false;
        widgetDataRequest.widgetId = 12345;
        const loadingStatus = new BehaviorSubject(true);
        BatchExportingStore.widgetLoadingStatusMap.set(12345, loadingStatus);
        widgetDataRequest['cacheKey'] = 'cacheKey4';
        jest.spyOn(service, 'requestDataFromServer$');
        jest.spyOn(exploreCachingServiceStub, 'getDataFromCache$').mockImplementation(() => {
            return of({originalColumns: [], data: {}});
        });
        jest.spyOn(ExploreCachingService, 'getColumnKeyDiffMapping').mockImplementation(() => {
            const map = new Map<string, string>();
            map.set('1', '1');
            return map;
        });
        jest.spyOn(ExploreCachingService, 'updateKeysInResponse').mockImplementation();

        service.getData$(widgetDataRequest, false, DataRequestConstants.DATA_REQUEST_URL.BASE).subscribe(() => {
            expect(BatchExportingStore.widgetLoadingStatusMap.get(12345)).toBeFalsy();
            expect(loadingStatus.getValue()).toBeFalsy();
            done();
        });
    });

    it('getData - from cache for exportRequest with no widgetLoadingStatus', (done: any) => {
        BatchExportingStore.init();
        BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.LOADING);
        jest.resetAllMocks();
        widgetDataRequest.isBatchExport = true;
        widgetDataRequest.hardRefresh = false;
        widgetDataRequest.widgetId = 12345;
        const loadingStatus = new BehaviorSubject(true);
        BatchExportingStore.widgetLoadingStatusMap = new Map<number, BehaviorSubject<boolean>>();
        BatchExportingStore.widgetLoadingStatusMap.set(56789, loadingStatus);
        widgetDataRequest['cacheKey'] = 'cacheKey4';
        jest.spyOn(service, 'requestDataFromServer$');
        jest.spyOn(exploreCachingServiceStub, 'getDataFromCache$').mockImplementation(() => {
            return of({originalColumns: [], data: {}});
        });
        jest.spyOn(ExploreCachingService, 'getColumnKeyDiffMapping').mockImplementation(() => {
            const map = new Map<string, string>();
            map.set('1', '1');
            return map;
        });
        jest.spyOn(ExploreCachingService, 'updateKeysInResponse').mockImplementation();

        service.getData$(widgetDataRequest, false, DataRequestConstants.DATA_REQUEST_URL.BASE).subscribe(() => {
            expect(BatchExportingStore.widgetLoadingStatusMap.get(12345)).toBeFalsy();
            expect(BatchExportingStore.widgetLoadingStatusMap.get(56789)).toBeTruthy();
            expect(loadingStatus.getValue()).toBeTruthy();
            expect(BatchExportingStore.getBatchContainerStatus()).toEqual(BatchContainerStatus.LOADING);
            done();
        });
    });

    it('getData - hard refresh with debug Context', (done: any) => {
        jest.resetAllMocks();
        widgetDataRequest.widgetId = 12345;
        widgetDataRequest['cacheKey'] = 'cacheKey10';
        widgetDataRequest.hardRefresh = true;
        widgetDataRequest.debugContext = true;
        jest.spyOn(service, 'requestDataFromServer$').mockImplementation(() => {
            return of('');
        });
        jest.spyOn(exploreCachingServiceStub, 'deleteDataFromCache');
        jest.spyOn(exploreCachingServiceStub, 'getDataFromCache$');

        service.getData$(widgetDataRequest, false, DataRequestConstants.DATA_REQUEST_URL.BASE).subscribe(() => {
            expect(service.requestDataFromServer$).toHaveBeenCalledWith(widgetDataRequest.requestParams[0], expect.anything(), DataRequestConstants.DATA_REQUEST_URL.BASE);
            expect(exploreCachingServiceStub.deleteDataFromCache).toHaveBeenCalled();
            expect(exploreCachingServiceStub.getDataFromCache$).not.toHaveBeenCalled();
            done();
        });
    });

});

