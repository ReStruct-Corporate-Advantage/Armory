import {ConfigInitializer} from '../initializers/config.initializer';
import {RuleFactory} from './rule.factory';
import {CompositionConstants} from '../constants';
import {PortfolioRule} from '@models/portfolio/tradeRules/portfolio-rule.model';
import {ActiveSectorRule} from '@models/portfolio/tradeRules/active-sector-rule.model';
import {ActiveSecurityRule} from '@models/portfolio/tradeRules/active-security-rule.model';
import {SectorRule} from '@models/portfolio/tradeRules/sector-rule.model';
import {NAVSecurityRule} from '@models/portfolio/tradeRules/nav-security-rule.model';
import {SecurityRule} from '@models/portfolio/tradeRules/security-rule.model';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import {ModellingType} from '@enums/modelling-type.enum';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {BreakdownTreeRule} from '@models/portfolio/tradeRules/breakdown-tree-rule.model';
import {ActiveBreakdownRule} from '@models/portfolio/tradeRules/active-breakdown-rule.model';
import {NewPortfolioHoldingChange} from '@models/portfolio/composition/new-portfolio-holding-change.model';
import {RuleUnit} from '@enums/rule-unit.enum';
import {CoreUserMetaDataStore,UserMetaData} from '@blk/explore-ui-core';

