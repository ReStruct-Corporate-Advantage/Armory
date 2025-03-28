import {PrecannedStressScenariosLiquiditySettings} from './precanned-stress-scenarios-liquidity-settings.model';
import {LiquidityConstants} from "../liquidity.constants";

describe('Test PrecannedStressScenariosLiquiditySettings', () => {

    let precannedStressscenariosLiquiditySettings: PrecannedStressScenariosLiquiditySettings;

    beforeEach(() => {
        precannedStressscenariosLiquiditySettings = new PrecannedStressScenariosLiquiditySettings();
    });

    it('Test initialization', () => {
        expect(precannedStressscenariosLiquiditySettings.assetStressScenario).toBeUndefined();
        expect(precannedStressscenariosLiquiditySettings.stressMultiplierType).toBeUndefined();
    });

    it('Test initialize', () => {
        const data = new Map<string, boolean>();
        precannedStressscenariosLiquiditySettings.initialize(data);
        expect(precannedStressscenariosLiquiditySettings.assetStressScenario).toBeUndefined();
        expect(precannedStressscenariosLiquiditySettings.stressMultiplierType).toBeUndefined();
    });

    it('Test serialize empty object', () => {
        const serialized = precannedStressscenariosLiquiditySettings.serialize();
        expect(serialized.assetStressScenario).toBeUndefined();
        expect(serialized.stressMultiplierType).toBeUndefined();
    });

    it('Test serialize default values', () => {
        precannedStressscenariosLiquiditySettings.assetStressScenario = LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO;
        precannedStressscenariosLiquiditySettings.stressMultiplierType = LiquidityConstants.DEFAULT_STRESS_MULTIPLIER_TYPE;

        const serialized = precannedStressscenariosLiquiditySettings.serialize();
        expect(serialized.assetStressScenario).toBeUndefined();
        expect(serialized.stressMultiplierType).toBeUndefined();
    });

    it('Test serialize non default values', () => {
        precannedStressscenariosLiquiditySettings.assetStressScenario = 'ABC';
        precannedStressscenariosLiquiditySettings.stressMultiplierType = 'XYZ';

        const serialized = precannedStressscenariosLiquiditySettings.serialize();
        expect(serialized.assetStressScenario).toBe('ABC');
        expect(serialized.stressMultiplierType).toBe('XYZ');
    });

    it('Test deserialize empty', () => {
        precannedStressscenariosLiquiditySettings.deserialize(null);
        expect(precannedStressscenariosLiquiditySettings.assetStressScenario).toBeUndefined();
        expect(precannedStressscenariosLiquiditySettings.stressMultiplierType).toBeUndefined();

        precannedStressscenariosLiquiditySettings.deserialize({});
        expect(precannedStressscenariosLiquiditySettings.assetStressScenario).toBeUndefined();
        expect(precannedStressscenariosLiquiditySettings.stressMultiplierType).toBeUndefined();
    });

    it('Test deserialize with properties', () => {
        precannedStressscenariosLiquiditySettings.deserialize({assetStressScenario: 'ABC', stressMultiplierType: 'XYZ'});
        expect(precannedStressscenariosLiquiditySettings.assetStressScenario).toBe('ABC');
        expect(precannedStressscenariosLiquiditySettings.stressMultiplierType).toBe('XYZ');
    });

    it('Test equals', () => {
        expect(precannedStressscenariosLiquiditySettings.equals(null)).toBeFalsy();

        const other = new PrecannedStressScenariosLiquiditySettings();
        expect(precannedStressscenariosLiquiditySettings.equals(other)).toBeTruthy();

        precannedStressscenariosLiquiditySettings.stressMultiplierType = 'XYZ';
        expect(precannedStressscenariosLiquiditySettings.equals(null)).toBeFalsy();

        other.stressMultiplierType = 'XYZ';
        expect(precannedStressscenariosLiquiditySettings.equals(other)).toBeTruthy();

        precannedStressscenariosLiquiditySettings.assetStressScenario = 'ABC';
        expect(precannedStressscenariosLiquiditySettings.equals(null)).toBeFalsy();

        other.assetStressScenario = 'ABC';
        expect(precannedStressscenariosLiquiditySettings.equals(other)).toBeTruthy();
    });

    it('Test addRequestParams', () => {
        const params: any = {};
        precannedStressscenariosLiquiditySettings.addRequestParams(params);
        expect(Object.keys(params).length).toBe(0);

        precannedStressscenariosLiquiditySettings.assetStressScenario = 'ABC';
        precannedStressscenariosLiquiditySettings.addRequestParams(params);
        expect(Object.keys(params).length).toBe(1);
        expect(params.assetStressScenario).toBe('ABC');

        precannedStressscenariosLiquiditySettings.stressMultiplierType = 'XYZ';
        precannedStressscenariosLiquiditySettings.addRequestParams(params);
        expect(Object.keys(params).length).toBe(2);
        expect(params.assetStressScenario).toBe('ABC');
        expect(params.stressMultiplierType).toBe('XYZ');
    });
});
