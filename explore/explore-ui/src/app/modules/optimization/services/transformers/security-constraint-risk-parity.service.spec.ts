import {TestBed} from '@angular/core/testing';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {SecurityConstraintRiskParityService} from './security-constraint-risk-parity.service';
import {Security} from '@interfaces/security.interface';

describe('SecurityConstraintRiskParityService', () => {
    let service: SecurityConstraintRiskParityService;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.inject(SecurityConstraintRiskParityService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return type', () => {
        expect(service.type()).toEqual('security_constraints_risk_budgeting');
    });

    describe('should transform', () => {
        it('should return empty object if no objectives', () => {
            expect(service.transform(new PortfolioWithPositions())).toEqual({});
        });

        it('should return valid object when data', () => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            portfolio.riskParitySettings.securityConstraints = new Map<string, Security>();
            portfolio.riskParitySettings.securityConstraints.set('abc', {});
            expect(service.transform(portfolio)).toEqual({
                'data': [
                    {
                        'security_constraints': 'Custom Security List'
                    }
                ]
            });

            portfolio.riskParitySettings.securityConstraints = new Map<string, Security>();
            expect(service.transform(portfolio)).toEqual({
            });
        });
    });
});
