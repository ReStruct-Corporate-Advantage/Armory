import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {TimeSeriesSettings} from './time-series-settings.model';
import {ChartWidgetInputConfigType, ConfigTypeFactory, DateValue} from '@blk/explore-ui-core';


/**
 * Test cases for TimeSeriesSettings.ts
 */
describe('TimeSeriesSettings tests', function () {

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll((function () {
        ConfigInitializer.registerWidgetInputTypes();
    }));

    /**
     * Test serialize/deserialize
     */
    it('Test Serialize/Deserialize', () => {
        // Create timeSeriesSettings to serialize
        const timeSeriesSettings = new TimeSeriesSettings({frequency: 'WEEKLY', periods: 10, chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: true});

        // Serialize
        const timeSeriesSettingsSerialized: any = timeSeriesSettings.serialize();

        // Deserialize
        const timeSeriesSettingsDeserialized: TimeSeriesSettings =
            ConfigTypeFactory.createConfig(timeSeriesSettingsSerialized, TimeSeriesSettings.INPUT_CONFIG_NAME, true);

        // Validate
        expect(timeSeriesSettings.frequency).toStrictEqual(timeSeriesSettingsDeserialized.frequency);
        expect(timeSeriesSettings.periods).toStrictEqual(timeSeriesSettingsDeserialized.periods);
        expect(timeSeriesSettings.chartType).toStrictEqual(timeSeriesSettingsDeserialized.chartType);
        expect(timeSeriesSettings.dateFormat).toStrictEqual(timeSeriesSettingsDeserialized.dateFormat);
        expect(timeSeriesSettings.includeTotalValues).toStrictEqual(timeSeriesSettingsDeserialized.includeTotalValues);

        // Create timeSeriesSettings (By date option) to serialize
        const timeSeriesSettings2 = new TimeSeriesSettings({frequency: 'DAILY', startDate: DateValue.newRelativeDate('T-2'), endDate: DateValue.newRelativeDate('T-1'), chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: true});
        const timeSeriesSettingsSerialized2 = timeSeriesSettings2.serialize();
        const timeSeriesSettingsDeserialized2 = ConfigTypeFactory.createConfig(timeSeriesSettingsSerialized2, TimeSeriesSettings.INPUT_CONFIG_NAME, true);

        expect(timeSeriesSettings2.frequency).toStrictEqual(timeSeriesSettingsDeserialized2.frequency);
        expect(timeSeriesSettings2.startDate).toEqual(timeSeriesSettingsDeserialized2.startDate);
        expect(timeSeriesSettings2.endDate).toEqual(timeSeriesSettingsDeserialized2.endDate);
        expect(timeSeriesSettings2.chartType).toStrictEqual(timeSeriesSettingsDeserialized2.chartType);
        expect(timeSeriesSettings2.dateFormat).toStrictEqual(timeSeriesSettingsDeserialized2.dateFormat);
        expect(timeSeriesSettings2.includeTotalValues).toStrictEqual(timeSeriesSettingsDeserialized2.includeTotalValues);
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        let timeSeriesSettings1 = new TimeSeriesSettings({frequency: 'WEEKLY', periods: 10, chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: true});
        let timeSeriesSettings2 = new TimeSeriesSettings({frequency: 'DAILY', periods: 5, chartType: 'bar', dateFormat: 'M/d/yyyy', includeTotalValues: false});

        // Different frequency, periods, chartType, dateFormat and includeTotalValues
        expect(timeSeriesSettings1.equals(timeSeriesSettings2)).toBe(false);

        // Different frequency, periods, chartType, dateFormat and  same includeTotalValues
        timeSeriesSettings2 = new TimeSeriesSettings({frequency: 'DAILY', periods: 5, chartType: 'bar', dateFormat: 'M/d/yyyy', includeTotalValues: true});
        expect(timeSeriesSettings1.equals(timeSeriesSettings2)).toBe(false);

        // Different frequency, periods, chartType and same dateFormat, includeTotalValues
        timeSeriesSettings2 = new TimeSeriesSettings({frequency: 'DAILY', periods: 5, chartType: 'bar', dateFormat: 'Aladdin date format', includeTotalValues: true});
        expect(timeSeriesSettings1.equals(timeSeriesSettings2)).toBe(false);

        // Different frequency, periods, and same chartType, dateFormat, includeTotalValues
        timeSeriesSettings2 = new TimeSeriesSettings({frequency: 'DAILY', periods: 5, chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: true});
        expect(timeSeriesSettings1.equals(timeSeriesSettings2)).toBe(false);

        // Different frequency, and same periods, chartType, dateFormat, includeTotalValues
        timeSeriesSettings2 = new TimeSeriesSettings({frequency: 'DAILY', periods: 10, chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: true});
        expect(timeSeriesSettings1.equals(timeSeriesSettings2)).toBe(false);

        // Same frequency, periods, chartType, dateFormat, includeTotalValues
        timeSeriesSettings2 = new TimeSeriesSettings({frequency: 'WEEKLY', periods: 10, chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: true});
        expect(timeSeriesSettings1.equals(timeSeriesSettings2)).toBe(true);

        timeSeriesSettings1 = new TimeSeriesSettings({frequency: 'MONTHLY', periods: 10, chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: true});

        timeSeriesSettings2 = new TimeSeriesSettings({frequency: 'MONTHLY', periods: 9, chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: true, appendReportDate: true});
        expect(timeSeriesSettings1.equals(timeSeriesSettings2)).toBe(true);
        timeSeriesSettings2 = new TimeSeriesSettings({frequency: 'MONTHLY', periods: 10, chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: true, appendReportDate: false});
        expect(timeSeriesSettings1.equals(timeSeriesSettings2)).toBe(false);
    });
    /**
     * Test case for method equals
     */
    it('Test addRequestParams', () => {
        let timeSeriesSettings = new TimeSeriesSettings({frequency: 'WEEKLY', periods: 10, chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: true, appendReportDate: false});
        let optionValues = {} as any;
        timeSeriesSettings.addRequestParams(optionValues);
        expect(optionValues.freqType).toBe('WEEKLY');
        expect(optionValues.periods).toBe(10);
        expect(optionValues.includeTotalValues).toBeTruthy();
        expect(optionValues.appendReportDate).toBeUndefined();

        timeSeriesSettings = new TimeSeriesSettings({frequency: 'MONTHLY', periods: 10, chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: true});
        optionValues = {} as any;
        timeSeriesSettings.addRequestParams(optionValues);
        expect(optionValues.freqType).toBe('MONTHLY');
        expect(optionValues.periods).toBe(9);
        expect(optionValues.includeTotalValues).toBeTruthy();
        expect(optionValues.appendReportDate).toBeTruthy();

        timeSeriesSettings = new TimeSeriesSettings({frequency: 'DAILY', startDate: DateValue.newRelativeDate('T-2'), endDate: DateValue.newRelativeDate('T-1'), chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: true});
        optionValues = {} as any;
        timeSeriesSettings.addRequestParams(optionValues);
        expect(optionValues.freqType).toBe('DAILY');
        expect(optionValues.startDate).toBe('T-2');
        expect(optionValues.forDate).toBe('T-1');
        expect(optionValues.includeTotalValues).toBeTruthy();
    });

    it('Test shouldSkipSerialize', () => {
        const timeSeriesSettings = new TimeSeriesSettings({frequency: 'WEEKLY', periods: 10, chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: true});
        expect(timeSeriesSettings.shouldSkipSerialize()).toBe(false);
    });
});
