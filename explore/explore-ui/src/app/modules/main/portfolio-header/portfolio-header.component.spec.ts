import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {PortfolioHeaderComponent} from './portfolio-header.component';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {Report} from '@models/workspace/report.model';
import {ExploreIndexSearchService, ExplorePortfolioSearchService, NotificationService, PortfolioService} from '../../../shared/services';
import {WorkspaceStore} from '../../../stores';
import {
    DateValue,
    ExploreDialogParam,
    AlertConstants,
    TelemetryService,
    TelemetryActionConstants, TelemetryWhatIfPortfolioTrackingParameters
} from '@blk/explore-ui-core';
import {WorkpadUtils} from '@utils/workpad.utils';
import {LookThroughSettings} from '@blk/explore-ui-look-through-settings';
import {Breakdown, ColumnSectorRule, CustomFilter, CustomSector} from '@blk/explore-ui-breakdown';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {ModellingType} from '@enums/modelling-type.enum';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {FavoriteConstants} from '@constants/favorite.constants';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';
import {delay} from 'rxjs/operators';
import {cloneDeep} from 'lodash';
import * as compositionDataMock from '@mocks/compositionData/compositionDataMock.json';
import * as breakdownMock from '@mocks/compositionData/breakdownMock.json';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CompositionDataService} from '../composition-modelling/services/composition-data.service';
import {LookThroughSettingsWithRules} from '../../../models/lookthrough/look-through-settings-with-rules.model';
import {LookthroughfilterRulesFav} from '../../../models/lookthrough/look-through-filter-rules-fav.model';
import {LookthroughFilterRule} from '../../../models/lookthrough/look-through-filter-rule.model';

