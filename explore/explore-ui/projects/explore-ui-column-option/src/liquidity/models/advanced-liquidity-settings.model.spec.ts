import {AbstractLiquiditySettings} from './abstract-liquidity-settings.model';
import {AdvancedLiquiditySettings} from './advanced-liquidity-settings.model';
import {CoreDefinitionStore} from '@blk/explore-ui-core';
import {LiquidityConstants} from '../liquidity.constants';

describe('AdvancedLiquiditySettings test', () => {
    let advancedLiquiditySettings: AdvancedLiquiditySettings;

    beforeEach(() => {
        advancedLiquiditySettings = new AdvancedLiquiditySettings();
        advancedLiquiditySettings.initialize(new Map<string, boolean>());
        CoreDefinitionStore.assetClassModelMapping = [
            {'value': 'Equities', 'text': 'Conditional v2.0:BRSEQ20'}, {'value': 'Corporate Bond', 'text': 'Conditional v1.0:CORP20EC'}
        ];
    });

    it('Test model initialization', () => {
        expect(advancedLiquiditySettings).toBeDefined();
        expect(advancedLiquiditySettings.modelSelectionMapping).toBeDefined();
        expect(advancedLiquiditySettings.modelSelectionMapping.size).toBe(0);
    });

    it('Test deserialize', () => {
        const data: any = {
            modelSelectionMapping: new Map<string, string>()
        };
        advancedLiquiditySettings.deserialize(data);

        expect(advancedLiquiditySettings.modelSelectionMapping.size).toBe(0);
    });

    it('Test addRequestParams', function () {
        const requestParam: any = {};
        advancedLiquiditySettings.addRequestParams(requestParam);
        expect(requestParam).toBeDefined();

        advancedLiquiditySettings.modelSelectionMapping.set('Equities', 'BRSEQ20');
        advancedLiquiditySettings.modelSelectionMapping.set('Corporate Bond', 'CORP20EC');
        advancedLiquiditySettings.addRequestParams(requestParam);
        expect(requestParam).toBeDefined();
        expect(requestParam.modelSelectionMapping['Equities']).toBe('BRSEQ20');
    });

    it('Test serialize', function () {
        advancedLiquiditySettings.modelSelectionMapping.set('Equities', 'BRSEQ20');
        advancedLiquiditySettings.modelSelectionMapping.set('Corporate Bond', 'Default');
        const data = advancedLiquiditySettings.serialize();
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.modelSelectionMapping['Equities']).toBe('BRSEQ20');
        expect(data.modelSelectionMapping['Corporate Bond']).toBeUndefined();
    });

    it('Test deserialize when modelSelectionMapping has modelDescription as value', () => {
        CoreDefinitionStore.assetClassModelMapping = [
            {'value': 'Equities', 'text': 'Conditional v2.0:BRSEQ20'}, {'value': 'Corporate Bond', 'text': 'Conditional v1.0:CORP20EC'}
        ];

        const data: any = {
            modelSelectionMapping: {Equities: 'Conditional v2.0'}
        };

        advancedLiquiditySettings.deserialize(data);

        expect(advancedLiquiditySettings.modelSelectionMapping.size).toBe(1);
        expect(advancedLiquiditySettings.modelSelectionMapping.get('Equities')).toBe('BRSEQ20');
    });

    it('Test deserialize when modelSelectionMapping has modelDescription as value and modelDescription is not present in assetClassModelMapping', () => {
        CoreDefinitionStore.assetClassModelMapping = [
            {'value': 'Equities', 'text': 'Conditional v2.0:BRSEQ20'}, {'value': 'Corporate Bond', 'text': 'Conditional v1.0:CORP20EC'}
        ];

        const data: any = {
            modelSelectionMapping: {Equities: 'Equities v2.0'}
        };

        advancedLiquiditySettings.deserialize(data);

        expect(advancedLiquiditySettings.modelSelectionMapping.size).toBe(1);
        expect(advancedLiquiditySettings.modelSelectionMapping.get('Equities')).toBe(LiquidityConstants.DEFAULT_MODEL_SELECTION);
    });

    it('Test deserialize when modelSelectionMapping has modelPurpose as value', () => {
        CoreDefinitionStore.assetClassModelMapping = [
            {'value': 'Equities', 'text': 'Conditional v2.0:BRSEQ20'}, {'value': 'Corporate Bond', 'text': 'Conditional v1.0:CORP20EC'}
        ];

        const data: any = {
            modelSelectionMapping: {Equities: 'BRSEQ20'}
        };

        advancedLiquiditySettings.deserialize(data);

        expect(advancedLiquiditySettings.modelSelectionMapping.size).toBe(1);
        expect(advancedLiquiditySettings.modelSelectionMapping.get('Equities')).toBe('BRSEQ20');
    });

    describe('Test equals', () => {
        it('If not instance of AdvancedLiquiditySettings', () => {
            const object = {} as AbstractLiquiditySettings;
            expect(advancedLiquiditySettings.equals(object)).toBeFalsy();
        });

        it('For different scenario', () => {
            const advancedLiquiditySettingsOther = new AdvancedLiquiditySettings();
            advancedLiquiditySettingsOther.initialize(new Map<string, boolean>());

            expect(advancedLiquiditySettings.equals(advancedLiquiditySettingsOther)).toBeTruthy();

            // change adv participation rate other
            advancedLiquiditySettingsOther.modelSelectionMapping.set('Equities', 'BRSEQ20');
            expect(advancedLiquiditySettings.equals(advancedLiquiditySettingsOther)).toBeFalsy();
        });
    });
});
