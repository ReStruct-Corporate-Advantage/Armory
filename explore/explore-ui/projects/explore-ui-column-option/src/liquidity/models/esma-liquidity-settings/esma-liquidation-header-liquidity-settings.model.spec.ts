import {AbstractLiquiditySettings} from '../abstract-liquidity-settings.model';
import {EsmaLiquidationHeaderLiquiditySettings} from './esma-liquidation-header-liquidity-settings.model';

describe('ESMAliquidationHeaderLiquiditySettings test', () => {
    let esmaLiquidationHeaderLiquiditySettings: EsmaLiquidationHeaderLiquiditySettings;

    beforeEach(() => {
        esmaLiquidationHeaderLiquiditySettings = new EsmaLiquidationHeaderLiquiditySettings();
        esmaLiquidationHeaderLiquiditySettings.initialize(new Map<string, boolean>());
    });

    it('Test model initialization', () => {
        expect(esmaLiquidationHeaderLiquiditySettings).toBeDefined();
        expect(esmaLiquidationHeaderLiquiditySettings.includeEquityHFCashFlag).toBe(true);
        expect(esmaLiquidationHeaderLiquiditySettings.navMultiplier).toBe(1);
        expect(esmaLiquidationHeaderLiquiditySettings.capacityApproach).toBe('concurrentWeighted');
    });

    it('Test model initialization with Tcost enabled', () => {
        esmaLiquidationHeaderLiquiditySettings = new EsmaLiquidationHeaderLiquiditySettings();
        const definitons: Map<string, boolean> = new Map<string, boolean>();
        definitons.set('ENABLE_TRANSACTION_COST_FLAG', true);
        esmaLiquidationHeaderLiquiditySettings.initialize(definitons);
        expect(esmaLiquidationHeaderLiquiditySettings).toBeDefined();
        expect(esmaLiquidationHeaderLiquiditySettings.includeTransactionCostFlag).toBe(true);
        expect(esmaLiquidationHeaderLiquiditySettings.includeEquityHFCashFlag).toBe(true);
        expect(esmaLiquidationHeaderLiquiditySettings.navMultiplier).toBe(1);
        expect(esmaLiquidationHeaderLiquiditySettings.capacityApproach).toBe('concurrentWeighted');
    });

    it('Test deserialize', () => {
        const data: any = {
            navMultiplier: 0
        };
        esmaLiquidationHeaderLiquiditySettings.deserialize(data);

        expect(esmaLiquidationHeaderLiquiditySettings.navMultiplier).toBe(0);
    });

    it('Test addRequestParams', function () {
        const requestParam: any = {};
        esmaLiquidationHeaderLiquiditySettings.addRequestParams(requestParam);

        expect(requestParam).toBeDefined();
        expect(requestParam.includeEquityHFCashFlag).toBe(true);
        expect(requestParam.navMultiplier).toBe(1);
    });

    it('Test serialize', function () {
        const data = esmaLiquidationHeaderLiquiditySettings.serialize();

        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.navMultiplier).toBe(1);
    });

    describe('Test equals', () => {
        it('If not instance of EsmaLiquidationHeaderLiquidationSettings', () => {
            const object = {} as AbstractLiquiditySettings;
            expect(esmaLiquidationHeaderLiquiditySettings.equals(object)).toBeFalsy();
        });

        it('For different scenario', () => {
            const esmaLiquidationHeaderLiquiditySettingsOther: EsmaLiquidationHeaderLiquiditySettings = new EsmaLiquidationHeaderLiquiditySettings();
            esmaLiquidationHeaderLiquiditySettingsOther.initialize(new Map<string, boolean>());

            expect(esmaLiquidationHeaderLiquiditySettings.equals(esmaLiquidationHeaderLiquiditySettingsOther)).toBeTruthy();

            esmaLiquidationHeaderLiquiditySettingsOther.navMultiplier = 10;
            expect(esmaLiquidationHeaderLiquiditySettings.equals(esmaLiquidationHeaderLiquiditySettingsOther)).toBeFalsy();

            esmaLiquidationHeaderLiquiditySettingsOther.includeEquityHFCashFlag = false;
            expect(esmaLiquidationHeaderLiquiditySettings.equals(esmaLiquidationHeaderLiquiditySettingsOther)).toBeFalsy();
        });
    });
});
