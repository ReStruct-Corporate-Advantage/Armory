import {TelemetryFactorParameters} from './telemetry-factor-parameters';

describe('TelemetryFactorParameters', () => {
    it('should test deserialize', () => {
        const data = {
            factorKey: 'factorA123',
            factorTag: 'factorA',
            riskSettingsChanged: true,
            fxCrossCurrencyChanged: true,
            shockSettingsChanged: false,
        };
        const telemetryFactorParameters = new TelemetryFactorParameters(data);
        expect(telemetryFactorParameters).toEqual(data);
    });
});
