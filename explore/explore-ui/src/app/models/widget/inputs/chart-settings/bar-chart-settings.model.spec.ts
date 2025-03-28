import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {BarChartSettings} from './bar-chart-settings.model';

/**
 * Bar Chart settings tests
 */
describe('BarChartSettingsTest test', function () {

    beforeAll((function () {
        ConfigInitializer.registerWidgetInputTypes();
    }));

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function () {
        const barChartSettings: BarChartSettings = new BarChartSettings();
        barChartSettings.includeTotalValues = false;
        barChartSettings.chartType = 'bar';

        // Convert the object to string and then back to json again.
        let serializedData: any = barChartSettings.serialize();

        let newBarChartSettings: BarChartSettings = ConfigTypeFactory.createConfig(serializedData, BarChartSettings.configType, false);
        // Validate that the before and after are the same.
        expect(newBarChartSettings.includeTotalValues).toBeFalsy();
        expect(newBarChartSettings.chartType).toBe(barChartSettings.chartType);

        // Convert the object to string and then back to json again.
        serializedData = {chart : {chartType: 'column', includeTotalValues: true}};

        newBarChartSettings = ConfigTypeFactory.createConfig(serializedData, BarChartSettings.configType, false);
        // Validate that the before and after are the same.
        expect(newBarChartSettings.includeTotalValues).toBeTruthy();
        expect(newBarChartSettings.chartType).toBe('column');
    });

    /**
     * Test case for deserialize. In case the required fields are present in data
     */
    it('Test deserialize - data is present in data', function () {

        const data: any = {
            'includeTotalValue': false,
            'chartType': 'bar',
        };

        const barChartSettings: BarChartSettings = new BarChartSettings(data);
        // Validate
        expect(barChartSettings).not.toBeUndefined();
        expect(barChartSettings).not.toBeNull();
        expect(barChartSettings.includeTotalValues).toBeFalsy();
        expect(barChartSettings.chartType).toBe('bar');

    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const model1: BarChartSettings = new BarChartSettings();
        const model2: BarChartSettings = new BarChartSettings();
        expect(model1.equals(model2)).toBeTruthy();

        // Different include total values
        model1.includeTotalValues = false;
        model1.chartType = 'bar';

        model2.includeTotalValues = true;
        model2.chartType = 'bar';
        expect(model1.equals(model2)).toBeFalsy();

        // Different chart type
        model2.includeTotalValues = model1.includeTotalValues;
        model2.chartType = 'columns';
        expect(model1.equals(model2)).toBeFalsy();

        // Everything same now
        model2.includeTotalValues = model1.includeTotalValues;
        model2.chartType = model1.chartType;
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test shouldSkipSerialize', () => {
        const model: BarChartSettings = new BarChartSettings();
        expect(model.shouldSkipSerialize()).toBeFalsy();
    });
});

