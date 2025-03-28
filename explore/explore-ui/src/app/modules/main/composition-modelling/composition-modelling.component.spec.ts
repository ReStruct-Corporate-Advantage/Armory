import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CompositionModellingComponent} from './composition-modelling.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {WorkspaceStore} from '../../../stores';
import {BehaviorSubject, of, throwError} from 'rxjs';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {ModellingType} from '@enums/modelling-type.enum';
import {CompositionDataService} from './services/composition-data.service';
import * as compositionDataMock from '@mocks/compositionData/compositionDataMock.json';
import * as breakdownMock from '@mocks/compositionData/breakdownMock.json';
import {cloneDeep} from 'lodash';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {Breakdown, BreakdownInitializer} from '@blk/explore-ui-breakdown';
import {CompositionUtils} from '@utils/composition.utils';
import {RuleFactory} from '../../../factories/rule.factory';
import {SecurityRule} from '@models/portfolio/tradeRules/security-rule.model';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {DateValue, ErrorTypeConstants, ExploreModellingChangeLevel, UIErrorParameters} from '@blk/explore-ui-core';
import {GridApi, NewValueParams, RowNode} from 'ag-grid-community';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';
import {NewSecurityHoldingChange} from '@models/portfolio/composition/new-security-holding-change.model';
import {LatestOptimizationRunDetails} from '@models/portfolio/optimization/latest-optimization-run-details';
import {PortfolioSecurityHoldingChange} from '@models/portfolio/composition/portfolio-security-holding-change.model';
import {BreakdownTreeRule} from '@models/portfolio/tradeRules/breakdown-tree-rule.model';
import {PortfolioRule} from '@models/portfolio/tradeRules/portfolio-rule.model';
import {NotificationService} from '@services/notification';

