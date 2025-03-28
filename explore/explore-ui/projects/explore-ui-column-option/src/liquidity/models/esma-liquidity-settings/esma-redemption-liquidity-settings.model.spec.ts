import {AbstractLiquiditySettings} from '../abstract-liquidity-settings.model';
import {EsmaRedemptionLiquiditySettings} from './esma-redemption-liquidity-settings.model';

describe('ESMARedemptionLiquiditySettings test', () => {
    let esmaRedemptionLiquiditySettings: EsmaRedemptionLiquiditySettings;

    beforeEach(() => {
        esmaRedemptionLiquiditySettings = new EsmaRedemptionLiquiditySettings();
        esmaRedemptionLiquiditySettings.initialize(new Map<string, boolean>(), new Map<string, any>());
    });

    it('Test model initialization', () => {
        expect(esmaRedemptionLiquiditySettings).toBeDefined();
        expect(esmaRedemptionLiquiditySettings.liabilityType).toBe('redemptionScenarios');
    });

    it('Test deserialize', () => {
        const data: any = {
            liabilityType: 'Dummy Liability String',
            redemptionScenario: 'Dummy Redemption String',
            includeAdditionalCollateralFlag: false
        };
        esmaRedemptionLiquiditySettings.deserialize(data);

        expect(esmaRedemptionLiquiditySettings.liabilityType).toBe('Dummy Liability String');
        expect(esmaRedemptionLiquiditySettings.redemptionScenario).toBe('Dummy Redemption String');
        expect(esmaRedemptionLiquiditySettings.includeAdditionalCollateralFlag).toBeFalsy();
    });

    it('Test addRequestParams', () => {
        let requestParam: any = {};
        esmaRedemptionLiquiditySettings.addRequestParams(requestParam);

        expect(requestParam).toBeDefined();
        expect(requestParam.liabilityType).toBe('redemptionScenarios');
    });

    it('Test serialize', function () {
        let data = esmaRedemptionLiquiditySettings.serialize();
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.liabilityType).toBe('redemptionScenarios');
    });

    describe('Test equals', () => {
        it('If not instance of EsmaRedemptionLiquidationSettings', () => {
            const object = {} as AbstractLiquiditySettings;
            expect(esmaRedemptionLiquiditySettings.equals(object)).toBeFalsy();
        });

        it('For different scenario', () => {
            const esmaRedemptionLiquiditySettingsOther: EsmaRedemptionLiquiditySettings = new EsmaRedemptionLiquiditySettings();
            esmaRedemptionLiquiditySettingsOther.initialize(new Map<string, boolean>(), new Map<string, any>());

            expect(esmaRedemptionLiquiditySettings.equals(esmaRedemptionLiquiditySettingsOther)).toBeTruthy();

            esmaRedemptionLiquiditySettingsOther.includeAdditionalCollateralFlag = false;
            expect(esmaRedemptionLiquiditySettings.equals(esmaRedemptionLiquiditySettingsOther)).toBeFalsy();

            esmaRedemptionLiquiditySettingsOther.liabilityType = 'Dummy Value';
            expect(esmaRedemptionLiquiditySettings.equals(esmaRedemptionLiquiditySettingsOther)).toBeFalsy();
        });
    });
});
