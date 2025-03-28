import {TestBed} from '@angular/core/testing';
import {PortfolioConstraintTransformerService} from './portfolio-constraint-transformer.service';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {YES} from '../../constants/constraint.constants';
import {SUB_TYPE_PORTFOLIO_CONSTRAINTS} from '../../../constants/optimization-types.constants';

describe('PortfolioConstraintTransformerService', () => {
    let service: PortfolioConstraintTransformerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.inject(PortfolioConstraintTransformerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return type', () => {
        expect(service.type()).toEqual(SUB_TYPE_PORTFOLIO_CONSTRAINTS);
    });

    it('should transform', () => {
        const constraint: Constraint = new Constraint({
            title: 'title',
            optionValues: {
                ConstraintValue: true,
                ConstraintUnit: 'PERCENTAGE',
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
            relaxation: true,
            isRelaxable: true,
            enabled: false
        });
    });
});