describe('CompositionModellingComponent', () => {
    let component: CompositionModellingComponent;
    let fixture: ComponentFixture<CompositionModellingComponent>;
    const compositionData = cloneDeep(compositionDataMock);
    const breakdown: Breakdown = new Breakdown(breakdownMock);
    const compositionDataServiceStub = {
        fetchHoldingChangesFollowedByCompositionData$: jest.fn(() => of(compositionData)),
        fetchDefaultCompositionBreakdown$: jest.fn(() => of(breakdown))
    };

    const notificationServiceStub = {
        error: jest.fn()
    };

    beforeAll(() => {
        WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(new WhatIfPortfolio());
        WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(new ReportGroup());
        BreakdownInitializer.registerBreakdownConfigTypes();
        BreakdownInitializer.registerSectorConfigTypes();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [CompositionModellingComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: CompositionDataService, useValue: compositionDataServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub}
            ]
        });

        fixture = TestBed.createComponent(CompositionModellingComponent);
        component = fixture.componentInstance;
        jest.spyOn(CompositionUtils, 'refreshCompositionData').mockImplementation(() => {});
        fixture.detectChanges();
        jest.clearAllMocks();
    });


    it('tests tradeActionHandler', async () => {
        let whatIfPort: WhatIfPortfolio = new RulesBasedPortfolio();
        const createRuleSpy = jest.spyOn(RuleFactory, 'createRuleBasedOnAction');
        const tradeRule: BaseRule = new SecurityRule('a', 1);
        const compositionPayload: WidgetPayload = {};
        const params: NewValueParams = {
            api: null,
            colDef: null,
            column: null,
            columnApi: null,
            data: null,
            node: null,
            oldValue: null,
            newValue: null,
            context: null
        };
        jest.spyOn(component['changeDetectorRef'], 'markForCheck');
        jest.spyOn(whatIfPort as RulesBasedPortfolio, 'addTradeRule').mockImplementation(jest.fn());
        jest.spyOn(CompositionUtils, 'refreshCompositionData').mockReturnValue(compositionPayload);

        // valid trade rule and is a rule based portfolio
        createRuleSpy.mockReturnValue(tradeRule);
        await component.tradeActionHandler(whatIfPort, params);
        expect(RuleFactory.createRuleBasedOnAction).toHaveBeenCalledWith(whatIfPort, params);
        expect(whatIfPort['addTradeRule']).toHaveBeenCalledWith(tradeRule);
        expect(compositionDataServiceStub.fetchHoldingChangesFollowedByCompositionData$).toHaveBeenCalledTimes(1);
        expect(CompositionUtils.refreshCompositionData).toHaveBeenCalledWith(whatIfPort, component.eventHandlerMap, undefined, undefined);
        expect(component.compositionPayload === compositionPayload).toBeTruthy();

        // valid trade rule, but is a portfolio with positions
        jest.clearAllMocks();
        const gridApi = {} as GridApi;
        params.api = gridApi;
        gridApi['serverSideRowModel'] = {datasource: {qssp: {expandedState: new ExpandedState({allExpanded: true})}}};
        gridApi['sortController'] = {getSortModel: () => {return undefined}};
        gridApi.getColumnState = jest.fn().mockReturnValue([]);
        whatIfPort = new PortfolioWithPositions();
        await component.tradeActionHandler(whatIfPort, params);
        expect(RuleFactory.createRuleBasedOnAction).toHaveBeenCalledWith(whatIfPort, params);
        expect(whatIfPort['addTradeRule']).toBeUndefined();
        expect(compositionDataServiceStub.fetchHoldingChangesFollowedByCompositionData$).toHaveBeenCalledTimes(1);
        expect(CompositionUtils.refreshCompositionData).toHaveBeenCalledWith(whatIfPort, component.eventHandlerMap, [], new ExpandedState({allExpanded: true}));
        expect(component.compositionPayload === compositionPayload).toBeTruthy();

        // invalid trade rule and is a portfolio with positions
        jest.clearAllMocks();
        createRuleSpy.mockReturnValue(null);
        await component.tradeActionHandler(whatIfPort, params);
        expect(RuleFactory.createRuleBasedOnAction).toHaveBeenCalledWith(whatIfPort, params);
        expect(whatIfPort['addTradeRule']).toBeUndefined();
        expect(compositionDataServiceStub.fetchHoldingChangesFollowedByCompositionData$).not.toHaveBeenCalled();
    });


    it('tests setModellingType', async () => {
        jest.spyOn(WorkspaceStore.currentPortfolio$, 'next').mockImplementation(param => component.portfolio = param as WhatIfPortfolio);
        jest.spyOn(CompositionUtils, 'updateTradingColumn');

        component.portfolio.datePicker = new DateValue();
        expect(component.portfolio.modellingType).toBeUndefined();
        // modelling type position
        await component.setModellingType(1);
        expect(component.portfolio.modellingType).toBe(ModellingType.POSITION);
        expect(compositionDataServiceStub.fetchDefaultCompositionBreakdown$).toHaveBeenCalledWith(expect.any(PortfolioWithPositions));
        expect(compositionDataServiceStub.fetchHoldingChangesFollowedByCompositionData$).toHaveBeenCalledWith(expect.any(PortfolioWithPositions));
        expect(component.portfolio.composition === compositionData).toBeTruthy();
        expect(component.portfolio.compositionSetting.breakdownTree === breakdown).toBeTruthy();
        expect(CompositionUtils.updateTradingColumn).toHaveBeenCalledWith(expect.any(WhatIfPortfolio));


        // modelling type portfolio
        jest.clearAllMocks();
        await component.setModellingType(2);
        expect(component.portfolio.modellingType).toBe(ModellingType.PORTFOLIO);
        expect(compositionDataServiceStub.fetchDefaultCompositionBreakdown$).toHaveBeenCalledWith(expect.any(RulesBasedPortfolio));
        expect(CompositionUtils.updateTradingColumn).toHaveBeenCalledWith(expect.any(WhatIfPortfolio));


        // modelling type sector
        jest.clearAllMocks();
        await component.setModellingType(0);
        expect(component.portfolio.modellingType).toBe(ModellingType.SECTOR);
        expect(compositionDataServiceStub.fetchDefaultCompositionBreakdown$).toHaveBeenCalledWith(expect.any(RulesBasedPortfolio));
        expect(CompositionUtils.updateTradingColumn).toHaveBeenCalledWith(expect.any(WhatIfPortfolio));


        // invalid modelling type
        jest.clearAllMocks();
        jest.spyOn(console, 'warn');
        await component.setModellingType(4);
        expect(component.portfolio.modellingType).toBe(ModellingType.SECTOR);
        expect(console.warn).toHaveBeenCalled();
        expect(compositionDataServiceStub.fetchDefaultCompositionBreakdown$).toHaveBeenCalledWith(expect.any(RulesBasedPortfolio));
        expect(CompositionUtils.updateTradingColumn).toHaveBeenCalledWith(expect.any(WhatIfPortfolio));
    });

    it('tests maintainNaturalOrder', () => {
        expect(component.maintainNaturalOrder()).toBe(0);
    });

    it('tests refreshCompositionConfig', async () => {
        const compositionPayload: WidgetPayload = {};
        jest.spyOn(CompositionUtils, 'refreshCompositionData').mockReturnValue(compositionPayload);
        const whatIfPort: WhatIfPortfolio = new RulesBasedPortfolio();
        whatIfPort.holdingChanges = [new PortfolioSecurityHoldingChange(), new NewSecurityHoldingChange()];
        const refreshCompositionConfig = {sourceOfRules: 'securitySearch', portfolio: whatIfPort};
        component.callForRefreshComposition(refreshCompositionConfig);
        // only new Security holding change is retained
        expect(refreshCompositionConfig.portfolio.holdingChangesGeneratedForAddedSecurities.length).toBe(1);
        expect(refreshCompositionConfig.portfolio.holdingChangesGeneratedForAddedSecurities[0] instanceof NewSecurityHoldingChange).toBeTruthy();

        whatIfPort.holdingChanges = [new NewSecurityHoldingChange(), new NewSecurityHoldingChange(), new NewSecurityHoldingChange(), new PortfolioSecurityHoldingChange()];
        refreshCompositionConfig.portfolio = whatIfPort;
        component.callForRefreshComposition(refreshCompositionConfig);
        // only new Security holding change are retained
        expect(refreshCompositionConfig.portfolio.holdingChangesGeneratedForAddedSecurities.length).toBe(4);
    });


    it('should handle error in callForRefreshComposition', () => {
        const error = new Error('Test error');
        compositionDataServiceStub.fetchHoldingChangesFollowedByCompositionData$.mockReturnValue(throwError(error));

        const refreshCompositionConfig = {
            portfolio: {},
            showNotification: true,
            callbackFunction: jest.fn()
        };

        component.callForRefreshComposition(refreshCompositionConfig);

        expect(compositionDataServiceStub.fetchHoldingChangesFollowedByCompositionData$).toHaveBeenCalledWith(refreshCompositionConfig.portfolio, undefined, undefined);
        expect(notificationServiceStub.error).toHaveBeenCalledWith(error, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_FETCH_HOLDING_CHANGES_FOLLOWED_BY_COMPOSITION_DATA_ERROR);
        expect(refreshCompositionConfig.callbackFunction).toHaveBeenCalled();
    });

    it('tests resetComposition', () => {
        const mockFn = jest.fn().mockImplementation(() => { });
        component.portfolio.clearHoldingChanges = mockFn;
        component.portfolio.holdingChangesGeneratedForAddedSecurities = [new NewSecurityHoldingChange()];
        (component.portfolio as PortfolioWithPositions).latestOptimizationRunDetails = [new LatestOptimizationRunDetails()];
        component.resetComposition();
        expect(component.portfolio.clearHoldingChanges).toHaveBeenCalledTimes(1);
    });

    it('tests getModellingLevel', () => {
        const node = new RowNode(null);
        let tradeRule: any;
        tradeRule = new SecurityRule('abc', 45);
        expect(component.getModellingLevel(node, tradeRule)).toBe(ExploreModellingChangeLevel.EXPLORE_MODELLING_CHANGE_LEVEL_SECURITY);
        tradeRule = new BreakdownTreeRule('abc', 45, null, null);
        expect(component.getModellingLevel(node, tradeRule)).toBe(ExploreModellingChangeLevel.EXPLORE_MODELLING_CHANGE_LEVEL_SECTOR);
        tradeRule = new PortfolioRule('abc', 45, null, null);
        expect(component.getModellingLevel(node, tradeRule)).toBe(ExploreModellingChangeLevel.EXPLORE_MODELLING_CHANGE_LEVEL_PORTFOLIO);
        node.group = true;
        expect(component.getModellingLevel(node, tradeRule)).toBe(ExploreModellingChangeLevel.EXPLORE_MODELLING_CHANGE_LEVEL_PORTGROUP);
        tradeRule = null;
        expect(component.getModellingLevel(node, tradeRule)).toBe(ExploreModellingChangeLevel.EXPLORE_MODELLING_CHANGE_LEVEL_UNSPECIFIED);
    });
});
