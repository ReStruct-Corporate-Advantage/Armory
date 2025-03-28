import {TestBed} from '@angular/core/testing';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WidgetServiceRegistry} from '@services/widget/widget-service-registry';
import {PortfolioService} from '@services/portfolio/portfolio.service';
import {LoadAllService} from './load-all.service';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {WorkspaceStore} from '@stores/workspace.store';
import {Workspace} from '@models/workspace/workspace.model';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {Http2BmsService} from '@services/bms';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import * as workspaceMock from '../../../../../mocks/workspaceMock.json';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {LoadAllRequestQueue} from '@models/load-all/load-all-request-queue.model';
import {LoadAllDataRequest} from '@models/load-all/load-all-data-request.model';
import {LoadAllTracker} from '@models/load-all/load-all-tracker.model';
import {AppStore} from '../../../app.store';
import {PortfolioLoadingStatus} from '@interfaces/portfolio-loading-status.interface';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {CoreDefinitionStore, TokenConstants, WidgetConfigType} from '@blk/explore-ui-core';
import {LookThroughSettings} from '@blk/explore-ui-look-through-settings';

/**
 * Tests for LoadAllService
 */
describe('LoadAllService', () => {
    let loadAllService: LoadAllService;
    let workspace: Workspace;

    const portfolioServiceStub = {
        fetchPortfolioInformation$: jest.fn(
            (): Observable<any> => {
                const port = new Portfolio('PEP');
                port.portId = 'PEP12345';
                return of(port);
            }
        )
    };

    const riskAndExposureServiceMock = {
        extractDataAndStore: jest.fn(),
        getWidgetConfigTypes: jest.fn(() => [WidgetConfigType.RISK_EXPOSURE])
    };

    beforeAll(() => {
        AppStore.loadAllRequestSubject$ = new Subject<{widget: Widget; port: Portfolio}>();
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                Http2BmsService,
                {provide: PortfolioService, useValue: portfolioServiceStub},
                {
                    provide: AbstractWidgetService,
                    useValue: riskAndExposureServiceMock,
                    deps: [Http2BmsService],
                    multi: true
                },
                {provide: WidgetServiceRegistry, useClass: WidgetServiceRegistry}
            ]
        });
        loadAllService = TestBed.inject(LoadAllService);
        jest.spyOn(WorkspaceStore, 'validateWorkpadAndUpdate').mockImplementation((workpad, portfolio, report) => WorkspaceStore.updateCurrentWorkpad(workpad, portfolio, report));
        WorkspaceStore.init();
        workspace = new Workspace(workspaceMock);
        WorkspaceStore.updateWorkspace(workspace);
        WorkspaceStore.getCurrentReport().widgets.push(new Widget());
        WorkspaceStore.portfolioLoadingStatusMap = new Map<string, BehaviorSubject<PortfolioLoadingStatus>>();
    });

    it('should be created', () => {
        expect(loadAllService).toBeTruthy();
    });

    describe('initiateLoadAllProcess test', () => {

        it('should set loadAllInProgress flag to false if there are no widgets', () => {
            jest.spyOn<any, string>(loadAllService, 'addRequestsToUnprocessedQueue$').mockReturnValue(of([]));
            jest.spyOn<any, string>(loadAllService, 'moveTheRequestsToInProgress');
            loadAllService.initiateLoadAllProcess(workspace);
            expect(loadAllService['moveTheRequestsToInProgress']).not.toHaveBeenCalled();
            expect(LoadAllService.loadAllInProgress).toBeFalsy();
        });

        it('should call addRequestsToUnprocessedQueue$ and then moveTheRequestsToInProgress', () => {
            const port = new Portfolio('PEP');
            port.portId = 'PEP54321';
            WorkspaceStore.portfolioLoadingStatusMap.set(port.portId, new BehaviorSubject<PortfolioLoadingStatus>({isLoading: true}));
            jest.spyOn<any, string>(loadAllService, 'addRequestsToUnprocessedQueue$').mockReturnValue(of([port]));
            jest.spyOn<any, string>(loadAllService, 'moveTheRequestsToInProgress');
            loadAllService.initiateLoadAllProcess(workspace);
            expect(loadAllService['addRequestsToUnprocessedQueue$']).toHaveBeenCalled();
            expect(loadAllService['moveTheRequestsToInProgress']).toHaveBeenCalled();
        });
    });

    describe('addRequestsToUnprocessedQueue$ test', () => {
        it('should expect the total number and unProcessedRequestNumber to be expectedWidgetCount and inProgressRequestCounter and completion percentage to be 0', () => {
            jest.spyOn(WorkspaceStore.portfolioLoadingStatusMap, 'get').mockReturnValue(new BehaviorSubject<PortfolioLoadingStatus>({isLoading: true}));
            loadAllService['addRequestsToUnprocessedQueue$'](workspace);
            expect(WorkspaceStore.portfolioLoadingStatusMap.get).not.toHaveBeenCalled();
            expect(LoadAllService['loadAllRequestQueue'].loadAllTracker.inProgressRequestCounter).toBe(0);
            expect(loadAllService['getCompletionPercentage']()).toBe(100);
        });

        it('should skip portfolio with lookthrough enabled', () => {
            (workspace.workpads[0] as FlatWorkpad).portfolio.lookthroughSettings = new LookThroughSettings();
            (workspace.workpads[0] as FlatWorkpad).portfolio.lookthroughSettings.isLookThroughEnabled = true;
            loadAllService['addRequestsToUnprocessedQueue$'](workspace).subscribe((data) => {
                expect(data.length).toBe(0);
            });
        });

        it('should skip current report', () => {
            loadAllService['addRequestsToUnprocessedQueue$'](workspace).subscribe((data) => {
                expect(data.length).toBe(0);
            });
        });

        it('should get no workpadPortfolios if not in compare mode', () => {
            jest.spyOn(WorkspaceStore.portfolioLoadingStatusMap, 'get').mockReturnValue(new BehaviorSubject<PortfolioLoadingStatus>({isLoading: false}));
            const report2 = new Report();
            report2.widgets = [new Widget(), new Widget()];
            workspace.workpads[0].reports.push(report2);
            (workspace.workpads[0] as FlatWorkpad).portfolio.lookthroughSettings.isLookThroughEnabled = false;
            jest.spyOn<any, string>(loadAllService, 'addRequestsToUnprocessedQueue$').mockRestore();
            loadAllService['addRequestsToUnprocessedQueue$'](workspace).subscribe((data) => {
                expect(data.length).toBe(1);
            });
            expect(LoadAllService['loadAllRequestQueue'].unprocessedRequestQueue.length).toBe(2);
            expect(LoadAllService['loadAllRequestQueue'].unprocessedRequestQueue[0].workpadPortfolios).toBeUndefined();
        });

        it('Should return if there are no widgets found', () => {
            // Create a new queue
            LoadAllService['loadAllRequestQueue'] = new LoadAllRequestQueue();
            // Create a dummy workspace
            const emptyWorkspace = new Workspace();
            loadAllService['addRequestsToUnprocessedQueue$'](emptyWorkspace).subscribe(
                () => {},
                (payload: any) => {
                    expect(payload).toBeNull();
                }
            );
        });
    });

    describe('moveTheRequestsToInProgress test', () => {
        beforeAll(() => {
            // Mock the requestLimit token to 5
            CoreDefinitionStore.tokens[TokenConstants.LOAD_ALL_REQUEST_LIMIT] = 5;
            const report = new Report();
            const widget1 = new Widget();
            widget1.id = 123;
            widget1.configType = WidgetConfigType.RISK_EXPOSURE;
            const widget2 = new Widget();
            widget2.id = 456;
            report.widgets = [widget1, widget2];
            WorkspaceStore.currentReport$ = new BehaviorSubject<Report>(report);
            const port = new Portfolio('PEP');
            port.portId = 'PEP2345';
            WorkspaceStore.portfolioLoadingStatusMap.set(port.portId, new BehaviorSubject<PortfolioLoadingStatus>({isLoading: true}));
            port.loadAllTracker = new LoadAllTracker();
            WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(port);

            const request1 = new LoadAllDataRequest(
                WorkspaceStore.getCurrentPortfolio(),
                WorkspaceStore.getCurrentReport(),
                WorkspaceStore.getCurrentReport().widgets[0]
            );
            const request2 = new LoadAllDataRequest(
                WorkspaceStore.getCurrentPortfolio(),
                WorkspaceStore.getCurrentReport(),
                WorkspaceStore.getCurrentReport().widgets[1]
            );
            LoadAllService['loadAllRequestQueue'] = new LoadAllRequestQueue();
            LoadAllService['loadAllRequestQueue'].unprocessedRequestQueue = [request1, request2];
            jest.spyOn<any, string>(loadAllService, 'processInProgressRequest').mockImplementation(_a => {});
            jest.spyOn<any, string>(loadAllService, 'moveTheRequestsToInProgress').mockRestore();
            loadAllService['moveTheRequestsToInProgress']();
        });

        it('should move request from unprocessed to inProgress', () => {
            expect(LoadAllService['loadAllRequestQueue'].unprocessedRequestQueue.length).toBe(0);
            expect(LoadAllService['loadAllRequestQueue'].loadAllTracker.inProgressRequestCounter).toBe(2);
        });

        it('should process inProgressRequest', () => {
            expect(loadAllService['processInProgressRequest']).toHaveBeenCalled();
        });
    });

    describe('processInProgressRequest test', () => {
        it('should not call extractDataAndStore if widgetDataService undefined', () => {
            const requestWrong = new LoadAllDataRequest(
                WorkspaceStore.getCurrentPortfolio(),
                WorkspaceStore.getCurrentReport(),
                WorkspaceStore.getCurrentReport().widgets[1],
                []
            );
            loadAllService['processInProgressRequest'](requestWrong);
            expect(riskAndExposureServiceMock['extractDataAndStore']).not.toHaveBeenCalled();
        });

        it('processInProgressRequest should call extractDataAndStore with correct parameters', () => {
            LoadAllService['loadAllRequestQueue'] = new LoadAllRequestQueue();
            const workpadPortfolios = [new Portfolio()];
            const portfolio = new Portfolio();
            const report = new Report();
            const widget = new Widget();
            widget.configType = WidgetConfigType.RISK_EXPOSURE;
            const request = new LoadAllDataRequest(
                portfolio,
                report,
                widget,
                workpadPortfolios
            );

            jest.spyOn<any, string>(loadAllService, 'processInProgressRequest').mockRestore();
            loadAllService['processInProgressRequest'](request);
            expect(riskAndExposureServiceMock['extractDataAndStore']).toHaveBeenCalledWith({widget, portfolio, report, allPortfolios: workpadPortfolios, omitData: true});
        });

        it('should processInProgressRequest and then decrementInProgressRequestCounter and moveTheRequestsToInProgress', () => {
            LoadAllService['loadAllRequestQueue'] = new LoadAllRequestQueue();
            jest.spyOn(LoadAllService['loadAllRequestQueue'].loadAllTracker, 'decrementInProgressRequestCounter');
            jest.spyOn<any>(loadAllService, 'moveTheRequestsToInProgress');
            const portfolio = WorkspaceStore.getCurrentPortfolio();
            const report = WorkspaceStore.getCurrentReport();
            const widget = report.widgets[0];
            const request = new LoadAllDataRequest(
                portfolio,
                report,
                widget,
                []
            );
            request.portfolio.loadAllTracker = new LoadAllTracker();
            AppStore.loadAllRequestSubject$.next({widget, port: portfolio});
            loadAllService['processInProgressRequest'](request);
            expect(riskAndExposureServiceMock['extractDataAndStore']).toHaveBeenCalled();

            jest.spyOn(portfolio.loadAllTracker, 'decrementInProgressRequestCounter');
            jest.spyOn(portfolio.loadAllTracker, 'isLoadAllInProgress').mockReturnValue(false);
            jest.spyOn(WorkspaceStore.portfolioLoadingStatusMap, 'get').mockReturnValue(new BehaviorSubject<PortfolioLoadingStatus>({isLoading: true}));
            loadAllService['loadAllRequestCompletedCallback'](widget, portfolio);
            expect(WorkspaceStore.portfolioLoadingStatusMap.get).toHaveBeenCalledWith('PEP2345');
            expect(LoadAllService['loadAllRequestQueue'].loadAllTracker.decrementInProgressRequestCounter).toHaveBeenCalled();
            expect(portfolio.loadAllTracker.decrementInProgressRequestCounter).toHaveBeenCalled();
            expect(loadAllService['moveTheRequestsToInProgress']).toHaveBeenCalled();

            LoadAllService.loadAllInProgress = true;
            jest.spyOn<any>(loadAllService, 'getCompletionPercentage').mockReturnValue(100);
            jest.spyOn(LoadAllService['loadAllRequestQueue'].loadAllTracker, 'resetTotalRequestCount');
            jest.spyOn(portfolio.loadAllTracker, 'resetTotalRequestCount');
            loadAllService['loadAllRequestCompletedCallback'](widget, portfolio);
            expect(LoadAllService.loadAllInProgress).toBeFalsy();
            expect(LoadAllService['loadAllRequestQueue'].loadAllTracker.resetTotalRequestCount).toHaveBeenCalled();
            expect(portfolio.loadAllTracker.resetTotalRequestCount).toHaveBeenCalled();
        });
    });
});
