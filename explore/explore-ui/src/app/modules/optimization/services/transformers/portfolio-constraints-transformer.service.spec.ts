import {TestBed} from '@angular/core/testing';
import {PortfolioConstraintsTransformerService} from './portfolio-constraints-transformer.service';
import {SUB_TYPE_PORTFOLIO_CONSTRAINTS, TYPE_CONSTRAINTS} from '@optimization-settings/constants/optimization-types.constants';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {PortfolioConstraintTransformerService} from '@optimization-settings/constraints-settings/services/transformers/portfolio-constraint-transformer.service';
import {Dictionary} from 'lodash';
import {ExploreConstraintsSettingsService} from '@optimization-settings/constraints-settings/services/explore-constraints-settings.service';
import {DefinitionsStore} from '../../../../stores';
import {OptimizationConstraint} from '@models/definitions/optimization/optimization-constraint.model';

describe('PortfolioConstraintsTransformerService', () => {
    let service: PortfolioConstraintsTransformerService;
    let portfolioConstraintTransformerService: PortfolioConstraintTransformerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{
                provide: PortfolioConstraintTransformerService,
                useValue: {
                    transform: jest.fn()
                }
            },
                {
                    provide: ExploreConstraintsSettingsService,
                    useValue: {
                        createConstraint: jest.fn(() => new Constraint())
                    }
                }]
        });

        service = TestBed.inject(PortfolioConstraintsTransformerService);
        portfolioConstraintTransformerService = TestBed.inject(PortfolioConstraintTransformerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return type', () => {
        expect(service.type()).toEqual(TYPE_CONSTRAINTS);
    });

    it('should return sub type', () => {
        expect(service.subType()).toEqual(SUB_TYPE_PORTFOLIO_CONSTRAINTS);
    });

    describe('should transform', () => {

        it('should return empty object when no constraints', () => {
            const portfolio = new PortfolioWithPositions();

            expect(service.transform(portfolio)).toEqual({});
        });

        it('should add allow short position by default when no constraints', () => {
            const portfolio = new PortfolioWithPositions();
            const data: any = {
                columnTag: 'allow_short_position',
                constraintType: 'PORTFOLIO_CONSTRAINT',
                group: 'Long/Short',
                isRelaxable: false,
                title: 'Allow Short Positions'
            };
            DefinitionsStore.optimizationConstraint = [new OptimizationConstraint(data)];
            expect(service.transform(portfolio)).toEqual({});
        });

        it('should filter out disabled', () => {
            const portfolio = new PortfolioWithPositions();
            const constraint = new Constraint({
                title: 'title',
                optionValues: {
                    ConstraintValue: true,
                    ConstraintUnit: 'unit',
                    ConstraintLowerBound: 1,
                    ConstraintUpperBound: 2
                },
                relaxationValue: 1,
                enabled: false
            });
            portfolio.optimizationSettings.portfolioConstraints = [constraint];

            expect(service.transform(portfolio)).toEqual({});
        });

        it('should return transformed object when constraints', () => {
            const transformSpy = jest.spyOn(portfolioConstraintTransformerService, 'transform');
            const transformedConstraint: Dictionary<any> = {
                constraint: 'title',
                value: 'val',
                unit: 'unit',
                lowerBound: 1,
                upperBound: 2,
                relaxation: true
            };
            transformSpy.mockReturnValue(transformedConstraint);
            const portfolio = new PortfolioWithPositions();
            const constraint = new Constraint({
                title: 'title',
                optionValues: {
                    ConstraintValue: true,
                    ConstraintUnit: 'unit',
                    ConstraintLowerBound: 1,
                    ConstraintUpperBound: 2
                },
                relaxationValue: 1,
                enabled: true
            });
            portfolio.optimizationSettings.portfolioConstraints = [constraint];

            expect(service.transform(portfolio)).toEqual({
                data: [transformedConstraint]
            });
            expect(transformSpy).toHaveBeenCalledTimes(1);
            expect(transformSpy).toHaveBeenCalledWith(constraint);
        });
    });
});
