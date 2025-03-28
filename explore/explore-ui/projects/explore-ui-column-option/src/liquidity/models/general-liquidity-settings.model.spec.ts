import {AbstractLiquiditySettings} from './abstract-liquidity-settings.model';
import {GeneralLiquiditySettings} from './general-liquidity-settings.model';

describe('GeneralLiquiditySettings test', () => {
    let generalLiquiditySettings: GeneralLiquiditySettings;

    beforeEach(() => {
        generalLiquiditySettings = new GeneralLiquiditySettings();
        generalLiquiditySettings.initialize(new Map<string, boolean>());
    });

    it('Test model initialization', () => {
        expect(generalLiquiditySettings).toBeDefined();
        expect(generalLiquiditySettings.horizon).toBe(1);
        expect(generalLiquiditySettings.advParticipationRate).toBe(25);
        expect(generalLiquiditySettings.advParticipationRateEquity).toBe(25);
        expect(generalLiquiditySettings.advParticipationRateOther).toBe(100);
    });

    it('Test deserialize', () => {
        const data: any = {
            horizon: 0, advParticipationRate: 1
        };
        generalLiquiditySettings.deserialize(data);

        expect(generalLiquiditySettings.horizon).toBe(0);
        expect(generalLiquiditySettings.advParticipationRate).toBe(1);
    });

    it('Test addRequestParams', function () {
        let requestParam: any = {};
        generalLiquiditySettings.addRequestParams(requestParam);
        expect(requestParam).toBeDefined();
        expect(requestParam.horizon).toBe(1);
        expect(requestParam.advParticipationRate).toBe(25);

        generalLiquiditySettings.advParticipationRateEquity = 30;
        generalLiquiditySettings.advParticipationRateOther = 90;
        generalLiquiditySettings.addRequestParams(requestParam);
        expect(requestParam).toBeDefined();
        expect(requestParam.advParticipationRateEquity).toBe(30);
        expect(requestParam.advParticipationRateOther).toBe(90);
    });

    it('Test serialize', function () {
        let data = generalLiquiditySettings.serialize();
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        // all options were populated according to default values
        expect(data.advParticipationRate).toBe(25);
    });

    describe('Test equals', () => {
        it('If not instance of GeneralLiquiditySettings', () => {
            const object = {} as AbstractLiquiditySettings;
            expect(generalLiquiditySettings.equals(object)).toBeFalsy();
        });

        it('For different scenario', () => {
            const generalLiquiditySettingsOther = new GeneralLiquiditySettings();
            generalLiquiditySettingsOther.initialize(new Map<string, boolean>());

            expect(generalLiquiditySettings.equals(generalLiquiditySettingsOther)).toBeTruthy();

            // change adv participation rate other
            generalLiquiditySettingsOther.advParticipationRateOther = 90;
            expect(generalLiquiditySettings.equals(generalLiquiditySettingsOther)).toBeFalsy();

            // change adv participation rate equity
            generalLiquiditySettingsOther.advParticipationRateEquity = 30;
            expect(generalLiquiditySettings.equals(generalLiquiditySettingsOther)).toBeFalsy();

            // change adv participation rate
            generalLiquiditySettingsOther.advParticipationRate = 30;
            expect(generalLiquiditySettings.equals(generalLiquiditySettingsOther)).toBeFalsy();

            // change horizon
            generalLiquiditySettingsOther.horizon = 10;
            expect(generalLiquiditySettings.equals(generalLiquiditySettingsOther)).toBeFalsy();
        });
    });
});
