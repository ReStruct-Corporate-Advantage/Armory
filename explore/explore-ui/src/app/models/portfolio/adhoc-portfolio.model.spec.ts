import {AdhocPortParams} from './adhocModelling/adhoc-port-params.model';
import {AdhocPortfolio} from './adhoc-portfolio.model';
import * as adhocPort from '../../../../mocks/adhocPort1.json';
import {ConfigInitializer} from '../../initializers/config.initializer';
import {Portfolio} from './portfolio.model';
import * as portMock from '../../../../mocks/portMock.json';
import {ConfigTypeFactory, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {BreakdownInitializer} from '@blk/explore-ui-breakdown';

describe('AdhocPortfolio tests', () => {

    beforeAll(() => {
        ConfigInitializer.registerHoldingChangeTypes();
        ConfigInitializer.registerPortfolioTypes();
        BreakdownInitializer.registerSectorConfigTypes();
        BreakdownInitializer.registerBreakdownConfigTypes();
    });

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });

    /**
     * Test case serialize/deserialize
     */
    it('serialize/deserialize', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const port = new AdhocPortfolio();
        port.deserialize(adhocPort);
        const saved = port.serialize(true);
        let newPort = new AdhocPortfolio();
        newPort.deserialize(saved);
        expect(port.equals(newPort)).toBe(true);
        newPort = ConfigTypeFactory.createConfig(saved, saved.configType, false);
        expect(port.equals(newPort)).toBe(true);
        expect(newPort.adhocParams.equals(new AdhocPortParams({
            name: 'Adhoc IP',
            fullName: 'Adhoc International Paper',
            currency: 'JPY',
            portMktNotional: 300000,
            date: {date: '01/01/2020', dateString: false}
        }))).toBe(true);
        expect(newPort.riskParitySettings.objectiveSettings.portfolioObjectives.length).toBe(2);
        expect(newPort.optimizationSettings.objectiveSettings.portfolioObjectives.length).toBe(1);
    });

    it('serialize/deserialize with existing adhocParams', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const port = new AdhocPortfolio();
        port.adhocParams = new AdhocPortParams({
            name: 'Adhoc',
            fullName: 'Adhoc Example',
            currency: 'USD',
            portMktNotional: 3
        });
        port.deserialize(adhocPort);
        const saved = port.serialize(true);
        let newPort = new AdhocPortfolio();
        newPort.deserialize(saved);
        expect(port.equals(newPort)).toBe(true);
        newPort = ConfigTypeFactory.createConfig(saved, saved.configType, false);
        expect(port.equals(newPort)).toBe(true);
        expect(newPort.adhocParams.name).toBe('Adhoc');
    });

    /**
     * Test case for copyFrom
     */
    it('Test copyFrom', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        // Copy from Portfolio With Positions
        let port: Portfolio = new AdhocPortfolio();
        port.deserialize(adhocPort);
        let newPort = new AdhocPortfolio('IP');
        newPort.copyFrom(port);
        expect(port.equals(newPort)).toBe(true);

        // Copy from Normal Portfolio
        port = new Portfolio();
        port.deserialize(portMock);
        newPort = new AdhocPortfolio();
        newPort.copyFrom(port);
        expect(port.equals(newPort)).toBe(true);

        expect(newPort.adhocParams).not.toBeDefined();
    });

    /**
     * Test basic parameters are created properly
     */
    it('create basic params check', () => {
        // Create the portfolio to perform the tests on.
        const port = new AdhocPortfolio('test_ticker', {date: '03/10/2016', calCode: 'GreenPkg'});
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
