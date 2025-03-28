import {AttributionSettings} from './attribution-settings.model';
import {isEmpty, isEqual} from 'lodash';
import {CoreCommonConstants} from '../../../core/constants';
import {PerformanceConstants} from '../../performance.constants';
import {ExpostSettings} from '../../../expost/models/expost-settings.model';
import {TokenUtils} from '../../../definition/token/token.utils';

describe('AttributionSettings', () => {

    it('Test topDownWithoutLookthrough getter/setter', () => {
        const attributionSettings = new AttributionSettings();
        expect(attributionSettings.topDownWithoutLookthrough).toBeUndefined();

        attributionSettings.topDownWithoutLookthrough = true;
        expect(attributionSettings.topDownWithoutLookthrough).toBeTruthy();

        attributionSettings.topDownWithoutLookthrough = undefined;
        const parentAttributionSettings = new AttributionSettings();
        parentAttributionSettings.topDownWithoutLookthrough = true;
        attributionSettings.parentAttributionSettings = parentAttributionSettings;
        // Should still be truthy (inherited from parent)
        expect(attributionSettings.topDownWithoutLookthrough).toBeTruthy();

        // Set to true (while parent is still true)
        attributionSettings.topDownWithoutLookthrough = true;
        // Set parent to false
        parentAttributionSettings.topDownWithoutLookthrough = false;
        expect(attributionSettings.topDownWithoutLookthrough).toBeFalsy();

        // Set to true again (while parent is false)
        attributionSettings.topDownWithoutLookthrough = true;
        expect(attributionSettings.topDownWithoutLookthrough).toBeTruthy();
    });

    it('Test bottomsUpWithLookthrough getter/setter', () => {
        const attributionSettings = new AttributionSettings();
        expect(attributionSettings.bottomsUpWithLookthrough).toBeUndefined();

        attributionSettings.bottomsUpWithLookthrough = true;
        expect(attributionSettings.bottomsUpWithLookthrough).toBeTruthy();

        attributionSettings.bottomsUpWithLookthrough = undefined;
        const parentAttributionSettings = new AttributionSettings();
        parentAttributionSettings.bottomsUpWithLookthrough = true;
        attributionSettings.parentAttributionSettings = parentAttributionSettings;
        // Should still be truthy (inherited from parent)
        expect(attributionSettings.bottomsUpWithLookthrough).toBeTruthy();

        // Set to true (while parent is still true)
        attributionSettings.bottomsUpWithLookthrough = true;
        // Set parent to false
        parentAttributionSettings.bottomsUpWithLookthrough = false;
        expect(attributionSettings.bottomsUpWithLookthrough).toBeFalsy();

        // Set to true again (while parent is false)
        attributionSettings.bottomsUpWithLookthrough = true;
        expect(attributionSettings.bottomsUpWithLookthrough).toBeTruthy();
    });

    /**
     * Test case for method equal
     */
    it('Test equal', () => {
        const attributionSettings1 = new AttributionSettings('FIXED_INCOME', 'FIXED_INCOME', ['rf_contr', 'rldn_contr', 'dur_contr', 'conv_contr', 'crv_contr', 'tradeprice_contr', 'comm_contr', 'fx_contr', 'fxcarry_contr', 'cvx_crv_contr'], 'MARKET_VALUE', 'RELATIVE', 'IMMEDIATE_PARENT_LEVEL', 'MarketValue', false, false);
        const attributionSettings2 = new AttributionSettings('FIXED_INCOME', 'FIXED_INCOME', ['rf_contr', 'rldn_contr', 'dur_contr', 'conv_contr', 'crv_contr', 'tradeprice_contr', 'comm_contr', 'fx_contr', 'fxcarry_contr', 'cvx_crv_contr'], 'MARKET_VALUE', 'RELATIVE', 'IMMEDIATE_PARENT_LEVEL', 'MarketValue', false, false);

        // Different assetType
        attributionSettings2.assetType = 'EQUITY';
        expect(attributionSettings1.equals(attributionSettings2)).toBe(false);

        // Different cannedMethod
        attributionSettings2.assetType = 'FIXED_INCOME';
        attributionSettings2.cannedMethod = 'FIXED_INCOME_DXS';
        expect(attributionSettings1.equals(attributionSettings2)).toBe(false);

        // Different factors
        attributionSettings2.cannedMethod = 'FIXED_INCOME';
        attributionSettings2.factors = ['rf_contr', 'rldn_contr'];
        expect(attributionSettings1.equals(attributionSettings2)).toBe(false);

        // Different sectorWeighting
        attributionSettings2.factors = ['rf_contr', 'rldn_contr', 'dur_contr', 'conv_contr', 'crv_contr', 'tradeprice_contr', 'comm_contr', 'fx_contr', 'fxcarry_contr', 'cvx_crv_contr'];
        attributionSettings2.sectorWeighting = 'DXS';
        expect(attributionSettings1.equals(attributionSettings2)).toBe(false);

        // Different attributionCalculatorMethod
        attributionSettings2.sectorWeighting = 'MARKET_VALUE';
        attributionSettings2.attributionCalculatorMethod = 'HYBRID';
        expect(attributionSettings1.equals(attributionSettings2)).toBe(false);

        // Different sectorLevel
        attributionSettings2.attributionCalculatorMethod = 'RELATIVE';
        attributionSettings2.sectorLevel = 'BENCH_TOTAL';
        expect(attributionSettings1.equals(attributionSettings2)).toBe(false);

        // Different exposureMode
        attributionSettings2.sectorLevel = 'IMMEDIATE_PARENT_LEVEL';
        attributionSettings2.exposureMode = 'NotionalMV';
        expect(attributionSettings1.equals(attributionSettings2)).toBe(false);

        // Different multiManagerAttribution
        attributionSettings2.exposureMode = 'MarketValue';
        attributionSettings2.multiManagerAttribution = true;
        expect(attributionSettings1.equals(attributionSettings2)).toBe(false);

        // Different multiManagerAttribution
        attributionSettings2.multiManagerAttribution = false;
        attributionSettings2.topDownWithoutLookthrough = true;
        expect(attributionSettings1.equals(attributionSettings2)).toBe(false);

        // Same settings
        attributionSettings2.topDownWithoutLookthrough = false;
        expect(attributionSettings1.equals(attributionSettings2)).toBe(true);

        attributionSettings2.isColumnListUpdateEnabled = true;
        expect(attributionSettings1.equals(attributionSettings2)).toBeFalsy();

        attributionSettings2.isColumnListUpdateEnabled = false;
        expect(attributionSettings1.equals(attributionSettings2)).toBeTruthy();
    });

    it('Test equal', () => {
        const attributionSettings1 = new AttributionSettings('FIXED_INCOME', 'FIXED_INCOME', ['rf_contr', 'rldn_contr', 'dur_contr', 'conv_contr', 'crv_contr', 'tradeprice_contr', 'comm_contr', 'fx_contr', 'fxcarry_contr', 'cvx_crv_contr'], 'MARKET_VALUE', 'RELATIVE', 'IMMEDIATE_PARENT_LEVEL', 'MarketValue', false, false);
        attributionSettings1.sourceName = CoreCommonConstants.SETTINGS_HIERARCHY_TYPE.COLUMN;
        const attributionSettings2 = new AttributionSettings('FIXED_INCOME', 'FIXED_INCOME', ['rf_contr', 'rldn_contr', 'dur_contr', 'conv_contr', 'crv_contr', 'tradeprice_contr', 'comm_contr', 'fx_contr', 'fxcarry_contr', 'cvx_crv_contr'], 'MARKET_VALUE', 'RELATIVE', 'IMMEDIATE_PARENT_LEVEL', 'MarketValue', false, false);
        attributionSettings2.sourceName = CoreCommonConstants.SETTINGS_HIERARCHY_TYPE.WIDGET;
        attributionSettings1.parentAttributionSettings = attributionSettings2;
        expect(attributionSettings1.getSourceDisplayName()).toBe('Widget (User Selected)');
        expect(attributionSettings2.getSourceDisplayName()).toBe('Widget (User Selected)');
    });

    it('should check excessFlagMap setter and getter', () => {
        const attributionSettings = new AttributionSettings();

        // Initially, both are undefined
        expect(attributionSettings.excessFlagMap).toBeUndefined();

        // Set excessFlagMap in one object
        attributionSettings.excessFlagMap = new Map<string, boolean>();
        attributionSettings.excessFlagMap.set('key1', true);
        attributionSettings.excessFlagMap.set('key2', false);

        expect(attributionSettings.excessFlagMap.size).toEqual(2);
    });

    it('should check localExcessFlagMap getter and setter', () => {
        const attributionSettings = new AttributionSettings();

        // Initially, both are undefined
        expect(attributionSettings.getLocalExcessFlagMap()).toBeUndefined();

        // Set excessFlagMap in one object
        attributionSettings.excessFlagMap = new Map<string, boolean>();
        attributionSettings.excessFlagMap.set('key1', true);
        attributionSettings.excessFlagMap.set('key2', false);

        expect(attributionSettings.getLocalExcessFlagMap().size).toEqual(2);
    });

    it('Test serialize and deserialize with parent settings', () => {
        let parentAttributionSettings = new AttributionSettings('FIXED_INCOME', 'FIXED_INCOME', ['rf_contr', 'rldn_contr'], 'MARKET_VALUE', 'RELATIVE', 'IMMEDIATE_PARENT_LEVEL', 'MarketValue', false);
        let attributionSettings = new AttributionSettings();
        attributionSettings.parentAttributionSettings = parentAttributionSettings;
        let data: any = attributionSettings.serialize();
        let deserializedAttributionSettings = new AttributionSettings();
        deserializedAttributionSettings.deserialize(data);
        expect(JSON.stringify(data)).toBe('{}');

        // Custom setting on parent
        parentAttributionSettings.cannedMethod = 'CUSTOM';
        data = attributionSettings.serialize();
        deserializedAttributionSettings = new AttributionSettings();
        deserializedAttributionSettings.deserialize(data);
        expect(JSON.stringify(data)).toBe('{}');

        // Overridden pre canned setting
        attributionSettings.cannedMethod = 'EQUITY';
        data = attributionSettings.serialize();
        deserializedAttributionSettings = new AttributionSettings();
        deserializedAttributionSettings.deserialize(data);
        expect(JSON.stringify(data)).toBe('{"cannedMethod":"EQUITY"}');

        // Overridden custom settings
        attributionSettings.parentAttributionSettings.cannedMethod = 'FIXED_INCOME';
        attributionSettings.cannedMethod = 'CUSTOM';
        data = attributionSettings.serialize();
        deserializedAttributionSettings = new AttributionSettings();
        deserializedAttributionSettings.deserialize(data);
        expect(JSON.stringify(data)).toBe('{"cannedMethod":"CUSTOM","assetType":"FIXED_INCOME","sectorLevel":"IMMEDIATE_PARENT_LEVEL","sectorWeighting":"MARKET_VALUE","attributionCalculatorMethod":"RELATIVE","exposureMode":"MarketValue","factors":["rf_contr","rldn_contr"]}');

        // Overridden custom settings
        attributionSettings.parentAttributionSettings = new AttributionSettings();
        attributionSettings.parentAttributionSettings.cannedMethod = 'FIXED_INCOME';
        attributionSettings.cannedMethod = 'CUSTOM';
        attributionSettings.assetType = 'EQ_MANDATE';
        attributionSettings.sectorWeighting = 'MARKET_VALUE';
        attributionSettings.attributionCalculatorMethod = 'RELATIVE';
        attributionSettings.sectorLevel = 'IMMEDIATE_PARENT_LEVEL';
        attributionSettings.exposureMode = 'Default';
        attributionSettings.multiManagerAttribution = false;
        attributionSettings.factors = ['rf_contr', 'rldn_contr'];
        data = attributionSettings.serialize();
        deserializedAttributionSettings = new AttributionSettings();
        deserializedAttributionSettings.deserialize(data);
        expect(JSON.stringify(data)).toBe('{"cannedMethod":"CUSTOM","assetType":"EQ_MANDATE","sectorLevel":"IMMEDIATE_PARENT_LEVEL","sectorWeighting":"MARKET_VALUE","attributionCalculatorMethod":"RELATIVE","exposureMode":"Default","factors":["rf_contr","rldn_contr"]}');

        // Just asset type overridden
        attributionSettings = new AttributionSettings();
        parentAttributionSettings = new AttributionSettings();
        attributionSettings.parentAttributionSettings = parentAttributionSettings;
        parentAttributionSettings.cannedMethod = 'CUSTOM';
        parentAttributionSettings.assetType = 'EQ_MANDATE';
        parentAttributionSettings.sectorWeighting = 'MARKET_VALUE';
        parentAttributionSettings.attributionCalculatorMethod = 'RELATIVE';
        parentAttributionSettings.sectorLevel = 'IMMEDIATE_PARENT_LEVEL';
        parentAttributionSettings.exposureMode = 'Default';
        parentAttributionSettings.multiManagerAttribution = false;
        parentAttributionSettings.factors = ['rf_contr', 'rldn_contr'];
        attributionSettings.assetType = 'FIXED_INCOME';
        data = attributionSettings.serialize();
        deserializedAttributionSettings = new AttributionSettings();
        deserializedAttributionSettings.deserialize(data);
        expect(JSON.stringify(data)).toBe('{"cannedMethod":"CUSTOM","assetType":"FIXED_INCOME"}');

        // sectorWeighting also overridden
        attributionSettings.cannedMethod = null;
        attributionSettings.sectorWeighting = 'DXS';
        data = attributionSettings.serialize();
        deserializedAttributionSettings = new AttributionSettings();
        deserializedAttributionSettings.deserialize(data);
        expect(JSON.stringify(data)).toBe('{"cannedMethod":"CUSTOM","assetType":"FIXED_INCOME","sectorWeighting":"DXS"}');

        // attributionCalculatorMethod also overridden
        attributionSettings.cannedMethod = null;
        attributionSettings.attributionCalculatorMethod = 'HYBRID';
        data = attributionSettings.serialize();
        deserializedAttributionSettings = new AttributionSettings();
        deserializedAttributionSettings.deserialize(data);
        expect(JSON.stringify(data)).toBe('{"cannedMethod":"CUSTOM","assetType":"FIXED_INCOME","sectorWeighting":"DXS","attributionCalculatorMethod":"HYBRID"}');

        //  sectorLevel also overridden
        attributionSettings.cannedMethod = null;
        attributionSettings.sectorLevel = 'BENCHMARK_TOTAL';
        data = attributionSettings.serialize();
        deserializedAttributionSettings = new AttributionSettings();
        deserializedAttributionSettings.deserialize(data);
        expect(JSON.stringify(data)).toBe('{"cannedMethod":"CUSTOM","assetType":"FIXED_INCOME","sectorLevel":"BENCHMARK_TOTAL","sectorWeighting":"DXS","attributionCalculatorMethod":"HYBRID"}');

        //  exposureMode also overridden
        attributionSettings.cannedMethod = null;
        attributionSettings.exposureMode = 'MarketValue';
        data = attributionSettings.serialize();
        deserializedAttributionSettings = new AttributionSettings();
        deserializedAttributionSettings.deserialize(data);
        expect(JSON.stringify(data)).toBe('{"cannedMethod":"CUSTOM","assetType":"FIXED_INCOME","sectorLevel":"BENCHMARK_TOTAL","sectorWeighting":"DXS","attributionCalculatorMethod":"HYBRID","exposureMode":"MarketValue"}');

        // factors overridden but same values
        attributionSettings.cannedMethod = null;
        attributionSettings.factors = ['rf_contr', 'rldn_contr'];
        data = attributionSettings.serialize();
        deserializedAttributionSettings = new AttributionSettings();
        deserializedAttributionSettings.deserialize(data);
        expect(JSON.stringify(data)).toBe('{}');

        //  factors also overridden
        attributionSettings.cannedMethod = null;
        attributionSettings.factors = [];
        data = attributionSettings.serialize();
        deserializedAttributionSettings = new AttributionSettings();
        deserializedAttributionSettings.deserialize(data);
        expect(JSON.stringify(data)).toBe('{"cannedMethod":"CUSTOM","assetType":"FIXED_INCOME","sectorLevel":"BENCHMARK_TOTAL","sectorWeighting":"DXS","attributionCalculatorMethod":"HYBRID","exposureMode":"MarketValue","factors":[]}');

        //  multiManagerAttribution also overridden
        attributionSettings.multiManagerAttribution = true;
        attributionSettings.topDownWithoutLookthrough = true;
        data = attributionSettings.serialize();
        deserializedAttributionSettings = new AttributionSettings();
        deserializedAttributionSettings.deserialize(data);
        expect(JSON.stringify(data)).toBe('{"cannedMethod":"CUSTOM","assetType":"FIXED_INCOME","sectorLevel":"BENCHMARK_TOTAL","sectorWeighting":"DXS","attributionCalculatorMethod":"HYBRID","exposureMode":"MarketValue","factors":[],"topDownWithoutLookthrough":true,"multiManagerAttribution":true}');

        attributionSettings.topDownWithoutLookthrough = false;
        attributionSettings.bottomsUpWithLookthrough = true;
        data = attributionSettings.serialize();
        deserializedAttributionSettings = new AttributionSettings();
        deserializedAttributionSettings.deserialize(data);
        expect(JSON.stringify(data)).toBe('{"cannedMethod":"CUSTOM","assetType":"FIXED_INCOME","sectorLevel":"BENCHMARK_TOTAL","sectorWeighting":"DXS","attributionCalculatorMethod":"HYBRID","exposureMode":"MarketValue","factors":[],"bottomsUpWithLookthrough":true,"multiManagerAttribution":true}');
    });

    it('Test serialize and deserialize for sector levels with suppress token on', () => {
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
        const attributionSettings = new AttributionSettings();
        attributionSettings.sectorLevel = 'IMMEDIATE_PARENT_LEVEL';
        attributionSettings.attributionCalculatorMethod = PerformanceConstants.CALCULATION_METHOD.HYBRID;
        const serializedData = attributionSettings.serialize();
        const deserializedAttributionSettings = new AttributionSettings();
        deserializedAttributionSettings.deserialize(serializedData);
        expect(isEmpty(deserializedAttributionSettings.sectorLevel));
    });

    it('Test serialize and deserialize with excessFlagMap', () => {
        const attributionSettings = new AttributionSettings();
        attributionSettings.cannedMethod = PerformanceConstants.CANNED_METHOD.CUSTOM;
        attributionSettings.excessFlagMap = new Map<string, boolean>();
        attributionSettings.excessFlagMap.set('key1', true);
        attributionSettings.excessFlagMap.set('key2', false);

        // Serialize the attributionSettings
        const serializedData = attributionSettings.serialize();

        // Create a new AttributionSettings instance and deserialize the serialized data
        const deserializedAttributionSettings = new AttributionSettings();
        deserializedAttributionSettings.deserialize(serializedData);

        // Check if the deserialized excessFlagMap is equal to the original one
        expect(deserializedAttributionSettings.excessFlagMap.get('key1')).toBe(true);
        expect(deserializedAttributionSettings.excessFlagMap.get('key2')).toBe(false);
    });

    /**
     * Test case for method checkFactors
     */
    it('Test checkFactors', () => {
        const attributionSettings = new AttributionSettings();
        const parentAttributionSettings = new AttributionSettings();
        attributionSettings.parentAttributionSettings = parentAttributionSettings;

        // Only Parent has factors
        parentAttributionSettings.factors = ['rf_contr', 'rldn_contr'];
        expect(attributionSettings.checkFactors()).toBe(true);

        // Only child has factors
        parentAttributionSettings.factors = undefined;
        attributionSettings.factors = ['rf_contr', 'rldn_contr'];
        expect(attributionSettings.checkFactors()).toBe(true);

        // Both have factors but not the same number of factors
        parentAttributionSettings.factors = ['rf_contr'];
        expect(attributionSettings.checkFactors()).toBe(true);

        // Both have same number of factors but they are different
        parentAttributionSettings.factors = ['rf_contr', 'fx_carry'];
        expect(attributionSettings.checkFactors()).toBe(true);

        // Both have same factors
        parentAttributionSettings.factors = ['rldn_contr', 'rf_contr'];
        expect(attributionSettings.checkSettings()).toBe(false);
    });

    /**
     * Test case for method checkSettings
     */
    it('Test checkSettings', function () {
        const attributionSettings = new AttributionSettings();
        const parentAttributionSettings = new AttributionSettings();
        attributionSettings.parentAttributionSettings = parentAttributionSettings;
        parentAttributionSettings.cannedMethod = 'CUSTOM';
        parentAttributionSettings.assetType = 'EQ_MANDATE';
        parentAttributionSettings.sectorWeighting = 'MARKET_VALUE';
        parentAttributionSettings.attributionCalculatorMethod = 'RELATIVE';
        parentAttributionSettings.sectorLevel = 'IMMEDIATE_PARENT_LEVEL';
        parentAttributionSettings.exposureMode = 'Default';
        parentAttributionSettings.multiManagerAttribution = false;
        parentAttributionSettings.factors = ['rf_contr', 'rldn_contr'];

        expect(attributionSettings.checkSettings()).toBe(false);

        attributionSettings.assetType = 'FIXED_INCOME';
        expect(attributionSettings.checkSettings()).toBe(true);

        attributionSettings.assetType = 'EQ_MANDATE';
        attributionSettings.sectorWeighting = 'DXS';
        expect(attributionSettings.checkSettings()).toBe(true);

        attributionSettings.sectorWeighting = 'MARKET_VALUE';
        attributionSettings.attributionCalculatorMethod = 'HYBRID';
        expect(attributionSettings.checkSettings()).toBe(true);

        attributionSettings.attributionCalculatorMethod = 'RELATIVE';
        attributionSettings.sectorLevel = 'BENCHMARK_TOTAL';
        expect(attributionSettings.checkSettings()).toBe(true);

        attributionSettings.sectorLevel = 'IMMEDIATE_PARENT_LEVEL';
        attributionSettings.exposureMode = 'MarketValue';
        expect(attributionSettings.checkSettings()).toBe(true);

        attributionSettings.exposureMode = 'Default';
        attributionSettings.multiManagerAttribution = true;
        expect(attributionSettings.checkSettings()).toBe(true);

        attributionSettings.multiManagerAttribution = false;
        attributionSettings.factors = [];
        expect(attributionSettings.checkSettings()).toBe(true);

        attributionSettings.factors = ['rf_contr', 'rldn_contr'];
        attributionSettings.cannedMethod = 'EQUITY';
        expect(attributionSettings.checkSettings()).toBe(true);
    });

    /**
     * Test case for method resetSettings
     */
    it('Test resetSettings', () => {
        const attributionSettings = new AttributionSettings();
        const parentAttributionSettings = new AttributionSettings();
        attributionSettings.parentAttributionSettings = parentAttributionSettings;
        parentAttributionSettings.cannedMethod = 'CUSTOM';
        parentAttributionSettings.assetType = 'EQ_MANDATE';
        parentAttributionSettings.sectorWeighting = 'MARKET_VALUE';
        parentAttributionSettings.attributionCalculatorMethod = 'RELATIVE';
        parentAttributionSettings.sectorLevel = 'IMMEDIATE_PARENT_LEVEL';
        parentAttributionSettings.exposureMode = 'Default';
        parentAttributionSettings.multiManagerAttribution = true;
        parentAttributionSettings.factors = ['rf_contr', 'rldn_contr'];

        attributionSettings.cannedMethod = 'EQUITY';
        attributionSettings.assetType = 'FI_MANDATE';
        attributionSettings.sectorWeighting = 'DXS';
        attributionSettings.attributionCalculatorMethod = 'HYBRID';
        attributionSettings.sectorLevel = 'BENCHMARK_TOTAL';
        attributionSettings.exposureMode = 'MarketValue';
        attributionSettings.multiManagerAttribution = false;
        attributionSettings.factors = [];

        attributionSettings.resetSettings();

        expect(attributionSettings.cannedMethod).toBe('CUSTOM');
        expect(attributionSettings.assetType).toBe('EQ_MANDATE');
        expect(attributionSettings.sectorWeighting).toBe('MARKET_VALUE');
        expect(attributionSettings.attributionCalculatorMethod).toBe('RELATIVE');
        expect(attributionSettings.sectorLevel).toBe('IMMEDIATE_PARENT_LEVEL');
        expect(attributionSettings.exposureMode).toBe('Default');
        expect(attributionSettings.multiManagerAttribution).toBe(true);
        expect(isEqual(attributionSettings.factors, (['rf_contr', 'rldn_contr']))).toBe(true);
    });

    it('should copy excessFlagMap from parentAttributionSettings when setLocalExcessFlagMapAsParentCopy is called', () => {
        const attributionSettings = new AttributionSettings();
        const parentAttributionSettings = new AttributionSettings();
        parentAttributionSettings.setLocalExcessFlagMap(new Map([['key1', true], ['key2', false]]));
        attributionSettings.parentAttributionSettings = parentAttributionSettings;

        attributionSettings.setLocalExcessFlagMapAsParentCopy();

        expect(attributionSettings.getLocalExcessFlagMap()).toEqual(new Map([['key1', true], ['key2', false]]));
    });

    it('should set excessFlagMap to undefined when parentAttributionSettings is null', () => {
        const attributionSettings = new AttributionSettings();
        attributionSettings.parentAttributionSettings = null;

        attributionSettings.setLocalExcessFlagMapAsParentCopy();

        expect(attributionSettings.getLocalExcessFlagMap()).toBeUndefined();
    });

    it('should compare cannedMethod correctly', () => {
        const attributionSettings1: AttributionSettings = new AttributionSettings();
        const attributionSettings2: AttributionSettings = new AttributionSettings();

        attributionSettings1.cannedMethod = 'method1';
        attributionSettings2.cannedMethod = 'method2';
        expect(attributionSettings1.equals(attributionSettings2)).toBe(false);

        attributionSettings2.cannedMethod = 'method1';
        expect(attributionSettings1.equals(attributionSettings2)).toBe(true);
    });

    it('should compare excessFlagMap correctly', () => {
        const attributionSettings1: AttributionSettings = new AttributionSettings();
        const attributionSettings2: AttributionSettings = new AttributionSettings();

        attributionSettings1.factors = ['rf_contr', 'rldn_contr'];
        attributionSettings2.factors = ['rf_contr', 'rldn_contr'];

        attributionSettings1.excessFlagMap = new Map<string, boolean>();
        attributionSettings1.excessFlagMap.set('key1', true);
        attributionSettings1.excessFlagMap.set('key2', false);

        attributionSettings2.excessFlagMap = new Map<string, boolean>();
        attributionSettings2.excessFlagMap.set('key1', false);
        attributionSettings2.excessFlagMap.set('key2', true);

        expect(attributionSettings1.equals(attributionSettings2)).toBe(false);

        attributionSettings2.excessFlagMap.set('key1', true);
        attributionSettings2.excessFlagMap.set('key2', false);
        expect(attributionSettings1.equals(attributionSettings2)).toBe(true);
    });

    it('should compare localExcessFlagMap correctly', () => {
        const attributionSettings1: AttributionSettings = new AttributionSettings();
        const attributionSettings2: AttributionSettings = new AttributionSettings();

        attributionSettings1.factors = ['rf_contr', 'rldn_contr'];
        attributionSettings2.factors = ['rf_contr', 'rldn_contr'];

        attributionSettings1.setLocalExcessFlagMap(new Map<string, boolean>());
        attributionSettings1.getLocalExcessFlagMap().set('key1', true);
        attributionSettings1.getLocalExcessFlagMap().set('key2', false);

        attributionSettings2.setLocalExcessFlagMap(new Map<string, boolean>());
        attributionSettings2.getLocalExcessFlagMap().set('key1', false);
        attributionSettings2.getLocalExcessFlagMap().set('key2', true);
        expect(attributionSettings1.equals(attributionSettings2)).toBe(false);

        attributionSettings2.getLocalExcessFlagMap().set('key1', true);
        attributionSettings2.getLocalExcessFlagMap().set('key2', false);
        expect(attributionSettings1.equals(attributionSettings2)).toBe(true);
    });

    /**
     * Test case for method addRequestData
     */
    it('Test addRequestData', () => {
        const attributionSettings = new AttributionSettings();
        attributionSettings.cannedMethod = 'EQUITY';
        attributionSettings.assetType = 'BAL_MANDATE';
        attributionSettings.sectorWeighting = 'MARKET_VALUE';
        attributionSettings.attributionCalculatorMethod = 'RELATIVE';
        attributionSettings.sectorLevel = 'IMMEDIATE_PARENT_LEVEL';
        attributionSettings.exposureMode = 'Default';
        attributionSettings.multiManagerAttribution = true;
        attributionSettings.factors = ['rf_contr', 'rldn_contr'];

        let optionValues = {};
        let expectedOptionValues: any = {
            cannedAttributionMethodology: 'EQUITY',
            sectorWeighting: 'MARKET_VALUE',
            attributionCalculatorMethod: 'RELATIVE',
            sectorLevel: 'IMMEDIATE_PARENT_LEVEL',
            exposureMode: 'Default',
            assetType: 'BAL_MANDATE',
            multiManagerAttribution: true
        };
        attributionSettings.addRequestData(optionValues);
        expect(isEqual(optionValues, expectedOptionValues)).toBe(true);

        attributionSettings.cannedMethod = 'CUSTOM';
        optionValues = {};
        expectedOptionValues = {
            cannedAttributionMethodology: 'CUSTOM',
            factors: ['rf_contr', 'rldn_contr'],
            sectorWeighting: 'MARKET_VALUE',
            attributionCalculatorMethod: 'RELATIVE',
            sectorLevel: 'IMMEDIATE_PARENT_LEVEL',
            assetType: 'BAL_MANDATE',
            exposureMode: 'Default',
            multiManagerAttribution: true
        };
        jest.spyOn(attributionSettings, 'resetSettings');
        attributionSettings.addRequestData(optionValues);
        expect(attributionSettings.resetSettings).not.toHaveBeenCalled();
        expect(isEqual(optionValues, expectedOptionValues)).toBe(true);

        // Test with bottomsUpWithLookthrough = true
        attributionSettings.topDownWithoutLookthrough = undefined;
        attributionSettings.bottomsUpWithLookthrough = true;
        optionValues = {};
        expectedOptionValues = {
            cannedAttributionMethodology: 'CUSTOM',
            factors: ['rf_contr', 'rldn_contr'],
            sectorWeighting: 'MARKET_VALUE',
            attributionCalculatorMethod: 'RELATIVE',
            sectorLevel: 'IMMEDIATE_PARENT_LEVEL',
            assetType: 'BAL_MANDATE',
            exposureMode: 'Default',
            isBottomsUpWithLookthrough: true,
            multiManagerAttribution: true
        };
        attributionSettings.addRequestData(optionValues);
        expect(attributionSettings.resetSettings).not.toHaveBeenCalled();
        expect(isEqual(optionValues, expectedOptionValues)).toBe(true);

        // Test with topDownWithoutLookthrough and bottomsUpWithLookthrough both disabled (Default)
        attributionSettings.bottomsUpWithLookthrough = undefined;
        optionValues = {};
        expectedOptionValues = {
            cannedAttributionMethodology: 'CUSTOM',
            factors: ['rf_contr', 'rldn_contr'],
            sectorWeighting: 'MARKET_VALUE',
            attributionCalculatorMethod: 'RELATIVE',
            sectorLevel: 'IMMEDIATE_PARENT_LEVEL',
            assetType: 'BAL_MANDATE',
            exposureMode: 'Default',
            multiManagerAttribution: true
        };
        attributionSettings.addRequestData(optionValues);
        expect(attributionSettings.resetSettings).not.toHaveBeenCalled();
        expect(isEqual(optionValues, expectedOptionValues)).toBe(true);

        expectedOptionValues = {
            cannedAttributionMethodology: 'CUSTOM',
            factors: ['rf_contr', 'rldn_contr'],
            sectorWeighting: 'MARKET_VALUE',
            attributionCalculatorMethod: 'RELATIVE',
            sectorLevel: 'IMMEDIATE_PARENT_LEVEL',
            assetType: 'BAL_MANDATE',
            exposureMode: 'Default',
            isTopDownWithoutLookThrough: true,
            multiManagerAttribution: true
        };

        attributionSettings.cannedMethod = null;
        attributionSettings.parentAttributionSettings = new AttributionSettings();
        attributionSettings.parentAttributionSettings.cannedMethod = 'CUSTOM';
        attributionSettings.parentAttributionSettings.assetType = 'BAL_MANDATE';
        attributionSettings.parentAttributionSettings.sectorWeighting = 'MARKET_VALUE';
        attributionSettings.parentAttributionSettings.attributionCalculatorMethod = 'RELATIVE';
        attributionSettings.parentAttributionSettings.sectorLevel = 'IMMEDIATE_PARENT_LEVEL';
        attributionSettings.parentAttributionSettings.exposureMode = 'Default';
        attributionSettings.parentAttributionSettings.multiManagerAttribution = true;
        attributionSettings.parentAttributionSettings.factors = ['rf_contr', 'rldn_contr'];
        attributionSettings.parentAttributionSettings.topDownWithoutLookthrough = true;
        attributionSettings.addRequestData(optionValues);
        expect(isEqual(optionValues, expectedOptionValues)).toBe(true);
    });

    /**
     * Test case for method createModelLegacy
     */
    it('Test createModelLegacy', () => {
        const optionValues = {
            cannedAttributionMethodology: 'CUSTOM',
            factors: ['rf_contr', 'rldn_contr'],
            sectorWeighting: 'MARKET_VALUE',
            attributionCalculatorMethod: 'RELATIVE',
            sectorLevel: 'IMMEDIATE_PARENT_LEVEL',
            assetType: 'EQ_MANDATE',
            multiManagerAttribution: true
        };

        const attributionSettings = new AttributionSettings();
        attributionSettings.createModelLegacy(optionValues);
        expect(attributionSettings.cannedMethod).toBe('CUSTOM');
        expect(attributionSettings.assetType).toBe('EQ_MANDATE');
        expect(attributionSettings.sectorWeighting).toBe('MARKET_VALUE');
        expect(attributionSettings.attributionCalculatorMethod).toBe('RELATIVE');
        expect(attributionSettings.sectorLevel).toBe('IMMEDIATE_PARENT_LEVEL');
        expect(isEqual(attributionSettings.factors, ['rf_contr', 'rldn_contr'])).toBe(true);
        expect(attributionSettings.multiManagerAttribution).toBe(true);
        console.log(optionValues);
        expect(isEqual(optionValues, {})).toBe(true);

    });

    it('should return false when the passed object is not an instance of AttributionSettings', () => {
        const attributionSettings = new AttributionSettings();
        const notAttributionSettings = new ExpostSettings();

        const result = attributionSettings.equals(notAttributionSettings);

        expect(result).toBe(false);
    });

    it('should not return false when the passed object is an instance of AttributionSettings', () => {
        const attributionSettings = new AttributionSettings();
        const anotherAttributionSettings = new AttributionSettings();

        const result = attributionSettings.equals(anotherAttributionSettings);

        expect(result).not.toBe(false);
    });

    describe('test getLookThroughValue method', () => {
        let attributionSettings: AttributionSettings;

        beforeEach(() => {
            attributionSettings = new AttributionSettings();
        });

        it('should return correct look through value', () => {
            // Set the values for the test
            attributionSettings['_topDownWithoutLookthrough'] = true;
            attributionSettings['_bottomsUpWithLookthrough'] = false;

            // Call the method with the key
            const result = attributionSettings.getLookThroughValue('topDownWithoutLookthrough');

            // Assert the result
            expect(result).toBe(true);
        });

        it('should return parent look through value when not set on self', () => {
            // Set the values for the test
            attributionSettings['_topDownWithoutLookthrough'] = undefined;
            attributionSettings['_bottomsUpWithLookthrough'] = undefined;
            attributionSettings['topDownWithoutLookthrough'] = true;
            attributionSettings['bottomsUpWithLookthrough'] = false;

            // Call the method with the key
            const result = attributionSettings.getLookThroughValue('topDownWithoutLookthrough');

            // Assert the result
            expect(result).toBe(true);
        });

        it('Test shouldSkipSerialize', () => {
            const attributionSettings = new AttributionSettings();
            expect(attributionSettings.shouldSkipSerialize()).toBe(false);
        });
    });
});
