import {TelemetryFactorDataTimeSeriesRequestTracker} from './telemetry-factor-data-time-series-request-tracker';
import {TelemetryFactorDataWidgetTimeSeriesRequestParameters, TelemetryFactorParameters, TelemetryTimeSeriesSettingParameters} from '../../../parameters';
import {FactorDataAnalytic} from '../../../enums';


describe('Telemetry Factor Data Time Series Request Tracker', () => {
    it(' it should test generateProtoBuff', () => {
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
        const params = new TelemetryFactorDataWidgetTimeSeriesRequestParameters(data);

        const factorDataTimeSeriesRequestTracker = new TelemetryFactorDataTimeSeriesRequestTracker();
        const stats = factorDataTimeSeriesRequestTracker.generateProtoBuff(params);

        expect(stats.getFactorAnalytic()).toBe(FactorDataAnalytic.FACTOR_DATA_ANALYTIC_FACTOR_LEVELS);
        expect(stats.getRiskSettingsChanged()).toBe(true);
        expect(stats.getShowAsChart()).toBe(true);
        expect(stats.getFactorColumnsList().length).toBe(1);
        expect(stats.getComparisonFactorColumnsList().length).toBe(1);
        expect(stats.getTimeSeriesSetting()).toBeDefined();
        expect(stats.getTimeSeriesSetting().getFrequency()).toBe('DAILY');
        expect(stats.getTimeSeriesSetting().getChartType()).toBe('line');
        expect(stats.getTimeSeriesSetting().getPeriodCount()).toBe(10);
        expect(stats.getTimeSeriesSetting().getFormatDateType()).toBe('dd-MM-yyyy');
        expect(stats.getTimeSeriesSetting().getCompareMode()).toBe('none');
    });
});
