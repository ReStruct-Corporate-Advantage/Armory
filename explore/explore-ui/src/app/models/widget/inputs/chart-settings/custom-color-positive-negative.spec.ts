import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {ChartWidgetInputConfigType, ConfigTypeFactory} from '@blk/explore-ui-core';
import {CustomColorPositiveNegative} from '@models/widget/inputs/chart-settings/custom-color-positive-negative';

describe('CustomColorPositiveNegative tests', function () {

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

        const customColor = new CustomColorPositiveNegative({positiveColor: '#000000', negativeColor: '#FFFFFF', isEnabled: true});

        // Serialize
        const customColorSerialized: any = customColor.serialize();

        // Deserialize
        const customColorDeserialized: CustomColorPositiveNegative =
            ConfigTypeFactory.createConfig(customColorSerialized, ChartWidgetInputConfigType.CUSTOM_COLOR_POSITIVE_NEGATIVE, true);

        // Validate
        expect(customColor.positiveColor).toStrictEqual(customColorDeserialized.positiveColor);
        expect(customColor.negativeColor).toStrictEqual(customColorDeserialized.negativeColor);
    });

    /**
     * Test case for equals method
     */
    it('Test equals', function () {
        const customColor1 = new CustomColorPositiveNegative({positiveColor: '#000000', negativeColor: '#FFFFFF', isEnabled: true});
        let customColor2 = new CustomColorPositiveNegative({positiveColor: '#000000', negativeColor: '#FFFFFF', isEnabled: true});

        expect(customColor1.equals(customColor2)).toBe(true);

        customColor2 = new CustomColorPositiveNegative({positiveColor: '#000000', negativeColor: '#FFFFFF', isEnabled: false});
        expect(customColor1.equals(customColor2)).toBe(false);

        customColor2 = new CustomColorPositiveNegative({positiveColor: '#000001', negativeColor: '#FFFFFF', isEnabled: true});
        expect(customColor1.equals(customColor2)).toBe(false);
        customColor2 = new CustomColorPositiveNegative({positiveColor: '#000000', negativeColor: '#FFFFFE', isEnabled: true});
        expect(customColor1.equals(customColor2)).toBe(false);
    });

    it('Test shouldSkipSerialize', () => {
        const customColor = new CustomColorPositiveNegative({positiveColor: '#000000', negativeColor: '#FFFFFF', isEnabled: true});
        expect(customColor.shouldSkipSerialize()).toBe(false);
    });
});
