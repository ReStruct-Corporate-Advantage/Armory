import {ExposureSettings} from './exposure-settings.model';
import {CoreRiskConstants} from '../../core-risk.constants';
import {RiskModel} from '@blk/explore-ui-core';

describe('ExposureSettings', () => {
    /**
     * Test case for ExposureSettings initializing correctly
     */
    it('Test if ExposureSettings initializes correctly ', () => {

        // GIVEN
        const exposureRiskSettings = new ExposureSettings(new ExposureSettings(), CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // THEN
        expect(exposureRiskSettings.parentRiskSettings).toBeDefined();
        expect(exposureRiskSettings.name).toBeDefined();
        expect(exposureRiskSettings.name).toEqual(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
    });

    /**
     * Test case for riskModel  Getter from Parent
     */
    it('Test  riskModel  Getter from Parent', () => {

        // GIVEN
        const parentRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const exposureRiskSettings = new ExposureSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.riskModel = '^JAPNA';

        // THEN
        expect(exposureRiskSettings.riskModel).toEqual(parentRiskSettings.riskModel);
    });

    /**
     * Test case for riskModel  Getter from SELF
     */
    it('Test  riskModel  Getter from SELF', () => {

        // GIVEN
        const parentRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const exposureRiskSettings = new ExposureSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.riskModel = '^JAPNA';
        exposureRiskSettings.riskModel = 'Not_Japna';

        // THEN
        expect(exposureRiskSettings.riskModel).toEqual('Not_Japna');
    });

    /**
     * Test case for riskModel Setting when value is not same as parent
     */
    it('Test case for riskModel  Setting when value is not same as parent ', () => {

        // GIVEN
        const parentRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const exposureRiskSettings = new ExposureSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.riskModel = '^JAPNA';
        exposureRiskSettings.riskModel = 'My_Own_Value';

        // THEN
        expect(exposureRiskSettings.riskModel).toEqual('My_Own_Value');
    });

    it('Test riskModel Setter with its impact on request param', () => {
        const parentRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        const exposureRiskSettings: ExposureSettings = new ExposureSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        (exposureRiskSettings.parentRiskSettings as ExposureSettings).riskModel = 'P100';

        // Now changing back to DEFAULT, will not populate _riskModel and hence we don't see populated in request param
        exposureRiskSettings.riskModel = 'DEFAULT';
        const requestParam = {};
        let isAboveSettingDefaultSetting = exposureRiskSettings.isDefaultSetting('riskModel');
        exposureRiskSettings.addRequestData(requestParam, exposureRiskSettings);
        // Although it's different from parentRiskSetting if we choose DEFAULT we will not send to the server
        expect(requestParam).toStrictEqual({});
        expect(isAboveSettingDefaultSetting).toBeTruthy();

        // In case of different mapping
        exposureRiskSettings.riskModel = '^UKINA';
        exposureRiskSettings.addRequestData(requestParam, parentRiskSettings);
        isAboveSettingDefaultSetting = exposureRiskSettings.isDefaultSetting('riskModel');
        expect(requestParam).toStrictEqual({ModelMapping: '^UKINA'});
        expect(isAboveSettingDefaultSetting).toBeFalsy();
    });

    /**
     * Test deserialize
     */
    it('Test deserialize', () => {

        // GIVEN
        const parentRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const exposureRiskSettings = new ExposureSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        const data: any = {riskModel: '^JAPNA'};

        // WHEN
        exposureRiskSettings.deserialize(data);

        // THEN
        expect(exposureRiskSettings.riskModel).toEqual('^JAPNA');
    });

    /**
     * Test serialize
     */
    it('Test serialize', () => {

        // GIVEN
        const parentRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const exposureRiskSettings = new ExposureSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        exposureRiskSettings.riskModel = '^JAPNA';

        // WHEN
        const expected = exposureRiskSettings.serialize();

        // THEN
        expect(expected).toEqual({riskModel: '^JAPNA'});
    });

    /**
     * Test resetSettings
     */
    it('Test resetSettings', function () {

        // GIVEN
        const parentRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const exposureRiskSettings = new ExposureSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        exposureRiskSettings.riskModel = '^JAPNA';

        // WHEN
        exposureRiskSettings.resetSettings();

        // THEN
        expect(exposureRiskSettings.riskModel).toEqual(undefined);
    });

    /**
     * Test addRequestData When
     */
    it('Test addRequestData', function () {

        // GIVEN
        const defaultRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        const parentRiskSettings = new ExposureSettings(defaultRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const exposureRiskSettings = new ExposureSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        defaultRiskSettings.riskModel = '^JAPNA';

        // WHEN
        const expected: any = {};
        exposureRiskSettings.addRequestData(expected, exposureRiskSettings);

        // THEN
        expect(expected).toEqual({});
    });

    /**
     * Test addRequestData When
     */
    it('Test addRequestData', function () {

        // GIVEN
        const defaultRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        const parentRiskSettings = new ExposureSettings(defaultRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const exposureRiskSettings = new ExposureSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        defaultRiskSettings.riskModel = '^JAPNA';
        exposureRiskSettings.riskModel = 'My_Val';
        // WHEN
        const expected: any = {};
        exposureRiskSettings.addRequestData(expected, exposureRiskSettings);

        // THEN
        expect(expected).toEqual({ModelMapping: 'My_Val'});
    });


    /**
     * Test addRequestData For Column
     */
    it('Test addRequestData For Column', function () {

        // GIVEN
        const defaultRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        const parentRiskSettings = new ExposureSettings(defaultRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const widgetexposureRiskSettings = new ExposureSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        const exposureRiskSettings = new ExposureSettings(widgetexposureRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN);

        defaultRiskSettings.riskModel = '^JAPNA';
        // WHEN
        const expected: any = {};
        exposureRiskSettings.addRequestData(expected, exposureRiskSettings.parentRiskSettings as ExposureSettings);

        // THEN
        expect(expected).toEqual({});
    });

    /**
     * Test doesValueExist
     */
    it('Test doesValueExist when it does', function () {

        // GIVEN
        const exposureRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        exposureRiskSettings.riskModel = '^JAPNA';

        // THEN
        expect(exposureRiskSettings.doesValueExist('riskModel')).toEqual(true);
    });

    /**
     * Test doesValueExist When
     */
    it('Test doesValueExist when it doesnt ', function () {

        // GIVEN
        const exposureRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        exposureRiskSettings.riskModel = undefined;

        // THEN
        expect(exposureRiskSettings.doesValueExist('riskModel')).toEqual(false);
    });

    describe('checkGPDefault Test', () => {
        it('should check GP default for portfolio risk settings', () => {
            const parentExposureRiskSettings = new ExposureSettings(undefined);
            parentExposureRiskSettings.riskModel = '^APWDA';

            const exposureRiskSettings = new ExposureSettings(parentExposureRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

            exposureRiskSettings.riskModels = [
                new RiskModel({Value: 'DEFAULT', Label: 'Organization Default'}),
                new RiskModel({Value: '^^STORM,^PRT_FI', Label: 'STORM for Equity'})
            ];

            exposureRiskSettings.checkGPDefault();

            expect(exposureRiskSettings.riskModels).toEqual([
                new RiskModel({Value: 'DEFAULT', Label: 'Organization Default'}),
                new RiskModel({Value: '^^STORM,^PRT_FI', Label: 'STORM for Equity'})
            ]);
        });

        it('should check GP default for portfolio risk settings and riskModel sourceName is Org default', () => {
            const orgDefaultExposureRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
            orgDefaultExposureRiskSettings.riskModel = '^APWDA';

            const portDefaultExposureRiskSettings = new ExposureSettings(orgDefaultExposureRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);

            const exposureRiskSettings = new ExposureSettings(portDefaultExposureRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

            exposureRiskSettings.riskModels = [
                new RiskModel({Value: 'DEFAULT', Label: 'Organization Default'}),
                new RiskModel({Value: '^^STORM,^PRT_FI', Label: 'STORM for Equity'})
            ];

            exposureRiskSettings.checkGPDefault();

            expect(exposureRiskSettings.riskModels).toEqual([
                new RiskModel({Value: '^APWDA', Label: 'Organization Default (^APWDA)'}),
                new RiskModel({Value: '^^STORM,^PRT_FI', Label: 'STORM for Equity'})
            ]);
        });

        it('should check GP default for widget risk settings and riskModel sourceName is portfolio', () => {
            const parentExposureRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
            parentExposureRiskSettings.riskModel = '^APWDA';

            const portfolioExposureRiskSettings = new ExposureSettings(parentExposureRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

            const exposureRiskSettings = new ExposureSettings(portfolioExposureRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            exposureRiskSettings.riskModels = [
                new RiskModel({Value: 'DEFAULT', Label: 'Organization Default'})
            ];

            exposureRiskSettings.checkGPDefault();

            expect(exposureRiskSettings.riskModels).toEqual([
                new RiskModel({Value: '^APWDA', Label: 'GP Default (^APWDA)'}),
                new RiskModel({Value: 'DEFAULT', Label: 'Organization Default'}),
            ]);
        });

        it('should check GP default for widget risk settings and riskModel sourceName is widget', () => {
            const parentExposureRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);

            const portfolioExposureRiskSettings = new ExposureSettings(parentExposureRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

            const exposureRiskSettings = new ExposureSettings(portfolioExposureRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            exposureRiskSettings.riskModel = '^APWDA';

            exposureRiskSettings.riskModels = [
                new RiskModel({Value: 'DEFAULT', Label: 'Organization Default'})
            ];

            exposureRiskSettings.checkGPDefault();

            expect(exposureRiskSettings.riskModels).toEqual([
                new RiskModel({Value: 'DEFAULT', Label: 'Organization Default'})
            ]);
        });

    });
});
