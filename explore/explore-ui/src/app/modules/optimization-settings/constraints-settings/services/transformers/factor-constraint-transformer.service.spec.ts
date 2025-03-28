import {TestBed} from '@angular/core/testing';
import {SUB_TYPE_FACTOR_CONSTRAINTS} from '../../../constants/optimization-types.constants';
import {FactorConstraintTransformerService} from '@optimization-settings/constraints-settings/services/transformers/factor-constraint-transformer.service';
import {Constraint} from '@models/portfolio/constraints/constraint.model';

describe('FactorConstraintTransformerService', () => {
    let service: FactorConstraintTransformerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FactorConstraintTransformerService);
    });

    it('tests getType', () => {
        expect(service.type()).toEqual(SUB_TYPE_FACTOR_CONSTRAINTS);
    });

    it('tests getName', () => {
        expect(service.getName({
            'quickFactorBlock': 'BRS_GOLD__1_USDIR',
            'factorTagList': ''
        })).toBe('USD Interest Rates');

        expect(service.getName({
            'quickFactorBlock': '',
            'factorTagList': 'bcd'
        })).toBe('bcd');
    });

    it('tests transform', () => {
        expect(service.transform(new Constraint({
            title: 'title',
            optionValues: {
                ConstraintLowerBound: 1,
                ConstraintUpperBound: 2,
                quickFactorBlock: 'BRS_GOLD__1_USDIR'
            },
            relaxationValue: 1,
            isRelaxable: true,
            enabled: false
        }))).toStrictEqual({
            constraint: 'title',
            name: 'USD Interest Rates',
            lowerBound: 1,
            upperBound: 2,
            relaxation: true,
            isRelaxable: true,
            enabled: false
        });
    });
});
