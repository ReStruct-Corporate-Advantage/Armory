import { CoreRiskConstants } from '../../core-risk.constants';
import { MCVaRRiskSettingsModel } from './mcvar-risk-settings.model';

describe('MCVaR settings model test', () => {

    let orgLevelMcVaRSettings;
    beforeEach(async () => {
        orgLevelMcVaRSettings = new MCVaRRiskSettingsModel(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
    });

    describe('Test constructor', () => {
        it('org level MCVaR settings', () => {
            expect(orgLevelMcVaRSettings.parentRiskSettings).toBeUndefined();
            expect(orgLevelMcVaRSettings.name).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
            const serializedSettings = orgLevelMcVaRSettings.serialize();
            expect(Object.keys(serializedSettings).length).toBe(0);
            const requestParams = {};
            orgLevelMcVaRSettings.addRequestData(requestParams, orgLevelMcVaRSettings);
            expect(Object.keys(requestParams).length).toBe(0);
        });

        it('serialize and addRequestData', () => {
            const portfolioLevelMCVaRRiskSettings = new MCVaRRiskSettingsModel(orgLevelMcVaRSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
            expect(portfolioLevelMCVaRRiskSettings.parentRiskSettings).toBe(orgLevelMcVaRSettings);
            expect(portfolioLevelMCVaRRiskSettings.name).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
            const serializedSettings = portfolioLevelMCVaRRiskSettings.serialize();
            expect(Object.keys(serializedSettings).length).toBe(0);
            const requestParams = {};
            portfolioLevelMCVaRRiskSettings.addRequestData(requestParams, portfolioLevelMCVaRRiskSettings);
            expect(Object.keys(requestParams).length).toBe(0);
        });
    });

    describe('test deserialize', () => {
        const favData: any = {};
        it('empty data', () => {
            orgLevelMcVaRSettings.deserialize(favData);
            const serializedSettings = orgLevelMcVaRSettings.serialize();
            expect(Object.keys(serializedSettings).length).toBe(0);
            const requestParams = {};
            orgLevelMcVaRSettings.addRequestData(requestParams, orgLevelMcVaRSettings);
            expect(Object.keys(requestParams).length).toBe(0);
        });

        it('all data', () => {
            favData.samples = 10000;
            favData.seed = 100;
            favData.distributionType = CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[1].value;
            favData.pricingType = CoreRiskConstants.MCVAR_PRICING_TYPES[1].value;
            favData.includeTimeReturn = true;
            favData.idiosyncraticCorrelation = CoreRiskConstants.MCVAR_IDIO_CALCS[1].value;
            favData.useImportanceSampling = true;
            favData.trainingSamples = 1000;

            orgLevelMcVaRSettings.deserialize(favData);

            expect(orgLevelMcVaRSettings.samples).toBe(10000);
            expect(orgLevelMcVaRSettings.seed).toBe(100);
            expect(orgLevelMcVaRSettings.distributionType).toBe(CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[1].value);
            expect(orgLevelMcVaRSettings.pricingType).toBe(CoreRiskConstants.MCVAR_PRICING_TYPES[1].value);


            const serializedSettings = orgLevelMcVaRSettings.serialize();
            expect(Object.keys(serializedSettings).length).toBe(8);
            const requestParams: any = {};
            orgLevelMcVaRSettings.addRequestData(requestParams, orgLevelMcVaRSettings);
            expect(Object.keys(requestParams).length).toBe(1);
            const mcvarRiskSettings = requestParams.mcvarRiskSettings;
            expect(Object.keys(mcvarRiskSettings).length).toBe(7);
        });
    });

    describe('test getters', () => {
        const parentRiskSettingsData: any = {
            distributionType: CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[0].value,
            degreesOfFreedom: 100,
            samples: 100,
            seed: 10,
            pricingType: CoreRiskConstants.MCVAR_PRICING_TYPES[0].value,
            includeTimeReturn: true,
            idiosyncraticCorrelation: CoreRiskConstants.MCVAR_IDIO_CALCS[0].value,
            useImportanceSampling: true,
            trainingSamples: 4
        };
        const parentMCVarRiskSettings: MCVaRRiskSettingsModel = new MCVaRRiskSettingsModel(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        parentMCVarRiskSettings.deserialize(parentRiskSettingsData);
        it ('getter from parent', () => {
            const mcvarRiskSettings = new MCVaRRiskSettingsModel(parentMCVarRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            expect(mcvarRiskSettings.distributionType).toBe(CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[0].value);
            expect(mcvarRiskSettings.degreesOfFreedom).toBe(100);
            expect(mcvarRiskSettings.samples).toBe(100);
            expect(mcvarRiskSettings.seed).toBe(10);
            expect(mcvarRiskSettings.pricingType).toBe(CoreRiskConstants.MCVAR_PRICING_TYPES[0].value);
            expect(mcvarRiskSettings.includeTimeReturn).toBeTruthy();
            expect(mcvarRiskSettings.idiosyncraticCorrelation).toBe(CoreRiskConstants.MCVAR_IDIO_CALCS[0].value);
            expect(mcvarRiskSettings.useImportanceSampling).toBeTruthy();
        });

        it ('getter from self', () => {
            const mcvarRiskSettings = new MCVaRRiskSettingsModel(parentMCVarRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            const mcvarRiskSettingsData: any = {
                distributionType: CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[1].value,
                degreesOfFreedom: 1000,
                samples: 1000,
                seed: 100,
                pricingType: CoreRiskConstants.MCVAR_PRICING_TYPES[1].value,
                includeTimeReturn: false,
                idiosyncraticCorrelation: CoreRiskConstants.MCVAR_IDIO_CALCS[0].value,
                useImportanceSampling: false,
                trainingSamples: 4
            };
            mcvarRiskSettings.deserialize(mcvarRiskSettingsData);
            expect(mcvarRiskSettings.distributionType).toBe(CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[1].value);
            expect(mcvarRiskSettings.degreesOfFreedom).toBe(1000);
            expect(mcvarRiskSettings.samples).toBe(1000);
            expect(mcvarRiskSettings.seed).toBe(100);
            expect(mcvarRiskSettings.pricingType).toBe(CoreRiskConstants.MCVAR_PRICING_TYPES[1].value);
            expect(mcvarRiskSettings.includeTimeReturn).toBeFalsy();
            expect(mcvarRiskSettings.idiosyncraticCorrelation).toBe(CoreRiskConstants.MCVAR_IDIO_CALCS[0].value);
            expect(mcvarRiskSettings.useImportanceSampling).toBeFalsy();
        });
    });

    describe('test setters', () => {
        let parentMCVarRiskSettings: MCVaRRiskSettingsModel = new MCVaRRiskSettingsModel(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        it('parent empty', () => {
            const mcvarRiskSettings = new MCVaRRiskSettingsModel(parentMCVarRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            mcvarRiskSettings.distributionType = CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[0].value;
            mcvarRiskSettings.degreesOfFreedom = 100;
            mcvarRiskSettings.samples = 100;
            mcvarRiskSettings.seed = 10;
            mcvarRiskSettings.pricingType = CoreRiskConstants.MCVAR_PRICING_TYPES[0].value;
            mcvarRiskSettings.includeTimeReturn = true;
            mcvarRiskSettings.idiosyncraticCorrelation = CoreRiskConstants.MCVAR_IDIO_CALCS[0].value;
            mcvarRiskSettings.useImportanceSampling = true;

            expect(mcvarRiskSettings.getSourceName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.DISTRIBUTION_TYPE)).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            expect(mcvarRiskSettings.getSourceName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.DEGREES_OF_FREEDOM)).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            expect(mcvarRiskSettings.getSourceName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.SAMPLES)).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            expect(mcvarRiskSettings.getSourceName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.SEED)).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            expect(mcvarRiskSettings.getSourceName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.PRICING_TYPE)).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            expect(mcvarRiskSettings.getSourceName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.INCLUDE_TIME_RETURN)).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            expect(mcvarRiskSettings.getSourceName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.IDIOSYNC_CORR)).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            expect(mcvarRiskSettings.getSourceName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.USE_IMPORTANCE_SAMPLING)).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        });

        it('same as parent', () => {
            const parentRiskSettingsData: any = {
                distributionType: CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[0].value,
                degreesOfFreedom: 100,
                samples: 100,
                seed: 10,
                pricingType: CoreRiskConstants.MCVAR_PRICING_TYPES[0].value,
                includeTimeReturn: true,
                idiosyncraticCorrelation: CoreRiskConstants.MCVAR_IDIO_CALCS[0].value,
                useImportanceSampling: true,
                trainingSamples: 4
            };
            parentMCVarRiskSettings = new MCVaRRiskSettingsModel(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
            parentMCVarRiskSettings.deserialize(parentRiskSettingsData);
            const mcvarRiskSettings = new MCVaRRiskSettingsModel(parentMCVarRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            mcvarRiskSettings.distributionType = CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[0].value;
            mcvarRiskSettings.degreesOfFreedom = 100;
            mcvarRiskSettings.samples = 100;
            mcvarRiskSettings.seed = 10;
            mcvarRiskSettings.pricingType = CoreRiskConstants.MCVAR_PRICING_TYPES[0].value;
            mcvarRiskSettings.includeTimeReturn = true;
            mcvarRiskSettings.idiosyncraticCorrelation = CoreRiskConstants.MCVAR_IDIO_CALCS[0].value;
            mcvarRiskSettings.useImportanceSampling = true;

            expect(mcvarRiskSettings.getSourceName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.DISTRIBUTION_TYPE)).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
            expect(mcvarRiskSettings.getSourceName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.DEGREES_OF_FREEDOM)).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
            expect(mcvarRiskSettings.getSourceName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.SAMPLES)).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
            expect(mcvarRiskSettings.getSourceName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.SEED)).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
            expect(mcvarRiskSettings.getSourceName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.PRICING_TYPE)).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
            expect(mcvarRiskSettings.getSourceName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.INCLUDE_TIME_RETURN)).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
            expect(mcvarRiskSettings.getSourceName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.IDIOSYNC_CORR)).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
            expect(mcvarRiskSettings.getSourceName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.USE_IMPORTANCE_SAMPLING)).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        });
    });
});
