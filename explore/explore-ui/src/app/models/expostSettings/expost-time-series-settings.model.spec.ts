import {CoreWidgetConstants, ExpostSettings, TimePeriod} from '@blk/explore-ui-core';
import {ExpostSettingsTestBed} from '@models/expostSettings/expost-settings-test-bed.testutil';
import {ExpostTimeSeriesSettings} from './expost-time-series-settings.model';

/**
 * Test cases for ExpostTimeSeriesSettings.ts
 */
describe('ExpostTimeSeriesSettings tests', function () {

    /**
     * Test case for method equal
     */
    it('Test Expost Time Series Settings equal', function () {
        const expostTimeSeriesSettings1 = new ExpostTimeSeriesSettings();
        const expostTimeSeriesSettings2 = new ExpostTimeSeriesSettings();

        const statisticPeriod1 = new TimePeriod('1 Day', 1, 'Days');
        const statisticPeriod2 = new TimePeriod('2 Days', 2, 'Days');

        const samplingPeriod1 = new TimePeriod('1 Month', 1, 'Months');
        const samplingPeriod2 = new TimePeriod('1 Week', 1, 'Weeks');

        const expostSettings1 = new ExpostSettings();
        expostSettings1.statisticPeriods = [statisticPeriod1];
        expostSettings1.samplingPeriod = samplingPeriod1;
        expostTimeSeriesSettings1.expostSettings = expostSettings1;
        expostTimeSeriesSettings1.timePeriod = new TimePeriod('1 Year', 1, 'Years');
        expostTimeSeriesSettings1.showAsChart = false;

        const expostSettings2 = new ExpostSettings();
        expostSettings2.statisticPeriods = [statisticPeriod2];
        expostSettings2.samplingPeriod = samplingPeriod1;
        expostTimeSeriesSettings2.expostSettings = expostSettings2;
        expostTimeSeriesSettings2.timePeriod = new TimePeriod('1 Year', 1, 'Years');
        expostTimeSeriesSettings2.showAsChart = false;

        // Different statistic periods
        expect(expostTimeSeriesSettings1.equals(expostTimeSeriesSettings2)).toBe(false);

        // Different sampling periods
        expostSettings2.statisticPeriods = [statisticPeriod1];
        expostSettings2.samplingPeriod = samplingPeriod2;
        expect(expostTimeSeriesSettings1.equals(expostTimeSeriesSettings2)).toBe(false);

        // Different time period
        expostSettings2.samplingPeriod = samplingPeriod1;
        expostTimeSeriesSettings2.timePeriod = new TimePeriod('2 Years', 2, 'Years');
        expect(expostTimeSeriesSettings1.equals(expostTimeSeriesSettings2)).toBe(false);

        // Different showAsChart
        expostTimeSeriesSettings2.timePeriod = new TimePeriod('1 Year', 1, 'Years');
        expostTimeSeriesSettings2.showAsChart = true;
        expect(expostTimeSeriesSettings1.equals(expostTimeSeriesSettings2)).toBe(false);


        // Same settings
        expostTimeSeriesSettings2.showAsChart = false;
        expect(expostTimeSeriesSettings1.equals(expostTimeSeriesSettings2)).toBe(true);
    });

    it('Test serialize and deserialize', function () {
        const expostTimeSeriesSettings1 = new ExpostTimeSeriesSettings();

        const statisticPeriod1 = new TimePeriod('1 Day', 1, 'Days');
        const samplingPeriod1 = new TimePeriod('1 Month', 1, 'Months');

        const expostSettings1 = new ExpostSettings();
        expostSettings1.statisticPeriods = [statisticPeriod1];
        expostSettings1.samplingPeriod = samplingPeriod1;
        expostTimeSeriesSettings1.expostSettings = expostSettings1;
        expostTimeSeriesSettings1.timePeriod = new TimePeriod('1 Year', 1, 'Years');
        expostTimeSeriesSettings1.showAsChart = true;

        const data: any = expostTimeSeriesSettings1.serialize();
        const deserializedExpostTimeSeriesSettings = new ExpostTimeSeriesSettings();
        deserializedExpostTimeSeriesSettings.deserialize(data);

        // Check statistic period
        expect(expostTimeSeriesSettings1.expostSettings.statisticPeriods[0].shortName === deserializedExpostTimeSeriesSettings.expostSettings.statisticPeriods[0].shortName).toBe(true);
        expect(expostTimeSeriesSettings1.expostSettings.statisticPeriods[0].numberOfPeriods === deserializedExpostTimeSeriesSettings.expostSettings.statisticPeriods[0].numberOfPeriods).toBe(true);

        // Check sampling period
        expect(expostTimeSeriesSettings1.expostSettings.samplingPeriod.shortName === deserializedExpostTimeSeriesSettings.expostSettings.samplingPeriod.shortName).toBe(true);
        expect(expostTimeSeriesSettings1.expostSettings.samplingPeriod.numberOfPeriods === deserializedExpostTimeSeriesSettings.expostSettings.samplingPeriod.numberOfPeriods).toBe(true);

        // Check timePeriod
        expect(expostTimeSeriesSettings1.timePeriod.shortName === deserializedExpostTimeSeriesSettings.timePeriod.shortName).toBe(true);
        expect(expostTimeSeriesSettings1.timePeriod.numberOfPeriods === deserializedExpostTimeSeriesSettings.timePeriod.numberOfPeriods).toBe(true);

        // Check showAsChart
        expect(expostTimeSeriesSettings1.showAsChart === deserializedExpostTimeSeriesSettings.showAsChart).toBe(true);
    });

    it('Test updateDerivedSettings', function () {
        const expostTimeSeriesSettings = new ExpostTimeSeriesSettings();
        const expostSettings = new ExpostSettings();
        expostTimeSeriesSettings.expostSettings = new ExpostSettings();
        expostTimeSeriesSettings.expostSettings.samplingPeriod = new TimePeriod();
        expostSettings.statisticPeriods = [new TimePeriod('1 Day', 1, 'Days')];
        expostTimeSeriesSettings.updateDerivedSettings(expostSettings);
        expect(expostTimeSeriesSettings.expostSettings).toEqual(expostSettings);
    });

    it('Test updateDerivedSettings when widget level expost settings exist', function () {
        const expostTimeSeriesSettings = new ExpostTimeSeriesSettings();
        const expostSettings = new ExpostSettings();
        expostTimeSeriesSettings.expostSettings = new ExpostSettings();
        expostTimeSeriesSettings.expostSettings.samplingPeriod = new TimePeriod('1 Month', 1, 'Month');
        expostTimeSeriesSettings.expostSettings.samplingPeriod = new TimePeriod();
        expostSettings.statisticPeriods = [new TimePeriod('1 Day', 1, 'Days')];
        expostTimeSeriesSettings.updateDerivedSettings(expostSettings);
        expect(expostTimeSeriesSettings.expostSettings).toEqual(expostTimeSeriesSettings.expostSettings);
    });

    /*
     * Tests addRequestParams
     */
    it('Test addRequestParams', function () {
        const expostTimeSeriesSettings = new ExpostTimeSeriesSettings();
        const expostSettings = new ExpostSettings();
        expostTimeSeriesSettings.expostSettings = expostSettings;

        // Set statistical periods
        expostSettings.statisticPeriods = ExpostSettingsTestBed.createStatisticalPeriods();
        // Set sampling period
        expostSettings.samplingPeriod = new TimePeriod('3 Quarters', 3, 'Quarters');
        // Set time period
        expostTimeSeriesSettings.timePeriod = new TimePeriod('2 Year2', 2, 'Years');

        // Add request params
        const requestParams: any = {};
        expostTimeSeriesSettings.addRequestParams(requestParams);

        // Validate
        expect(requestParams.samplingPeriod).toStrictEqual({numberOfPeriods: 3, shortName: 'Quarters'});
        expect(requestParams.timePeriod).toStrictEqual({numberOfPeriods: 2, shortName: 'Years'});
        ExpostSettingsTestBed.validateStatisticalPeriods(requestParams);
    });

    it('Test getChartingLib', function () {
        const expostTimeSeriesSettings = new ExpostTimeSeriesSettings();
        // Validate
        expect(expostTimeSeriesSettings.getChartingLib()).toBe(CoreWidgetConstants.CHARTING_LIB.AG_GRID);
        expostTimeSeriesSettings.showAsChart = true;
        expect(expostTimeSeriesSettings.getChartingLib()).toBe(CoreWidgetConstants.CHARTING_LIB.HIGHCHART);
    });

    it('Test toggleChartingLib', function () {
        const expostTimeSeriesSettings = new ExpostTimeSeriesSettings();
        // Validate
        expect(expostTimeSeriesSettings.getChartingLib()).toBe(CoreWidgetConstants.CHARTING_LIB.AG_GRID);
        expostTimeSeriesSettings.toggleChartingLib();
        expect(expostTimeSeriesSettings.getChartingLib()).toBe(CoreWidgetConstants.CHARTING_LIB.HIGHCHART);
        expect(expostTimeSeriesSettings.showAsChart).toBeTruthy();
    });

    it('Test shouldSkipSerialize', () => {
        const expostTimeSeriesSettings = new ExpostTimeSeriesSettings();
        expect(expostTimeSeriesSettings.shouldSkipSerialize()).toBe(false);
    });
});
