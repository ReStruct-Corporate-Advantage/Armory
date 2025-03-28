import {ExpostSettingsStore} from './expost-settings.store';
import {TimePeriod} from '../date/models/time-period/time-period.model';

describe('ExpostSettingsStore', () => {
    it('ExpostSettingsStore tests', () => {
        const expostSamplingPeriods = [
            {displayName : '1 Month', numberOfPeriods : 1, timePeriodShortName : 'Months'},
            {displayName : '1 Week', numberOfPeriods : 1, timePeriodShortName : 'Weeks'},
        ];
        const expostStatisticPeriods = [
            {displayName : '1 Year', numberOfPeriods : 1, timePeriodShortName : 'Years'},
            {displayName : '2 Years', numberOfPeriods : 2, timePeriodShortName : 'Years'},
            {displayName : '3 Years', numberOfPeriods : 3, timePeriodShortName : 'Years'},
        ];

        ExpostSettingsStore.setSupportedSettings(expostSamplingPeriods, expostStatisticPeriods);

        const supportedSamplingPeriods = [];
        supportedSamplingPeriods.push(new TimePeriod('1 Month', 1, 'Months'));
        supportedSamplingPeriods.push(new TimePeriod('1 Week', 1, 'Weeks'));

        const supportedStatisticPeriods = [];
        supportedStatisticPeriods.push(new TimePeriod('1 Year', 1, 'Years'));
        supportedStatisticPeriods.push(new TimePeriod('2 Years', 2, 'Years'));
        supportedStatisticPeriods.push(new TimePeriod('3 Years', 3, 'Years'));

        expect(ExpostSettingsStore.supportedSamplingPeriods[0].equals(supportedSamplingPeriods[0])).toBe(true);
        expect(ExpostSettingsStore.supportedSamplingPeriods[1].equals(supportedSamplingPeriods[1])).toBe(true);
        expect(ExpostSettingsStore.supportedStatisticPeriods[0].equals(supportedStatisticPeriods[0])).toBe(true);
        expect(ExpostSettingsStore.supportedStatisticPeriods[1].equals(supportedStatisticPeriods[1])).toBe(true);
        expect(ExpostSettingsStore.supportedStatisticPeriods[2].equals(supportedStatisticPeriods[2])).toBe(true);
    });

    it('test getSupportedExpostTimeSeriesPeriods method', () => {
        expect(ExpostSettingsStore.getSupportedExpostTimeSeriesPeriods().length).toBe(6);
    });

    it('test getSupportedReturnStatisticPeriods method', () => {
        expect(ExpostSettingsStore.getSupportedReturnStatisticPeriods().length).toBe(2);
    });
});
