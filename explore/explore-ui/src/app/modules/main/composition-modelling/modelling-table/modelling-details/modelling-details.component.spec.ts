import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ModellingDetailsComponent} from './modelling-details.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {PortfolioSecurityHoldingChange} from '@models/portfolio/composition/portfolio-security-holding-change.model';
import {RuleFactory} from '../../../../../factories/rule.factory';
import {CompositionConstants} from '@constants/composition.constants';
import {SectorRule} from '@models/portfolio/tradeRules/sector-rule.model';
import {HoldingChange} from '@models/portfolio/composition/holding-change.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {CompositionUtils} from '@utils/composition.utils';
import {FavoriteService} from '@services/favorite';
import {of} from 'rxjs';
import {CompositionRule} from '@models/portfolio/composition/composition-rule.model';
import {FavoriteComponent} from '../../../../favorite/load/favorite/favorite.component';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {ExploreOptimizationService} from '../../../../optimization/services/explore-optimization.service';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {ObjectiveSettings} from '@models/portfolio/objectives/objective.settings.model';
import {StressScenarioPortfolioObjective} from '@models/portfolio/objectives/stress-scenario-portfolio-objective.model';
import {LatestOptimizationRunDetails} from '@models/portfolio/optimization/latest-optimization-run-details';
import {EfficientFrontierConstants} from '@blk/explore-efficient-frontier';
import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';
import {AlphaScorePortfolioObjective} from '@models/portfolio/objectives/alpha-score-portfolio-objective.model';
import {CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {ModellingType} from '@enums/modelling-type.enum';

describe('ModellingDetailsComponent', () => {
    let component: ModellingDetailsComponent;
    let fixture: ComponentFixture<ModellingDetailsComponent>;
    const compositionRule: CompositionRule = new CompositionRule();
    const holdingChanges: HoldingChange[] = [
        new PortfolioSecurityHoldingChange({
            lineItem: 'a',
            isCashOffsetRequired: true,
            changeInWeight: -5,
            newWeight: 2,
            tradeSize: 2,
            secDesc: 'sec1',
            changeInQuantity: 10,
            changeInNotional: 20,
            changeInMarketValue: 30
        }),
        new PortfolioSecurityHoldingChange({
            lineItem: 'c',
            isCashOffsetRequired: true,
            changeInWeight: -6,
            newWeight: 1,
            tradeSize: -2,
            secDesc: 'sec2',
            changeInQuantity: 30,
            changeInNotional: -20,
            changeInMarketValue: 10
        })
    ];
    const favoriteServiceStub = {
        getFavorite$: jest.fn(() => of(compositionRule))
    };
    const exploreOptimizationServiceStub = {
        getOptimizationSummaryData$: jest.fn(() => of({objective: 'Minimize Risk'}))
    };

    beforeAll(() => RuleFactory.registerRuleType(CompositionConstants.RULE_TYPES.SECTOR, SectorRule));

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ModellingDetailsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: ExploreOptimizationService, useValue: exploreOptimizationServiceStub}
            ]
        });

        fixture = TestBed.createComponent(ModellingDetailsComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => jest.clearAllMocks());

    jest.spyOn(CompositionUtils, 'prepareCompositionPayload');

    it('tests ngOnChanges', () => {
        component.portfolio = new RulesBasedPortfolio();
        component.portfolio.deserialize({
            ticker: 'PEP',
            compositionRules: {
                tradeRules: [
                    {
                        lineItem: 'a',
                        newWeight: 2
                    },
                    {
                        lineItem: 'c',
                        newWeight: 3,
                        ruleType: CompositionConstants.RULE_TYPES.SECTOR
                    }
                ]
            }
        });
        component.portfolio.composition = {
            data: {
                data: [1000]
            },
            columns: ['notional_mv_after']
        };
        component.portfolio.addHoldingChanges(holdingChanges);
        (component.portfolio as PortfolioWithPositions).optoFinalHoldings = holdingChanges;
        component.ngOnChanges();
        expect(component.tradeRules.length).toBe(2);
        expect(component.savableRules.length).toBe(1);
        verifyFunc1();
    });

    it('tests ngOnChanges - not a rule based portfolio', () => {
        component.portfolio = new WhatIfPortfolio('PEP');
        component.portfolio.addHoldingChanges(holdingChanges);
        (component.portfolio as PortfolioWithPositions).optoFinalHoldings = holdingChanges;
        component.portfolio.composition = {
            data: {
                data: [1000]
            },
            columns: ['notional_mv_after']
        };
        component.ngOnChanges();
        expect(component.tradeRules).toBeUndefined();
        expect(component.savableRules).toBeUndefined();
        verifyFunc1();
    });

    it('tests ngOnChanges - not a rule based portfolio - no holding changes', () => {
        component.portfolio = new WhatIfPortfolio('PEP');
        component.ngOnChanges();
        verifyFunc2();
    });

    it('tests ngOnChanges - test violation reports', () => {
        component.portfolio = new PortfolioWithPositions('PEP');
        const latestOptimizationRunDetails = new LatestOptimizationRunDetails();
        latestOptimizationRunDetails.violationReports = {
            'Turnover Constraint': [{columns: ['Final Turnover', 'Specified Maximum Turnover'], data: [['3', '5']]}],
            'Other Constraints': [{columns: ['Specified Maximum Number of Trades', 'Final Number of Trades'], data: [['-5', '9']]}, {columns: ['Maximum Turnover'], data: [['5']]}]
        };
        (component.portfolio as PortfolioWithPositions).latestOptimizationRunDetails = [latestOptimizationRunDetails];
        component.ngOnChanges();
        expect(component.feasibilityReportData).toEqual([
            [
                {
                    'Final Turnover': '3',
                    'Specified Maximum Turnover': '5'
                }
            ]
        ]);
        expect(component.otherConstraintsData).toEqual([
            [
                {
                    'Final Number of Trades': '9',
                    'Specified Maximum Number of Trades': '-5'
                }
            ],
            [
                {
                    'Maximum Turnover': '5'
                }
            ]
        ]);
    });

    it('tests ngOnChanges - not a rule based portfolio - trade size zero', () => {
        component.portfolio = new WhatIfPortfolio('PEP');
        component.portfolio.addHoldingChanges(holdingChanges);
        component.portfolio.composition = {
            data: {
                data: [1000]
            },
            columns: ['notional_mv_after']
        };
        component.portfolio.holdingChanges.forEach(change => (change as PortfolioSecurityHoldingChange).tradeSize = 0);
        component.ngOnChanges();
        verifyFunc2();
    });

    it('tests loadSelectedRule', async () => {
        component.showCompositionTable = null;
        jest.spyOn(component.displayedCompositionRule, 'deserialize').mockImplementation(() => {});
        await component.loadSelectedRule(123);
        expect(favoriteServiceStub.getFavorite$).toHaveBeenCalledWith(123);
        expect(component.displayedCompositionRule.deserialize).toHaveBeenCalledWith(compositionRule);
        expect(component.showCompositionRule).toBe(true);
    });

    it('tests createTabData', () => {
        component.portfolio = new WhatIfPortfolio('PEP');
        component.portfolio.setModellingType(ModellingType.SECTOR);
        component.createTabData();
        expect(component.modellingDetailsTabData.length).toBe(2);
        expect(component.modellingDetailsTabData.includes({label: 'Rules', uid: '0'}));
        expect(component.modellingDetailsTabData.includes({label: 'Trades', uid: '3'}));
        component.portfolio.setModellingType(ModellingType.PORTFOLIO);
        component.createTabData();
        expect(component.modellingDetailsTabData.length).toBe(1);
        expect(component.modellingDetailsTabData.includes({label: 'Rules', uid: '0'}));
        component.latestOptoRunDetails = { optoRunSuccessful: true } as any as LatestOptimizationRunDetails;
        component.createTabData();
        expect(component.modellingDetailsTabData.length).toBe(2);
        expect(component.modellingDetailsTabData.includes({label: 'Rules', uid: '0'}));
        expect(component.modellingDetailsTabData.includes({label: 'Feasibility Report', uid: '4'}));
        component.portfolio.setModellingType(ModellingType.POSITION);
        component.createTabData();
        expect(component.modellingDetailsTabData.length).toBe(3);
        expect(component.modellingDetailsTabData.includes({label: 'Optimization Summary', uid: '1'}));
        expect(component.modellingDetailsTabData.includes({label: 'Feasibility Report', uid: '4'}));
        expect(component.modellingDetailsTabData.includes({label: 'Trades', uid: '3'}));
        const portWithPost = new PortfolioWithPositions();
        portWithPost.optimizationSettings.isEfficientFrontierEnabled = true;
        component.portfolio = portWithPost;
        component.portfolio.setModellingType(ModellingType.POSITION);
        component.createTabData();
        expect(component.modellingDetailsTabData.length).toBe(2);
        expect(component.modellingDetailsTabData.includes({label: 'Efficient Frontier', uid: '2'}));
        expect(component.modellingDetailsTabData.includes({label: 'Feasibility Report', uid: '4'}));
    });

    it('tests applySelectedRule', () => {
        component.portfolio = new RulesBasedPortfolio();
        jest.spyOn(component.showCompositionTable, 'emit').mockImplementation(() => {});
        jest.spyOn((component.portfolio as RulesBasedPortfolio).compositionRules, 'addTradeRules').mockImplementation(() => {});
        component.applySelectedRule();
        expect((component.portfolio as RulesBasedPortfolio).compositionRules.addTradeRules).toHaveBeenCalledWith(component.displayedCompositionRule);
        expect(component.showCompositionTable.emit).toHaveBeenCalledTimes(1);
    });

    it('tests openSaveCompositionModal', () => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.access = true;
        CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
        CoreUserMetaDataStore.userMetaData.login = 'seakim';
        component.portfolio = new RulesBasedPortfolio();
        component.compositionRuleTree = new FavoriteComponent();
        jest.spyOn(component['appStore'].saveFavoriteAction$, 'next').mockImplementation(() => {});
        component.openSaveCompositionRuleModal();
        expect(component['appStore'].saveFavoriteAction$.next).toHaveBeenCalledWith(new SaveFavoriteAction(
            (component.portfolio as RulesBasedPortfolio).compositionRules,
            'Composition Rule',
            'COMP_RULES',
            'COMP_RULES_FOLDER',
            component.compositionRuleTree.refreshMyFavoriteTree
        ));
    });

    it('tests isEfficientEnabled', () => {
        expect(component.isEfficientEnabled()).toBeFalsy();
        component.portfolio = new PortfolioWithPositions('ILB');
        (component.portfolio as PortfolioWithPositions).optimizationSettings.isEfficientFrontierEnabled = true;
        expect(component.isEfficientEnabled()).toBeTruthy();
    });

    it('tests isStressScenarioPortfolioObjective', () => {
        expect(component.isStressScenarioPortfolioObjective()).toBeFalsy();
        component.portfolio = new PortfolioWithPositions('ILB');
        const objectiveSettings = new ObjectiveSettings();
        objectiveSettings.portfolioObjectives = [new StressScenarioPortfolioObjective()];
        (component.portfolio as PortfolioWithPositions).optimizationSettings.objectiveSettings = objectiveSettings;
        expect(component.isStressScenarioPortfolioObjective()).toBeTruthy();
    });

    it('tests onSelectedYAxisValueChanged', () => {
        component.portfolio = new PortfolioWithPositions('ILB');
        component.onSelectedYAxisValueChange('expectedVolatility');
        expect((component.portfolio as PortfolioWithPositions).optimizationSettings.selectedYAxis).toEqual('expectedVolatility');

    });

    it('tests getDefaultYAxis()', () => {
        component.portfolio = new PortfolioWithPositions('ILB');
        // if no objective setting is present check default YAxis is equal to Risk(Active)
        expect(component.getDefaultYAxis()).toEqual(EfficientFrontierConstants.EXPECTED_VOLATILITY);

        const objectiveSettings = new ObjectiveSettings();

        objectiveSettings.portfolioObjectives = [new PortfolioObjective({key: 'MINIMIZE_TCOST'})];
        (component.portfolio as PortfolioWithPositions).optimizationSettings.objectiveSettings = objectiveSettings;
        expect(component.getDefaultYAxis()).toEqual(EfficientFrontierConstants.TCOST_OF_TRADES);

        objectiveSettings.portfolioObjectives.push(new PortfolioObjective({key: 'MINIMIZE_RISK'}));
        expect(component.getDefaultYAxis()).toEqual(EfficientFrontierConstants.EXPECTED_VOLATILITY);

        objectiveSettings.portfolioObjectives.push( new AlphaScorePortfolioObjective({key: 'MAXIMIZE_ALPHA_SCORE'}));
        expect(component.getDefaultYAxis()).toEqual(EfficientFrontierConstants.EXPECTED_RETURN);

        objectiveSettings.portfolioObjectives = [new PortfolioObjective({key: 'MINIMIZE_SYSTEMATIC_RISK'})];
        expect(component.getDefaultYAxis()).toEqual(EfficientFrontierConstants.EXPECTED_FACTOR_VOLATILITY);

        objectiveSettings.portfolioObjectives.push( new StressScenarioPortfolioObjective({key: 'MAXIMIZE_ALPHA_STRESS_SCENARIO'}));
        expect(component.getDefaultYAxis()).toEqual(EfficientFrontierConstants.EXPECTED_RETURN);

    });

    it('tests getYAxisColumn', () => {
        component.portfolio = new PortfolioWithPositions('ILB');

        // if no objective setting is present check default y axis is equal to Risk(Active)
        expect(component.getYAxisColumn()).toEqual(EfficientFrontierConstants.EXPECTED_VOLATILITY);

        (component.portfolio as PortfolioWithPositions).optimizationSettings.selectedYAxis = EfficientFrontierConstants.TCOST_OF_TRADES;
        expect(component.getYAxisColumn()).toEqual(EfficientFrontierConstants.TCOST_OF_TRADES);
    });

    const verifyFunc1 = () => {
        expect(component.tradeStats).toEqual({
            totalTrades: 2,
            totalBuy: 1,
            totalSell: 1,
            totalBuyAmount: 2,
            totalSellAmount: -2,
            turnover: '',
            tcostOfTrades: '',
            spreadTcostOfTrades: '',
            marketImpactTcostOfTrades: ''
        });
        expect(component.tradePayload.responseConfig.columns).toEqual(['lineItem', 'secDesc', 'tradeType', 'tradeSize', 'changeInQuantity', 'changeInNotionalMarketValue', 'changeInMarketValue']);
        expect(component.tradePayload.requestConfig.portfolio).toEqual('PEP');
        expect(component.tradePayload.defaultColumnDefs.length).toBe(7);
        expect(component.tradePayload.breakdownLevels.length).toBe(0);
        expect(component.tradePayload.cube['underlyingCube'].cube.size).toBe(1);
        expect(CompositionUtils.prepareCompositionPayload).toHaveBeenCalledWith({
            data: [], children: [
                {data: ['a', 'sec1', 'Buy', 2, 10, 20, 30], rowId: 2},
                {data: ['c', 'sec2', 'Sell', -2, 30, -20, 10], rowId: 3}
            ], rowId: 1
        }, ['lineItem', 'secDesc', 'tradeType', 'tradeSize', 'changeInQuantity', 'changeInNotionalMarketValue', 'changeInMarketValue'], component.portfolio, [], expect.anything(), null);
    };

    const verifyFunc2 = () => {
        expect(component.tradeRules).toBeUndefined();
        expect(component.savableRules).toBeUndefined();
        expect(component.tradeStats).toEqual({
            totalTrades: 0,
            totalBuy: 0,
            totalSell: 0,
            totalBuyAmount: 0,
            totalSellAmount: 0,
            turnover: '',
            tcostOfTrades: '',
            spreadTcostOfTrades: '',
            marketImpactTcostOfTrades: ''
        });
        expect(component.tradePayload).toBeUndefined();
        expect(CompositionUtils.prepareCompositionPayload).not.toHaveBeenCalled();
    };
});
