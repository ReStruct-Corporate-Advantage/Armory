import {TelemetryFactorDataWidgetRiskMatrixRequestParameters, TelemetryFactorParameters} from '../../../parameters';
import {FactorDataAnalytic} from '../../../enums';
import {TelemetryFactorDataRiskMatrixRequestTracker} from './telemetry-factor-data-risk-matrix-request-tracker';


describe('Telemetry Factor Data Risk Matrix Request Tracker', () => {
    it(' it should test generateProtoBuff', () => {
        const data = {
            factorAnalytic: FactorDataAnalytic.FACTOR_DATA_ANALYTIC_CORRELATIONS,
            riskSettingsChanged: true,
            triangularMatrix: true,
            comparisonMode: true,
            showChangeUpperTriangle: true,
            conditionalFormattingEnabled: true,
            factorColumnsList: [
                new TelemetryFactorParameters({
                    factorKey: 'factorA123',
                    factorTag: 'factorA',
                    riskSettingsChanged: true,
                    fxCrossCurrencyChanged: true,
                })
            ],
        };
        const params = new TelemetryFactorDataWidgetRiskMatrixRequestParameters(data);

        const factorDataRiskMatrixRequestTracker = new TelemetryFactorDataRiskMatrixRequestTracker();
        const stats = factorDataRiskMatrixRequestTracker.generateProtoBuff(params);

        expect(stats.getFactorAnalytic()).toBe(FactorDataAnalytic.FACTOR_DATA_ANALYTIC_CORRELATIONS);
        expect(stats.getRiskSettingsChanged()).toBe(true);
        expect(stats.getFactorColumnsList().length).toBe(1);
        expect(stats.getComparisonMode()).toBe(true);
        expect(stats.getConditionalFormattingEnabled()).toBe(true);
        expect(stats.getShowChangeUpperTriangle()).toBe(true);
        expect(stats.getTriangularMatrix()).toBe(true);
    });
});
