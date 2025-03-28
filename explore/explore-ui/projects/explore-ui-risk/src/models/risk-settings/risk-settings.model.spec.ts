import {DateValue, NotificationType} from '@blk/explore-ui-core';
import {CoreRiskConstants} from '../../core-risk.constants';
import {AdvancedRiskSettings} from '../advanced-risk-settings/advanced-risk-settings.model';
import {EconomySettings} from '../economy-settings/economy-settings.model';
import {ExposureSettings} from '../exposure-settings/exposure-settings.model';
import {RiskSettings} from './risk-settings.model';
import {HvarRiskSettingsModel} from '../hvar-risk-settings/hvar-risk-settings.model';
import { AdvancedHvarRiskSettingsModel } from '../advance-hvar-risk-settings/advanced-hvar-risk-settings.model';

describe('RiskSettings', () => {
    /**
     * Test case for createConfig
     */
    it('Test serialize', () => {
        const economySettings = new EconomySettings(undefined, '');
        economySettings.weightingScheme = 'DLY';
        economySettings.riskHorizon = 2;
        economySettings.decayFactor = 0.33;
        economySettings.confidenceLevelSD = 2;
        economySettings.period = 3;
        economySettings.dateObject = new DateValue({date: '12/03/2017', calCode: 'Greenpkg', dateString: false});
        const exposureRiskSettings = new ExposureSettings(undefined, '');
        exposureRiskSettings.riskModel = '^JAPNA';
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, '');
        advancedRiskSettings.excludeBlock = 'FX';


        // GIVEN
        const riskSettings = new RiskSettings();
        riskSettings.economyRiskSettings = economySettings;
        riskSettings.exposureRiskSettings = exposureRiskSettings;
        riskSettings.advancedRiskSettings = advancedRiskSettings;

        // WHEN
        // TODO: Change this to serialize
        const expectedConfig: any = riskSettings.doSerialize();
        const newRiskSettings: RiskSettings = new RiskSettings(expectedConfig);

        // THEN
        expect(newRiskSettings.economyRiskSettings).toEqual(riskSettings.economyRiskSettings);
        expect(newRiskSettings.exposureRiskSettings).toEqual(riskSettings.exposureRiskSettings);
        expect(newRiskSettings.advancedRiskSettings).toEqual(riskSettings.advancedRiskSettings);
    });

    /**
     * Test case for getRequestParams
     */
    it('Test getRequestParams - has widget level risk settings', () => {
        const defaultEconomySettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        defaultEconomySettings.weightingScheme = 'DLY';
        defaultEconomySettings.riskHorizon = 2;
        defaultEconomySettings.decayFactor = 0.33;
        defaultEconomySettings.confidenceLevelSD = 2;
        defaultEconomySettings.period = 3;
        defaultEconomySettings.dateObject = new DateValue({date: '12/03/2017'});
        const defaultExposureRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        defaultExposureRiskSettings.riskModel = '^JAPNA';
        const defaultAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        defaultAdvancedRiskSettings.excludeBlock = 'FX';
        // GIVEN
        const defaultRiskSettings = new RiskSettings();
        defaultRiskSettings.economyRiskSettings = defaultEconomySettings;
        defaultRiskSettings.exposureRiskSettings = defaultExposureRiskSettings;
        defaultRiskSettings.advancedRiskSettings = defaultAdvancedRiskSettings;


        const economySettings = new EconomySettings(defaultEconomySettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        const exposureRiskSettings = new ExposureSettings(defaultExposureRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        const advancedRiskSettings = new AdvancedRiskSettings(defaultAdvancedRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        // GIVEN
        const riskSettings = new RiskSettings();
        riskSettings.economyRiskSettings = economySettings;
        riskSettings.exposureRiskSettings = exposureRiskSettings;
        riskSettings.advancedRiskSettings = advancedRiskSettings;

        // WHEN
        const expectedParams = riskSettings.getRequestParams();

        // THEN -- Portfolio and Widget
        expect(expectedParams).toEqual({
            'EconomyDate': '12/03/2017',
            'RiskHorizon': 2,
            'ConfidenceLevelInStdDeviation': 2,
            'CovMatrix': 'DLY',
            'DecayFactor': 0.33,
            'Period': 3,
            'ModelMapping': '^JAPNA',
            'ExcludeBlock': 'FX'
        });
    });

    it('Test getRequestParams - has column level risk settings', () => {
        const defaultEconomySettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        const defaultExposureRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        const defaultAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        // GIVEN
        const defaultRiskSettings = new RiskSettings();
        defaultRiskSettings.economyRiskSettings = defaultEconomySettings;
        defaultRiskSettings.exposureRiskSettings = defaultExposureRiskSettings;
        defaultRiskSettings.advancedRiskSettings = defaultAdvancedRiskSettings;


        const economySettings = new EconomySettings(defaultEconomySettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN);
        const exposureRiskSettings = new ExposureSettings(defaultExposureRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN);
        const advancedRiskSettings = new AdvancedRiskSettings(defaultAdvancedRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN);
        // GIVEN
        const riskSettings = new RiskSettings();
        riskSettings.economyRiskSettings = economySettings;
        riskSettings.exposureRiskSettings = exposureRiskSettings;
        riskSettings.advancedRiskSettings = advancedRiskSettings;
        riskSettings.hvarRiskSettings = null;

        const exposureRiskSpy = jest.spyOn(riskSettings.exposureRiskSettings, 'addRequestData');
        const economyRiskSpy = jest.spyOn(riskSettings.economyRiskSettings, 'addRequestData');
        const AdvancedRiskSpy = jest.spyOn(riskSettings.advancedRiskSettings, 'addRequestData');

        // WHEN
        const expectedParams = riskSettings.getRequestParams();
        expect(exposureRiskSpy).toHaveBeenCalledWith({}, defaultExposureRiskSettings);
        expect(economyRiskSpy).toHaveBeenCalledWith({}, defaultEconomySettings, undefined);
        expect(AdvancedRiskSpy).toHaveBeenCalledWith({}, defaultAdvancedRiskSettings);
    });

    it('Test addRequestParams - called from AbstractColumnOption', () => {
        const riskSettings = new RiskSettings();
        const requestParams = {};
        const fnSpy = jest.spyOn(riskSettings, 'getRequestParams').mockReturnValue({riskMapping: 'STML'});
        riskSettings.addRequestParams(requestParams);
        expect(requestParams[CoreRiskConstants.RISK_SETTINGS]).toBeDefined();
        expect(requestParams[CoreRiskConstants.RISK_SETTINGS]).toEqual({riskMapping: 'STML'});
    });

    it('test doAddRequestParams - if riskSetting null', () => {
        const riskSettings = new RiskSettings();
        const requestParams = {};
        jest.spyOn(riskSettings, 'getRequestParams').mockReturnValue({});
        riskSettings.addRequestParams(requestParams);
        expect(requestParams[CoreRiskConstants.RISK_SETTINGS]).toBeUndefined();
    });

    describe('Test isValidColumnOption', () => {
        const riskSettings = new RiskSettings();
        riskSettings.hvarRiskSettings = new HvarRiskSettingsModel();
        riskSettings.hvarRiskSettings.confidenceLevelPercentage = 99;
        riskSettings.hvarRiskSettings.advancedHvarRiskSettings = new AdvancedHvarRiskSettingsModel();
        riskSettings.hvarRiskSettings.advancedHvarRiskSettings.confidenceIntervalScaling = 95;

        it('Test invalid scenario', () => {
            const exploreInputValidationIn = riskSettings.isValidColumnOption();
            expect(exploreInputValidationIn).toBeTruthy();
            expect(exploreInputValidationIn.notificationType).toBe(NotificationType.ERROR);
            expect(exploreInputValidationIn.message).toBe('confidenceLevelPercentage=99 must be less than confidenceIntervalToScale=95');
        });

        it('Test valid scenario', () => {
            riskSettings.hvarRiskSettings.advancedHvarRiskSettings.confidenceIntervalScaling = 99;
            const exploreInputValidationIn = riskSettings.isValidColumnOption();
            expect(exploreInputValidationIn).toBeUndefined();
        });
    });

    it('test construct - legacy fav type', () => {
        const json = {
            'CovMatrix': 'WKL',
            'confidenceLevelInPercentage': 99,
            'OverrideGpDefaultPortfolioRiskSettings': true,
            'exposureRiskSettings': {
                'riskModel': '^WRLDA'
            },
            'economyRiskSettings': {
                'riskHorizon': 3,
                'decayFactor': 0.9737,
                'confidenceLevelSD': 2.33,
                'dateObject': {
                    'dateStringValue': 'T-1',
                    'dateString': true
                }
            },
            'inputType': 'widgetRiskSettings'
        };
        const riskSettings = new RiskSettings(json);
        expect(riskSettings.economyRiskSettings).toBeDefined();
        expect(riskSettings.economyRiskSettings.weightingScheme).toBe('WKL');
    });


    it('Test for getParentRiskSettings and createAllRiskSettings)', function () {
        const widgetRiskSettings = new RiskSettings();

        const portDefaultEconomySettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        portDefaultEconomySettings.overlap = 5;
        const portEconomySettings = new EconomySettings(portDefaultEconomySettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        widgetRiskSettings.economyRiskSettings = new EconomySettings(portEconomySettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        widgetRiskSettings.economyRiskSettings.period = 125;

        const portDefaultExposureSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        portDefaultExposureSettings.riskModel = '^EMEAA';
        const portExposureSettings = new ExposureSettings(portDefaultExposureSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        widgetRiskSettings.exposureRiskSettings = new ExposureSettings(portExposureSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        const portDefaultAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        portDefaultAdvancedRiskSettings.dxsBlock = 'ALL_DXS';
        const portAdvancedRiskSettings = new AdvancedRiskSettings(portDefaultAdvancedRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        portAdvancedRiskSettings.excludeBlock = 'ABC';
        widgetRiskSettings.advancedRiskSettings = new AdvancedRiskSettings(portAdvancedRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        const portDefaultHVARSettings = new HvarRiskSettingsModel(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        portDefaultHVARSettings.factorScaling = 'NONE';
        const portHVARSettings = new HvarRiskSettingsModel(portDefaultHVARSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        widgetRiskSettings.hvarRiskSettings = new HvarRiskSettingsModel(portHVARSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        const parentRiskSettings = widgetRiskSettings.getParentRiskSettings();
        const allRiskSettings = parentRiskSettings.createAllRiskSettings();

        expect(allRiskSettings.economyRiskSettings.overlap).toEqual(5);
        expect(allRiskSettings.exposureRiskSettings.riskModel).toEqual('^EMEAA');
        expect(allRiskSettings.advancedRiskSettings.excludeBlock).toEqual('ABC');
        expect(allRiskSettings.advancedRiskSettings.dxsBlock).toEqual('ALL_DXS');
        expect(allRiskSettings.hvarRiskSettings.factorScaling).toEqual('NONE');
    });
});