describe('PortfolioHeaderComponent', () => {
    let component: PortfolioHeaderComponent;
    let fixture: ComponentFixture<PortfolioHeaderComponent>;
    const compositionData = cloneDeep(compositionDataMock);
    const breakdown: Breakdown = new Breakdown(breakdownMock);
    const compositionDataServiceStub = {
        fetchCompositionDataForColumns$: jest.fn(() => of(compositionData)),
        fetchDefaultCompositionBreakdown$: jest.fn(() => of(breakdown))
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [PortfolioHeaderComponent],
            providers: [
                {provide: CompositionDataService, useValue: compositionDataServiceStub}
            ]
        });
    });

        const portfolioSearchServiceStub = {};

        const portfolioServiceStub = {
            setPortfolioTitle: jest.fn(),
            fetchPortfolioInformation$: jest.fn(() => of(new Portfolio('PEP--HP', null, false, 'Perf Benchmark for PEP-AU')))
        };

        const notificationServiceStub = {
            openDialog: jest.fn(),
            invokeWidgetReloadPrompt: jest.fn()
        };

        const indexSearchServiceStub = {
            searchIndex$: jest.fn((): Observable<any> => {
                return of({
                    searchResults: [
                        {
                            fullName: 'BARCLAYS',
                            familyTree: [
                                {
                                    fullName: 'BBG Barc 144A Ex Euro 300MM Min',
                                    familyTree: [],
                                    ticker: 'L144AXEURO',
                                    CLASS_TYPE: 'com.bfm.app.prismweb.json.PortfolioSearchResultBean'
                                },
                                {
                                    fullName: 'BBG Barc US Aggregate 300M 8-plus yr Index',
                                    familyTree: [],
                                    ticker: 'LEH300M8P',
                                    CLASS_TYPE: 'com.bfm.app.prismweb.json.PortfolioSearchResultBean'
                                },
                                {
                                    fullName: 'BBG Barc Credit 5-10 Yr Index',
                                    familyTree: [],
                                    ticker: 'LCRED5-10',
                                    CLASS_TYPE: 'com.bfm.app.prismweb.json.PortfolioSearchResultBean'
                                }
                            ],
                            CLASS_TYPE: 'com.bfm.app.prismweb.json.PortfolioSearchResultBean'
                        }
                    ]
                });
            })
        };

        beforeEach(() => {
            TestBed.configureTestingModule({
                declarations: [PortfolioHeaderComponent],
                schemas: [CUSTOM_ELEMENTS_SCHEMA],
                providers: [
                    {provide: ExplorePortfolioSearchService, useValue: portfolioSearchServiceStub},
                    {provide: PortfolioService, useValue: portfolioServiceStub},
                    {provide: ExploreIndexSearchService, useValue: indexSearchServiceStub},
                    {provide: NotificationService, useValue: notificationServiceStub}
                ]
            });

            fixture = TestBed.createComponent(PortfolioHeaderComponent);
            component = fixture.debugElement.componentInstance;
        });

        it('should create', () => {
            expect(component).toBeTruthy();
        });

        beforeAll(() => {
            WorkspaceStore.init();
        });

        describe('onInit Test', () => {
            it('should get PortfolioHeaderTitle onInit', () => {
                jest.spyOn(WorkspaceStore, 'getCurrentPortfolio$').mockReturnValue(of(new Portfolio('PEP', null, null, 'BGF Pacific Equity Fund')));
                WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(new FlatWorkpad());
                WorkspaceStore.currentReport$ = new BehaviorSubject<Report>(new Report());
                component.ngOnInit();
                expect(component.currentPortfolioHeaderTitle).toBe('BGF Pacific Equity Fund (PEP)');
            });
        });

    describe('retainPortfolioSettings', () => {
        it('should copy lookthroughSettings from currentPort', () => {
            component['currentPort'] = new Portfolio();
            component['currentPort'].lookthroughSettings = new LookThroughSettingsWithRules();
            component['currentPort'].lookthroughSettings.isLookThroughEnabled = true;
            const ltFilterRulesFav: LookthroughfilterRulesFav = new LookthroughfilterRulesFav();
            ltFilterRulesFav.id = 126;
            ltFilterRulesFav.title = 'ltRule_126';
            ltFilterRulesFav.owner = 'suresing';
            ltFilterRulesFav.ltFilterRules = new Array<LookthroughFilterRule>();
            const ltFilterRule: LookthroughFilterRule = new LookthroughFilterRule();
            ltFilterRule.enabled = true;
            ltFilterRule.ltType = 'Sector';
            ltFilterRule.displayName = 'new Rule_126';
            ltFilterRulesFav.ltFilterRules.push(ltFilterRule);
            component['currentPort'].lookthroughSettings.ltFilterRulesFav = ltFilterRulesFav;
            const portfolio = new Portfolio();
            component['retainPortfolioSettings'](portfolio);
            expect(portfolio.lookthroughSettings).toEqual(component['currentPort'].lookthroughSettings);
        });

        it('should copy splitPositionSettings from currentPort', () => {
            component['currentPort'] = new Portfolio();
            component['currentPort'].splitPositionSettings = { selectedPositionTypes: ['type1'] } as any;
            const portfolio = new Portfolio();
            component['retainPortfolioSettings'](portfolio);
            expect(portfolio.splitPositionSettings).toEqual(component['currentPort'].splitPositionSettings);
        });

        it('should copy customSector filter from currentPort if not empty', () => {
            component['currentPort'] = new Portfolio();
            component['currentPort'].filter = new CustomFilter();
            component['currentPort'].filter.customSector = new CustomSector();
            component['currentPort'].filter.customSector.rule = { colTag: 'tag1' } as any;
            const portfolio = new Portfolio();
            portfolio.filter = new CustomFilter();
            component['retainPortfolioSettings'](portfolio);
            expect(portfolio.filter.customSector.rule).toEqual(component['currentPort'].filter.customSector.rule);
        });

        it('should copy applyFilterTo from currentPort if not empty', () => {
            component['currentPort'] = new Portfolio();
            component['currentPort'].applyFilterTo = 'filter1';
            const portfolio = new Portfolio();
            component['retainPortfolioSettings'](portfolio);
            expect(portfolio.applyFilterTo).toEqual(component['currentPort'].applyFilterTo);
        });
    });

        describe('onPortfolioChangeClicked Test', () => {
            it('should toggle this.searchMode', () => {
                expect(component.searchMode).toBeFalsy();
                component.onPortfolioChangeClicked();

                expect(component.searchMode).toBeTruthy();
            });
        });

        describe('onChangePortfolio Test', () => {
            it('should fetchPortfolioInformation and update', () => {
                WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(new FlatWorkpad());
                WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(new Portfolio('', new DateValue()));
                jest.spyOn(WorkspaceStore, 'validateWorkpadAndUpdate').mockImplementation((workpad, portfolio, report) => WorkspaceStore.updateCurrentWorkpad(workpad, portfolio, report));
                jest.spyOn(WorkspaceStore.getCurrentWorkpad(), 'replacePortfolios');
                jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad');
                jest.spyOn(WorkspaceStore, 'updatePortfolioInComparisonConfig').mockImplementation(() => {
                });
                const portfolioSearchItem = new PortfolioSearchItem('PEP--HP');
                component.onChangePortfolio(portfolioSearchItem);

                expect(component['notificationService'].invokeWidgetReloadPrompt).toHaveBeenCalled();
                expect(component.searchMode).toBeFalsy();
                expect(WorkspaceStore.getCurrentWorkpad().replacePortfolios).toHaveBeenCalled();
                expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalled();
                expect(WorkspaceStore.updatePortfolioInComparisonConfig).toHaveBeenCalled();
            });

            it('should handle error', () => {
                WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(new Portfolio('', new DateValue()));
                jest.spyOn(component['portfolioService'], 'fetchPortfolioInformation$').mockReturnValue(throwError('error'));
                jest.spyOn(component['notificationService'], 'openDialog');
                component.onChangePortfolio(new PortfolioSearchItem('PEP'));

                expect(component['notificationService'].openDialog).toHaveBeenCalledWith(
                    new ExploreDialogParam(
                        AlertConstants.TYPE.ALERT,
                        AlertConstants.HEADER.PORT_INFO_MISSING,
                        AlertConstants.BODY.PORT_INFO_MISSING,
                        AlertConstants.BTN.OK
                    ));
            });
        });

        describe('ngOnInit Test', () => {
            it('should set currentPortfolioHeaderTitle, tooltipInfo, and popoverHeader on ngOnInit', fakeAsync(() => {
                const port: Portfolio = new Portfolio('PEP');
                port.fullName = 'BGF Pacific Equity Fund';
                port.currency = 'USD';
                WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(port);
                jest.spyOn(WorkspaceStore, 'getCurrentPortfolio$').mockReturnValue(of(port).pipe(delay(1)));
                component.ngOnInit();
                tick(1);
                expect(component.currentPortfolioHeaderTitle).toStrictEqual(port.getPortfolioHeaderTitle());
                expect(component.tooltipInfo.currency).toBe(port.currency);
                expect(component.popoverHeader).toBe(port.portName + ' | ' + port.fullName);
            }));
        });

        it('tests onIndexSelectionChanged', () => {
            jest.spyOn(component, 'onChangePortfolio').mockImplementation(() => {
            });

            // click on parent node
            const event1 = {detail: {value: [{children: []}]}};
            component.onIndexSelectionChanged(event1 as CustomEvent);
            expect(component.onChangePortfolio).not.toHaveBeenCalled();
            // click on child node
            const event2 = {detail: {value: [{ticker: 'PEP', fullName: 'Pacific Equity Fund'}]}};
            component.onIndexSelectionChanged(event2 as CustomEvent);
            expect(component.onChangePortfolio).toHaveBeenCalled();
        });

        it('tests addWhatIfPortfolio', () => {
            const newWhatIfPort: WhatIfPortfolio = {holdingChanges: ['test'] };
            jest.spyOn(WorkpadUtils, 'addWhatIfPortfolioAndShowComposition').mockReturnValue(newWhatIfPort);
            component.addWhatIfPortfolio();
            expect(WorkpadUtils.addWhatIfPortfolioAndShowComposition).toHaveBeenCalledTimes(1);
        });

        it('tests onIndexResearchPopoverClosed', () => {
            jest.spyOn(component['cdRef'], 'detectChanges').mockImplementation(() => {
            });
            component.onIndexResearchPopoverClosed();
            expect(component.searchMode).toBeFalsy();
        });

        it('should test trackPortfolioTelemetry', () => {
            const portfolioSearchItem = {
                ticker: 'AAPL',
                type: 'portfolio',
            };
            const currentPortfolio = {
                datePicker: { date: '2023-05-16' },
            } as unknown as Portfolio;
            const defaultDateObject = { date: '2023-01-01' };
            const addPortSourceEnum = 'source';
            jest.spyOn(WorkspaceStore, 'getCurrentPortfolio').mockReturnValue(currentPortfolio);
            component.trackPortfolioTelemetry(portfolioSearchItem);
        });

        it('tests retainPortfolioSettings', () => {
            // portfolio and currentPort both undefined, should simply exit
            component.currentPort = undefined;
            component['retainPortfolioSettings'](undefined);

            // portfolio is defined, currentPort is undefined, should simply exit
            const portfolio: Portfolio = new Portfolio();
            component['retainPortfolioSettings'](portfolio);
            expect(portfolio.lookthroughSettings.isAnyLookthroughEnabled()).toBeFalsy();

            // current portfolio is defined, but it's look-through setting is undefined
            // no effect on portfolio's look-through settings
            component.currentPort = new Portfolio();
            component.currentPort.lookthroughSettings = undefined;
            component['retainPortfolioSettings'](portfolio);
            expect(portfolio.lookthroughSettings.isAnyLookthroughEnabled()).toBeFalsy();

            // look-through setting is defined, but empty
            // no effect on portfolio's look-through settings
            component.currentPort.lookthroughSettings = new LookThroughSettings();
            component['retainPortfolioSettings'](portfolio);
            expect(portfolio.lookthroughSettings.isAnyLookthroughEnabled()).toBeFalsy();

            // check look-through settings
            component.currentPort.lookthroughSettings.isLookThroughEnabled = true;
            component['retainPortfolioSettings'](portfolio);
            expect(portfolio.lookthroughSettings.isAnyLookthroughEnabled()).toBeTruthy();

            // check portfolio level filter
            component.currentPort.filter.customSector = new CustomSector();
            component.currentPort.filter.customSector.rule = new ColumnSectorRule({colTag: 'abc'});
            component.currentPort.applyFilterTo = 'bcd';
            component['retainPortfolioSettings'](portfolio);
            expect((portfolio.filter.customSector.rule as ColumnSectorRule).columnTag).toMatch('abc');
            expect(portfolio.applyFilterTo).toMatch('bcd');

            // check split position types
            component.currentPort.splitPositionSettings.selectedPositionTypes = ['cde'];
            component['retainPortfolioSettings'](portfolio);
            expect(portfolio.splitPositionSettings.selectedPositionTypes[0]).toMatch('cde');
        });

        it('tests saveAsPortfolio', () => {
            jest.spyOn(component['appStore'].saveFavoriteAction$, 'next').mockImplementation(() => {
            });
            const telemetryTrackSpy = jest.spyOn(TelemetryService, 'track');

            // modelling type sector
            component.currentPort = new RulesBasedPortfolio();
            component.saveAsPortfolio();
            expect(component['appStore'].saveFavoriteAction$.next)
                .toHaveBeenCalledWith(new SaveFavoriteAction(component.currentPort, 'rule based what if portfolios', 'WHATIF_RULES', FavoriteConstants.PORTFOLIO_FOLDER, component.updatePortfolioName, undefined, false));
            expect(telemetryTrackSpy).toHaveBeenCalledWith(TelemetryActionConstants.USER_BEHAVIOUR.SAVE_WHAT_IF, new TelemetryWhatIfPortfolioTrackingParameters({
                'favoriteType': undefined,
                'hasOtherWhatIfs': false,
                'typeOfPortfolio': 5,
                'whatIfName': undefined,
            }));

            // modelling type portfolio
            jest.clearAllMocks();
            (component.currentPort as WhatIfPortfolio).modellingType = ModellingType.PORTFOLIO;
            component.saveAsPortfolio();
            expect(component['appStore'].saveFavoriteAction$.next)
                .toHaveBeenCalledWith(new SaveFavoriteAction(component.currentPort, 'rule based what if portfolios', 'WHATIF_RULES', FavoriteConstants.PORTFOLIO_FOLDER, component.updatePortfolioName, undefined, false));

            // modelling type position
            jest.clearAllMocks();
            (component.currentPort as WhatIfPortfolio).modellingType = ModellingType.POSITION;
            component.saveAsPortfolio();
            expect(component['appStore'].saveFavoriteAction$.next)
                .toHaveBeenCalledWith(new SaveFavoriteAction(component.currentPort, 'position based portfolios', 'WHATIF_POS', FavoriteConstants.PORTFOLIO_FOLDER, component.updatePortfolioName, undefined, false));

            // adhoc type portfolio
            jest.clearAllMocks();
            component.currentPort = new AdhocPortfolio('name', null, new AdhocPortParams({'name': 'adhocpg', 'fullName': 'adhocpg', 'currency': 'USD', 'date': {'calCode': 'INDEX_ALL_Calendar', 'dateString': true, 'dateStringValue': 'T-1', 'date': '09/04/2018'}, 'portMktNotional': 100000}));
            (component.currentPort as WhatIfPortfolio).modellingType = ModellingType.POSITION;
            component.saveAsPortfolio();
            expect(component['appStore'].saveFavoriteAction$.next)
                .toHaveBeenCalledWith(new SaveFavoriteAction(component.currentPort, 'position based portfolios', 'ADHOC_PORT', FavoriteConstants.PORTFOLIO_FOLDER, component.updatePortfolioName, undefined, false));

            // adhoc type port group
            jest.clearAllMocks();
            component.currentPort = new AdhocPortGroup('name', null, new AdhocPortParams({'name': 'adhocpg', 'fullName': 'adhocpg', 'currency': 'USD', 'date': {'calCode': 'INDEX_ALL_Calendar', 'dateString': true, 'dateStringValue': 'T-1', 'date': '09/04/2018'}, 'portMktNotional': 100000}));
            (component.currentPort as WhatIfPortfolio).modellingType = ModellingType.PORTFOLIO;
            component.saveAsPortfolio();
            expect(component['appStore'].saveFavoriteAction$.next)
                .toHaveBeenCalledWith(new SaveFavoriteAction(component.currentPort, 'rule based what if portfolios', 'ADHOC_PG', FavoriteConstants.PORTFOLIO_FOLDER, component.updatePortfolioName, undefined, false));

            jest.clearAllMocks();
            component.currentPort = new AdhocPortGroup('name', null, new AdhocPortParams({'name': 'adhoc', 'fullName': 'adhocpg', 'currency': 'USD', 'date': {'calCode': 'INDEX_ALL_Calendar', 'dateString': true, 'dateStringValue': 'T-1', 'date': '09/04/2018'}, 'portMktNotional': 100000}));
            (component.currentPort as WhatIfPortfolio).modellingType = ModellingType.PORTFOLIO;
            component.currentPort.portfolios = [new WhatIfPortfolio('test what-if')];
            component.saveAsPortfolio();
            expect(component['appStore'].saveFavoriteAction$.next)
                .toHaveBeenCalledWith(new SaveFavoriteAction(component.currentPort, 'rule based what if portfolios', 'ADHOC_PG', FavoriteConstants.PORTFOLIO_FOLDER, component.updatePortfolioName, undefined, false));
            expect(telemetryTrackSpy).toHaveBeenCalledWith(TelemetryActionConstants.USER_BEHAVIOUR.SAVE_WHAT_IF, new TelemetryWhatIfPortfolioTrackingParameters({
                'favoriteType': undefined,
                'hasOtherWhatIfs': false,
                'typeOfPortfolio': 4,
                'whatIfName': undefined,
            }));
        });

        it('tests updatePortfolioName', () => {
            jest.spyOn(component['appStore'].portfolioNameSubject$, 'next').mockImplementation(() => {
            });
            component.currentPort = new Portfolio('CORE-HQ');
            component.updatePortfolioName();
            expect(component.currentPortfolioHeaderTitle).toEqual('CORE-HQ');
            expect(component['appStore'].portfolioNameSubject$.next).toHaveBeenCalledWith('CORE-HQ');
        });
    });
