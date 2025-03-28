import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {ConfigTypeFactory, EventType, TelemetryGenericEventParameters, WidgetInput} from '@blk/explore-ui-core';
import {ColorScale} from '@models/widget/inputs/chart-settings/color-scale.model';
import { ColorScaleMidpointOption } from '@enums/color-scale-midpoint-option';
import {ColorScaleFormatOption} from '@enums/color-scale-format-option';

/**
 * Test cases for ColorScale Model
 */
describe('ColorScale tests', function () {

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

        // Create colorScale to serialize
        const colorScale = new ColorScale({format: 'None', midpoint: 'None', colors: []});

        // Serialize
        let colorScaleSerialized: any = colorScale.serialize();

        // Deserialize
        let colorScaleDeserialized: ColorScale =
            ConfigTypeFactory.createConfig(colorScaleSerialized, ColorScale.configType, true);

        // Validate
        expect(colorScale.format).toStrictEqual(colorScaleDeserialized.format);
        expect(colorScale.midpoint).toStrictEqual(colorScaleDeserialized.midpoint);
        expect(colorScale.colors).toStrictEqual(colorScaleDeserialized.colors);

        colorScaleSerialized = {format: 'None', midpoint: 'None', colors: ['None']};

        // Deserialize
        colorScaleDeserialized = ConfigTypeFactory.createConfig(colorScaleSerialized, ColorScale.configType, true);

        // Validate data
        expect(colorScaleDeserialized.format).toBe('None');
        expect(colorScaleDeserialized.midpoint).toBe('None');
        expect(colorScaleDeserialized.colors).toStrictEqual(['None']);

        // Validate types
        expect(typeof colorScale.format).toBe('string');
        expect(typeof colorScale.midpoint).toBe('string');
        expect(typeof colorScale.colors).toBe('object');
    });

    /**
     * Test case for equals method
     */
    it('Test equals', function () {
        const colorScale1 = new ColorScale({format: ColorScaleFormatOption.THREE_COLOR_SCALE, midpoint: ColorScaleMidpointOption.ZERO_CENTERED, colors: ['#8c0200', '#bc0300', '#d90400']});
        let colorScale2 = new ColorScale({format: ColorScaleFormatOption.TWO_COLOR_SCALE});

        // Different values for colorScales
        expect(colorScale1.equals(colorScale2)).toBe(false);

        // Same values for colorScales
        colorScale2 = new ColorScale({format: ColorScaleFormatOption.THREE_COLOR_SCALE, midpoint: ColorScaleMidpointOption.ZERO_CENTERED, colors: ['#8c0200', '#bc0300', '#d90400']});
        expect(colorScale2.equals(colorScale1)).toEqual(true);

        // Different values for colors
        const colorScale3 = new ColorScale({format: ColorScaleFormatOption.THREE_COLOR_SCALE, midpoint: ColorScaleMidpointOption.ZERO_CENTERED, colors: ['#8c0201', '#bc0300', '#d90400']});
        expect(colorScale3.equals(colorScale1)).toEqual(false);

        // Check areInputValuesSame
        const inputs = new Map<string, WidgetInput>();
        inputs.set('colorScale', colorScale2);
        const displaySettingsOnDone = new TelemetryGenericEventParameters(EventType.WIDGET_INPUT_DONE_EVENT);
        expect(displaySettingsOnDone.type === EventType.WIDGET_INPUT_DONE_EVENT).toBeTruthy();
    });

    it('Test shouldSkipSerialize', () => {
        const colorScale = new ColorScale({format: ColorScaleFormatOption.THREE_COLOR_SCALE, midpoint: ColorScaleMidpointOption.ZERO_CENTERED, colors: ['#8c0200', '#bc0300', '#d90400']});
        expect(colorScale.shouldSkipSerialize()).toBeFalsy();
    });
});
