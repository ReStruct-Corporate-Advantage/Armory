import {TelemetryTimeSeriesSettingParameters} from './telemetry-time-series-setting-parameters';

describe('TelemetryTimeSeriesSettingParameters', () => {
    it('should test deserialize', () => {
        const data = {
            frequency: 'DAILY',
            periodCount: 10,
            chartType: 'line',
            formatDateType: 'dd-MM-yyyy',
            compareMode: 'none',
        };
        const telemetryTimeSeriesSettingParameters = new TelemetryTimeSeriesSettingParameters(data);
        expect(telemetryTimeSeriesSettingParameters).toEqual(data);
    });
});
