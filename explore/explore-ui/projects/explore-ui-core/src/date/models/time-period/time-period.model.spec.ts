import {TimePeriodConstants} from '../../constants';
import {TimePeriod} from './time-period.model';

describe('TimePeriod testcase', () => {
    it('Test serialize and deserialize', () => {
        let timePeriod = new TimePeriod('Month to date', 1, 'MTD', '29-Feb-2016', '10-Mar-2016');
        let data = timePeriod.serialize();
        let deserializedTimePeriod = new TimePeriod();
        deserializedTimePeriod.deserialize(data);
        expect(JSON.stringify(data)).toBe('{"numberOfPeriods":1,"shortName":"MTD","timePeriodName":"Month to date"}');

        // Custom time period
        timePeriod.timePeriodName = 'Custom';
        timePeriod.shortName = TimePeriodConstants.CUSTOM_TIME_PERIOD;
        data = timePeriod.serialize();
        deserializedTimePeriod = new TimePeriod();
        deserializedTimePeriod.deserialize(data);
        expect(JSON.stringify(data)).not.toBe('{"numberOfPeriods":1,"shortName":"CUSTOM","timePeriodName":"Custom","fromDateValue":"29-Feb-2016","toDateValue":"10-Mar-2016"}');
        expect(JSON.stringify(data)).toBe('{"numberOfPeriods":1,"shortName":"CUSTOM","timePeriodName":"Custom","fromDateValue":"02/29/2016","toDateValue":"03/10/2016"}');

        // Custom time period with fromDateValue and toDateValue being relative date format
        timePeriod = new TimePeriod('Custom', 1, 'CUSTOM', 'T-1ME', 'T-1');
        data = timePeriod.serialize();
        deserializedTimePeriod = new TimePeriod();
        deserializedTimePeriod.deserialize(data);
        expect(JSON.stringify(data)).toBe('{"numberOfPeriods":1,"shortName":"CUSTOM","timePeriodName":"Custom","fromDateValue":"T-1ME","toDateValue":"T-1"}');
    });

    /**
     * Test case for method equal
     */
    it('Test equal', () => {
        const timePeriod1 = new TimePeriod('Month to date', 1, 'MTD', '29-Feb-2016', '10-Mar-2016');
        // Test with undefined
        expect(timePeriod1.equals(undefined)).toBe(false);

        // Different number of periods
        let timePeriod2 =  new TimePeriod('Month to date', 2, 'MTD');
        expect(timePeriod1.equals(timePeriod2)).toBe(false);

        // Same number of periods but different timePeriodShortName
        timePeriod2 =  new TimePeriod('Month to date', 1, 'DTD');
        expect(timePeriod1.equals(timePeriod2)).toBe(false);

        // Same settings - from and to dates don't matter for non custom time periods
        timePeriod2 = new TimePeriod('Month to date', 1, 'MTD');
        expect(timePeriod1.equals(timePeriod2)).toBe(true);

        // Custom time period - Differemt from and to dates
        timePeriod2.timePeriodName = timePeriod1.timePeriodName = 'Custom';
        timePeriod2.shortName = timePeriod1.shortName = TimePeriodConstants.CUSTOM_TIME_PERIOD;
        expect(timePeriod1.equals(timePeriod2)).toBe(false);

        timePeriod2.fromDateValue = '02/29/2016';
        timePeriod2.toDateValue = '03/10/2016';
        expect(timePeriod1.equals(timePeriod2)).toBe(true);

        timePeriod1.fromDateValue = timePeriod2.fromDateValue = 'T-1M';
        timePeriod1.toDateValue = timePeriod2.toDateValue = 'T-1';
        expect(timePeriod1.equals(timePeriod2)).toBe(true);

        timePeriod2.type = 'different';
        expect(timePeriod1.equals(timePeriod2)).toBe(false);

        timePeriod2.type = undefined;
        timePeriod2.interval = 'YEARS';
        expect(timePeriod1.equals(timePeriod2)).toBe(false);

        timePeriod2.interval = undefined;
        expect(timePeriod1.equals(timePeriod2)).toBe(true);
    });

    it('Test isCustomTimePeriod', () => {
        const timePeriod = new TimePeriod('Month to date', 1, 'MTD', '29-Feb-2016', '10-Mar-2016');
        expect(timePeriod.isCustomTimePeriod()).toBe(false);

        // Custom time period
        timePeriod.shortName = TimePeriodConstants.CUSTOM_TIME_PERIOD;
        expect(timePeriod.isCustomTimePeriod()).toBe(true);
    });

    it('Test addRequestData', () => {
        const timePeriod = new TimePeriod('Month to date', 1, 'MTD', '29-Feb-2016', '10-Mar-2016');
        let optionValues = [];
        timePeriod.addRequestData(optionValues);
        // Custom time period
        expect(optionValues[TimePeriodConstants.TIME_PERIOD]).toEqual(timePeriod.shortName);
        expect(optionValues[TimePeriodConstants.NUMBER_OF_PERIODS]).toEqual(timePeriod.numberOfPeriods);

        timePeriod.timePeriodName = 'Custom';
        timePeriod.shortName = TimePeriodConstants.CUSTOM_TIME_PERIOD;
        optionValues = [];
        timePeriod.addRequestData(optionValues);
        expect(optionValues[TimePeriodConstants.TIME_PERIOD]).toEqual(timePeriod.shortName);
        expect(optionValues[TimePeriodConstants.NUMBER_OF_PERIODS]).toEqual(timePeriod.numberOfPeriods);
        expect(optionValues[TimePeriodConstants.START_DATE]).toEqual(timePeriod.fromDateValue);
        expect(optionValues[TimePeriodConstants.END_DATE]).toEqual(timePeriod.toDateValue);
    });

    it('Test createModelLegacy', () => {
        const timePeriod = new TimePeriod();
        const optionValues = [];
        optionValues[TimePeriodConstants.TIME_PERIOD] = 'MTD';
        optionValues[TimePeriodConstants.NUMBER_OF_PERIODS] = 1;
        optionValues[TimePeriodConstants.START_DATE] = '10/16/2018';
        optionValues[TimePeriodConstants.END_DATE] = '10/31/2018';
        timePeriod.createModelLegacy(optionValues);
        expect(optionValues[TimePeriodConstants.TIME_PERIOD]).toEqual(undefined);
        expect(optionValues[TimePeriodConstants.NUMBER_OF_PERIODS]).toEqual(undefined);
        expect(optionValues[TimePeriodConstants.START_DATE]).toEqual(undefined);
        expect(optionValues[TimePeriodConstants.END_DATE]).toEqual(undefined);
        expect(timePeriod.shortName).toEqual('MTD');
        expect(timePeriod.numberOfPeriods).toEqual(1);
    });

    it('Test createReqParamWithNumberOfPeriodsAndShortName', () => {
        const timePeriod = new TimePeriod();
        timePeriod.numberOfPeriods = 1;
        timePeriod.shortName = 'xyz';

        const requestParam: any = timePeriod.createReqParamWithNumberOfPeriodsAndShortName();

        expect(requestParam.numberOfPeriods).toStrictEqual(1);
        expect(requestParam.shortName).toStrictEqual('xyz');
    });
});
