import {TestBed} from '@angular/core/testing';
import {Observable, of, Subject, throwError} from 'rxjs';

import {WorkspaceService} from './workspace.service';
import {WorkspaceStore} from '../../../stores';
import {WorkpadService} from './workpad.service';
import {FavoriteService, NotificationService, PortfolioService} from '..';
import {Workspace} from '@models/workspace/workspace.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import * as portMock from '../../../../../mocks/portMock.json';
import * as workspaceMock from '../../../../../mocks/workspaceMock.json';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {
    AlertConstants,
    CoreUserMetaDataStore,
    DateService,
    DateValue,
    ErrorTypeConstants,
    ExploreDialogParam, UIErrorParameters,
    UserMetaData
} from '@blk/explore-ui-core';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Report} from '@models/workspace/report.model';

describe('WorkspaceService', () => {
    let service: WorkspaceService;
    let workspace: Workspace;

    const favoriteServiceStub = {
        getFavorite$: jest.fn((): Observable<any> => {
            return of(workspace);
        })
    };

    const workpadServiceStub = {
        createFlatWorkpad: jest.fn(),
        fetchAllPortfolios$: jest.fn(() => {
            return of([portMock]);
        })
    };

    const notificationServiceStub = {
        invokeWidgetReloadPrompt: jest.fn(),
        openDialog: jest.fn(),
        warning: jest.fn()
    };

    const dateService = {
        parseDateString$: jest.fn(),
        midNightRefresh$: new Subject()
    };

    const portfolioServiceStub = {
        setPortfolioTitle: jest.fn(),
        fetchPortfolioInformation$: jest.fn((): Observable<any> => {
            return of(new Portfolio('PEP--HP', null, false, 'Perf Benchmark for PEP-AU'));
        })
    };

    beforeAll(() => {
        WorkspaceStore.init();
    });

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: WorkpadService, useValue: workpadServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: DateService, useValue: dateService},
                {provide: PortfolioService, useValue: portfolioServiceStub}
            ]
        });
        service = TestBed.inject(WorkspaceService);
        workspace = new Workspace(workspaceMock);

        jest.spyOn(WorkspaceStore, 'validateWorkpadAndUpdate').mockImplementation((workpad, portfolio, report) => WorkspaceStore.updateCurrentWorkpad(workpad, portfolio, report));
    });

    it('Test refreshWorkspaceDates', () => {
        const workpad1 = new FlatWorkpad();
        workpad1.portfolio = new Portfolio('PEP', new DateValue({
            calCode: 'TEST',
            dateString: true,
            dateStringValue: 'T-1'
        }));

        const workpad2 = new ReportGroup();
        workpad2.addPortfolios(new Portfolio('PEP', new DateValue({
            calCode: 'TEST',
            dateString: false,
            date: '05/25/2020'
        })));

        jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValueOnce({workpads: [workpad1, workpad2]});
        dateService.parseDateString$.mockReturnValueOnce(of(new Date()));
        service.refreshWorkspaceDates();
        expect(dateService.parseDateString$).toHaveBeenCalled();
    });

    describe('initializeWorkspaceFromIntro Test', () => {
        it('should initialize workspace by adding workpad, and update current object not more than once', () => {
            jest.spyOn(service['workpadService'], 'createFlatWorkpad');
            jest.spyOn(WorkspaceStore, 'getWorkspace');
            jest.spyOn(WorkspaceStore, 'updateWorkspace');
            jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad');
            jest.spyOn(WorkspaceStore, 'updateCurrentPortfolio');
            jest.spyOn(WorkspaceStore, 'updateCurrentReport');

            const portfolio = new Portfolio('PEP');
            service.initializeWorkspaceFromIntro(portfolio);

            expect(service['workpadService'].createFlatWorkpad).toHaveBeenCalledWith(portfolio);
            expect(WorkspaceStore.getWorkspace).toHaveBeenCalled();
            expect(WorkspaceStore.updateWorkspace).toHaveBeenCalledTimes(1);
            expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalledTimes(1);
            expect(WorkspaceStore.updateCurrentPortfolio).toHaveBeenCalledTimes(1);
            expect(WorkspaceStore.updateCurrentReport).toHaveBeenCalledTimes(1);
        });
    });

    describe('loadFavoriteWorkspace Test', () => {
        it('should call initialize workspace from favorite with the response from getFavorite$', () => {
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            jest.spyOn(service, 'initializeWorkspaceFromFavorite' as any);

            service.loadFavoriteWorkspace(1719479, 'Loading Favorite Workspace');

            expect(service['initializeWorkspaceFromFavorite']).toHaveBeenCalledWith(workspace);
        });

        it('should show broken workspace error when getFavorite$ throws error', () => {
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            jest.spyOn(service['favoriteService'], 'getFavorite$').mockReturnValue(throwError('error'));
            jest.spyOn(service, 'initializeWorkspaceFromFavorite' as any);
            jest.spyOn(service['notificationService'], 'openDialog');
            jest.spyOn(WorkspaceStore, 'newWorkspace');
            service.loadFavoriteWorkspace(1719479, 'Loading Favorite Workspace');
            expect(service['initializeWorkspaceFromFavorite']).not.toHaveBeenCalled();
            expect(WorkspaceStore.newWorkspace).toHaveBeenCalled();
            expect(service['notificationService'].warning).toHaveBeenCalledWith(AlertConstants.BODY.BROKEN_WORKSPACE_FORMAT, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_WARNING, true);
        });

        it('Test initializeWorkspaceFromFavorite - should show broken workspace error when workspace is null', () => {
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            jest.spyOn(WorkspaceStore, 'newWorkspace');
            jest.spyOn(service['notificationService'], 'openDialog');
            jest.spyOn(service['favoriteService'], 'getFavorite$').mockReturnValue(of(null));
            service.loadFavoriteWorkspace(1719479, 'Loading Favorite Workspace');
            expect(service['notificationService'].warning).toHaveBeenCalledWith(AlertConstants.BODY.WORKSPACE_NOT_EXIST, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_WARNING, true);
            expect(WorkspaceStore.newWorkspace).toHaveBeenCalled();
        });

        describe('initializeWorkspaceFromFavorite Test', () => {
            it('should update the portfolio(s) of the first workpad and then update current objects not more than once', () => {
                const defaultWorkpad = workspace.workpads[0] as FlatWorkpad;
                expect(defaultWorkpad.portfolio.portName).toBe('PEP');
                expect(defaultWorkpad.portfolio.fullName).toBeUndefined();
                jest.spyOn(WorkspaceStore, 'updateWorkspace').mockClear();
                jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad').mockClear();
                jest.spyOn(WorkspaceStore, 'updateCurrentPortfolio').mockClear();
                jest.spyOn(WorkspaceStore, 'updateCurrentReport').mockClear();

                service['initializeWorkspaceFromFavorite'](workspace);

                expect(defaultWorkpad.portfolio.fullName).toBe('BGF Pacific Equity Fund');
                expect(WorkspaceStore.updateWorkspace).toHaveBeenCalledTimes(1);
                expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalledTimes(1);
                expect(WorkspaceStore.updateCurrentReport).toHaveBeenCalledTimes(1);
                expect(WorkspaceStore.updateCurrentPortfolio).toHaveBeenCalledTimes(1);
            });

            it('should update the current workpad - if the first portfolio has no perms', () => {
                jest.spyOn(service['workpadService'], 'fetchAllPortfolios$').mockReturnValue(throwError('error'));
                jest.spyOn(service['notificationService'], 'openDialog');
                jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad').mockClear();
                jest.spyOn(WorkspaceStore, 'updateCurrentReport').mockClear();
                service['initializeWorkspaceFromFavorite'](workspace);
                expect(service['notificationService'].openDialog).toHaveBeenCalledWith(new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT,
                    AlertConstants.HEADER.PORT_INFO_MISSING,
                    AlertConstants.BODY.PORT_INFO_MISSING,
                    AlertConstants.BTN.OK));
                expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalledTimes(1);
                expect(WorkspaceStore.updateCurrentReport).toHaveBeenCalledTimes(1);
            });

            it('should show broken workspace error message if no portfolio is present in the workspace', () => {
                jest.spyOn(service['workpadService'], 'fetchAllPortfolios$').mockReturnValue(of([]));
                jest.spyOn(service['notificationService'], 'openDialog');
                service['initializeWorkspaceFromFavorite'](workspace);
                expect(service['notificationService'].warning).toHaveBeenCalledWith(AlertConstants.BODY.BROKEN_WORKSPACE_FORMAT, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_FETCH_ALL_PORTFOLIOS_WARNING, true);
            });
        });
    });

    describe('loadPortfolioAndCreateWorkspace Test', () => {
        it('should fetchPortfolioInformation and then initializeWorkspaceFromIntro', async () => {
            jest.spyOn(service, 'initializeWorkspaceFromIntro');
            await service.loadPortfolioAndCreateWorkspace(new Portfolio('PEP', new DateValue()));

            expect(service.initializeWorkspaceFromIntro).toHaveBeenCalled();
        });

        it('should open dialog with alert if error occured while fetching portfolio information', async () => {
            jest.spyOn(service['portfolioService'], 'fetchPortfolioInformation$').mockReturnValue(throwError('error'));
            jest.spyOn(service['notificationService'], 'openDialog');
            await service.loadPortfolioAndCreateWorkspace(new Portfolio('PEP', new DateValue()));

            expect(service['notificationService'].openDialog).toHaveBeenCalledWith(new ExploreDialogParam(
                AlertConstants.TYPE.ALERT,
                AlertConstants.HEADER.PORT_INFO_MISSING,
                AlertConstants.BODY.PORT_INFO_MISSING,
                AlertConstants.BTN.OK
            ));
        });
    });

    describe('loadFavoriteReportWithUrl Test', () => {
        it('should create a workpad and then add portfolio into it and add favorite reports', async () => {
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            CoreUserMetaDataStore.userMetaData.access = true;
            CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
            CoreUserMetaDataStore.userMetaData.launchApps = ['SECURITY_MASTER', 'ANSER', 'ALADDIN_VIEW'];
            CoreUserMetaDataStore.userMetaData.login = 'seakim';
            CoreUserMetaDataStore.userMetaData.globalFavPerms = true;
            CoreUserMetaDataStore.userMetaData.perfDataPerms = true;
            CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;
            const favoriteReport = new Report('favorite report');
            const workpad = new FlatWorkpad();
            jest.spyOn(service['favoriteService'], 'getFavorite$').mockReturnValue(of(favoriteReport));
            jest.spyOn(WorkspaceStore, 'addWorkpads');
            jest.spyOn(workpad, 'addPortfolios');
            jest.spyOn(workpad,'addReports');
            jest.spyOn(WorkspaceStore, 'updateWorkspace');

            service.loadFavoriteReportWithUrl(['123456'], new Portfolio('PEP'));
            expect(WorkspaceStore.getCurrentWorkpad().reports.length).toBe(1);
        });
    });
});
