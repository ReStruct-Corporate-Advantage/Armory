import {TelemetryFactorParameters} from './telemetry-factor-parameters';
import {TelemetryFactorDataWidgetTimeSeriesRequestParameters} from './telemetry-factor-data-widget-time-series-request-parameters';
import {TelemetryTimeSeriesSettingParameters} from './telemetry-time-series-setting-parameters';
import {FactorDataAnalytic} from '../../../enums';

describe('TelemetryFactorDataWidgetTimeSeriesRequestParameters', () => {
    it('should test deserialize', () => {
        const data = {
            factorAnalytic: FactorDataAnalytic.FACTOR_DATA_ANALYTIC_FACTOR_LEVELS,
            riskSettingsChanged: true,
            showAsChart: true,
            timeSeriesSetting: new TelemetryTimeSeriesSettingParameters({
                frequency: 'DAILY',
                periodCount: 10,
                chartType: 'line',
                formatDateType: 'dd-MM-yyyy',
                compareMode: 'none',
            }),
            factorColumnsList: [
                new TelemetryFactorParameters({
                    factorKey: 'factorA123',
                    factorTag: 'factorA',
                    riskSettingsChanged: true,
                    fxCrossCurrencyChanged: true,
                })
            ],
            comparisonFactorColumnsList: [
                new TelemetryFactorParameters({
                    factorKey: 'factorB121',
                    factorTag: 'factorB',
                    riskSettingsChanged: true,
                    fxCrossCurrencyChanged: true,
                })
            ],
        };
        const telemetryFactorDataWidgetTimeSeriesRequestParameters = new TelemetryFactorDataWidgetTimeSeriesRequestParameters(data);
        expect(telemetryFactorDataWidgetTimeSeriesRequestParameters).toEqual(data);
    });
});
