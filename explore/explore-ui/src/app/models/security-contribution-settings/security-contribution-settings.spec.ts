import {RiskSettings} from '@blk/explore-ui-risk';
import {SecurityContributionSettings} from './security-contribution-settings';

describe('SecurityContributionSettings', () => {
    it('should create an instance', () => {
        const securityContributionSettings = new SecurityContributionSettings();
        expect(securityContributionSettings).toBeTruthy();
        expect(securityContributionSettings.configType).toBe('factorSecContribSettings');
    });

    it('should serialize and deserialize to same object', () => {
        const originalSettings = new SecurityContributionSettings();
        originalSettings.isFactorBased = true;
        originalSettings.showWhenFactorLevelOnly = true;
        originalSettings.showWhenPosTypeActiveExists = false;
        originalSettings.showWhenPosTypeBenchExists = true;

        const serializedSettings: any = originalSettings.serialize(false);

        const deserializedSettings = new SecurityContributionSettings();
        deserializedSettings.deserialize(serializedSettings);
        expect(deserializedSettings).toEqual(originalSettings);
    });

    it('should create request param for column', () => {
        const secContribSettings = new SecurityContributionSettings();
        secContribSettings.isFactorBased = true;
        secContribSettings.showWhenFactorLevelOnly = true;
        secContribSettings.showWhenPosTypeActiveExists = false;
        secContribSettings.showWhenPosTypeBenchExists = true;

        const requestParams = {};
        secContribSettings.addRequestParams(requestParams);
        expect(requestParams['factorSecContribSettings']).toBeDefined();
    });

    it('should test equals method', () => {
        const settings1 = new SecurityContributionSettings();
        settings1.isFactorBased = true;
        settings1.showWhenFactorLevelOnly = true;
        settings1.showWhenPosTypeActiveExists = true;
        settings1.showWhenPosTypeBenchExists = true;

        const riskSettings = new RiskSettings();
        expect(settings1.equals(riskSettings)).toBe(false);

        const settings2 = new SecurityContributionSettings();
        expect(settings1.equals(settings2)).toBe(false);
        settings2.isFactorBased = true;
        expect(settings1.equals(settings2)).toBe(false);
        settings2.showWhenFactorLevelOnly = true;
        expect(settings1.equals(settings2)).toBe(false);
        settings2.showWhenPosTypeActiveExists = true;
        expect(settings1.equals(settings2)).toBe(false);
        settings2.showWhenPosTypeBenchExists = true;
        expect(settings1.equals(settings2)).toBe(true);
    });

    it('should test isValid method', () => {
        expect(new SecurityContributionSettings().isValid()).toBe(true);
    });
});
