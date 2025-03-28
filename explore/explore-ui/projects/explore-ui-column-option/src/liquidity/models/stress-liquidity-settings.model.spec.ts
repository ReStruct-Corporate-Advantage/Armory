import {AbstractLiquiditySettings} from './abstract-liquidity-settings.model';
import {StressLiquiditySettings} from './stress-liquidity-settings.model';

describe('StressLiquiditySettings test', () => {
    let stressLiquiditySettings: StressLiquiditySettings;

    beforeEach(() => {
        stressLiquiditySettings = new StressLiquiditySettings();
        stressLiquiditySettings.initialize(new Map<string, boolean>());
    });

    it('Test model initialization with default values', () => {
        expect(stressLiquiditySettings).toBeDefined();
        expect(stressLiquiditySettings.fixedCostMultiplier).toBeUndefined();
        expect(stressLiquiditySettings.marketDepthMultiplier).toBeUndefined();
        expect(stressLiquiditySettings.marketImpactMultiplier).toBeUndefined();
        expect(stressLiquiditySettings.stressAnalysisFlag).toBeFalsy();
        expect(stressLiquiditySettings.tcostStressFlag).toBeFalsy();
    });

    describe('test deserialize', () => {
        it('Test deserialize empty', () => {
            const data: any = {};
            stressLiquiditySettings.deserialize(data);
            expect(stressLiquiditySettings.fixedCostMultiplier).toBeUndefined();
            expect(stressLiquiditySettings.marketImpactMultiplier).toBeUndefined();
            expect(stressLiquiditySettings.marketDepthMultiplier).toBeUndefined();
        });

        it('Test deserialize', () => {
            const data: any = {
                fixedCostMultiplier: 2, marketDepthMultiplier: 3, marketImpactMultiplier: 4
            };
            stressLiquiditySettings.deserialize(data);
            expect(stressLiquiditySettings.fixedCostMultiplier).toBe(2);
            expect(stressLiquiditySettings.marketImpactMultiplier).toBe(4);
        });
    });

    it('test addRequestParams', () => {
        const requestParam: any = {};
        stressLiquiditySettings.addRequestParams(requestParam);
        expect(requestParam).toBeDefined();
        expect(requestParam.fixedCostMultiplier).toBeUndefined();
        expect(requestParam.marketDepthMultiplier).toBeUndefined();
        expect(requestParam.marketImpactMultiplier).toBeUndefined();
        expect(requestParam.stressAnalysisFlag).toBeFalsy();
    });

    it('Test serialize', () => {
        const data = stressLiquiditySettings.serialize();
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.fixedCostMultiplier).toBeUndefined();
        expect(data.marketImpactMultiplier).toBeUndefined();
        expect(data.marketDepthMultiplier).toBeUndefined();
        expect(data.stressAnalysisFlag).toBeFalsy();
        expect(data.tcostStressFlag).toBeFalsy();
    });

    describe('Test equals', () => {
        it('If not instance of StressLiquiditySettings', () => {
            const object = {} as AbstractLiquiditySettings;
            expect(stressLiquiditySettings.equals(object)).toBeFalsy();
        });

        it('For different scenario', () => {
            const stressLiquiditySettingsOther: StressLiquiditySettings = new StressLiquiditySettings();
            stressLiquiditySettingsOther.initialize(new Map<string, boolean>());

            expect(stressLiquiditySettings.equals(stressLiquiditySettingsOther)).toBeTruthy();

            stressLiquiditySettingsOther.stressAnalysisFlag = true;
            expect(stressLiquiditySettings.equals(stressLiquiditySettingsOther)).toBeFalsy();

            stressLiquiditySettingsOther.stressAnalysisFlag = false;
            stressLiquiditySettingsOther.tcostStressFlag = true;
            expect(stressLiquiditySettings.equals(stressLiquiditySettingsOther)).toBeFalsy();
        });
    });
});
