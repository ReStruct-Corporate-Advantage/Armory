import {DateValue} from '@blk/explore-ui-core';
import {AdvancedHvarRiskSettingsModel} from '../advance-hvar-risk-settings/advanced-hvar-risk-settings.model';
import {HvarRiskSettingsModel} from './hvar-risk-settings.model';
import {CoreRiskConstants} from '../../core-risk.constants';

describe('HVaRRiskSettings', () => {
    /**
     * Test case for HVaR Risk Settings initializing correctly
     */
    it('Test if HVaRRiskSettings initializes correctly ', () => {
        // GIVEN
        const hvarSettings = new HvarRiskSettingsModel(new HvarRiskSettingsModel(), CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // THEN
        expect(hvarSettings.parentRiskSettings).toBeDefined();
        expect(hvarSettings.name).toBeDefined();
        expect(hvarSettings.name).toEqual(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        expect(hvarSettings.advancedHvarRiskSettings).toBeUndefined();
    });

    /**
     * Test serialize
     */
    it('Test serialize', () => {
        const hvarRiskSettingsModel = new HvarRiskSettingsModel();
        let serialized = hvarRiskSettingsModel.serialize();
        expect(Object.keys(serialized).length).toBe(0);
        hvarRiskSettingsModel.advancedHvarRiskSettings = new AdvancedHvarRiskSettingsModel();
        hvarRiskSettingsModel.advancedHvarRiskSettings.holdingPeriod = 20;
        serialized = hvarRiskSettingsModel.serialize();
        expect(serialized.advancedHvarRiskSettings.holdingPeriod).toBe(20);
    });

    describe('Test Deserialize', () => {
        /**
         * Test deserialize
         */
        it('Test deserialize', () => {
            const orgDefaultHvarRiskSettings = new HvarRiskSettingsModel(null, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
            const portDefaultHvarRiskSettings = new HvarRiskSettingsModel(orgDefaultHvarRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
            portDefaultHvarRiskSettings.deserialize({
                confidenceLevelPercentage: 2,
                returnHorizonSelection: 'days',
                numberOfDays: 10,
                linear: 5,
                startDate: {date: 12233017, calCode: 'GreenPkg', dateString: false},
                historicalReturnDecay: 'Half Life',
                volatilityScaling: 'OFF'
            });
            const hvarRiskSettings = new HvarRiskSettingsModel(portDefaultHvarRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
            const data: any = {
                confidenceLevelPercentage: 0.95,
                returnHorizon: 'days',
                numberOfDays: 5,
                linear: 3,
                startDate: new DateValue({date: '12/03/2017', calCode: 'GreenPkg', dateString: false}),
                historicalReturnDecay: 1,
                volatilityScaling: 'FACTOR',
                secScaling: 40,
                isNumberOfObservationsSelected: true,
                numberOfObservations: 1000,
                advancedHvarRiskSettings: {
                    holdingPeriod: 40
                }
            };
            hvarRiskSettings.deserialize(data);
            expect(hvarRiskSettings.confidenceLevelPercentage).toEqual(0.95);
            expect(hvarRiskSettings.returnHorizonSelection).toEqual('days');
            expect(hvarRiskSettings.numberOfDays).toEqual(5);
            expect(hvarRiskSettings.linear).toEqual(3);
            expect(hvarRiskSettings.historicalReturnDecay).toEqual(1);
            expect(hvarRiskSettings.numberOfObservations).toEqual(1000);
            expect(hvarRiskSettings.isNumberOfObservationsSelected).toEqual(true);
            expect(hvarRiskSettings.startDate).toEqual(new DateValue({
                date: '12/03/2017',
                calCode: 'GreenPkg',
                dateString: false
            }));
            expect(hvarRiskSettings.advancedHvarRiskSettings.holdingPeriod).toEqual(40);
            expect(hvarRiskSettings.advancedHvarRiskSettings.confidenceIntervalScaling).toBeUndefined();
            expect(hvarRiskSettings.factorScaling).toEqual('FACTORLEVEL_VOL_SCALE');
        });

        /**
         * Test deserialize for backward compatibility portfolio level
         */
        it('Test Backward compatibility Portfolio level', () => {
            const orgDefaultHvarRiskSettings = new HvarRiskSettingsModel(null, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
            const hvarRiskSettings = new HvarRiskSettingsModel(orgDefaultHvarRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
            const data: any = {
                confidenceLevelPercentage: 0.95,
                returnHorizon: 'days',
                numberOfDays: 5,
                linear: 3,
                startDate: new DateValue({date: '12/03/2017', calCode: 'GreenPkg', dateString: false}),
                historicalReturnDecay: 1,
                volatilityScaling: 'OFF',
                secScaling: 40,
                evtKernelSmoothing: true,
                isNumberOfObservationsSelected: true,
                numberOfObservations: 1000
            };
            hvarRiskSettings.deserialize(data);
            expect(hvarRiskSettings.advancedHvarRiskSettings.holdingPeriod).toEqual(20);
            expect(hvarRiskSettings.advancedHvarRiskSettings.confidenceIntervalScaling).toBe(99);
            expect(hvarRiskSettings.factorScaling).toEqual('NONE');
        });

        /**
         * Test deserialize for backward compatibility column level
         */
        it('Test Backward compatibility Portfolio level', () => {
            const orgDefaultHvarRiskSettings = new HvarRiskSettingsModel(null, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
            const hvarRiskSettings = new HvarRiskSettingsModel(orgDefaultHvarRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN);
            const data: any = {
                confidenceLevelPercentage: 0.95,
                returnHorizon: 'days',
                numberOfDays: 5,
                linear: 3,
                startDate: new DateValue({date: '12/03/2017', calCode: 'GreenPkg', dateString: false}),
                historicalReturnDecay: 1,
                volatilityScaling: 'FACTOR',
                secScaling: 40,
                evtKernelSmoothing: true,
                isNumberOfObservationsSelected: true,
                numberOfObservations: 1000
            };
            hvarRiskSettings.deserialize(data);
            expect(hvarRiskSettings.advancedHvarRiskSettings.holdingPeriod).toEqual(20);
            expect(hvarRiskSettings.advancedHvarRiskSettings.confidenceIntervalScaling).toBe(99);
            expect(hvarRiskSettings.factorScaling).toEqual('FACTORLEVEL_EVT_AND_VOL_SCALE');
        });
    });

    /**
     * Test equals
     */
    it('Test equals', () => {
        const model = new HvarRiskSettingsModel();
        const model1 = new HvarRiskSettingsModel();
        expect(model.equals(model1)).toBeTruthy();
        expect(model1.equals(model)).toBeTruthy();
        model.startDate = new DateValue('06/03/2021');
        expect(model.equals(model1)).toBeFalsy();
        expect(model1.equals(model)).toBeFalsy();
        model1.startDate = new DateValue('06/03/2021');
        expect(model.equals(model1)).toBeTruthy();
        expect(model1.equals(model)).toBeTruthy();
        const advancedHvarRiskSettings = new AdvancedHvarRiskSettingsModel();
        advancedHvarRiskSettings.holdingPeriod = 20;
        model.advancedHvarRiskSettings = advancedHvarRiskSettings;
        expect(model.equals(model1)).toBeFalsy();
        const advancedHvarRiskSettings1 = new AdvancedHvarRiskSettingsModel();
        advancedHvarRiskSettings1.holdingPeriod = 21;
        model1.advancedHvarRiskSettings = advancedHvarRiskSettings1;
        expect(model.equals(model1)).toBeFalsy();
        model.advancedHvarRiskSettings.holdingPeriod = 21;
        expect(model.equals(model1)).toBeTruthy();
        model.factorScaling = 'PORTFOLIO_EVT_AND_FACTORLEVEL_VOL_SCALE';
        expect(model.equals(model1)).toBeFalsy();
        model1.factorScaling = 'PORTFOLIO_EVT_AND_FACTORLEVEL_VOL_SCALE';
        expect(model.equals(model1)).toBeTruthy();
    });

    /**
     * Test addRequestParams
     */
    it('Test addRequestParams', () => {
        const orgDefaultHvarRiskSettings = new HvarRiskSettingsModel(null, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        const portDefaultHvarRiskSettings = new HvarRiskSettingsModel(orgDefaultHvarRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        portDefaultHvarRiskSettings.deserialize({
            confidenceLevelPercentage: 2,
            returnHorizon: 'days',
            numberOfDays: 10,
            linear: 5,
            startDate: {date: 12233017, calCode: 'GreenPkg', dateString: false},
            historicalReturnDecay: 'Half Life',
            volatilityScaling: 'OFF'
        });
        const hvarRiskSettings = new HvarRiskSettingsModel(portDefaultHvarRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const data: any = {
            confidenceLevelPercentage: 0.95,
            returnHorizon: '1week',
            secScaling: 40,
            evtKernelSmoothing: false,
            volatilityScaling: 'FACTOR',
            isNumberOfObservationsSelected: true,
            numberOfObservations: 1000,
            advancedHvarRiskSettings: {
                holdingPeriod: 21
            }
        };
        hvarRiskSettings.deserialize(data);

        const requestParams = {};
        hvarRiskSettings.addRequestData(requestParams, portDefaultHvarRiskSettings);
        let hvarSettingParams = requestParams['hvarRiskSettings'];
        expect(hvarSettingParams.confidenceLevelPercentage).toEqual(0.95);
        expect(hvarSettingParams.returnHorizon).toEqual('1week');
        expect(hvarSettingParams.numberOfDays).toEqual(5);
        expect(hvarSettingParams.linear).toEqual(5);
        expect(hvarSettingParams.numberOfObservations).toEqual(1000);
        expect(hvarSettingParams.startDate).toBeUndefined();
        expect(hvarSettingParams.holdingPeriod).toBe(21);
        expect(hvarSettingParams.factorScaling).toBe('FACTORLEVEL_VOL_SCALE');

        hvarRiskSettings.addRequestData(requestParams, hvarRiskSettings);
        hvarSettingParams = requestParams['hvarRiskSettings'];
        expect(hvarSettingParams.holdingPeriod).toBe(21);
    });
});
