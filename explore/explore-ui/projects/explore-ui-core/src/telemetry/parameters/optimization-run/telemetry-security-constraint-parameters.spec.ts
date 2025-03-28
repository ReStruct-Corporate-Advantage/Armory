import {TelemetrySecurityConstraintDetailParameter} from './telemetry-security-constraint-parameter';

describe('TelemetrySecurityConstraintParameters', () => {
    it('should test deserialize', () => {
        const params = new TelemetrySecurityConstraintDetailParameter({
            constraintAttribute: 'market value %',
            wayToApplySecurityConstraint: 'Filter'
        });
        expect(params.wayToApplySecurityConstraint).toBe('Filter');
    });
});
