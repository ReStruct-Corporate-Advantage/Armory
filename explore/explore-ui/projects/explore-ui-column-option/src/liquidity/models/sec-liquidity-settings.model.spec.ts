import {LiquidityStore} from '../liquidity.store';
import {AbstractLiquiditySettings} from './abstract-liquidity-settings.model';
import {SECLiquiditySettings} from './sec-liquidity-settings.model';

describe('SECLiquiditySettings test', () => {
    let secLiquiditySettings: SECLiquiditySettings;

    beforeEach(() => {
        secLiquiditySettings = new SECLiquiditySettings();
        secLiquiditySettings.initialize(new Map<string, boolean>(), new Map<string, any>());
        secLiquiditySettings.scenario = 'Dummy Scenario String';
    });

    it('Test model initialization with liquidity defaults', () => {
        const secLiquiditySettingsOther: SECLiquiditySettings = new SECLiquiditySettings();
        const definitions: Map<string, any> = new Map(Object.entries(LiquidityStore));
        secLiquiditySettingsOther.initialize(new Map<string, boolean>(), definitions);

        expect(secLiquiditySettingsOther.scenario).toBe('');
    });

    it('Test model initialization', () => {
        expect(secLiquiditySettings).toBeDefined();
        expect(secLiquiditySettings.rats).toBe(100);
        expect(secLiquiditySettings.isSECColumn).toBeFalsy();
    });

    it('Test deserialize', () => {
        const data: any = {
            rats: 200, isSECColumn: true, secPercentNAV: 102
        };
        secLiquiditySettings.deserialize(data);

        expect(secLiquiditySettings.rats).toBe(200);
        expect(secLiquiditySettings.secPercentNAV).toBe(102);
    });

    it('Test addRequestParams', () => {
        secLiquiditySettings.isSECColumn = true;

        const requestParam: any = {};
        secLiquiditySettings.addRequestParams(requestParam);

        expect(requestParam).toBeDefined();
        expect(requestParam.isSECColumn).toBeTruthy();
        expect(requestParam.percentNAVLiquidated).toBeUndefined();
        expect(requestParam.scenario).toBe('Dummy Scenario String');
    });

    it('Test serialize', () => {
        const data = secLiquiditySettings.serialize();

        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.rats).toBe(100);
        expect(data.secPercentNAV).toBe(100);
    });

    describe('Test equals', () => {
        it('If not instance of SECLiquiditySettings', () => {
            const object = {} as AbstractLiquiditySettings;
            expect(secLiquiditySettings.equals(object)).toBeFalsy();
        });

        it('For different scenario', () => {
            const secLiquiditySettingsOther: SECLiquiditySettings = new SECLiquiditySettings();
            secLiquiditySettingsOther.initialize(new Map<string, boolean>(), new Map<string, any>());

            expect(secLiquiditySettings.equals(secLiquiditySettingsOther)).toBeFalsy();

            secLiquiditySettingsOther.scenario = 'Dummy Scenario String';
            expect(secLiquiditySettings.equals(secLiquiditySettingsOther)).toBeTruthy();

            secLiquiditySettingsOther.isSECColumn = true;
            expect(secLiquiditySettings.equals(secLiquiditySettingsOther)).toBeFalsy();
        });
    });
});