describe('Rule Factory Tests', () => {
    beforeAll(() => {
        ConfigInitializer.registerRuleTypes();
    });

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });

    it('tests createRuleBasedOnType', () => {
        expect(RuleFactory.createRuleBasedOnType({'ruleType': CompositionConstants.RULE_TYPES.PORTFOLIO}) instanceof PortfolioRule).toBe(true);
        expect(RuleFactory.createRuleBasedOnType({'ruleType': CompositionConstants.RULE_TYPES.NAV_SECURITY}) instanceof NAVSecurityRule).toBe(true);
        expect(RuleFactory.createRuleBasedOnType({'ruleType': CompositionConstants.RULE_TYPES.ACTIVE_SECURITY}) instanceof ActiveSecurityRule).toBe(true);
        expect(RuleFactory.createRuleBasedOnType({'ruleType': CompositionConstants.RULE_TYPES.SECTOR}) instanceof SectorRule).toBe(true);
        expect(RuleFactory.createRuleBasedOnType({'ruleType': CompositionConstants.RULE_TYPES.ACTIVE_SECTOR}) instanceof ActiveSectorRule).toBe(true);
        expect(RuleFactory.createRuleBasedOnType({'ruleType': CompositionConstants.RULE_TYPES.BREAKDOWN_TREE}) instanceof BreakdownTreeRule).toBe(true);
        expect(RuleFactory.createRuleBasedOnType({'ruleType': CompositionConstants.RULE_TYPES.ACTIVE_BREAKDOWN}) instanceof ActiveBreakdownRule).toBe(true);
        expect(RuleFactory.createRuleBasedOnType({'ruleType': ''}) instanceof SecurityRule).toBe(true);
    });

    it('Test Returns null rule for no change in values', () => {
        const params: any = {
            newValue: 10,
            oldValue: 10
        };
        const rule: BaseRule = RuleFactory.createRuleBasedOnAction(null, params);
        expect(rule).toBeNull();
    });

    it('test Rule for PortGroups', () => {
        const portfolio: RulesBasedPortfolio = createPortfolio('CORE-HQ', true, false);
        portfolio.compositionSetting.breakdownTree.children = [];
        portfolio.modellingType = ModellingType.PORTFOLIO;
        const params: any = createParams('HIC', 5, 10, 'pct_nav_group', 'PORT', false, 0);
        const rule: BaseRule = RuleFactory.createRuleBasedOnAction(portfolio, params);

        expect(rule).not.toBeNull();
        expect(rule instanceof PortfolioRule).toBeTruthy();
        expect(rule.newWeight).toEqual(10);
    });

    it('test Rule with arithmetic signs', () => {
        const portfolio: RulesBasedPortfolio = createPortfolio('CORE-HQ', true, false);
        portfolio.compositionSetting.breakdownTree.children = [];
        portfolio.modellingType = ModellingType.PORTFOLIO;
        const params: any = createParams('HIC', 5, 10, 'pct_nav_group', 'PORT', false, 0);
        params.newValue = '+-10';
        const rule: BaseRule = RuleFactory.createRuleBasedOnAction(portfolio, params);

        expect(rule).not.toBeNull();
        expect(rule instanceof PortfolioRule).toBeTruthy();
        expect(rule.newWeight).toEqual(-5);
    });

    it('test CreateRule method', () => {
        expect(RuleFactory.createRule('037833100', 0, 'KeepAsCash')).toStrictEqual(new NAVSecurityRule('037833100', 0));
        expect(RuleFactory.createRule('037833100', 0, 'Security')).toStrictEqual(new SecurityRule('037833100', 0));
        expect(RuleFactory.createRule('037833100', 0, 'Portfolio')).toStrictEqual(new PortfolioRule('037833100', 0));
        expect(RuleFactory.createRule('037833100', 0, 'Security', RuleUnit.PCT_NOTIONAL_VAL, 123, 'Test', 'TestPort'))
            .toStrictEqual(new SecurityRule('037833100', 0, RuleUnit.PCT_NOTIONAL_VAL, undefined, 'TestPort'));
    });

    it('test Rule for Composite Portfolios', () => {
        const portfolio: RulesBasedPortfolio = createPortfolio('LEH_AGG', false, true);
        portfolio.compositionSetting.breakdownTree.children = [];
        portfolio.modellingType = ModellingType.PORTFOLIO;
        const params: any = createParams('HIC', 10, 4.5, 'pct_nav_group', 'PORT', false, 0);
        let rule: BaseRule = RuleFactory.createRuleBasedOnAction(portfolio, params);

        expect(rule).not.toBeNull();
        expect(rule instanceof PortfolioRule).toBeTruthy();
        expect(rule.newWeight).toEqual(4.5);

        // scenario #2 - composite what-if
        params.node.data.cusip = 'HIC-#-(what-if HIC 123)';
        const newPortChange: NewPortfolioHoldingChange = new NewPortfolioHoldingChange();
        newPortChange.title = 'what-if HIC 123';
        newPortChange.id = 123;
        portfolio.holdingChanges = [newPortChange];

        rule = RuleFactory.createRuleBasedOnAction(portfolio, params);
        expect(rule instanceof PortfolioRule && rule.id === 123).toBeTruthy();
    });

    it('test rule for security level ', () => {
        const portfolio: RulesBasedPortfolio = createPortfolio('IP', false, false);
        portfolio.compositionSetting.breakdownTree = new Breakdown();
        const params: any = createParams('GOOGLE', 10, 4.5, 'pct_notional_val', 'PORT', false, 0);
        const rule: BaseRule = RuleFactory.createRuleBasedOnAction(portfolio, params);

        expect(rule).not.toBeNull();
        expect(rule instanceof SecurityRule).toBeTruthy();
        expect(rule.newWeight).toEqual(4.5);
    });

    it('test single portfolio Sector trade rule', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const portfolio: RulesBasedPortfolio = createPortfolio('IP', false, false);
        portfolio.compositionSetting.breakdownTree = Breakdown.getDefaultBreakdown();
        const params: any = createParams('ABS', 10, 4.5, 'pct_notional_val', 'PORT', false, 0);
        params.node.group = true;
        params.node.key = 'sectorName';
        params.node.level = 1;
        params.node.parent = {'level': 0};

        const rule: BaseRule = RuleFactory.createRuleBasedOnAction(portfolio, params);

        expect(rule).not.toBeNull();
        expect(rule instanceof BreakdownTreeRule).toBeTruthy();
        expect(rule.newWeight).toEqual(4.5);
    });


    it('test single portfolio with Breakdown but action on security ', () => {
        const portfolio: RulesBasedPortfolio = createPortfolio('IP', false, false);
        portfolio.compositionSetting.breakdownTree = Breakdown.getDefaultBreakdown();
        const params: any = createParams('GOOGLE', 10, 4.5, 'pct_notional_val', 'PORT', false, 0);
        const rule: BaseRule = RuleFactory.createRuleBasedOnAction(portfolio, params);

        expect(rule).not.toBeNull();
        expect(rule instanceof SecurityRule).toBeTruthy();
        expect(rule.newWeight).toEqual(4.5);
    });

    /**
     * Function to create RulesBasedPortfolio object based on parameters passed.
     */
    function createPortfolio(portfolioName: string, isPortGroup: boolean, isComposite: boolean) {
        const portfolio: RulesBasedPortfolio = new RulesBasedPortfolio(portfolioName);
        portfolio.isPortfolioGroup = isPortGroup;
        portfolio.isCompositePortfolio = isComposite;

        if (isPortGroup || isComposite) {
            portfolio.compositionSetting.tradingColumn = 'pct_nav_group';
        } else {
            portfolio.compositionSetting.tradingColumn = 'pct_notional_val';
        }
        return portfolio;
    }

    /**
     * Create Parameters on node used by factory
     */
    function createParams(lineItem: string, oldValue: number, newValue: number, tradingColumn: string, columnType: string, isInActiveSpace: boolean, benchValue: number) {
        const params: any = {newValue: newValue, oldValue: oldValue};
        params.data = {};
        params.data.title = lineItem;
        params.node = {};
        params.node.parent = 'IP';
        params.node.data = {};
        params.node.data.cusip = lineItem;

        let colSeparator = '_';

        if (columnType === 'ACTIVE') {
            colSeparator = colSeparator + 'active_';
        } else if (isInActiveSpace) {
            params.node.data[tradingColumn + colSeparator + 'bench_before'] = benchValue;
            params.node.data[tradingColumn + colSeparator + 'bench_after'] = benchValue;
        }

        params.node.data[tradingColumn + colSeparator + 'before'] = oldValue;
        params.node.data[tradingColumn + colSeparator + 'after'] = newValue;
        params.colDef = {};
        params.colDef.positionColumnType = columnType;

        params.column = {parent: {groupId: tradingColumn}};
        return params;
    }
});
