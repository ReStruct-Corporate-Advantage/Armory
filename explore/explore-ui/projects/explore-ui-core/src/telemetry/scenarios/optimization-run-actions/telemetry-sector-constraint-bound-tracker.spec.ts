import {
    TelemetrySectorConstraintBoundParameter
} from '../../parameters';
import {
    ExploreSectorConstraintBoundType,
    ExploreSectorConstraintRelativeOperatorType,
} from '../../enums';
import {TelemetrySectorConstraintBoundTracker} from './telemetry-sector-constraint-bound-tracker';

describe('Telemetry Sector Constraint Bound Tracker', () => {
    it('should test generateProtoBuff', () => {
        const tracker = new TelemetrySectorConstraintBoundTracker();
        const constraintsParameters =  new TelemetrySectorConstraintBoundParameter({
                constraintType: ExploreSectorConstraintBoundType.EXPLORE_SECTOR_CONSTRAINT_TYPE_RELATIVE,
            constraintLowerBoundOperator: ExploreSectorConstraintRelativeOperatorType['ADDITION'],
            constraintUpperBoundOperator: ExploreSectorConstraintRelativeOperatorType['SUBTRACTION']
        });
        const stats = tracker.generateProtoBuff(constraintsParameters);
        expect(stats.getConstraintType()).toBe(ExploreSectorConstraintBoundType.EXPLORE_SECTOR_CONSTRAINT_TYPE_RELATIVE);
        expect(stats.getLowerBoundConstraintOperator()).toBe(ExploreSectorConstraintRelativeOperatorType.ADDITION);
        expect(stats.getUpperBoundConstraintOperator()).toBe(ExploreSectorConstraintRelativeOperatorType.SUBTRACTION);
    });
});
