import {TestBed} from '@angular/core/testing';
import {SecurityConstraintsTransformerService} from './security-constraints-transformer.service';
import {SUB_TYPE_SECURITY_CONSTRAINTS, TYPE_CONSTRAINTS} from '@optimization-settings/constants/optimization-types.constants';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {SecurityConstraintTransformerService} from '@optimization-settings/constraints-settings/services/transformers/security-constraint-transformer.service';
import {Dictionary} from 'lodash';

describe('SecurityConstraintsTransformerService', () => {
    let service: SecurityConstraintsTransformerService;
    let securityConstraintTransformerService: SecurityConstraintTransformerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{
                provide: SecurityConstraintTransformerService,
                useValue: {
                    transform: jest.fn()
                }
            }]
        });

        service = TestBed.inject(SecurityConstraintsTransformerService);
        securityConstraintTransformerService = TestBed.inject(SecurityConstraintTransformerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return type', () => {
        expect(service.type()).toEqual(TYPE_CONSTRAINTS);
    });

    it('should return sub type', () => {
        expect(service.subType()).toEqual(SUB_TYPE_SECURITY_CONSTRAINTS);
    });

    describe('should transform', () => {
        it('should return empty object when no constraints', () => {
            const portfolio = new PortfolioWithPositions();

            expect(service.transform(portfolio)).toEqual({});
        });

        it('should filter out disabled', () => {
            const portfolio = new PortfolioWithPositions();
            const constraint = new Constraint({
                title: 'title',
                optionValues: {
                    ConstraintValue: true,
                    ConstraintUnit: 'unit',
                    securityList: 'list'
                },
                relaxationValue: 1,
                enabled: false
            });
            portfolio.optimizationSettings.securityConstraints = [constraint];

            expect(service.transform(portfolio)).toEqual({});
        });

        it('should return transformed object when constraints', () => {
            const transformSpy = jest.spyOn(securityConstraintTransformerService, 'transform');
            const transformedConstraint: Dictionary<any> = {
                constraint: 'title',
                value: 'yes',
                unit: 'unit',
                associatedList: 'list',
                relaxation: true
            };
            transformSpy.mockReturnValue(transformedConstraint);
            const portfolio = new PortfolioWithPositions();
            const constraint = new Constraint({
                title: 'title',
                optionValues: {
                    ConstraintValue: true,
                    ConstraintUnit: 'unit',
                    securityList: 'list'
                },
                relaxationValue: 1,
                enabled: true
            });
            portfolio.optimizationSettings.securityConstraints = [constraint];

            expect(service.transform(portfolio)).toEqual({
                data: [transformedConstraint]
            });
            expect(transformSpy).toHaveBeenCalledTimes(1);
            expect(transformSpy).toHaveBeenCalledWith(constraint);
        });
    });
});
