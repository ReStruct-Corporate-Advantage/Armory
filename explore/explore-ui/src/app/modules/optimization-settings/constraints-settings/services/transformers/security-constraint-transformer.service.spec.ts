import {TestBed} from '@angular/core/testing';
import {SecurityConstraintTransformerService} from './security-constraint-transformer.service';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {YES} from '../../constants/constraint.constants';
import {SUB_TYPE_SECURITY_CONSTRAINTS} from '../../../constants/optimization-types.constants';

describe('SecurityConstraintTransformerService', () => {
    let service: SecurityConstraintTransformerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.inject(SecurityConstraintTransformerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return type', () => {
        expect(service.type()).toEqual(SUB_TYPE_SECURITY_CONSTRAINTS);
    });

    it('should transform', () => {
        const constraint: Constraint = new Constraint({
            title: 'title',
            optionValues: {
                ConstraintValue: true,
                ConstraintUnit: 'PERCENTAGE',
                securityList: 'list',
                ConstraintLowerBound: 1,
                ConstraintUpperBound: 2
            },
            relaxationValue: 1,
            isRelaxable: true,
            enabled: false
        });

        expect(service.transform(constraint)).toEqual({
            constraint: 'title',
            value: YES,
            unit: '%',
            lowerBound: 1,
            upperBound: 2,
            associatedList: 'list',
            relaxation: true,
            isRelaxable: true,
            enabled: false
        });

        constraint.optionValues.securityList = null;
        expect(service.transform(constraint)).toEqual({
            constraint: 'title',
            value: YES,
            unit: '%',
            lowerBound: 1,
            upperBound: 2,
            associatedList: 'Custom List',
            relaxation: true,
            isRelaxable: true,
            enabled: false
        });
    });
});
