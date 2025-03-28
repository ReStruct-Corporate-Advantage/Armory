import {AbstractLiquiditySettings} from './abstract-liquidity-settings.model';
import {PartialLiquiditySettings} from './partial-liquidity-settings.model';

describe('PartialLiquiditySettings test', () => {
    let partialLiquiditySettings: PartialLiquiditySettings;

    beforeEach(() => {
        const defaultSettings: Map<string, boolean> = new Map<string, boolean>();
        defaultSettings.set('LIQUIDATION_SETTINGS', true);
        defaultSettings.set('MODIFIED_LIQUIDATION_STRATEGIES_ONLY', true);

        partialLiquiditySettings = new PartialLiquiditySettings();
        partialLiquiditySettings.initialize(defaultSettings);
    });

    it('Test model initialization', () => {
        expect(partialLiquiditySettings).toBeDefined();
        expect(partialLiquiditySettings.liquidationStrategy).toBe('modifiedWaterfall');
        expect(partialLiquiditySettings.partialLiquidation).toBeFalsy();
        expect(partialLiquiditySettings.percentNavLiquidated).toBe(100);
        expect(partialLiquiditySettings.maxRatio).toBe(1);
    });

    it('Test deserialize', () => {
        const data: any = {
            liquidationConstraint: 'liquidationConstraint', partialLiquidation: true,
            maxTransactionCost: 10, maxRatio: 0.3
        };
        partialLiquiditySettings.deserialize(data);

        expect(partialLiquiditySettings.liquidationConstraint).toBe('liquidationConstraint');
        expect(partialLiquiditySettings.partialLiquidation).toBeTruthy();
        expect(partialLiquiditySettings.maxTransactionCost).toBe(10);
        expect(partialLiquiditySettings.maxRatio).toBe(0.3);
    });

    it('Test addRequestParams', function () {
        const requestParam: any = {};
        partialLiquiditySettings.addRequestParams(requestParam);

        expect(requestParam).toBeDefined();
        expect(requestParam.partialLiquidation).toBeFalsy();
        expect(requestParam.maxMarketImpact).toBe(0.01);
        expect(requestParam.percentNAVLiquidated).toBe(1);
        expect(requestParam.maxRatio).toBe(1);
    });

    it('Test serialize', () => {
        const data = partialLiquiditySettings.serialize();

        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.partialLiquidation).toBeFalsy();
        expect(data.maxMarketImpact).toBe(100);
        expect(data.maxRatio).toBe(1);
    });

    describe('Test equals', () => {
        it('If not instance of GeneralLiquidityColumnOptions', () => {
            const object = {} as AbstractLiquiditySettings;
            expect(partialLiquiditySettings.equals(object)).toBeFalsy();
        });

        it('For different scenario', () => {
            const defaultSettings: Map<string, boolean> = new Map<string, boolean>();
            defaultSettings.set('LIQUIDATION_SETTINGS', true);
            defaultSettings.set('MODIFIED_LIQUIDATION_STRATEGIES_ONLY', true);

            const partialLiquiditySettingsOther = new PartialLiquiditySettings();
            partialLiquiditySettingsOther.initialize(defaultSettings);

            expect(partialLiquiditySettings.equals(partialLiquiditySettingsOther)).toBeTruthy();

            partialLiquiditySettingsOther.partialLiquidation = true;
            expect(partialLiquiditySettings.equals(partialLiquiditySettingsOther)).toBeFalsy();
        });
    });
});
