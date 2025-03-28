import {CoreRiskConstants} from '../core-risk.constants';
import {EconomySettings} from './economy-settings/economy-settings.model';

describe('AbstractRiskSettings', () => {
    /**
     * Test critical methods exist
     */
    it('Test critical methods exist', () => {
        const abstractRiskSettings = new EconomySettings(new EconomySettings(), CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        expect(abstractRiskSettings.deserialize).toBeDefined();
        expect(abstractRiskSettings.serialize).toBeDefined();
        expect(abstractRiskSettings.doesValueExist).toBeDefined();
        expect(abstractRiskSettings.addRequestData).toBeDefined();
        expect(abstractRiskSettings.getSourceName).toBeDefined();
    });

    /**
     * Test getSourceName when value is null
     */
    it('Test getSourceName when value is null', () => {

        // GIVEN
        const parentRiskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const abstractRiskSettings = new EconomySettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.weightingScheme = 'DLY';

        // THEN
        expect(abstractRiskSettings.getSourceName(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME)).toEqual(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

    });

    /**
     * Test getSourceName when value is NOT null
     */
    it('Test getSourceName when value is NOT null', () => {

        // GIVEN
        const parentRiskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const abstractRiskSettings = new EconomySettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        abstractRiskSettings.weightingScheme = 'DLY';

        // THEN
        expect(abstractRiskSettings.getSourceName(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME)).toEqual(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

    });

    /**
     * Test isDefaultSetting
     */
    it('Test isDefaultSetting negative', () => {

        // GIVEN
        const riskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const abstractRiskSettings = new EconomySettings(riskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        abstractRiskSettings.weightingScheme = 'DLY';



        // WHEN // THEN
        expect(abstractRiskSettings.isDefaultSetting(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME)).toEqual(false);

    });


    /**
     * Test isDefaultSetting
     */
    it('Test isDefaultSetting positive ', () => {

        // GIVEN
        const riskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        const abstractRiskSettings = new EconomySettings(riskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        abstractRiskSettings.weightingScheme = 'DLY';



        // WHEN // THEN
        expect(abstractRiskSettings.isDefaultSetting(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME)).toEqual(true);

    });

    /**
     * Test isDefaultSetting
     */
    it('Test getSourceDisplayName', () => {
        const riskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        let abstractRiskSettings = new EconomySettings(riskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        abstractRiskSettings.weightingScheme = 'DLY';
        expect(abstractRiskSettings.getSourceDisplayName(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME)).toEqual('Organization (Default)');

        abstractRiskSettings = new EconomySettings(riskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        abstractRiskSettings.weightingScheme = 'DLY';
        expect(abstractRiskSettings.getSourceDisplayName(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME)).toEqual('Portfolio (Default)');

        abstractRiskSettings = new EconomySettings(riskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        abstractRiskSettings.weightingScheme = 'DLY';
        expect(abstractRiskSettings.getSourceDisplayName(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME)).toEqual('Portfolio (User Selected)');

        abstractRiskSettings = new EconomySettings(riskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        abstractRiskSettings.weightingScheme = 'DLY';
        expect(abstractRiskSettings.getSourceDisplayName(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME)).toEqual('Widget (User Selected)');

        abstractRiskSettings = new EconomySettings(riskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN);
        abstractRiskSettings.weightingScheme = 'DLY';
        expect(abstractRiskSettings.getSourceDisplayName(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME)).toEqual('Column (User Selected)');
    });
});


