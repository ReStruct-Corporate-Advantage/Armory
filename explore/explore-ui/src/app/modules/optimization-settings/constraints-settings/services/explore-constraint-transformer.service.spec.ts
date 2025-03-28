import {TestBed} from '@angular/core/testing';
import {ExploreConstraintTransformerService} from './explore-constraint-transformer.service';
import {PortfolioConstraintTransformerService} from './transformers/portfolio-constraint-transformer.service';
import {SectorConstraintTransformerService} from './transformers/sector-constraint-transformer.service';
import {SecurityConstraintTransformerService} from './transformers/security-constraint-transformer.service';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {
    RelaxationConstraintTransformerService
} from '@optimization-settings/constraints-settings/services/transformers/relaxation-constraint-transformer.service';

describe('ExploreConstraintTransformerService', () => {
    let service: ExploreConstraintTransformerService;
    let service1: PortfolioConstraintTransformerService;
    let service2: SectorConstraintTransformerService;
    let service3: SecurityConstraintTransformerService;
    let service4: RelaxationConstraintTransformerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{
                provide: PortfolioConstraintTransformerService,
                useValue: {
                    type: jest.fn(() => '1'),
                    transform: jest.fn()
                }
            }, {
                provide: SectorConstraintTransformerService,
                useValue: {
                    type: jest.fn(() => '2'),
                    transform: jest.fn()
                }
            }, {
                provide: SecurityConstraintTransformerService,
                useValue: {
                    type: jest.fn(() => '3'),
                    transform: jest.fn()
                }
            }, {
                provide: RelaxationConstraintTransformerService,
                useValue: {
                    type: jest.fn(() => '4'),
                    transform: jest.fn()
                }
            }]
        });

        service = TestBed.inject(ExploreConstraintTransformerService);
        service1 = TestBed.inject(PortfolioConstraintTransformerService);
        service2 = TestBed.inject(SectorConstraintTransformerService);
        service3 = TestBed.inject(SecurityConstraintTransformerService);
        service4 = TestBed.inject(RelaxationConstraintTransformerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('should transform', () => {
        it('should return empty object if no supported', () => {
            const constraint: Constraint = new Constraint({title: 'title'});

            expect(service.transform(constraint, '5')).toEqual({});
        });

        it('should transform for portfolio constraints', () => {
            const constraint: Constraint = new Constraint({title: 'title'});
            const transformSpy = jest.spyOn(service1, 'transform');
            transformSpy.mockReturnValue({id: 1});

            expect(service.transform(constraint, '1')).toEqual({id: 1});
            expect(transformSpy).toHaveBeenCalledTimes(1);
            expect(transformSpy).toHaveBeenCalledWith(constraint);
        });

        it('should transform for sector constraints', () => {
            const constraint: Constraint = new Constraint({title: 'title'});
            const transformSpy = jest.spyOn(service2, 'transform');
            transformSpy.mockReturnValue({id: 2});

            expect(service.transform(constraint, '2')).toEqual({id: 2});
            expect(transformSpy).toHaveBeenCalledTimes(1);
            expect(transformSpy).toHaveBeenCalledWith(constraint);
        });

        it('should transform for security constraints', () => {
            const constraint: Constraint = new Constraint({title: 'title'});
            const transformSpy = jest.spyOn(service3, 'transform');
            transformSpy.mockReturnValue({id: 3});

            expect(service.transform(constraint, '3')).toEqual({id: 3});
            expect(transformSpy).toHaveBeenCalledTimes(1);
            expect(transformSpy).toHaveBeenCalledWith(constraint);
        });

        it('should transform for relaxation constraints', () => {
            const constraint: Constraint = new Constraint({title: 'title'});
            const transformSpy = jest.spyOn(service4, 'transform');
            transformSpy.mockReturnValue({id: 4});

            expect(service.transform(constraint, '4')).toEqual({id: 4});
            expect(transformSpy).toHaveBeenCalledTimes(1);
            expect(transformSpy).toHaveBeenCalledWith(constraint);
        });
    });
});
