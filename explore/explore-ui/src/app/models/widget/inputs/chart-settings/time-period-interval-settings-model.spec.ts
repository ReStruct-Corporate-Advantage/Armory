import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {ChartWidgetInputConfigType} from '@blk/explore-ui-core';
import {
    TimePeriodInterval,
    TimePeriodIntervalSettings
} from '@models/widget/inputs/chart-settings/time-period-interval-settings.model';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';

describe('TimePeriodIntervalSettings test', () => {
    beforeAll(() => {
        ConfigInitializer.registerChartWidgetInputConfigTypes();
    });

    /**
     * Test serialize/deserialize
     */
    it('should test TimePeriodIntervalSettings', () => {
        // serialize/deserialize check
        const timePeriodIntervalSettings = new TimePeriodIntervalSettings({});
        timePeriodIntervalSettings.timePeriodInterval = TimePeriodInterval.DAILY;
        expect(timePeriodIntervalSettings.serialize()).toBeUndefined();

        timePeriodIntervalSettings.timePeriodInterval = TimePeriodInterval.WEEKLY;
        const serializedConfig = timePeriodIntervalSettings.serialize();
        expect(new TimePeriodIntervalSettings(serializedConfig).timePeriodInterval).toEqual(TimePeriodInterval.WEEKLY);

        // equal check
        expect(timePeriodIntervalSettings.equals(new TimeSeriesSettings())).toBeFalsy();
        const timePeriodIntervalSettings2 = new TimePeriodIntervalSettings({timePeriodInterval: TimePeriodInterval.MONTHLY});
        expect(timePeriodIntervalSettings.equals(timePeriodIntervalSettings2)).toBeFalsy();

        timePeriodIntervalSettings.timePeriodInterval = TimePeriodInterval.MONTHLY;
        expect(timePeriodIntervalSettings.equals(timePeriodIntervalSettings2)).toBeTruthy();

        expect(timePeriodIntervalSettings.isDataStoreInput()).toBeFalsy();
        expect(timePeriodIntervalSettings.isEmpty()).toBeFalsy();
        expect(timePeriodIntervalSettings.getConfigType()).toBe(ChartWidgetInputConfigType.TIME_PERIOD_INTERVAL_SETTINGS);
    });

    it('Test shouldSkipSerialize', () => {
        const timePeriodIntervalSettings = new TimePeriodIntervalSettings({});
        expect(timePeriodIntervalSettings.shouldSkipSerialize()).toBeFalsy();
    });
});
