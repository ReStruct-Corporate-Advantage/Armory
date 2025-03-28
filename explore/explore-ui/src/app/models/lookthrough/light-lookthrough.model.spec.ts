import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {LightLookthrough} from './light-lookthrough.model';
import {ConfigInitializer} from '../../initializers/config.initializer';

/**
 * Test cases for LightLookthrough.ts
 */
describe('LightLookthrough tests', () => {

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll((function () {
        ConfigInitializer.registerWidgetInputTypes();
    }));

    /**
     * Test serialize/deserialize
     */
    it('Test Serialize/Deserialize', function () {
        const lightLookthrough = new LightLookthrough();

        // Serialize
        const lightLookthroughSerialized = lightLookthrough.serialize();

        // Deserialize
        const lightLookthroughDeserialized: LightLookthrough =
            ConfigTypeFactory.createConfig(lightLookthroughSerialized, LightLookthrough.configType, true);

        // Validate
        expect(lightLookthrough.isEnabled).toStrictEqual(lightLookthroughDeserialized.isEnabled);
    });

    /**
     * Test serialize/deserialize
     */
    it('Test isDataStoreInput', function () {
        expect(new LightLookthrough().isDataStoreInput()).toBeTruthy();
    });

    /**
     * Test serialize/deserialize
     */
    it('Test addRequestParams', function () {
        const requestParams = {};
        new LightLookthrough(true).addRequestParams(requestParams);
        expect(requestParams[LightLookthrough.configType]).toBeTruthy();
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const lightLookthrough1 = new LightLookthrough();
        let lightLookthrough2 = new LightLookthrough(true);

        // Different values for isEnabled
        expect(lightLookthrough1.equals(lightLookthrough2)).toBe(false);

        // Same values for isEnabled
        lightLookthrough2 = new LightLookthrough(false);
        expect(lightLookthrough1.equals(lightLookthrough2)).toBe(true);
    });

});
