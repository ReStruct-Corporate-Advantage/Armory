import {RiskRatioSettings} from './risk-ratio-settings.model';

describe('RiskRatioSettings', () => {
    /**
     * Test case for RiskRatioSettings initializing correctly
     */
    it('Test if RiskRatioSettings initializes correctly ', () => {
        // GIVEN
        const riskRatioSettings = new RiskRatioSettings();

        // THEN
        expect(riskRatioSettings.denominator).toBeUndefined();
        let serialized = riskRatioSettings.doSerialize(false);
        expect(serialized).toEqual({});
        expect(riskRatioSettings.isValid()).toBeFalsy();
        expect(riskRatioSettings.configType).toEqual('riskRatioSettings');

        const data = {denominator: 'BENCH'};
        const riskRatioSettings1 = new RiskRatioSettings(data);
        expect(riskRatioSettings1.denominator).toEqual('BENCH');
        serialized = riskRatioSettings1.doSerialize(false);
        expect(serialized).toEqual(data);
        expect(riskRatioSettings1.denominator).toBeTruthy();
        const requestParams = {};
        riskRatioSettings1.doAddRequestParams(requestParams);
        expect(requestParams).toEqual({ riskRatioSettings: { denominator: 'BENCH'} });

        expect(riskRatioSettings1.equals(riskRatioSettings)).toBeFalsy();
    });

    it('Test shouldSkipSerialize', () => {
        const riskRatioSettings = new RiskRatioSettings();
        expect(riskRatioSettings.shouldSkipSerialize()).toBeFalsy();
    });
});
