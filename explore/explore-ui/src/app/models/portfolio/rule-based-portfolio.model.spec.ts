import {CompositionRule} from './composition/composition-rule.model';
import {ModellingType} from '@enums/modelling-type.enum';
import {SectorRule} from './tradeRules/sector-rule.model';
import {RulesBasedPortfolio} from './rule-based-portfolio.model';
import {PortfolioSecurityHoldingChange} from './composition/portfolio-security-holding-change.model';
import * as ruleBasedPortfolio from '../../../../mocks/ruleBasedPortfolio1.json';
import * as portWithPositions from '../../../../mocks/portWithPositions1.json';
import * as portMock from '../../../../mocks/portMock.json';
import {CompositionSetting} from './composition/composition-setting.model';
import {Portfolio} from './portfolio.model';
import {isEqual} from 'lodash';
import {PortfolioWithPositions} from './portfolio-with-positions.model';
import {ConfigInitializer} from '../../initializers/config.initializer';
import {CalendarDateUtils, ConfigTypeFactory, DateValue, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {BreakdownTreeRule} from '@models/portfolio/tradeRules/breakdown-tree-rule.model';
import {BreakdownInitializer} from '@blk/explore-ui-breakdown';

describe('RulesBasedPortfolio tests', () => {

    beforeAll(() => {
        BreakdownInitializer.registerSectorRuleInfoTypes();
        ConfigInitializer.registerRuleTypes();
        ConfigInitializer.registerHoldingChangeTypes();
        ConfigInitializer.registerPortfolioTypes();
        BreakdownInitializer.registerSectorConfigTypes();
        BreakdownInitializer.registerBreakdownConfigTypes();
    });

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });

    /**
     * Test case for the constructor initialization
     */
    it('Test constructor', () => {
        let port = new RulesBasedPortfolio('IP', '', {date: '03/10/2016'});
        expect(port.title).toBe('IP-Portfolio with Rules/Filter');
        expect(port.modellingType).toBe(ModellingType.SECTOR);
        expect(port.compositionRules.title).toBe('IP');

        port = new RulesBasedPortfolio('IP', 'RulesBasedIP', {date: '03/10/2016'});
        expect(port.title).toBe('RulesBasedIP');
    });

    /**
     * Test case serialize/deserialize
     */
    it('serialize/deserialize', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01'
        const port = new RulesBasedPortfolio();
        port.deserialize(ruleBasedPortfolio);
        const saved = port.serialize(true);
        let newPort = new RulesBasedPortfolio();
        newPort.deserialize(saved);
        expect(newPort.datePicker).toBeTruthy();
        expect(newPort.datePicker.serialize()).toEqual(CalendarDateUtils.getDefaultDateObject().serialize());
        newPort.datePicker = new DateValue({
            date: '03/09/2016',
            calCode: 'GreenPkg',
            dateStringValue: '',
            dateString: false
        });
        port.datePicker = new DateValue({
            date: '03/09/2016',
            calCode: 'GreenPkg',
            dateStringValue: '',
            dateString: false
        });
        expect(port.equals(newPort)).toBe(true);
        newPort = ConfigTypeFactory.createConfig(saved, saved.configType, false);
        newPort.datePicker = new DateValue({
            date: '03/09/2016',
            calCode: 'GreenPkg',
            dateStringValue: '',
            dateString: false
        });
        expect(port.equals(newPort)).toBe(true);
    });

    /**
     * Test case deserialize for old favorites
     */
    it('deserialize old favorites', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01'
        const port = new RulesBasedPortfolio();
        port.deserialize(ruleBasedPortfolio);

        const newPort = new RulesBasedPortfolio();
        newPort.deserialize({
            compRulesAndFilter: {
                compositionRules: port.serialize(true).compositionRules
            }
        });

        expect(newPort.compositionRules.equals(port.compositionRules)).toBe(true);
        expect(isEqual(newPort.compositionSetting.serialize(), new CompositionSetting().serialize())).toBe(true);
    });


    /**
     * Test case for copyFrom
     */
    it('Test copyFrom', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01'
        // Copy from Rules Based Portfolio
        let port: Portfolio = new RulesBasedPortfolio();
        port.deserialize(ruleBasedPortfolio);
        let newPort = new RulesBasedPortfolio('IP');
        newPort.copyFrom(port);
        newPort.datePicker = new DateValue({
            date: '03/09/2016',
            calCode: 'GreenPkg',
            dateStringValue: '',
            dateString: false
        });
        port.datePicker = new DateValue({
            date: '03/09/2016',
            calCode: 'GreenPkg',
            dateStringValue: '',
            dateString: false
        });
        expect(port.equals(newPort)).toBe(true);

        // Copy from Normal Portfolio
        port = new Portfolio();
        port.deserialize(portMock);
        newPort = new RulesBasedPortfolio();
        newPort.copyFrom(port);
        newPort.datePicker = new DateValue({
            date: '03/09/2016',
            calCode: 'GreenPkg',
            dateStringValue: '',
            dateString: false
        });
        port.datePicker = new DateValue({
            date: '03/09/2016',
            calCode: 'GreenPkg',
            dateStringValue: '',
            dateString: false
        });
        expect(port.equals(newPort)).toBe(true);
        expect(isEqual(newPort.compositionSetting.serialize(), new CompositionSetting().serialize())).toBe(true);
    });

    /**
     * Test case for hasHoldingChangesOrRules
     */
    it('Test hasHoldingChangesOrRules', () => {
        const port = new RulesBasedPortfolio();
        port.deserialize(ruleBasedPortfolio);

        // Has comp rules
        expect(port.hasHoldingChangesOrRules()).toBe(true);

        // Has holding changes
        port.compositionRules = new CompositionRule();
        port.holdingChanges.push(new PortfolioSecurityHoldingChange());
        expect(port.hasHoldingChangesOrRules()).toBe(true);

        // No comp rules or holding changes
        port.holdingChanges = [];
        expect(port.hasHoldingChangesOrRules()).toBe(false);
    });

    /**
     * Test case for addTradeRule
     */
    it('Test addTradeRule', () => {
        const port = new RulesBasedPortfolio();
        port.deserialize(ruleBasedPortfolio);

        port.compositionRules = new CompositionRule();
        port.addTradeRule(new SectorRule('BND', 20, null));
        expect(port.compositionRules.tradeRules.length).toBe(1);

        port.addTradeRule(new SectorRule('BND', 40, null));
        expect(port.compositionRules.tradeRules.length).toBe(1);
        expect(port.compositionRules.tradeRules[0].newWeight).toBe(40);

        port.addTradeRule(new SectorRule('ABS', 40, null));
        expect(port.compositionRules.tradeRules.length).toBe(2);

        port.addTradeRule(new BreakdownTreeRule('ABS', 10.0, 'test', ['Corporates', 'Industrial']));
        expect(port.compositionRules.tradeRules.length).toBe(3);
        expect(port.compositionRules.tradeRules[2].newWeight).toBe(10);

        port.addTradeRule(new BreakdownTreeRule('ABS', 15.0, 'test', ['Corporates', 'Industrial']));
        expect(port.compositionRules.tradeRules.length).toBe(3);
        expect(port.compositionRules.tradeRules[2].newWeight).toBe(15);

        port.addTradeRule(new BreakdownTreeRule('ABS', 17.0, 'test', ['Corporates']));
        expect(port.compositionRules.tradeRules.length).toBe(4);
        expect(port.compositionRules.tradeRules[3].newWeight).toBe(17);

        port.addTradeRule(new BreakdownTreeRule('ABS', 20.0, 'test123', ['Corporates']));
        expect(port.compositionRules.tradeRules.length).toBe(5);
        expect(port.compositionRules.tradeRules[4].newWeight).toBe(20);
    });

    /**
     * Test basic parameters are created properly
     */
    it('create basic params check', () => {
        const port = new RulesBasedPortfolio();
        port.deserialize(ruleBasedPortfolio);
        port.datePicker = new DateValue({date: '03/09/2016', calCode: 'GreenPkg'});

        const port2 = new PortfolioWithPositions();
        port2.deserialize(portWithPositions);

        port.holdingChanges = port2.holdingChanges;
        port.fullName = 'International Paper';
        port.title = 'test_name';

        const requestParams: any = {};
        port.addRequestParams(requestParams);
        expect(requestParams).toEqual({
            portfolio: 'IP',
            portId: expect.anything(),
            fullPortfolioName: 'International Paper',
            portfolioIdentifier: 'test_name',
            forDate: '03/09/2016',
            currency: 'USD',
            holidayCalendar: 'GreenPkg',
            includeAliasPortfolios: false,
            holdingChanges: port.holdingChanges.map(change => change.serialize()),
            rules: JSON.stringify(port.compositionRules.tradeRules.map(change => change.serialize())),
            benchOrder: 1,
            benchSelection: 'RISK',
            splitPositionTypes: '',
            positionMode: 'AS_OF_W',
        });
    });

    it('Test clearHoldingChanges', () => {
        const port = new RulesBasedPortfolio();
        port.deserialize(ruleBasedPortfolio);

        port.compositionRules = new CompositionRule();
        port.addTradeRule(new SectorRule('BND', 20, null));
        port.addTradeRule(new SectorRule('CLR', 40, null));
        port.addTradeRule(new SectorRule('ABS', 40, null));
        const holdingChange1 = new PortfolioSecurityHoldingChange([{
            lineItem: 'ABC',
            changeInWeight: 2.0,
            newWeight: 3.0,
            isNavNeutral: true
        },
            {
                lineItem: 'ABC',
                changeInWeight: 2.0,
                newWeight: 3.0,
                isNavNeutral: false
            }]);
        port.addHoldingChanges([holdingChange1]);
        expect(port.compositionRules.tradeRules.length).toBe(3);
        port.clearHoldingChanges();
        expect(port.compositionRules.tradeRules.length).toBe(0);
        expect(port.holdingChanges.length).toBe(1);

    });

    it('Test clearHoldingChangesWithRulelist', () => {
        const port = new RulesBasedPortfolio();
        port.deserialize(ruleBasedPortfolio);

        port.compositionRules = new CompositionRule();
        port.addTradeRule(new SectorRule('BND', 20, null));
        port.addTradeRule(new SectorRule('CLR', 40, null));
        port.addTradeRule(new SectorRule('ABS', 40, null));
        const holdingChange1 = new PortfolioSecurityHoldingChange([{
            lineItem: 'ABC',
            changeInWeight: 2.0,
            newWeight: 3.0,
            isNavNeutral: true
        },
            {
                lineItem: 'ABC',
                changeInWeight: 2.0,
                newWeight: 3.0,
                isNavNeutral: false
            }]);
        port.addHoldingChanges([holdingChange1]);
        expect(port.compositionRules.tradeRules.length).toBe(3);
        port.clearHoldingChangesWithRulelist(false);
        expect(port.compositionRules.tradeRules.length).toBe(3);
        expect(port.holdingChanges.length).toBe(1);

    });
});
