import {AdhocPortParams} from './adhocModelling/adhoc-port-params.model';
import {AdhocPortGroup} from './adhoc-portgroup.model';
import * as adhocPort from '../../../../mocks/adhocPort1.json';
import {ConfigInitializer} from '../../initializers/config.initializer';
import {Portfolio} from './portfolio.model';
import * as portMock from '../../../../mocks/portMock.json';
import {ConfigTypeFactory, CoreUserMetaDataStore, DateValue, UserMetaData} from '@blk/explore-ui-core';
import {PortfolioRule} from '@models/portfolio/tradeRules/portfolio-rule.model';
import {BreakdownInitializer} from '@blk/explore-ui-breakdown';


describe('AdhocPortfolio tests', () => {

    beforeAll(() => {
        ConfigInitializer.registerHoldingChangeTypes();
        ConfigInitializer.registerPortfolioTypes();
        BreakdownInitializer.registerSectorConfigTypes();
        BreakdownInitializer.registerBreakdownConfigTypes();
        ConfigInitializer.registerRuleTypes();
    });

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });

    /**
     * Test case serialize/deserialize
     */
    it('serialize/deserialize', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const port = new AdhocPortGroup();
        port.deserialize(adhocPort);
        const portRule: PortfolioRule = new PortfolioRule('PEP', 5, 'PERCENT_NAV');
        portRule.ruleType = 'Portfolio';
        port.compositionRules.tradeRules.push(portRule);
        const saved = port.serialize(true);
        let newPort = new AdhocPortGroup();
        newPort.deserialize(saved);
        port.datePicker = newPort.datePicker = new DateValue({
            date: '01/01/2020',
            calCode: 'GreenPkg',
            dateStringValue: '',
            dateString: false
        });
        expect(port.equals(newPort)).toBe(true);
        newPort = ConfigTypeFactory.createConfig(saved, saved.configType, false);
        port.datePicker = newPort.datePicker = new DateValue({
            date: '01/01/2020',
            calCode: 'GreenPkg',
            dateStringValue: '',
            dateString: false
        });
        expect(port.equals(newPort)).toBe(true);
        expect(newPort.adhocParams.equals(new AdhocPortParams({
            name: 'Adhoc IP',
            fullName: 'Adhoc International Paper',
            currency: 'JPY',
            portMktNotional: 300000,
            date: {date: '01/01/2020', dateString: false}
        }))).toBe(true);
    });

    it('serialize/deserialize with existing adhocParams', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const port = new AdhocPortGroup();
        port.adhocParams = new AdhocPortParams({
            name: 'Adhoc',
            fullName: 'Adhoc Example',
            currency: 'USD',
            portMktNotional: 3
        });
        const portRule: PortfolioRule = new PortfolioRule('PEP', 5, 'PERCENT_NAV');
        portRule.ruleType = 'Portfolio';
        port.compositionRules.tradeRules.push(portRule);
        port.deserialize(adhocPort);
        const saved = port.serialize(true);
        let newPort = new AdhocPortGroup();
        newPort.deserialize(saved);
        port.datePicker = newPort.datePicker = new DateValue({
            date: '01/01/2020',
            calCode: 'GreenPkg',
            dateStringValue: '',
            dateString: false
        });
        expect(port.equals(newPort)).toBe(true);
        newPort = ConfigTypeFactory.createConfig(saved, saved.configType, false);
        port.datePicker = newPort.datePicker = new DateValue({
            date: '01/01/2020',
            calCode: 'GreenPkg',
            dateStringValue: '',
            dateString: false
        });
        expect(port.equals(newPort)).toBe(true);
        expect(newPort.adhocParams.name).toBe('Adhoc');
    });

    /**
     * Test case for copyFrom
     */
    it('Test copyFrom', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        // Copy from Rule based Portfolio
        let port: Portfolio = new AdhocPortGroup();
        port.deserialize(adhocPort);
        const portRule: PortfolioRule = new PortfolioRule('PEP', 5, 'PERCENT_NAV');
        portRule.ruleType = 'Portfolio';
        (port as AdhocPortGroup).compositionRules.tradeRules.push(portRule);
        let newPort = new AdhocPortGroup('IP');
        newPort.copyFrom(port);
        port.datePicker = newPort.datePicker = new DateValue({
            date: '01/01/2020',
            calCode: 'GreenPkg',
            dateStringValue: '',
            dateString: false
        });
        expect(port.equals(newPort)).toBe(true);

        // Copy from Normal Portfolio
        port = new Portfolio();
        port.deserialize(portMock);
        newPort = new AdhocPortGroup();
        newPort.copyFrom(port);
        port.datePicker = newPort.datePicker = new DateValue({
            date: '01/01/2020',
            calCode: 'GreenPkg',
            dateStringValue: '',
            dateString: false
        });
        expect(port.equals(newPort)).toBe(true);
        expect(newPort.adhocParams).not.toBeDefined();
    });

    /**
     * Test basic parameters are created properly
     */
    it('create basic params check', () => {
        // Create the portfolio to perform the tests on.
        const port = new AdhocPortGroup('test_ticker', {date: '03/10/2016', calCode: 'GreenPkg'});
        port.fullName = 'test_fullname';
        port.title = 'test_name';
        port.currency = 'USD';
        port.adhocParams = new AdhocPortParams({
            name: 'Adhoc IP',
            fullName: 'Adhoc International Paper',
            currency: 'JPY',
            portMktNotional: 300000,
            date: {date: '01/01/2020', dateString: false}
        });

        const requestParams: any = {};
        port.addRequestParams(requestParams);
        expect(requestParams).toEqual({
            portfolio: 'test_ticker',
            portId: expect.anything(),
            fullPortfolioName: 'test_fullname',
            portfolioIdentifier: 'test_name',
            forDate: '03/10/2016',
            currency: 'USD',
            holidayCalendar: 'GreenPkg',
            includeAliasPortfolios: false,
            rules: '[]',
            splitPositionTypes: '',
            positionMode: 'AS_OF_W',
            adhocParams: {
                name: 'Adhoc IP',
                fullName: 'Adhoc International Paper',
                currency: 'JPY',
                portMktNotional: 300000,
                date: {date: '01/01/2020', dateString: false}
            }
        });
    });
});
