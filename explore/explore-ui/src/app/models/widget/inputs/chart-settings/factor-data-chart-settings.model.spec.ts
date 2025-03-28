import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {FactorDataChartSettings} from './factor-data-chart-settings.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';


/**
 * Test cases for FactorDataChartSettings.model.ts
 */
describe('FactorDataChartSettings tests', function () {

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
        // Create factorDataChartSettings to serialize
        const factorDataChartSettings = new FactorDataChartSettings({ isTimeSeriesMode: true, factorTimeSeriesSelectedOption: 'FACTOR_LEVELS'});

        // Serialize
        const factorDataChartSettingsSerialized: any = factorDataChartSettings.serialize();

        // Deserialize
        const factorDataChartSettingsDeserialized: FactorDataChartSettings =
            ConfigTypeFactory.createConfig(factorDataChartSettingsSerialized, FactorDataChartSettings.configType, true);

        // Validate
        expect(factorDataChartSettings.isTimeSeriesMode).toStrictEqual(factorDataChartSettingsDeserialized.isTimeSeriesMode);
        expect(factorDataChartSettings.factorTimeSeriesSelectedOption).toStrictEqual(factorDataChartSettingsDeserialized.factorTimeSeriesSelectedOption);
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const factorDataChartSettings1 = new FactorDataChartSettings({ isTimeSeriesMode: true, factorTimeSeriesSelectedOption: 'FACTOR_LEVELS'});
        let factorDataChartSettings2 = new FactorDataChartSettings({ isTimeSeriesMode: true, factorTimeSeriesSelectedOption: 'FACTOR_RETURNS'});

        // Different isTimeSeriesMode and factorTimeSeriesSelectedOption
        expect(factorDataChartSettings1.equals(factorDataChartSettings2)).toBe(false);

        // Different isTimeSeriesMode and factorTimeSeriesSelectedOption
        factorDataChartSettings2 = new FactorDataChartSettings({ isTimeSeriesMode: false, factorTimeSeriesSelectedOption: 'FACTOR_LEVELS'});
        expect(factorDataChartSettings1.equals(factorDataChartSettings2)).toBe(false);

        // Same isTimeSeriesMode and factorTimeSeriesSelectedOption
        factorDataChartSettings2 = new FactorDataChartSettings({ isTimeSeriesMode: true, factorTimeSeriesSelectedOption: 'FACTOR_LEVELS'});
        expect(factorDataChartSettings1.equals(factorDataChartSettings2)).toBe(true);
    });
    /**
     * Test case for method equals
     */
    it('Test addRequestParams', function () {
        const factorDataChartSettings = new FactorDataChartSettings({ isTimeSeriesMode: true, factorTimeSeriesSelectedOption: 'FACTOR_LEVELS'});
        const optionValues = {} as any;
        factorDataChartSettings.addRequestParams(optionValues);
        expect(optionValues.factorDataChartSettings).not.toBeNull();
        expect(optionValues.factorDataChartSettings.isTimeSeriesMode).toBeTruthy();
        expect(optionValues.factorDataChartSettings.factorTimeSeriesSelectedOption).toBe('FACTOR_LEVELS');
    });

    it('Test shouldSkipSerialize', () => {
        const factorDataChartSettings = new FactorDataChartSettings({ isTimeSeriesMode: true, factorTimeSeriesSelectedOption: 'FACTOR_LEVELS'});
        expect(factorDataChartSettings.shouldSkipSerialize()).toBe(false);
    });
});
