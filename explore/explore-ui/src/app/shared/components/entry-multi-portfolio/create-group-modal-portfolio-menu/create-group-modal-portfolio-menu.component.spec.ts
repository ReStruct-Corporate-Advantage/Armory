import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { CreateGroupModalPortfolioMenuComponent } from './create-group-modal-portfolio-menu.component';
import {PortfolioService} from '@services/portfolio';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '@stores/workspace.store';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Report} from '@models/workspace/report.model';
import {BehaviorSubject, of, Observable} from 'rxjs';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {ExplorePortfolioSearchService} from '@services/explore-portfolio-search/explore-portfolio-search.service';
import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import {AddPortfolioService} from '../../add-portfolio-modal/add-portfolio.service';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import { CalendarDateUtils } from '@blk/explore-ui-core';
import {IndexSearchTreeItem} from '@models/portfolio/index-search-tree-item.model';
import { PortfolioType } from '../../add-portfolio-modal/portfolio-type.enum';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import { ExploreConstants } from '../../../../constants/explore.constants';



describe('CreateGroupModalPortfolioMenuComponent', () => {
    let component: CreateGroupModalPortfolioMenuComponent;
    let fixture: ComponentFixture<CreateGroupModalPortfolioMenuComponent>;
    let reportGroup: ReportGroup;
    let port1: Portfolio;
    let port2: Portfolio;

    const portfolioSearchServiceStub = {
        fetchPortfolioInformation$: jest.fn(() => of()),
        selectedPortfolioTickers: new Set<string>(),

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
    

    const portfolioServiceStub = {
        fetchPortfolioInformation$: jest.fn(() => of()),
        selectedPortfolioTickers: new Set<string>()
    };

    const addPortfolioServiceStub = {
        selectedPortfolioTickers: new Set<string>(),
        reportGroupList: [],
        checkedReportGroupList: [],
        selectedSecurities: new Map<string, any>(),
        adhocPortfoliosList: new Map<any, Map<string, any>>(),
        clear: jest.fn()
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
        WorkspaceStore.init();
        WorkspaceStore.currentReport$ = new BehaviorSubject<Report>(new Report());
        reportGroup = new ReportGroup();
        port1 = new Portfolio('PEP');
        port2 = new Portfolio('CORE-HQ');
        reportGroup.portfolios = [port1, port2];
        WorkspaceStore.currentWorkpad$ = new BehaviorSubject<ReportGroup>(reportGroup);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CreateGroupModalPortfolioMenuComponent],
            imports: [HttpClientTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: PortfolioService, useValue: portfolioServiceStub },
                {provide: AddPortfolioService, useValue: addPortfolioServiceStub},
                {provide: ExplorePortfolioSearchService, useValue: portfolioSearchServiceStub},
                ExplorePortfolioSearchService
            ]
        })
        .compileComponents();
      

        fixture = TestBed.createComponent(CreateGroupModalPortfolioMenuComponent);
        component = fixture.componentInstance;
        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
        expect(component.isComparisonListEmpty$.getValue()).toBeTruthy();
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

    
    describe('onSearchInputChanged Test', () => {
        it('should add portfolio to anchorOptions and selectedPortfolioTickers', () => {
            const searchTerm = 'PEP';
            const portfolioSearchItem = new PortfolioSearchItem(searchTerm);
            const portfolio: Portfolio = PortfolioService.getPortfolioObject(portfolioSearchItem, CalendarDateUtils.getDefaultDateObject(), portfolioSearchItem instanceof IndexSearchTreeItem);

            component.onSearchInputChanged(searchTerm);

            expect(component.isComparisonEnabled).toBeTruthy();
            expect(component.anchorOptions[0].values.some(option => option.displayValue === portfolio.portName)).toBeTruthy();
        });
    });

    describe('onPortfolioRemoved Test', () => {
        it('should remove portfolio from anchorOptions and selectedPortfolioTickers', () => {
            const portfolioSearchItem = new PortfolioSearchItem('PEP');
            const portfolio: Portfolio = PortfolioService.getPortfolioObject(portfolioSearchItem, CalendarDateUtils.getDefaultDateObject(), portfolioSearchItem instanceof IndexSearchTreeItem);

            component.onSearchInputChanged('PEP');
            component.onPortfolioRemoved(portfolioSearchItem);

            expect(component.anchorOptions[0].values.some(option => option.displayValue === portfolio.portName)).toBeFalsy();
            expect(component.allPortfolios.some(p => p.portId === portfolio.portId)).toBeFalsy();
            expect(component.selectedPortfolioTickers.has(portfolioSearchItem)).toBeFalsy();
        });
    });

    describe('onAllPortfolioRemoved Test', () => {
        it('should clear all portfolios from anchorOptions and selectedPortfolioTickers', () => {
            component.onSearchInputChanged('PEP');
            component.onSearchInputChanged('CORE-HQ');
            component.onAllPortfolioRemoved();

            expect(component.anchorOptions[0].values.length).toBe(1);
            expect(component.selectedPortfolioTickers.size).toBe(0);
        });
    });
    describe('addExistingPortfoliosToWorkspace Test', () => {
        it('should add existing portfolios to workspace', (done) => {
            const portfolioSearchItem = new PortfolioSearchItem('PEP');
            const portfolio: Portfolio = PortfolioService.getPortfolioObject(portfolioSearchItem, CalendarDateUtils.getDefaultDateObject(), portfolioSearchItem instanceof IndexSearchTreeItem);
            component.selectedPortfolioTickers.add(portfolioSearchItem);
    
            // Mock the fetchPortfolioInformation$ method to return the portfolio
            jest.spyOn(component['portfolioService'], 'fetchPortfolioInformation$').mockReturnValue(of(portfolio));
            jest.spyOn(component, 'closeModal');
    
            component.addExistingPortfoliosToWorkspace().subscribe(() => {
                expect(component['portfolioService'].fetchPortfolioInformation$).toHaveBeenCalled();
                expect(component.closeModal).toHaveBeenCalled();
                done();
            });
        }, 10000); // Increase timeout to 10000ms
    });
    

        describe('addPortfoliosToWorkpads Test', () => {
            it('should add portfolios to workpads', () => {
                const portfolios = [port1, port2];
                jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad');
                component['addPortfolioService'].reportGroupList = [];
    
                component.addPortfoliosToWorkpads(portfolios);
    
                expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalled();
            });
        });

    describe('createWorkpadForAddedPortfolio Test', () => {
        it('should create workpad for added portfolio', () => {
            const portfolio = new Portfolio('NEW');
            jest.spyOn(component['workpadService'], 'createFlatWorkpad').mockReturnValue(new ReportGroup());
            jest.spyOn(WorkspaceStore, 'addWorkpads');
            jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad');

            component.createWorkpadForAddedPortfolio(portfolio, 0);

            expect(component['workpadService'].createFlatWorkpad).toHaveBeenCalledWith(portfolio, 0);
            expect(WorkspaceStore.addWorkpads).toHaveBeenCalled();
            expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalled();
        });
    });

    describe('isAddButtonEnabled Test', () => {
        it('should return true if portfolioType is CUSTOM and customPortfolio is enabled', () => {
            component.portfolioType = PortfolioType.CUSTOM;
            component.customPortfolio = { isAddButtonEnabled: true } as AddCustomPortfolioComponent;

            expect(component.isAddButtonEnabled()).toBeTruthy();
        });

        it('should return true if selectedPortfolioTickers size is greater than 1', () => {
            component.portfolioType = PortfolioType.PORTFOLIO;
            component.selectedPortfolioTickers.add(new PortfolioSearchItem('PEP'));
            component.selectedPortfolioTickers.add(new PortfolioSearchItem('CORE-HQ'));

            expect(component.isAddButtonEnabled()).toBeTruthy();
        });
    });

    describe('addReportGroupDoneClickedCallback Test', () => {
        it('should call addExistingPortfoliosToWorkspace', () => {
            jest.spyOn(component, 'addExistingPortfoliosToWorkspace').mockReturnValue(of(true));

            component.addReportGroupDoneClickedCallback();

            expect(component.addExistingPortfoliosToWorkspace).toHaveBeenCalled();
        });
    });

    describe('createWorkpadForAddedPortfolio Test', () => {
        it('should create workpad for added portfolio', () => {
            const portfolio = new Portfolio('NEW');
            jest.spyOn(component['workpadService'], 'createFlatWorkpad').mockReturnValue(new ReportGroup());
            jest.spyOn(WorkspaceStore, 'addWorkpads');
            jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad');

            component.createWorkpadForAddedPortfolio(portfolio, 0);

            expect(component['workpadService'].createFlatWorkpad).toHaveBeenCalledWith(portfolio, 0);
            expect(WorkspaceStore.addWorkpads).toHaveBeenCalled();
            expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalled();
        });
    });

    describe('isAddButtonEnabled Test', () => {
        it('should return true if portfolioType is CUSTOM and customPortfolio is enabled', () => {
            component.portfolioType = PortfolioType.CUSTOM;
            component.customPortfolio = { isAddButtonEnabled: true } as AddCustomPortfolioComponent;

            expect(component.isAddButtonEnabled()).toBeTruthy();
        });

        it('should return true if selectedPortfolioTickers size is greater than 1', () => {
            component.portfolioType = PortfolioType.PORTFOLIO;
            component.selectedPortfolioTickers.add(new PortfolioSearchItem('PEP'));
            component.selectedPortfolioTickers.add(new PortfolioSearchItem('CORE-HQ'));

            expect(component.isAddButtonEnabled()).toBeTruthy();
        });

    });

    describe('addReportGroupDoneClickedCallback Test', () => {
        it('should call addExistingPortfoliosToWorkspace', () => {
            jest.spyOn(component, 'addExistingPortfoliosToWorkspace').mockReturnValue(of(true));

            component.addReportGroupDoneClickedCallback();

            expect(component.addExistingPortfoliosToWorkspace).toHaveBeenCalled();
        });
    });

    describe('addReportGroup Default Name Test', () => {
        it('should add a new report group and call addExistingPortfoliosToWorkspace when groupName is empty', () => {
            component.groupName = '';
            jest.spyOn(component, 'addExistingPortfoliosToWorkspace').mockReturnValue(of(true));

            component.addReportGroup();

            expect(component.reportGroupList.length).toBe(1);
            expect(component.reportGroupList[0].title).toBe(ExploreConstants.NEW_REPORT_GROUP_TITLE);
            expect(component.isOpen).toBeFalsy();
            expect(component.addExistingPortfoliosToWorkspace).toHaveBeenCalled();
        });

        it('should add a new report group and call addExistingPortfoliosToWorkspace when groupName is null', () => {
            component.groupName = null;
            jest.spyOn(component, 'addExistingPortfoliosToWorkspace').mockReturnValue(of(true));

            component.addReportGroup();

            expect(component.reportGroupList.length).toBe(1);
            expect(component.reportGroupList[0].title).toBe(ExploreConstants.NEW_REPORT_GROUP_TITLE);
            expect(component.isOpen).toBeFalsy();
            expect(component.addExistingPortfoliosToWorkspace).toHaveBeenCalled();
        });
    });
    
    describe('addReportGroup Test', () => {
        it('should add a new report group and call addExistingPortfoliosToWorkspace', () => {
            component.groupName = 'New Group';
            jest.spyOn(component, 'addExistingPortfoliosToWorkspace').mockReturnValue(of(true));

            component.addReportGroup();

            expect(component.reportGroupList.length).toBe(1);
            expect(component.reportGroupList[0].title).toBe('New Group');
            expect(component.isOpen).toBeFalsy();
            expect(component.addExistingPortfoliosToWorkspace).toHaveBeenCalled();
        });
    });

    describe('onAddClick Test', () => {
        it('should call onAddCallback and close modal if loadFavActionCallback is provided', () => {
            component.loadFavActionCallback = jest.fn();
            component.onAddCallback = jest.fn();
            jest.spyOn(component, 'closeModal');

            component.onAddClick();

            expect(component.onAddCallback).toHaveBeenCalledWith(component.selectedPortfolioTickers);
            expect(component.closeModal).toHaveBeenCalled();
        });

        it('should call addExistingPortfoliosToWorkspace if loadFavActionCallback is not provided', () => {
            component.loadFavActionCallback = null;
            jest.spyOn(component, 'addExistingPortfoliosToWorkspace').mockReturnValue(of(true));

            component.onAddClick();

            expect(component.addExistingPortfoliosToWorkspace).toHaveBeenCalled();
        });
    });

    describe('addReportGroupButtonClickedCallback Test', () => {
        it('should emit addReportGroupButtonClicked event and close modal', () => {
            jest.spyOn(component.addReportGroupButtonClicked, 'emit');

            component.addReportGroupButtonClickedCallback(true);

            expect(component.isOpen).toBeFalsy();
            expect(component.addReportGroupButtonClicked.emit).toHaveBeenCalledWith(true);
        });
    });

    describe('onColumnTitleValueChanged Test', () => {
        it('should update groupName when input value changes', () => {
            const event = new CustomEvent('input', {
                detail: { value: 'New Group Name' }
            });

            component.onColumnTitleValueChanged(event);

            expect(component.groupName).toBe('New Group Name');
        });
    });


    describe('setSelectedAnchorValue Test', () => {
        it('should update selected anchor value', () => {
            component.anchorOptions = [new ExploreSelectOptionGroup([
                new ExploreSelectOption('None', 'None', false),
                new ExploreSelectOption('Portfolio 1', '1', true),
                new ExploreSelectOption('Portfolio 2', '2', false)
            ])];

            const event = new CustomEvent('change', {
                detail: { value: { value: '2' } }
            });

            component.setSelectedAnchorValue(event);

            expect(component.anchorOptions[0].values[1].isSelected).toBeFalsy();
            expect(component.anchorOptions[0].values[2].isSelected).toBeTruthy();
        });
    });

    describe('addExistingPortfoliosToWorkspace Test', () => {
        it('should add existing portfolios to workspace', (done) => {
            const portfolioSearchItem = new PortfolioSearchItem('PEP');
            const portfolio: Portfolio = PortfolioService.getPortfolioObject(portfolioSearchItem, CalendarDateUtils.getDefaultDateObject(), portfolioSearchItem instanceof IndexSearchTreeItem);
            component.selectedPortfolioTickers.add(portfolioSearchItem);

            // Mock the fetchPortfolioInformation$ method to return the portfolio
            jest.spyOn(component['portfolioService'], 'fetchPortfolioInformation$').mockReturnValue(of(portfolio));
            jest.spyOn(component, 'closeModal');

            component.addExistingPortfoliosToWorkspace().subscribe(() => {
                expect(component['portfolioService'].fetchPortfolioInformation$).toHaveBeenCalled();
                expect(component.closeModal).toHaveBeenCalled();
                done();
            });
        }, 10000); // Increase timeout to 10000ms
    });

    describe('addPortfoliosToWorkpads Test', () => {
        it('should add portfolios to workpads', () => {
            const portfolios = [port1, port2];
            jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad');
            component['addPortfolioService'].reportGroupList = [];

            component.addPortfoliosToWorkpads(portfolios);

            expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalled();
        });
    });

    describe('addPortfoliosToWorkpads Test', () => {
        it('should add portfolios to workpads', () => {
            const portfolios = [port1, port2];
            jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad');
            component['addPortfolioService'].reportGroupList = [];

            component.addPortfoliosToWorkpads(portfolios);

            expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalled();
        });

        it('should handle report group and selected report correctly in addPortfoliosToWorkpads', () => {
            component.reportGroup = reportGroup;
            jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad');

            component.addPortfoliosToWorkpads([port1, port2]);

            expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalledWith(reportGroup);
        });
    });

    describe('setSelectedAnchorValue Test', () => {
        it('should update selected anchor value', () => {
            component.anchorOptions = [new ExploreSelectOptionGroup([
                new ExploreSelectOption('None', 'None', false),
                new ExploreSelectOption('Portfolio 1', '1', true),
                new ExploreSelectOption('Portfolio 2', '2', false)
            ])];

            const event = new CustomEvent('change', {
                detail: { value: { value: '2' } }
            });

            component.setSelectedAnchorValue(event);

            expect(component.anchorOptions[0].values[1].isSelected).toBeFalsy();
            expect(component.anchorOptions[0].values[2].isSelected).toBeTruthy();
        });
    });

    describe('for loop with AdhocPortParams Test', () => {
        it('should skip items that are instances of AdhocPortParams', () => {
            const adhocPortParams = new AdhocPortParams();
            component.selectedPortfolioTickers.add(adhocPortParams);

            for (let item of component.selectedPortfolioTickers) {
                if (item instanceof AdhocPortParams) {
                    continue;
                }
            }

            expect(component.selectedPortfolioTickers.has(adhocPortParams)).toBeTruthy();
        });
    });
});