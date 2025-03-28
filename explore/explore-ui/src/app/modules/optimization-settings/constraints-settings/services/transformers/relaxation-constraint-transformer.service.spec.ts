import {TestBed} from '@angular/core/testing';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {
    SUB_TYPE_RELAXATION_CONSTRAINTS,
    SUB_TYPE_SECURITY_CONSTRAINTS
} from '../../../constants/optimization-types.constants';
import {
    RelaxationConstraintTransformerService
} from '@optimization-settings/constraints-settings/services/transformers/relaxation-constraint-transformer.service';
import {SECURITY_CONSTRAINTS_TITLE} from '@optimization-settings/constants/optimization-title.constants';

describe('RelaxationConstraintTransformerService', () => {
    let service: RelaxationConstraintTransformerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RelaxationConstraintTransformerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return type', () => {
        expect(service.type()).toEqual(SUB_TYPE_RELAXATION_CONSTRAINTS);
    });

    it('should transform', () => {
        const constraint: Constraint = new Constraint({
            title: 'title',
            constraintType: SUB_TYPE_SECURITY_CONSTRAINTS,
            optionValues: {
                ConstraintValue: true,
                ConstraintUnit: 'PERCENTAGE',
                ConstraintLowerBound: 1,
                ConstraintUpperBound: 2,
                securityList: 'Investment Universe'
            },
            relaxationValue: 1,
            isRelaxable: true,
            enabled: false
        });

        expect(service.transform(constraint)).toEqual({
            constraintType: SECURITY_CONSTRAINTS_TITLE,
            constraint: 'title',
            constraintScope: 'Investment Universe',
            lowerBound: 1,
            upperBound: 2,
            relaxation: true,
            isRelaxable: true
        });
    });
});
