import {TestBed} from '@angular/core/testing';
import {ObjectivesTransformerService} from './objectives-transformer.service';
import {TYPE_OBJECTIVES} from '@optimization-settings/constants/optimization-types.constants';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {OptimizationConstants} from '@constants/optimization.constants';
import {DefinitionsStore} from '../../../../stores';
import {Objectives} from '@models/definitions/optimization/objectives.model';
import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';

describe('ObjectivesTransformerService', () => {
    let service: ObjectivesTransformerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.inject(ObjectivesTransformerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return type', () => {
        expect(service.type()).toEqual(TYPE_OBJECTIVES);
    });

    describe('should transform', () => {
        it('should return empty object if no objectives', () => {
            const portfolio = new PortfolioWithPositions();
            portfolio.optimizationSettings.objectiveSettings.portfolioObjectives = null;
            expect(service.transform(portfolio)).toEqual({});
        });

        it('should filter out disabled', () => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            portfolio.optimizationSettings.objectiveSettings.portfolioObjectives = [
                new PortfolioObjective({
                    key: 'key',
                    weight: 1,
                    enabled: false
                })
            ];
            portfolio.optimizationSettings.objectiveSettings.objectivesType = OptimizationConstants.ABSOLUTE_OBJECTIVE_TYPE;

            expect(service.transform(portfolio)).toEqual({});
        });

        it('should return valid object when data', () => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            portfolio.optimizationSettings.objectiveSettings.portfolioObjectives = [
                new PortfolioObjective({
                    key: 'key',
                    weight: 1,
                    enabled: true
                })
            ];
            portfolio.optimizationSettings.objectiveSettings.objectivesType = OptimizationConstants.ABSOLUTE_OBJECTIVE_TYPE;
            DefinitionsStore.optimizationObjective = [
                new Objectives({
                    objectiveKey: 'key',
                    objectiveDisplayValue: 'val'
                })
            ];

            expect(service.transform(portfolio)).toEqual({
                data: [
                    {
                        objective: 'val',
                        weight: 1
                    }
                ],
                additionalData: {
                    optionsValue: OptimizationConstants.ABSOLUTE_OBJECTIVE_TYPE
                }
            });
        });

        it('should default to objective key when no display value', () => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            portfolio.optimizationSettings.objectiveSettings.portfolioObjectives = [
                new PortfolioObjective({
                    key: 'key',
                    weight: 1,
                    enabled: true
                })
            ];
            portfolio.optimizationSettings.objectiveSettings.objectivesType = OptimizationConstants.ABSOLUTE_OBJECTIVE_TYPE;
            DefinitionsStore.optimizationObjective = [];

            expect(service.transform(portfolio)).toEqual({
                data: [
                    {
                        objective: 'key',
                        weight: 1
                    }
                ],
                additionalData: {
                    optionsValue: OptimizationConstants.ABSOLUTE_OBJECTIVE_TYPE
                }
            });
        });
    });
});
