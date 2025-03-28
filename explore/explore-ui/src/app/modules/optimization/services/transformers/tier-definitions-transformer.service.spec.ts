import {TierDefinitionsTransformerService} from './tier-definitions-transformer.service';
import {TestBed} from '@angular/core/testing';
import {TYPE_TIERS} from '@optimization-settings/constants/optimization-types.constants';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import { TierDefinition } from '@models/portfolio/optimization/tier-definition.model';

describe('TierDefinitionsTransformerService', () => {
    let service: TierDefinitionsTransformerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.inject(TierDefinitionsTransformerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return type', () => {
        expect(service.type()).toEqual(TYPE_TIERS);
    });

    describe('should transform', () => {
        it('should return empty object if no objectives', () => {
            expect(service.transform(new PortfolioWithPositions())).toEqual({});
        });

        it('should return valid object when data', function () {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            portfolio.riskParitySettings.tierDefinitions = new TierDefinition();
            portfolio.riskParitySettings.tierDefinitions.tierOne = 1;
            portfolio.riskParitySettings.tierDefinitions.tierTwo = 2;
            portfolio.riskParitySettings.tierDefinitions.tierType = 0;
            expect(service.transform(portfolio)).toEqual({
                'data': [{
                    'tierType': 'Name',
                    'tierOne': 1,
                    'tierTwo': 2
                }]
            });
        });
    });
});
