import {ExpostSettings, TimePeriod} from '@blk/explore-ui-core';
import {ExpostSettingsTestBed} from '@models/expostSettings/expost-settings-test-bed.testutil';
import {ExpostReturnSettings} from './expost-return-settings.model';

/**
 * Test cases for ExpostReturnSettings.ts
 */
describe('ExpostReturnSettings tests', function () {

    /**
     * Test case for method equal
     */
    it('Test Expost Return Settings equal', function () {
        const expostReturnsSettings1 = new ExpostReturnSettings();
        const expostReturnsSettings2 = new ExpostReturnSettings();

        const statisticPeriod1 = new TimePeriod('1 Day', 1, 'Days');
        const statisticPeriod2 = new TimePeriod('2 Days', 2, 'Days');

        const expostSettings1 = new ExpostSettings();
        expostSettings1.statisticPeriods = [statisticPeriod1];
        expostReturnsSettings1.expostSettings = expostSettings1;
        expostReturnsSettings1.timePeriod = new TimePeriod('1 Year', 1, 'Years');
        expostReturnsSettings1.showBench = false;
        expostReturnsSettings1.showActive = false;

        const expostSettings2 = new ExpostSettings();
        expostSettings2.statisticPeriods = [statisticPeriod2];
        expostReturnsSettings2.expostSettings = expostSettings2;
        expostReturnsSettings2.timePeriod = new TimePeriod('1 Year', 1, 'Years');
        expostReturnsSettings2.showBench = false;
        expostReturnsSettings2.showActive = false;

        // Different statistic periods
        expect(expostReturnsSettings1.equals(expostReturnsSettings2)).toBe(false);

        // Different time period
        expostSettings2.statisticPeriods = [statisticPeriod1];
        expostReturnsSettings2.timePeriod = new TimePeriod('2 Years', 2, 'Years');
        expect(expostReturnsSettings1.equals(expostReturnsSettings2)).toBe(false);

        // Different showBench
        expostReturnsSettings2.timePeriod = new TimePeriod('1 Year', 1, 'Years');
        expostReturnsSettings2.showBench = true;
        expect(expostReturnsSettings1.equals(expostReturnsSettings2)).toBe(false);

        // Different showActive
        expostReturnsSettings2.showBench = false;
        expostReturnsSettings2.showActive = true;
        expect(expostReturnsSettings1.equals(expostReturnsSettings2)).toBe(false);

        // Same settings
        expostReturnsSettings2.showActive = false;
        expect(expostReturnsSettings1.equals(expostReturnsSettings2)).toBe(true);
    });

    /*
     *
     */
    it('Test serialize and deserialize', function () {
        const expostReturnsSettings1 = new ExpostReturnSettings();
        const statisticPeriod1 = new TimePeriod('1 Day', 1, 'Days');
        const expostSettings1 = new ExpostSettings();
        expostSettings1.statisticPeriods = [statisticPeriod1];

        expostReturnsSettings1.expostSettings = expostSettings1;
        expostReturnsSettings1.timePeriod = new TimePeriod('1 Year', 1, 'Years');
        expostReturnsSettings1.showBench = false;
        expostReturnsSettings1.showActive = true;

        const data = expostReturnsSettings1.serialize();
        const deserializedExpostReturnSettings = new ExpostReturnSettings();
        deserializedExpostReturnSettings.deserialize(data);

        // Check statistic period
        expect(expostReturnsSettings1.expostSettings.statisticPeriods[0].shortName === deserializedExpostReturnSettings.expostSettings.statisticPeriods[0].shortName).toBe(true);
        expect(expostReturnsSettings1.expostSettings.statisticPeriods[0].numberOfPeriods === deserializedExpostReturnSettings.expostSettings.statisticPeriods[0].numberOfPeriods).toBe(true);

        // Check timePeriod
        expect(expostReturnsSettings1.timePeriod.shortName === deserializedExpostReturnSettings.timePeriod.shortName).toBe(true);
        expect(expostReturnsSettings1.timePeriod.numberOfPeriods === deserializedExpostReturnSettings.timePeriod.numberOfPeriods).toBe(true);

        // Check showBench
        expect(expostReturnsSettings1.showBench === deserializedExpostReturnSettings.showBench).toBe(true);

        // Check showActive
        expect(expostReturnsSettings1.showActive === deserializedExpostReturnSettings.showActive).toBe(true);
    });

    /*
     *
     */
    it('Test addRequestParams', function () {
        const expostReturnsSettings = new ExpostReturnSettings();
        const expostSettings = new ExpostSettings();
        expostReturnsSettings.expostSettings = expostSettings;

        // Set statistical periods
        expostSettings.statisticPeriods = ExpostSettingsTestBed.createStatisticalPeriods();
        // Set time period
        expostReturnsSettings.timePeriod = new TimePeriod('2 Year2', 2, 'Years');

        // Add request params
        const requestParams: any = {};
        expostReturnsSettings.addRequestParams(requestParams);

        // Validate
        expect(requestParams.samplingPeriod).toStrictEqual({numberOfPeriods: 1, shortName: 'Months'});
        expect(requestParams.timePeriod).toStrictEqual({numberOfPeriods: 2, shortName: 'Years'});
        ExpostSettingsTestBed.validateStatisticalPeriods(requestParams);
    });

    it('Test shouldSkipSerialize', () => {
        const expostReturnsSettings = new ExpostReturnSettings();
        expect(expostReturnsSettings.shouldSkipSerialize()).toBe(false);
    });
});
