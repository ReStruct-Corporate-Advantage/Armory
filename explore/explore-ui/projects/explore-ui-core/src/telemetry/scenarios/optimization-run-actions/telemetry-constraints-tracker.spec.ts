import {
    TelemetryConstraintsParameters,
    TelemetrySectorConstraintBoundParameter,
} from '../../parameters';
import {TelemetryConstraintsTracker} from './telemetry-constraints-tracker';
import {
    ExploreSectorConstraintBoundType,
    ExploreSectorConstraintRelativeOperatorType,
    ExploreSectorsForConstraint
} from '../../enums';

describe('Telemetry Constraints Tracker', () => {
    it('should test generateProtoBuff', () => {
        const tracker = new TelemetryConstraintsTracker();
        const constraintsParameters =  new TelemetryConstraintsParameters({
            sectorConstraints: [{
                constraintAttribute: 'market_val',
                sectorsForConstraint: ExploreSectorsForConstraint.EXPLORE_SECTORS_FOR_CONSTRAINT_ALL_SECTORS,
                isFilterApplied: true,
                sectorConstraintType: new TelemetrySectorConstraintBoundParameter({
                    constraintType: ExploreSectorConstraintBoundType.EXPLORE_SECTOR_CONSTRAINT_TYPE_RELATIVE,
                    constraintOperator: ExploreSectorConstraintRelativeOperatorType['ADDITION']
                })}],
            portfolioConstraints: [{
                constraintAttribute: 'allow_short_position',
                portfolioConstraintValue: 'yes'
            }],
            securityConstraints: [{
                constraintAttribute: 'notional mv',
                wayToApplySecurityConstraint: 'Custom security list'
            }],
            factorConstraints: [{
                constraintAttribute: 'Raw Pct Exposure',
                factorConstraintName: 'aaa'
            }]
        });
        const stats = tracker.generateProtoBuff(constraintsParameters);
        expect(stats.getSectorConstraintDetailsList().length).toBe(1);
        expect(constraintsParameters.factorConstraints.length).toBe(1);
    });
});
