import {LiquidityStore} from '../../liquidity.store';
import {AbstractLiquiditySettings} from '../abstract-liquidity-settings.model';
import {EsmaLiquidationFooterLiquiditySettings} from './esma-liquidation-footer-liquidity-settings.model';

describe('ESMALiquidationFooterLiquiditySettings test', () => {
    let esmaLiquidationFooterLiquiditySettings: EsmaLiquidationFooterLiquiditySettings;

    beforeEach(() => {
        esmaLiquidationFooterLiquiditySettings = new EsmaLiquidationFooterLiquiditySettings();
        esmaLiquidationFooterLiquiditySettings.initialize(new Map<string, boolean>(), new Map<string, any>());
    });

    it('Test model initialization with liquidity defaults', () => {
        const esmaLiquidationFooterLiquiditySettingsOther: EsmaLiquidationFooterLiquiditySettings = new EsmaLiquidationFooterLiquiditySettings();
        LiquidityStore.liquidityDefaults = {
            esma_illiquid_max_format: '',
            esma_illiquid_max_abs_pct: 1,
            esma_illiquid_max_rel: 1,
            'esma_days-to-unwind': 1
        };
        const definitions: Map<string, any> = new Map(Object.entries(LiquidityStore));

        esmaLiquidationFooterLiquiditySettingsOther.initialize(new Map<string, boolean>(), definitions);

        expect(esmaLiquidationFooterLiquiditySettingsOther.illiquidMaxFormat).toBe('');
        expect(esmaLiquidationFooterLiquiditySettingsOther.absIlliquidMax).toBe(100);
        expect(esmaLiquidationFooterLiquiditySettingsOther.relIlliquidMax).toBe(1);
        expect(esmaLiquidationFooterLiquiditySettingsOther.illiquidDef).toBe(1);
        expect(esmaLiquidationFooterLiquiditySettingsOther.holidayLookup).toBe(5);
        expect(esmaLiquidationFooterLiquiditySettings.assetStressScenario).toBeUndefined();
    });

    it('Test model initialization', () => {
        expect(esmaLiquidationFooterLiquiditySettings).toBeDefined();
        expect(esmaLiquidationFooterLiquiditySettings.useNotionalAmtLiq).toBe(false);
        expect(esmaLiquidationFooterLiquiditySettings.globalStressMultiplier.fixedCostMultiplier).toBe(1);
        expect(esmaLiquidationFooterLiquiditySettings.globalStressMultiplier.marketDepthMultiplier).toBe(1);
        expect(esmaLiquidationFooterLiquiditySettings.globalStressMultiplier.marketImpactMultiplier).toBe(1);
        expect(esmaLiquidationFooterLiquiditySettings.aggregation).toBe('net');
        expect(esmaLiquidationFooterLiquiditySettings.holidayLookup).toBe(5);
    });

    it('Test deserialize', () => {
        const data: any = {
            stressMultiplier: 0, aggregation: 'Dummy String value',
            holidayLookup: 5
        };
        esmaLiquidationFooterLiquiditySettings.deserialize(data);

        expect(esmaLiquidationFooterLiquiditySettings.globalStressMultiplier.marketDepthMultiplier).toBe(0);
        expect(esmaLiquidationFooterLiquiditySettings.globalStressMultiplier.marketImpactMultiplier).toBe(1);
        expect(esmaLiquidationFooterLiquiditySettings.globalStressMultiplier.fixedCostMultiplier).toBe(1);
        expect(esmaLiquidationFooterLiquiditySettings.holidayLookup).toBe(5);
        expect(esmaLiquidationFooterLiquiditySettings.aggregation).toBe('Dummy String value');
        expect(esmaLiquidationFooterLiquiditySettings.assetStressScenario).toBeUndefined();
        data.assetStressScenario = 'SCENE1';
        esmaLiquidationFooterLiquiditySettings.deserialize(data);
        expect(esmaLiquidationFooterLiquiditySettings.assetStressScenario).toBe('SCENE1');
    });

    describe('Test addRequestParams', () => {
        it('default', () => {
            const requestParam: any = {};
            esmaLiquidationFooterLiquiditySettings.illiquidEnabledFlag = true;
            esmaLiquidationFooterLiquiditySettings.illiquidMaxFormat = 'REL';
            esmaLiquidationFooterLiquiditySettings.relIlliquidMax = 100;
            esmaLiquidationFooterLiquiditySettings.holidayLookup = 100;
            esmaLiquidationFooterLiquiditySettings.addRequestParams(requestParam);

            expect(requestParam).toBeDefined();
            expect(requestParam.useNotionalAmtLiq).toBe(false);
            expect(requestParam.aggregation).toBe('net');
            expect(requestParam.relIlliquidMax).toBe(100);
            expect(requestParam.holidayLookup).toBe(100);
            expect(requestParam.assetStressScenario).toBeUndefined();
            expect(requestParam.fixedCostMultiplier).toBeUndefined();
            expect(requestParam.marketDepthMultiplier).toBeUndefined();
            expect(requestParam.marketImpactMultiplier).toBeUndefined();
        });

        it('globalStressFlag', () => {
            const requestParam: any = {};
            esmaLiquidationFooterLiquiditySettings.globalLevelStressTestingFlag = true;
            esmaLiquidationFooterLiquiditySettings.addRequestParams(requestParam);
            expect(requestParam.fixedCostMultiplier).toBe(1);
            expect(requestParam.marketImpactMultiplier).toBe(1);
            expect(requestParam.stressMultiplier).toBe(1);
        });

        it('assetStressScenario', () => {
            const requestParam: any = {};
            esmaLiquidationFooterLiquiditySettings.assetStressScenario = 'SCENE1';
            esmaLiquidationFooterLiquiditySettings.addRequestParams(requestParam);
            expect(requestParam.assetStressScenario).toBe('SCENE1');
        });
    });

    it('Test serialize', () => {
        const data = esmaLiquidationFooterLiquiditySettings.serialize();
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.marketImpactMultiplier).toBe(1);
        expect(data.marketDepthMultiplier).toBe(1);
        expect(data.fixedCostMultiplier).toBe(1);
        expect(data.holidayLookup).toBe(5);
        expect(data.assetStressScenario).toBeUndefined();
    });

    describe('Test equals', () => {
        it('If not instance of EsmaLiquidationFooterLiquidationSettings', () => {
            const object = {} as AbstractLiquiditySettings;
            expect(esmaLiquidationFooterLiquiditySettings.equals(object)).toBeFalsy();
        });

        it('For different scenario', () => {
            const esmaLiquidationFooterLiquiditySettingsOther: EsmaLiquidationFooterLiquiditySettings = new EsmaLiquidationFooterLiquiditySettings();
            esmaLiquidationFooterLiquiditySettingsOther.initialize(new Map<string, boolean>(), new Map<string, any>());

            expect(esmaLiquidationFooterLiquiditySettings.equals(esmaLiquidationFooterLiquiditySettingsOther)).toBeTruthy();

            esmaLiquidationFooterLiquiditySettingsOther.globalStressMultiplier.marketImpactMultiplier = 10;
            expect(esmaLiquidationFooterLiquiditySettings.equals(esmaLiquidationFooterLiquiditySettingsOther)).toBeFalsy();
            esmaLiquidationFooterLiquiditySettings.globalStressMultiplier.marketImpactMultiplier = 10;
            expect(esmaLiquidationFooterLiquiditySettings.equals(esmaLiquidationFooterLiquiditySettingsOther)).toBeTruthy();

            esmaLiquidationFooterLiquiditySettingsOther.globalStressMultiplier.marketDepthMultiplier = 10;
            expect(esmaLiquidationFooterLiquiditySettings.equals(esmaLiquidationFooterLiquiditySettingsOther)).toBeFalsy();
            esmaLiquidationFooterLiquiditySettings.globalStressMultiplier.marketDepthMultiplier = 10;
            expect(esmaLiquidationFooterLiquiditySettings.equals(esmaLiquidationFooterLiquiditySettingsOther)).toBeTruthy();

            esmaLiquidationFooterLiquiditySettingsOther.globalStressMultiplier.fixedCostMultiplier = 10;
            expect(esmaLiquidationFooterLiquiditySettings.equals(esmaLiquidationFooterLiquiditySettingsOther)).toBeFalsy();
            esmaLiquidationFooterLiquiditySettings.globalStressMultiplier.fixedCostMultiplier = 10;
            expect(esmaLiquidationFooterLiquiditySettings.equals(esmaLiquidationFooterLiquiditySettingsOther)).toBeTruthy();

            esmaLiquidationFooterLiquiditySettingsOther.useNotionalAmtLiq = true;
            expect(esmaLiquidationFooterLiquiditySettings.equals(esmaLiquidationFooterLiquiditySettingsOther)).toBeFalsy();
            esmaLiquidationFooterLiquiditySettings.useNotionalAmtLiq = true;
            expect(esmaLiquidationFooterLiquiditySettings.equals(esmaLiquidationFooterLiquiditySettingsOther)).toBeTruthy();

            esmaLiquidationFooterLiquiditySettingsOther.holidayLookup = 10;
            expect(esmaLiquidationFooterLiquiditySettings.equals(esmaLiquidationFooterLiquiditySettingsOther)).toBeFalsy();
            esmaLiquidationFooterLiquiditySettings.holidayLookup = 10;
            expect(esmaLiquidationFooterLiquiditySettings.equals(esmaLiquidationFooterLiquiditySettingsOther)).toBeTruthy();

            esmaLiquidationFooterLiquiditySettingsOther.assetStressScenario = 'SCENE1';
            expect(esmaLiquidationFooterLiquiditySettings.equals(esmaLiquidationFooterLiquiditySettingsOther)).toBeFalsy();
            esmaLiquidationFooterLiquiditySettings.assetStressScenario = 'SCENE1';
            expect(esmaLiquidationFooterLiquiditySettings.equals(esmaLiquidationFooterLiquiditySettingsOther)).toBeTruthy();

        });
    });
});
