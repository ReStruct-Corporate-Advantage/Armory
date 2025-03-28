import {AbstractLiquiditySettings} from './abstract-liquidity-settings.model';
import { GlobalStressMultiplier } from './global-stress-multiplier';
import {JITALiquiditySettings} from './jita-liquidity-settings.model';

describe('JITALiquiditySettings test', () => {
    let jitaLiquiditySettings: JITALiquiditySettings;

    beforeEach(() => {
        jitaLiquiditySettings = new JITALiquiditySettings();
        const optionAttributes = new Map<string, boolean>();
        optionAttributes.set('HAS_JITA_TIER_INFOS', true);
        jitaLiquiditySettings.initialize(optionAttributes);
    });

    it('Test model initialization', () => {
        expect(jitaLiquiditySettings).toBeDefined();
        expect(jitaLiquiditySettings.navMultiplier).toBe(1);
        expect(jitaLiquiditySettings.liquidationStrategy).toBe('waterfall');
        expect(jitaLiquiditySettings.liquidationConstraint).toBe('percentNAV');
        expect(jitaLiquiditySettings.percentNavLiquidated).toBe(100);
        expect(jitaLiquiditySettings.tierInfos.length).toBe(4);
        expect(jitaLiquiditySettings.aggregation).toBe('net');
        expect(jitaLiquiditySettings.liquidationBucketMeth).toBe('equalDollar');
        expect(jitaLiquiditySettings.illiquidEnabledFlag).toBeFalsy();
        expect(jitaLiquiditySettings.illiquidMaxFormat).toBeUndefined();
        expect(jitaLiquiditySettings.absIlliquidMax).toBeUndefined();
        expect(jitaLiquiditySettings.relIlliquidMax).toBeUndefined();
        expect(jitaLiquiditySettings.illiquidDef).toBeUndefined();
        expect(jitaLiquiditySettings.assetStressScenario).toBeUndefined();
        expect(jitaLiquiditySettings.globalStressMultiplier).toBeDefined();
        expect(jitaLiquiditySettings.globalStressMultiplier.fixedCostMultiplier).toBe(1);
        expect(jitaLiquiditySettings.globalStressMultiplier.marketDepthMultiplier).toBe(1);
        expect(jitaLiquiditySettings.globalStressMultiplier.marketImpactMultiplier).toBe(1);
    });

    it('Test deserialize and deserialize', () => {
        const data = jitaLiquiditySettings.serialize();
        const deserialized: JITALiquiditySettings = new JITALiquiditySettings();
        deserialized.deserialize(data);

        expect(deserialized.navMultiplier).toBe(1);
        expect(deserialized.liquidationStrategy).toBe('waterfall');
        expect(deserialized.liquidationConstraint).toBe('percentNAV');
        expect(deserialized.percentNavLiquidated).toBe(100);
        expect(deserialized.tierInfos.length).toBe(4);
        expect(deserialized.aggregation).toBe('net');
        expect(deserialized.liquidationBucketMeth).toBe('equalDollar');
        expect(deserialized.illiquidEnabledFlag).toBeFalsy();
        expect(deserialized.illiquidMaxFormat).toBeUndefined();
        expect(deserialized.absIlliquidMax).toBeUndefined();
        expect(deserialized.relIlliquidMax).toBeUndefined();
        expect(deserialized.illiquidDef).toBeUndefined();
        expect(deserialized.assetStressScenario).toBeUndefined();
        expect(jitaLiquiditySettings.globalStressMultiplier).toBeDefined();
        expect(jitaLiquiditySettings.globalStressMultiplier.fixedCostMultiplier).toBe(1);
        expect(jitaLiquiditySettings.globalStressMultiplier.marketDepthMultiplier).toBe(1);
        expect(jitaLiquiditySettings.globalStressMultiplier.marketImpactMultiplier).toBe(1);

        data.assetStressScenario = 'SCENE';
        data.stressMultiplier = 2;
        data.marketDepthMultiplier = undefined;
        deserialized.deserialize(data);
        expect(deserialized.assetStressScenario).toBe('SCENE');
        expect(deserialized.globalStressMultiplier.fixedCostMultiplier).toBe(1);
        expect(deserialized.globalStressMultiplier.marketDepthMultiplier).toBe(2);
        expect(deserialized.globalStressMultiplier.marketImpactMultiplier).toBe(1);
    });

    it('Test deserialize with Illiquid parameters', () => {
        const data: any = {};
        const deserialized: JITALiquiditySettings = new JITALiquiditySettings();
        data.illiquidEnabledFlag = true;
        data.illiquidMaxFormat = 'REL';
        data.relIlliquidMax = 9;
        data.illiquidDef = 9;
        data.assetStressScenario = 'SCENE';
        deserialized.deserialize(data);
        expect(deserialized.illiquidEnabledFlag).toBeTruthy();
        expect(deserialized.illiquidMaxFormat).toBe('REL');
        expect(deserialized.absIlliquidMax).toBeUndefined();
        expect(deserialized.relIlliquidMax).toBe(9);
        expect(deserialized.illiquidDef).toBe(9);
        expect(deserialized.assetStressScenario).toBe('SCENE');
    });

    describe('Test addRequestParams', () => {
        it('default params', () => {
            const requestParam: any = {};
            jitaLiquiditySettings.illiquidEnabledFlag = false;
            jitaLiquiditySettings.addRequestParams(requestParam);
            expect(requestParam).toBeDefined();
            expect(requestParam.navMultiplier).toBe(1);
            expect(requestParam.liquidationStrategy).toBe('waterfall');
            expect(requestParam.liquidationConstraint).toBe('percentNAV');
            expect(requestParam.percentNAVLiquidated).toBe(1);
            expect(requestParam.tierInfos).toBeDefined();
            expect(requestParam.tierInfos.length).toBe(4);
            expect(requestParam.aggregation).toBe('net');
            expect(requestParam.liquidationBucketMeth).toBe('equalDollar');
            expect(requestParam.illiquidMaxFormat).toBeUndefined();
            expect(requestParam.absIlliquidMax).toBeUndefined();
            expect(requestParam.relIlliquidMax).toBeUndefined();
            expect(requestParam.illiquidDef).toBeUndefined();
            expect(requestParam.assetStressScenario).toBeUndefined();
        });

        it('Illiquid enabled', () => {
            const requestParam: any = {};
            jitaLiquiditySettings.illiquidEnabledFlag = true;
            jitaLiquiditySettings.illiquidMaxFormat = 'ABS';
            jitaLiquiditySettings.absIlliquidMax = 27;
            jitaLiquiditySettings.illiquidDef = 9;
            jitaLiquiditySettings.assetStressScenario = 'SCENE';
            jitaLiquiditySettings.addRequestParams(requestParam);
            expect(requestParam.illiquidMaxFormat).toBe('ABS');
            expect(requestParam.absIlliquidMax).toBe(27);
            expect(requestParam.relIlliquidMax).toBeUndefined();
            expect(requestParam.illiquidDef).toBe(9);
            expect(requestParam.assetStressScenario).toBe('SCENE');
        });

        it('global stress', () => {
            const requestParam: any = {};
            jitaLiquiditySettings.globalLevelStressTestingFlag = true;
            jitaLiquiditySettings.globalStressMultiplier = new GlobalStressMultiplier();
            jitaLiquiditySettings.addRequestParams(requestParam);
            expect(requestParam.fixedCostMultiplier).toBe(1);
            expect(requestParam.marketImpactMultiplier).toBe(1);
            expect(requestParam.stressMultiplier).toBe(1);
        });
    });

    describe('Test equals', () => {
        it('If not instance of JITALiquiditySettings', () => {
            const object = {} as AbstractLiquiditySettings;
            expect(jitaLiquiditySettings.equals(object)).toBeFalsy();
        });

        it('For different scenario', () => {
            const jitaLiquiditySettingsOther = new JITALiquiditySettings();
            const attributes: Map<string, boolean> = new Map<string, boolean>();
            attributes.set('HAS_JITA_TIER_INFOS', true);
            jitaLiquiditySettingsOther.initialize(attributes);

            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeTruthy();

            jitaLiquiditySettingsOther.navMultiplier = 90;
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeFalsy();
            jitaLiquiditySettings.navMultiplier = 90;
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeTruthy();

            jitaLiquiditySettingsOther.percentNavLiquidated = 30;
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeFalsy();
            jitaLiquiditySettings.percentNavLiquidated = 30;
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeTruthy();

            jitaLiquiditySettingsOther.liquidationStrategy = 'modifiedWaterFall';
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeFalsy();
            jitaLiquiditySettings.liquidationStrategy = 'modifiedWaterFall';
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeTruthy();

            jitaLiquiditySettingsOther.illiquidEnabledFlag = true;
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeFalsy();
            jitaLiquiditySettings.illiquidEnabledFlag = true;
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeTruthy();

            jitaLiquiditySettingsOther.illiquidMaxFormat = 'REL';
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeFalsy();
            jitaLiquiditySettings.illiquidMaxFormat = 'REL';
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeTruthy();

            jitaLiquiditySettingsOther.relIlliquidMax = 9;
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeFalsy();
            jitaLiquiditySettings.relIlliquidMax = 9;
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeTruthy();

            jitaLiquiditySettingsOther.illiquidDef = 9;
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeFalsy();
            jitaLiquiditySettings.illiquidDef = 9;
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeTruthy();

            jitaLiquiditySettingsOther.assetStressScenario = 'SCENE';
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeFalsy();
            jitaLiquiditySettings.assetStressScenario = 'SCENE';
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeTruthy();

            jitaLiquiditySettingsOther.globalStressMultiplier.fixedCostMultiplier = 2;
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeFalsy();
            jitaLiquiditySettings.globalStressMultiplier.fixedCostMultiplier = 2;
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeTruthy();

            jitaLiquiditySettingsOther.globalStressMultiplier.marketImpactMultiplier = 2;
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeFalsy();
            jitaLiquiditySettings.globalStressMultiplier.marketImpactMultiplier = 2;
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeTruthy();

            jitaLiquiditySettingsOther.globalStressMultiplier.marketDepthMultiplier = 2;
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeFalsy();
            jitaLiquiditySettings.globalStressMultiplier.marketDepthMultiplier = 2;
            expect(jitaLiquiditySettings.equals(jitaLiquiditySettingsOther)).toBeTruthy();
        });
    });
});
