import {TelemetryFactorParameters} from './telemetry-factor-parameters';
import {FactorDataAnalytic} from '../../../enums';
import {TelemetryFactorDataWidgetRiskMatrixRequestParameters} from './telemetry-factor-data-widget-risk-matrix-request-parameters';

describe('TelemetryFactorDataWidgetRiskMatrixRequestParameters', () => {
    it('should test deserialize', () => {
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
        const telemetryFactorDataWidgetRiskMatrixRequestParameters = new TelemetryFactorDataWidgetRiskMatrixRequestParameters(data);
        expect(telemetryFactorDataWidgetRiskMatrixRequestParameters).toEqual(data);
    });
});
