import {
    TelemetrySectorConstraintBoundParameter, TelemetrySectorConstraintDetailParameter,
} from '../../parameters';
import {
    ExploreSectorConstraintBoundType,
    ExploreSectorConstraintRelativeOperatorType,
    ExploreSectorsForConstraint
} from '../../enums';
import {TelemetrySectorConstraintDetailTracker} from './telemetry-sector-constraint-detail-tracker';

describe('Telemetry Sector Constraint Detail Tracker', () => {
    it('should test generateProtoBuff', () => {
        const tracker = new TelemetrySectorConstraintDetailTracker();
        const constraintsParameters =  new TelemetrySectorConstraintDetailParameter({
                constraintAttribute: 'market_val',
                sectorsForConstraint: ExploreSectorsForConstraint.EXPLORE_SECTORS_FOR_CONSTRAINT_ALL_SECTORS,
                isFilterApplied: true,
                sectorConstraintType: new TelemetrySectorConstraintBoundParameter({
                    constraintType: ExploreSectorConstraintBoundType.EXPLORE_SECTOR_CONSTRAINT_TYPE_RELATIVE,
                    constraintOperator: ExploreSectorConstraintRelativeOperatorType['ADDITION']
                })
        });
        const stats = tracker.generateProtoBuff(constraintsParameters);
        expect(stats.getConstraintBoundType()).toBeDefined();
        expect(stats.getConstraintAttribute()).toBe('market_val');
        expect(stats.getFilterApplied()).toBe(true);
    });
});
