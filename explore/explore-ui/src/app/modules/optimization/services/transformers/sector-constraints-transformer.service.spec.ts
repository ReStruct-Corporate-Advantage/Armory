import {TestBed} from '@angular/core/testing';
import {SectorConstraintsTransformerService} from './sector-constraints-transformer.service';
import {SUB_TYPE_SECTOR_CONSTRAINTS, TYPE_CONSTRAINTS} from '@optimization-settings/constants/optimization-types.constants';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {SectorConstraintTransformerService} from '@optimization-settings/constraints-settings/services/transformers/sector-constraint-transformer.service';
import {Dictionary} from 'lodash';

describe('SectorConstraintsTransformerService', () => {
    let service: SectorConstraintsTransformerService;
    let sectorConstraintTransformerService: SectorConstraintTransformerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{
                provide: SectorConstraintTransformerService,
                useValue: {
                    transform: jest.fn()
                }
            }]
        });

        service = TestBed.inject(SectorConstraintsTransformerService);
        sectorConstraintTransformerService = TestBed.inject(SectorConstraintTransformerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return type', () => {
        expect(service.type()).toEqual(TYPE_CONSTRAINTS);
    });

    it('should return sub type', () => {
        expect(service.subType()).toEqual(SUB_TYPE_SECTOR_CONSTRAINTS);
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
                    sectorConstraintType: 'type',
                    ConstraintLowerBound: 1,
                    ConstraintUpperBound: 2,
                    breakdownTree: {
                        isEmpty: jest.fn(() => true)
                    }
                },
                relaxationValue: 1,
                enabled: false
            });
            portfolio.optimizationSettings.sectorConstraints = [constraint];

            expect(service.transform(portfolio)).toEqual({});
        });

        it('should return transformed object when constraints', () => {
            const portfolio = new PortfolioWithPositions();
            const transformSpy = jest.spyOn(sectorConstraintTransformerService, 'transform');
            const transformedConstraint: Dictionary<any> = {
                constraint: 'title',
                value: 'val',
                name: undefined,
                lowerBound: 1,
                upperBound: 2,
                relaxation: true
            };
            transformSpy.mockReturnValue(transformedConstraint);
            const constraint = new Constraint({
                title: 'title',
                optionValues: {
                    sectorConstraintType: 'type',
                    ConstraintLowerBound: 1,
                    ConstraintUpperBound: 2,
                    breakdownTree: {
                        isEmpty: jest.fn(() => true)
                    }
                },
                relaxationValue: 1,
                enabled: true
            });
            portfolio.optimizationSettings.sectorConstraints = [constraint];

            expect(service.transform(portfolio)).toEqual({
                data: [transformedConstraint]
            });
            expect(transformSpy).toHaveBeenCalledTimes(1);
            expect(transformSpy).toHaveBeenCalledWith(constraint);
        });
    });
});
