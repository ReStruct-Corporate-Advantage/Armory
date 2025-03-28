import {AbstractLiquiditySettings} from './abstract-liquidity-settings.model';
import {QuantitativeTieringLiquiditySettings} from './quantitative-tiering-liquidity-settings.model';

describe('QuantitativeTieringLiquiditySettings test', () => {
    let quantitativeTieringLiquiditySettings: QuantitativeTieringLiquiditySettings;

    beforeEach(() => {
        quantitativeTieringLiquiditySettings = new QuantitativeTieringLiquiditySettings();
        quantitativeTieringLiquiditySettings.initialize(new Map<string, boolean>());
    });

    it('Test model initialization', () => {
        expect(quantitativeTieringLiquiditySettings).toBeDefined();
        expect(quantitativeTieringLiquiditySettings.minDays).toBe(0);
        expect(quantitativeTieringLiquiditySettings.maxDays).toBe(500);
    });

    it('Test deserialize', () => {
        const data: any = {
            minDays: 2, maxDays: 2
        };
        quantitativeTieringLiquiditySettings.deserialize(data);
        expect(quantitativeTieringLiquiditySettings.minDays).toBe(2);
        expect(quantitativeTieringLiquiditySettings.maxDays).toBe(2);
    });

    it('Test deserialize with null data', () => {
        const data: any = null;
        quantitativeTieringLiquiditySettings.deserialize(data);
        expect(quantitativeTieringLiquiditySettings.minDays).toBe(0);
        expect(quantitativeTieringLiquiditySettings.maxDays).toBe(500);
    });

    it('Test addRequestParams', function () {
        const requestParam: any = {};
        quantitativeTieringLiquiditySettings.addRequestParams(requestParam);
        expect(requestParam).toBeDefined();
        expect(requestParam.minDays).toBe(0);
        expect(requestParam.maxDays).toBe(500);
    });

    it('Test serialize', () => {
        const data = quantitativeTieringLiquiditySettings.serialize();
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.maxDays).toBe(500);
        expect(data.minDays).toBe(0);
    });

    describe('Test equals', () => {
        it('If not instance of GeneralLiquidityColumnOptions', () => {
            const object = {} as AbstractLiquiditySettings;
            expect(quantitativeTieringLiquiditySettings.equals(object)).toBeFalsy();
        });

        it('For different scenario', () => {
            const quantitativeTieringLiquiditySettingOther = new QuantitativeTieringLiquiditySettings();
            quantitativeTieringLiquiditySettingOther.initialize(new Map<string, boolean>());

            expect(quantitativeTieringLiquiditySettings.equals(quantitativeTieringLiquiditySettingOther)).toBeTruthy();

            quantitativeTieringLiquiditySettingOther.minDays = 2;
            expect(quantitativeTieringLiquiditySettings.equals(quantitativeTieringLiquiditySettingOther)).toBeFalsy();
        });
    });
});
