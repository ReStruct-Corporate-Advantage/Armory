import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CommonUtils} from '@blk/explore-ui-core';
import {Observable, of, throwError} from 'rxjs';
import {async as _async} from 'rxjs/internal/scheduler/async';
import {cloneDeep} from 'lodash';
import {AddPortfolioModalComponent} from './add-portfolio-modal.component';
import {
    ExplorePortfolioSearchService,
    Http2BmsService,
    NotificationService,
    PortfolioService,
    WorkpadService
} from '@services/index';
import {WorkspaceStore} from '@stores/index';
import {AddPortfolioService} from './add-portfolio.service';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {Workspace} from '@models/workspace/workspace.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Security} from '@interfaces/security.interface';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {IndexSearchTreeItem} from '@models/portfolio/index-search-tree-item.model';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {NewSecurityHoldingChange} from '@models/portfolio/composition/new-security-holding-change.model';
import {AddCustomPortfolioComponent} from './add-custom-portfolio/add-custom-portfolio.component';
import {PortfolioType} from './portfolio-type.enum';

describe('AddPortfolioModalComponent', () => {
    let component: AddPortfolioModalComponent;
    let fixture: ComponentFixture<AddPortfolioModalComponent>;

    const addPortfolioServiceStub = {
        selectedPortfolioTickers: new Set<PortfolioSearchItem|IndexSearchTreeItem|AdhocPortParams>(),
        reportGroupList: [],
        checkedReportGroupList: [],
        selectedSecurities: new Map<string, Security>(),
        adhocPortfoliosList: new Map<AdhocPortParams, Map<string, Security>>(),
        clear: jest.fn()
    };
    const portfolioSearchServiceStub = {
        searchPortfolio: jest.fn((): Observable<any> => {
            return of({
                searchResults: [
                    {
                        code: '9214',
                        currency: 'USD',
                        familyTree: [],
                        fullName: 'BGF Pacific Equity Fund',
                        ticker: 'PEP'
                    }, {
                        code: '-74272',
                        currency: 'USD',
                        familyTree: [],
                        fullName: 'Perf Benchmark for PEP-AU',
                        ticker: 'PEP--HP'
                    }, {
                        code: '-551466',
                        currency: 'USD',
                        familyTree: [],
                        fullName: '1885 PRIVATE OPPORTUNITIES FUND, L.P.',
                        ticker: 'PEP-1885'
                    }
                ]
            });
        })
    };

    const adhocPort = new AdhocPortfolio('CP1');
    adhocPort.holdingChanges = [new NewSecurityHoldingChange({
        analyticsId: '-9999993873023246',
        changeInCurrentFace: 0,
        changeInDeltaAdjNotional: 0,
        changeInMarketValue: 10,
        changeInNotionalMarketValue: 10,
        changeInParValue: 0,
        changeInQuantity: 7.373106408023497,
        changeInWeight: 1,
        changeInWeightRelativeToMainPort: 1,
        isNavNeutral: true,
        isValid: true,
        lineItem: '037833100',
        newMarketValue: 10,
        newNotionalMarketValue: 10,
        newQuantity: 7.373106408023497,
        newWeight: 1,
        portfolioName: 'CP1',
        requiresBenchData: false,
        secDesc: 'APPLE INC',
        tradeSize: 1
    })];
    adhocPort.portId = 'CP1-0.999999';

    const portfolioServiceStub = {
        fetchPortfolioInformation$: jest.fn((portfolio: Portfolio): Observable<any> => {
            if (portfolio.portName === 'PEP') {
                return of(new Portfolio('PEP'));
            } else if (portfolio.portName === 'Error') {
                return throwError(new Error('Mock error'));
            } else if (portfolio.portName === 'CP1') {
                return of(adhocPort);
            } else if (portfolio.portName === 'CP2') {
                return of (new AdhocPortfolio('CP2'));
            } else if (portfolio.portName === 'LEH_AGG' && portfolio.isIndexResearchPortfolio) {
                return of(new Portfolio('LEH_AGG'));
            } else {
                return of('Invalid Portfolio');
            }
        })
    };

    const http2BmsServiceStub = {
        get$: jest.fn(() => {
            return of({}, _async);
        })
    };

    const workpadServiceStub = {
        createFlatWorkpad: jest.fn((port: Portfolio): FlatWorkpad => {
            const flatWorpad = new FlatWorkpad();
            flatWorpad.portfolio = port;
            return flatWorpad;
        })
    };

    const notificationServiceStub = {
        error: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                AddPortfolioModalComponent,
                AddCustomPortfolioComponent
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ExplorePortfolioSearchService, useValue: portfolioSearchServiceStub},
                {provide: PortfolioService, useValue: portfolioServiceStub},
                {provide: Http2BmsService, useValue: http2BmsServiceStub},
                {provide: AddPortfolioService, useValue: addPortfolioServiceStub},
                {provide: WorkpadService, useValue: workpadServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub}
            ]
        });

        fixture = TestBed.createComponent(AddPortfolioModalComponent);
        component = fixture.componentInstance;
        component.customPortfolio = TestBed.createComponent(AddCustomPortfolioComponent).componentInstance;
    });

    describe('closeModal Test', () => {
        it('should close modal', () => {
            component.isOpen = true;
            jest.spyOn(component['addPortfolioService'], 'clear');
            jest.spyOn(component.modalClosed, 'emit');

            component.closeModal();
            expect(component.isOpen).toBeFalsy();
            expect(component['addPortfolioService'].clear).toHaveBeenCalled();
            expect(component.modalClosed.emit).toHaveBeenCalled();
        });
    });

    describe('onAddPortfolioToWorkspace Test', () => {
        beforeEach(() => {
            WorkspaceStore.init();
            component.ngOnInit();
        });

        describe('addExistingPortfoliosToWorkspace tests', () => {
            it('should do nothing', () => {
                jest.spyOn(portfolioServiceStub, 'fetchPortfolioInformation$');
                component.addExistingPortfoliosToWorkspace();
                expect(portfolioServiceStub.fetchPortfolioInformation$).toHaveBeenCalledTimes(0);
            });

            it('should handle "invalid" ticker in fetchPortfolioInformation', () => {
                component.selectedPortfolioTickers = new Set<PortfolioSearchItem|IndexSearchTreeItem|AdhocPortParams>();
                component.selectedPortfolioTickers.add(new PortfolioSearchItem('FAKE_TICKER'));

                component.addExistingPortfoliosToWorkspace();
                expect(WorkspaceStore.getWorkspace().workpads.length).toBe(0);
            });

            it('should handle error ticker in fetchPortfolioInformation', () => {
                component.selectedPortfolioTickers = new Set<PortfolioSearchItem|IndexSearchTreeItem|AdhocPortParams>();
                component.selectedPortfolioTickers.add(new PortfolioSearchItem('Error'));

                component.addExistingPortfoliosToWorkspace();
                expect(WorkspaceStore.getWorkspace().workpads.length).toBe(0);
            });

            it('should add PEP to new workpad, and check updating current object is getting called only once', fakeAsync(() => {
                jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad');
                jest.spyOn(WorkspaceStore, 'updateCurrentPortfolio');
                jest.spyOn(WorkspaceStore, 'updateCurrentReport');

                component.selectedPortfolioTickers = new Set<PortfolioSearchItem|IndexSearchTreeItem|AdhocPortParams>();
                component.selectedPortfolioTickers.add(new PortfolioSearchItem('PEP'));
                component.selectedPortfolioTickers.add(new IndexSearchTreeItem('LEH_AGG', 'LEH_AGG', []));
                component.addExistingPortfoliosToWorkspace().subscribe();
                tick();
                tick();
                expect(WorkspaceStore.getWorkspace().workpads.length).toBe(2);
                expect(WorkspaceStore.getWorkspace().workpads[0] instanceof FlatWorkpad).toBeTruthy();
                expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios().length).toBe(1);
                expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios()[0].portName).toBe('PEP');

                expect(WorkspaceStore.getWorkspace().workpads[1] instanceof FlatWorkpad).toBeTruthy();
                expect(WorkspaceStore.getWorkspace().workpads[1].getAllPortfolios().length).toBe(1);
                expect(WorkspaceStore.getWorkspace().workpads[1].getAllPortfolios()[0].portName).toBe('LEH_AGG');

                expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalledTimes(1);
                expect(WorkspaceStore.updateCurrentPortfolio).toHaveBeenCalledTimes(1);

                // updateCurrentReport is getting called from updateCurrentWorkpad only if report exists.
                // While updating current workpad, we don't have report (curated report) yet,
                // therefore, updateCurrentReport is not getting called at this point.
                expect(WorkspaceStore.updateCurrentReport).toHaveBeenCalledTimes(0);
            }));

            it('should add PEP to Report Group, and check updating current object is getting called only once', fakeAsync(() => {
                jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad').mockClear();
                jest.spyOn(WorkspaceStore, 'updateCurrentPortfolio').mockClear();
                jest.spyOn(WorkspaceStore, 'updateCurrentReport');

                component.selectedPortfolioTickers = new Set<PortfolioSearchItem|IndexSearchTreeItem|AdhocPortParams>();
                component.selectedPortfolioTickers.add(new PortfolioSearchItem('PEP'));

                // The following report groups satisfy all the conditions for the if statements
                // reportGroup1 is a reportGroup that exists in the workpad, gets renamed and gets a portfolio added to it
                const reportGroup1 = new ReportGroup();
                // reportGroup2 is a reportGroup that does not exist in the workpad and gets added to the workpad
                const reportGroup2 = new ReportGroup();
                // reportGroup3 is a reportGroup that exists in the workpad and does not get renamed
                const reportGroup3 = new ReportGroup();
                WorkspaceStore.workspace$.next(new Workspace());
                WorkspaceStore.getWorkspace().addWorkpads(cloneDeep(reportGroup1));
                WorkspaceStore.getWorkspace().addWorkpads(cloneDeep(reportGroup3));
                reportGroup1.title = 'RPG1';
                component.reportGroupList = [reportGroup1, reportGroup2, reportGroup3];
                component['addPortfolioService'].checkedReportGroupList = [reportGroup1];

                component.addExistingPortfoliosToWorkspace().subscribe();
                tick();
                tick();
                expect(WorkspaceStore.getWorkspace().workpads.length).toBe(3);
                expect(WorkspaceStore.getWorkspace().workpads[0] instanceof ReportGroup).toBeTruthy();
                expect(WorkspaceStore.getWorkspace().workpads[1] instanceof ReportGroup).toBeTruthy();
                expect(WorkspaceStore.getWorkspace().workpads[2] instanceof ReportGroup).toBeTruthy();
                const rpg1 = (WorkspaceStore.getWorkspace().workpads[0] as ReportGroup);
                const rpg2 = (WorkspaceStore.getWorkspace().workpads[1] as ReportGroup);
                const rpg3 = (WorkspaceStore.getWorkspace().workpads[1] as ReportGroup);
                expect(rpg1.title).toBe('RPG1');
                expect(rpg1.portfolios.length).toBe(1);
                expect(rpg1.portfolios[0].portName).toBe('PEP');
                expect(rpg2.title).toBe(new ReportGroup().title);
                expect(rpg2.portfolios.length).toBe(0);
                expect(rpg3.title).toBe(new ReportGroup().title);
                expect(rpg3.portfolios.length).toBe(0);

                expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalledTimes(1);
                expect(WorkspaceStore.updateCurrentPortfolio).toHaveBeenCalledTimes(1);

                // updateCurrentReport is getting called from updateCurrentWorkpad only if report exists.
                // While updating current workpad, we don't have report (curated report) yet,
                // therefore, updateCurrentReport is not getting called at this point.
                expect(WorkspaceStore.updateCurrentReport).toHaveBeenCalledTimes(0);
            }));
            it('should add PEP to Report Group which was passsed from add to group workflow', fakeAsync(() => {
                jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad').mockClear();
                jest.spyOn(WorkspaceStore, 'updateCurrentPortfolio').mockClear();
                jest.spyOn(WorkspaceStore, 'updateCurrentReport');

                component.selectedPortfolioTickers = new Set<PortfolioSearchItem|IndexSearchTreeItem|AdhocPortParams>();
                component.selectedPortfolioTickers.add(new PortfolioSearchItem('PEP'));
                WorkspaceStore.workspace$.next(new Workspace());
                component.reportGroup = new ReportGroup();
                component.reportGroup.title = 'RPG1';
                WorkspaceStore.getWorkspace().addWorkpads(component.reportGroup);

                component.addExistingPortfoliosToWorkspace().subscribe();
                tick();
                tick();
                expect(WorkspaceStore.getWorkspace().workpads.length).toBe(1);
                expect(WorkspaceStore.getWorkspace().workpads[0] instanceof ReportGroup).toBeTruthy();
                const rpg1 = (WorkspaceStore.getWorkspace().workpads[0] as ReportGroup);
                expect(rpg1.title).toBe('RPG1');
                expect(rpg1.portfolios.length).toBe(1);
                expect(rpg1.portfolios[0].portName).toBe('PEP');

                expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalledTimes(1);
                expect(WorkspaceStore.updateCurrentPortfolio).toHaveBeenCalledTimes(1);
            }));
        });

        describe('addCustomPortfolioToWorkspace tests', () => {
            it('should add custom portfolio CP1 to new workpad, and check updating current object is getting called only once', fakeAsync(() => {
                jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad').mockClear();
                jest.spyOn(WorkspaceStore, 'updateCurrentPortfolio').mockClear();
                jest.spyOn(WorkspaceStore, 'updateCurrentReport');
                jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockReturnValue('-0.999999');

                const adhocParams = new AdhocPortParams();
                adhocParams.name = 'CP1';
                adhocParams.fullName = 'CP Full Name';
                adhocParams.currency = 'USD';
                adhocParams.portMktNotional = 1000;
                component['addPortfolioService'].adhocPortfoliosList.set(adhocParams, adhocPort);
                component.selectedPortfolioTickers = new Set<PortfolioSearchItem|IndexSearchTreeItem|AdhocPortParams>();
                component.selectedPortfolioTickers.add(adhocParams);

                WorkspaceStore.init();
                addPortfolioServiceStub.checkedReportGroupList = [];
                component.portfolioType = PortfolioType.CUSTOM;
                jest.spyOn(component.customPortfolio, 'addCustomPortfolioToSelectedPortfolioList').mockReturnValue(of(adhocPort));
                component.addExistingPortfoliosToWorkspace().subscribe();
                tick();
                tick();
                expect(WorkspaceStore.getWorkspace().workpads.length).toBe(1);
                expect(WorkspaceStore.getWorkspace().workpads[0] instanceof FlatWorkpad).toBeTruthy();
                expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios().length).toBe(1);
                expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios()[0].portName).toBe('CP1');

                expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalledTimes(1);
                expect(WorkspaceStore.updateCurrentPortfolio).toHaveBeenCalledTimes(1);
                // updateCurrentReport is getting called from updateCurrentWorkpad only if report exists.
                // While updating current workpad, we don't have report (curated report) yet,
                // therefore, updateCurrentReport is not getting called at this point.
                expect(WorkspaceStore.updateCurrentReport).toHaveBeenCalledTimes(0);
            }));
        });
    });

    describe('isAddButtonEnabled tests', () => {
        it('should enable add button for portfolio and index tabs', () => {
            WorkspaceStore.init();
            component.ngOnInit();
            expect(component.isAddButtonEnabled()).toBe(false);
            component.selectedPortfolioTickers.add(new PortfolioSearchItem('PEP'));
            expect(component.isAddButtonEnabled()).toBe(true);
            component.portfolioType = PortfolioType.CUSTOM;
            component.customPortfolio.isAddButtonEnabled = true;
            expect(component.isAddButtonEnabled()).toBe(true);
        });
    });
});
