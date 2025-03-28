import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {ChartSettings} from '@models/widget/inputs/chart-settings/chart-settings.model';

/**
 * Test cases for GridLines.ts
 */
describe('ChartSettings tests', function () {

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
        // Create gridLines to serialize
        const chartSettings = new ChartSettings();
        chartSettings.labelShow = true;
        chartSettings.legendShow = true;

        // Serialize
        let chartSettingsSerialized: any = chartSettings.serialize();

        // Deserialize
        let chartSettingsDeserialized: ChartSettings =
            ConfigTypeFactory.createConfig(chartSettingsSerialized, ChartSettings.configType, true);

        // Validate
        expect(chartSettings.labelShow).toStrictEqual(chartSettingsDeserialized.labelShow);

        chartSettingsSerialized = {chartSettings : {labelShow : true, legendShow : true}};

        // Deserialize
        chartSettingsDeserialized = ConfigTypeFactory.createConfig(chartSettingsSerialized, ChartSettings.configType, true);

        // Validate
        expect(chartSettings.labelShow).toStrictEqual(chartSettingsDeserialized.labelShow);
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const chartSettings1 = new ChartSettings();
        chartSettings1.labelShow = true;
        chartSettings1.legendShow = true;

        const chartSettings2 = new ChartSettings();
        chartSettings2.labelShow = true;
        chartSettings2.legendShow = false;

        // Different values for showGridLines
        expect(chartSettings1.equals(chartSettings2)).toBe(false);

        // Same values for showGridLines
        chartSettings2.legendShow = true;
        // Different values for showGridLines
        expect(chartSettings1.equals(chartSettings2)).toBe(true);
    });

    it('Test shouldSkipSerialize', () => {
        const chartSettings = new ChartSettings();
        expect(chartSettings.shouldSkipSerialize()).toBeFalsy();
    });
});
