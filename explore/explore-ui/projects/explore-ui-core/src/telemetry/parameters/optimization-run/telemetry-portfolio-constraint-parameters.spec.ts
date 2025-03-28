import {TelemetryPortfolioConstraintDetailParameter} from './telemetry-portfolio-constraint-parameter';

describe('TelemetryPortfolioConstraintParameters', () => {
    it('should test deserialize', () => {
        const params = new TelemetryPortfolioConstraintDetailParameter({
            constraintAttribute: 'allow short position',
            portfolioConstraintValue: 'No'
        });
        expect(params.portfolioConstraintValue).toBe('No');
    });
});
