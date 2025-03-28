import {TelemetryFactorConstraintDetailParameter} from './telemetry-factor-constraint-parameter';
describe('TelemetryPortfolioConstraintParameters', () => {
    it('should test deserialize', () => {
        const params = new TelemetryFactorConstraintDetailParameter({
            constraintAttribute: 'Raw Pct Exposure',
            factorConstraintName: 'EQ FX'
        });
        expect(params.constraintAttribute).toBe('Raw Pct Exposure');
        expect(params.factorConstraintName).toBe('EQ FX');
    });
    it('should test deserialize for no data', () => {
        const params = new TelemetryFactorConstraintDetailParameter({
        });
        expect(params).toEqual({});
    });
});
