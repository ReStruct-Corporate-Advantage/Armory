import {ExpostSettings} from './expost-settings.model';
import {TimePeriod} from '../../date/models/time-period/time-period.model';
import {ExpostSettingsTestBed} from '@models/expostSettings/expost-settings-test-bed.testutil';

describe('ExpostSettings Testcases', () => {

    it('Test serialize and deserialize', function () {
        const samplingPeriod1 = new TimePeriod('1 Month', 1, 'Months');
        const statisticPeriod1 = new TimePeriod('1 Day', 1, 'Days');

        const expostSettings1 = new ExpostSettings();
        expostSettings1.samplingPeriod = samplingPeriod1;
        expostSettings1.statisticPeriods = [statisticPeriod1];

        const data = expostSettings1.serialize();
        const deserializedExpostSettings = new ExpostSettings();
        deserializedExpostSettings.deserialize(data);

        // Check sampling period
        expect(expostSettings1.samplingPeriod.shortName === deserializedExpostSettings.samplingPeriod.shortName).toBe(true);
        expect(expostSettings1.samplingPeriod.numberOfPeriods === deserializedExpostSettings.samplingPeriod.numberOfPeriods).toBe(true);

        // Check statistic period
        expect(expostSettings1.statisticPeriods[0].shortName === deserializedExpostSettings.statisticPeriods[0].shortName).toBe(true);
        expect(expostSettings1.statisticPeriods[0].numberOfPeriods === deserializedExpostSettings.statisticPeriods[0].numberOfPeriods).toBe(true);

        // Check isNetReturns
        expect(expostSettings1.isNetReturns === deserializedExpostSettings.isNetReturns).toBe(true);

        // Check isLogNormal
        expect(expostSettings1.isLogNormal === deserializedExpostSettings.isLogNormal).toBe(true);

        // Check categoryBreakdown
        expect(expostSettings1.categoryBreakdown === deserializedExpostSettings.categoryBreakdown).toBe(true);
    });

    /**
     * Test case for method equal
     */
    it('Test Expost Settings equal', function () {
        const samplingPeriod1 = new TimePeriod('1 Month', 1, 'Months');
        const statisticPeriod1 = new TimePeriod('1 Day', 1, 'Days');

        const samplingPeriod2 = new TimePeriod('2 Months', 2, 'Months');
        const statisticPeriod2 = new TimePeriod('2 Days', 2, 'Days');

        const expostSettings1 = new ExpostSettings();
        expostSettings1.samplingPeriod = samplingPeriod1;
        expostSettings1.statisticPeriods = [statisticPeriod1, statisticPeriod2];
        expostSettings1.isNetReturns = false;
        expostSettings1.isLogNormal = false;

        const expostSettings2 = new ExpostSettings();
        expostSettings2.samplingPeriod = samplingPeriod2;
        expostSettings2.statisticPeriods = [statisticPeriod1, statisticPeriod2];
        expostSettings2.isNetReturns = false;
        expostSettings2.isLogNormal = false;

        // Different sampling periods
        expect(expostSettings1.equals(expostSettings2)).toBe(false);

        // Different statistic periods
        expostSettings2.samplingPeriod = samplingPeriod1;
        expostSettings2.statisticPeriods = [statisticPeriod1];
        expect(expostSettings1.equals(expostSettings2)).toBe(false);

        // Different isNetReturns
        expostSettings2.statisticPeriods = [statisticPeriod1, statisticPeriod2];
        expostSettings2.isNetReturns = true;
        expect(expostSettings1.equals(expostSettings2)).toBe(false);

        // Different isLogNormal
        expostSettings2.isNetReturns = false;
        expostSettings2.isLogNormal = true;
        expect(expostSettings1.equals(expostSettings2)).toBe(false);

        // Different categoryBreakdown
        expostSettings2.isLogNormal = false;
        expostSettings2.categoryBreakdown = false;
        expect(expostSettings1.equals(expostSettings2)).toBe(false);

        // Same settings
        expostSettings2.categoryBreakdown = true;
        expect(expostSettings1.equals(expostSettings2)).toBe(true);
    });

    /*
     * Tests addRequestParams
     */
    it('Test addRequestParams', function () {
        const expostSettings = new ExpostSettings();

        // Set statistical periods
        expostSettings.statisticPeriods = ExpostSettingsTestBed.createStatisticalPeriods();
        // Set sampling period
        expostSettings.samplingPeriod = new TimePeriod('3 Quarters', 3, 'Quarters');
        // Set category breakdown
        expostSettings.categoryBreakdown = false;

        // Add request params
        const requestParams: any = {};
        expostSettings.addRequestParams(requestParams);

        // Validate
        expect(requestParams.samplingPeriod).toStrictEqual({numberOfPeriods: 3, shortName : 'Quarters'});
        expect(requestParams.categoryBreakdown).toStrictEqual(false);
        ExpostSettingsTestBed.validateStatisticalPeriods(requestParams);
    });

    it('Test updateDerivedSettings', function () {
        const portfolioExpostSettings = new ExpostSettings();
        const timePeriod = new TimePeriod('3 Quarters', 3, 'Quarters');
        // Set statistical periods
        portfolioExpostSettings.statisticPeriods = [timePeriod];
        // Set sampling period
        portfolioExpostSettings.samplingPeriod = timePeriod;

        // set widget level settings
        const expostSettings = new ExpostSettings();
        expostSettings.updateDerivedSettings(portfolioExpostSettings);

        // Validate
        expect(expostSettings.samplingPeriod).toStrictEqual(timePeriod);
        expect(expostSettings.statisticPeriods[0]).toStrictEqual(timePeriod);
    });

    it('Test shouldSkipSerialize', () => {
        const expostSettings = new ExpostSettings();
        expect(expostSettings.shouldSkipSerialize()).toBe(false);
    });
});


