import {PortfolioWithPositions} from './portfolio-with-positions.model';
import {ModellingType} from '@enums/modelling-type.enum';
import {OptimizationSettings} from './optimization/optimization-settings.model';
import * as portWithPositions from '../../../../mocks/portWithPositions1.json';
import * as portMock from '../../../../mocks/portMock.json';
import {CompositionSetting} from './composition/composition-setting.model';
import {Portfolio} from './portfolio.model';
import {isEqual} from 'lodash';
import {ConfigInitializer} from '../../initializers/config.initializer';
import {ConfigTypeFactory, DateValue, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {BreakdownInitializer} from '@blk/explore-ui-breakdown';
import {PortfolioHoldingChange} from '@models/portfolio/composition/portfolio-holding-change.model';

describe('PortfolioWithPositions tests', () => {

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
     * Test case for the constructor initialization
     */
    it('Test constructor', () => {
        let port = new PortfolioWithPositions('IP', new DateValue({date: '03/10/2016'}));
        expect(port.title).toBe('IP 03/10/2016');
        expect(port.modellingType).toBe(ModellingType.POSITION);
        expect(port.date).toBe('03/10/2016');
        expect(port.holdingChanges.length).toBe(0);

        port = new PortfolioWithPositions('IP', {date: '03/10/2016'}, null, 'PortWithPositionIP');
        expect(port.title).toBe('PortWithPositionIP');
        expect(port.holdingChanges.length).toBe(0);
    });

    /**
     * Test case serialize/deserialize
     */
    it('serialize/deserialize', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const port = new PortfolioWithPositions();
        port.deserialize(portWithPositions);
        const saved = port.serialize(true);
        let newPort = new PortfolioWithPositions();
        newPort.deserialize(saved);
        expect(port.equals(newPort)).toBe(true);
        newPort = ConfigTypeFactory.createConfig(saved, saved.configType, false);
        expect(port.equals(newPort)).toBe(true);
        expect(newPort.holdingChanges.length).toBe(2);
        expect(newPort.riskParitySettings.objectiveSettings.portfolioObjectives.length).toBe(2);
        expect(newPort.optimizationSettings.objectiveSettings.portfolioObjectives.length).toBe(1);
    });

    /**
     * Test case serialize relative date
     */
    it('serialize relative date', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const port = new PortfolioWithPositions();
        port.deserialize(portWithPositions);
        port.datePicker = new DateValue({
            date: '03/09/2016',
            dateStringValue: 'T-1',
            dateString: true
        });
        const saved = port.serialize(true);
        expect(saved.datePicker.date).toBe('03/09/2016');
        expect(saved.datePicker.dateStringValue).toBe('');
        expect(saved.datePicker.dateString).toBe(false);
    });

    /**
     * Test case deSerialize with different datePicker date
     */
    it('deSerialize with different datePicker date', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const port = new PortfolioWithPositions();
        port.deserialize(portWithPositions);
        const saved = port.serialize(true);
        saved.datePicker = {
            date: '03/10/2016',
            calCode: 'GreenPkg'
        };
        const newPort = new PortfolioWithPositions();
        newPort.deserialize(saved);
        expect(newPort.datePicker.date).toBe('03/09/2016');
        expect(newPort.datePicker.dateStringValue).toBe(undefined);
        expect(newPort.datePicker.dateString).toBe(false);
        expect(newPort.datePicker.calCode).toBe('GreenPkg');
    });

    /**
     * Test case for copyFrom
     */
    it('Test copyFrom', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        // Copy from Portfolio With Positions
        let port: Portfolio = new PortfolioWithPositions();
        port.deserialize(portWithPositions);
        (port as PortfolioWithPositions).updateOptimizationSettings();
        let newPort = new PortfolioWithPositions('IP');
        newPort.copyFrom(port);
        expect(port.equals(newPort)).toBe(true);
        expect(newPort.optimizationSettings.objectiveSettings.portfolioObjectives.length).toBe(1);

        // Copy from Normal Portfolio
        port = new Portfolio();
        port.deserialize(portMock);
        newPort = new PortfolioWithPositions();
        newPort.copyFrom(port);
        expect(port.equals(newPort)).toBe(true);

        const expectedCompositionSettings = new CompositionSetting();
        expect(isEqual(newPort.compositionSetting, expectedCompositionSettings)).toBe(true);
        expect(newPort.date).toBe(port.datePicker.date);
    });

    /**
     * Test case for updateOptimizationSettings
     */
    it('Test updateOptimizationSettings', () => {
        // Copy from Portfolio With Positions
        const port = new PortfolioWithPositions();
        port.deserialize(portWithPositions);
        port.updateOptimizationSettings();

        const optimizationSettings = new OptimizationSettings();
        optimizationSettings.setDefaultObjective();
        expect(port.optimizationSettings.equals(optimizationSettings)).toBe(true);
    });

    /**
     * Test basic parameters are created properly
     */
    it('create basic params check', () => {
        const port = new PortfolioWithPositions();
        port.deserialize(portWithPositions);
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
            benchOrder: undefined,
            benchSelection: 'PERFORM',
            splitPositionTypes: '',
            positionMode: 'AS_OF_W',
        });
    });

    it('test clearHoldingChanges', () => {
        // test for portfolio with positions - point in time
        const port2 = new PortfolioWithPositions();
        const holdingChange2 = new PortfolioHoldingChange({
            lineItem: 'DEF',
            changeInWeight: 3.0,
            newWeight: 4.0
        });
        port2.setModellingType(1);
        port2.addHoldingChanges([holdingChange2]);
        (port2 as PortfolioWithPositions).optoFinalHoldings = [holdingChange2];
        port2.clearHoldingChanges();
        expect(port2.holdingChanges.length).toBe(0);
        expect((port2 as PortfolioWithPositions).optoFinalHoldings.length).toBe(0);
    });
});
