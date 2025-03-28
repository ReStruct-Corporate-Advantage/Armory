import {NormalizedFlag} from './normalized-flag.model';
import {ConfigTypeFactory, WidgetInputType} from '@blk/explore-ui-core';
import {BreakdownInitializer} from '../../breakdown.initializer';

describe('NormalizedFlag tests', () => {

    beforeAll((() => {
        BreakdownInitializer.registerNormalizedFlagConfigTypes();
    }));

    it('Test Serialize/Deserialize', () => {
        // Try with no value set.
        let normalizedFlag = new NormalizedFlag();
        let normalizedFlagDeserialized: NormalizedFlag = ConfigTypeFactory.createConfig(normalizedFlag.serialize(), WidgetInputType.NORMALIZED_FLAG, true);
        expect(normalizedFlagDeserialized.data).toStrictEqual(false);

        // Try with false value set.
        normalizedFlag = new NormalizedFlag(false);
        normalizedFlagDeserialized = ConfigTypeFactory.createConfig(normalizedFlag.serialize(), WidgetInputType.NORMALIZED_FLAG, true);
        expect(normalizedFlagDeserialized.data).toStrictEqual(false);

        // Try with true value set.
        normalizedFlag = new NormalizedFlag(true);
        normalizedFlagDeserialized = ConfigTypeFactory.createConfig(normalizedFlag.serialize(), WidgetInputType.NORMALIZED_FLAG, true);
        expect(normalizedFlagDeserialized.data).toStrictEqual(true);
    });

    it('Test deserialize an existing explore favorite', () => {
        // Validate that null ends up as false.
        const data = {
            data: null
        };
        const normalizedFlag = new NormalizedFlag();
        normalizedFlag.deserialize(data);
        expect(normalizedFlag.data).toStrictEqual(false);

        // Validate that false ends up as false.
        data.data = false;
        normalizedFlag.deserialize(data);
        expect(normalizedFlag.data).toStrictEqual(false);

        // Validate that true ends up as true.
        data.data = true;
        normalizedFlag.deserialize(data);
        expect(normalizedFlag.data).toStrictEqual(true);
    });

    it('Test isDataStoreInput', () => {
        expect(new NormalizedFlag().isDataStoreInput()).toBeTruthy();
    });

    it('Test addRequestParams', () => {
        const requestParams = {};
        new NormalizedFlag(true).addRequestParams(requestParams);
        expect(requestParams[WidgetInputType.NORMALIZED_FLAG]).toBeTruthy();
    });

    it('Test equals', () => {
        const normalizedFlag1 = new NormalizedFlag();
        let normalizedFlag2 = new NormalizedFlag(true);

        // Different values for isEnabled
        expect(normalizedFlag1.equals(normalizedFlag2)).toBe(false);

        // Same values for isEnabled
        normalizedFlag2 = new NormalizedFlag(false);
        expect(normalizedFlag1.equals(normalizedFlag2)).toBe(true);
    });
});
