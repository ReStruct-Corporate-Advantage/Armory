import {TestBed} from '@angular/core/testing';
import {InvestmentUniverseTransformerService} from './investment-universe-transformer.service';
import {TYPE_INVESTMENT_UNIVERSE} from '@optimization-settings/constants/optimization-types.constants';
import {InvestmentUniverseConstants} from '@constants/investment-universe.constants';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {Dictionary} from 'lodash';
import {InvestmentUniverseSecurity} from '@models/portfolio/investmentUniverse/investment-universe-security.model';
import {InvestmentUniversePortfolio} from '@models/portfolio/investmentUniverse/investment-universe-portfolio.model';
import {SECURITY_LIST_TYPE, SECURITY_LIST_VALUE, SECURITY_NAME_SUFFIX} from '../../constants/investment-universe.constants';

describe('InvestmentUniverseTransformerService', () => {
    let service: InvestmentUniverseTransformerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.inject(InvestmentUniverseTransformerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return type', () => {
        expect(service.type()).toEqual(TYPE_INVESTMENT_UNIVERSE);
    });

    describe('should transform', () => {
        let portfolio: PortfolioWithPositions;
        let data: Array<Dictionary<any>>;

        beforeEach(() => {
            const portfolioName = 'port';
            const benchmark = 'bench';
            portfolio = new PortfolioWithPositions(portfolioName);
            portfolio.benchmark = new Benchmark({name: benchmark});
            data = [
                {
                    type: InvestmentUniverseConstants.PORTFOLIO,
                    name: portfolioName,
                    label: InvestmentUniverseConstants.PORTFOLIO
                },
                {
                    type: InvestmentUniverseConstants.BENCHMARK,
                    name: benchmark,
                    label: InvestmentUniverseConstants.BENCHMARK
                }
            ];
        });

        it('should return default data', () => {
            expect(service.transform(portfolio)).toEqual({
                data
            });
        });

        it('should filter disabled', () => {
            portfolio.optimizationSettings.investmentUniverseSettings.investmentUniverse = [
                new InvestmentUniverseSecurity({
                    securities: ['test'],
                    type: SECURITY_LIST_TYPE,
                    label: 'label',
                    enabled: false
                })
            ];
            expect(service.transform(portfolio)).toEqual({
                data
            });
        });

        it('should return security list type', () => {
            portfolio.optimizationSettings.investmentUniverseSettings.investmentUniverse = [
                new InvestmentUniverseSecurity({
                    securities: ['test'],
                    type: SECURITY_LIST_TYPE,
                    label: 'label',
                    enabled: true
                })
            ];
            expect(service.transform(portfolio)).toEqual({
                data: [
                    {
                        type: SECURITY_LIST_VALUE,
                        name: undefined,
                        label: 'label'
                    }
                ]
            });
        });

        it('should return security name', () => {
            portfolio.optimizationSettings.investmentUniverseSettings.investmentUniverse = [
                new InvestmentUniverseSecurity({
                    securities: ['test'],
                    type: InvestmentUniverseConstants.SECURITY,
                    label: 'label',
                    enabled: true
                })
            ];
            expect(service.transform(portfolio)).toEqual({
                data: [
                    {
                        type: InvestmentUniverseConstants.SECURITY,
                        name: `1 ${SECURITY_NAME_SUFFIX}`,
                        label: 'label'
                    }
                ]
            });
        });

        it('should return portfolio name', () => {
            portfolio.optimizationSettings.investmentUniverseSettings.investmentUniverse = [
                new InvestmentUniversePortfolio({
                    portfolio: 'portfolio',
                    type: InvestmentUniverseConstants.PORTFOLIO,
                    label: 'label',
                    enabled: true
                })
            ];
            expect(service.transform(portfolio)).toEqual({
                data: [
                    {
                        type: InvestmentUniverseConstants.PORTFOLIO,
                        name: 'portfolio',
                        label: 'label'
                    }
                ]
            });
        });

        it('should return benchmark name', () => {
            portfolio.optimizationSettings.investmentUniverseSettings.investmentUniverse = [
                new InvestmentUniversePortfolio({
                    portfolio: 'portfolio',
                    type: InvestmentUniverseConstants.BENCHMARK,
                    label: 'label',
                    enabled: true
                })
            ];
            expect(service.transform(portfolio)).toEqual({
                data: [
                    {
                        type: InvestmentUniverseConstants.BENCHMARK,
                        name: 'portfolio',
                        label: 'label'
                    }
                ]
            });
        });

        it('should return undefined name', () => {
            portfolio.optimizationSettings.investmentUniverseSettings.investmentUniverse = [
                new InvestmentUniverseSecurity({
                    securities: ['test'],
                    type: 'other',
                    label: 'label',
                    enabled: true
                })
            ];
            expect(service.transform(portfolio)).toEqual({
                data: [
                    {
                        type: 'other',
                        name: undefined,
                        label: 'label'
                    }
                ]
            });
        });
    });
});
