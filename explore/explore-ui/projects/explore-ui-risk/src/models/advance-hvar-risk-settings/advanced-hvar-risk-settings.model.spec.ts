import {AdvancedHvarRiskSettingsModel} from './advanced-hvar-risk-settings.model';
import {CoreRiskConstants} from '../../core-risk.constants';

describe('AdvancedHVaRRiskSettings Model', () => {

    let advancedHvarRiskSettingsModel: AdvancedHvarRiskSettingsModel;
    let columnLevelAdvancedHvarRiskSettingsModel: AdvancedHvarRiskSettingsModel;

    beforeEach(() => {
        advancedHvarRiskSettingsModel = new AdvancedHvarRiskSettingsModel(new AdvancedHvarRiskSettingsModel(), CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        columnLevelAdvancedHvarRiskSettingsModel = new AdvancedHvarRiskSettingsModel(advancedHvarRiskSettingsModel, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN);
    });

    it('Initializes correctly', () => {
        expect(advancedHvarRiskSettingsModel.name).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        expect(advancedHvarRiskSettingsModel.name).toBeDefined();
        expect(advancedHvarRiskSettingsModel.holdingPeriod).toBeUndefined();
        expect(advancedHvarRiskSettingsModel.confidenceIntervalScaling).toBeUndefined();
    });

    it('Test serialize', () => {
        let serialized = advancedHvarRiskSettingsModel.serialize();
        expect(Object.keys(serialized).length).toBe(0);
        advancedHvarRiskSettingsModel.holdingPeriod = 10;
        advancedHvarRiskSettingsModel.confidenceIntervalScaling = 99;
        serialized = advancedHvarRiskSettingsModel.serialize();
        expect(Object.keys(serialized).length).toBe(2);
        expect(serialized.holdingPeriod).toBe(10);
        expect(serialized.confidenceIntervalScaling).toBe(99);
    });

    it('Test deserialize with null data', () => {
        advancedHvarRiskSettingsModel.deserialize(null);
        expect(advancedHvarRiskSettingsModel.name).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        expect(advancedHvarRiskSettingsModel.name).toBeDefined();
        expect(advancedHvarRiskSettingsModel.holdingPeriod).toBeUndefined();
        expect(advancedHvarRiskSettingsModel.confidenceIntervalScaling).toBeUndefined();
    });

    it('Test deserialize with empty data', () => {
        advancedHvarRiskSettingsModel.deserialize({});
        expect(advancedHvarRiskSettingsModel.name).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        expect(advancedHvarRiskSettingsModel.name).toBeDefined();
        expect(advancedHvarRiskSettingsModel.holdingPeriod).toBeUndefined();
        expect(advancedHvarRiskSettingsModel.confidenceIntervalScaling).toBeUndefined();
    });

    it('Test deserialize with data', () => {
        advancedHvarRiskSettingsModel.deserialize({holdingPeriod: 10, confidenceIntervalScaling: 99});
        expect(advancedHvarRiskSettingsModel.name).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        expect(advancedHvarRiskSettingsModel.name).toBeDefined();
        expect(advancedHvarRiskSettingsModel.holdingPeriod).toBe(10);
        expect(advancedHvarRiskSettingsModel.confidenceIntervalScaling).toBe(99);
    });

    it('Test addRequestData', () => {
        const params: any = {};
        columnLevelAdvancedHvarRiskSettingsModel.addRequestData(params, null);
        expect(Object.keys(params).length).toBe(0);
        advancedHvarRiskSettingsModel.holdingPeriod = 10;
        advancedHvarRiskSettingsModel.confidenceIntervalScaling = 95;
        columnLevelAdvancedHvarRiskSettingsModel.addRequestData(params, advancedHvarRiskSettingsModel);
        expect(Object.keys(params).length).toBe(0);
        columnLevelAdvancedHvarRiskSettingsModel.holdingPeriod = 20;
        columnLevelAdvancedHvarRiskSettingsModel.confidenceIntervalScaling = 95;
        columnLevelAdvancedHvarRiskSettingsModel.addRequestData(params, advancedHvarRiskSettingsModel);
        expect(params.holdingPeriod).toBe(20);
        expect(params.confidenceIntervalScaling).toBeUndefined();
    });
});
