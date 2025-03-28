import {TestBed} from '@angular/core/testing';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {OptimizationSettingsSerializerService} from './optimization-settings-serializer.service';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {WorkspaceStore} from '../../../stores';
import {BenchmarkConstants} from '../../../constants';
import {InvestmentUniversePortfolio} from '@models/portfolio/investmentUniverse/investment-universe-portfolio.model';
import {InvestmentUniverseConstants} from '../../../constants/investment-universe.constants';
import {RiskParitySettings} from '@models/portfolio/optimization/risk-parity-settings.model';

describe('OptimizationSettingsInitializerService', () => {
    let service: OptimizationSettingsSerializerService;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OptimizationSettingsSerializerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should read', () => {
        const portfolio: PortfolioWithPositions = new PortfolioWithPositions('TestPf');
        portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_PRIMARY, 1, 'TestBench');
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentPortfolio(portfolio);
        const optimizationSettings: OptimizationSettings = service.read();
        expect(optimizationSettings).toBeTruthy();
        expect(optimizationSettings.investmentUniverseSettings.investmentUniverse.length).toEqual(2);
    });

    it('should write', () => {
        const portfolio: PortfolioWithPositions = new PortfolioWithPositions('PEP');
        portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_PRIMARY, 1, 'TestBench');
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentPortfolio(portfolio);

        const optimizationSettings: OptimizationSettings = new OptimizationSettings();
        const investmentUniverseItem: InvestmentUniversePortfolio = new InvestmentUniversePortfolio({
            enabled: false,
            type: InvestmentUniverseConstants.PORTFOLIO,
            label: 'PEP_Test',
            isFrozen: true
        });
        investmentUniverseItem.portfolio = 'PEP';
        optimizationSettings.investmentUniverseSettings.investmentUniverse.push(investmentUniverseItem);

        expect(service.write(optimizationSettings)).toEqual(true);

        const portfolioWithPositions: PortfolioWithPositions = WorkspaceStore.getCurrentPortfolio() as PortfolioWithPositions;
        expect(portfolioWithPositions.optimizationSettings.investmentUniverseSettings.investmentUniverse.length).toEqual(1);
    });

    it('should write risk parity', () => {
        const portfolio: PortfolioWithPositions = new PortfolioWithPositions('PEP');
        portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_PRIMARY, 1, 'TestBench');
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentPortfolio(portfolio);

        const riskParitysettings: RiskParitySettings = new RiskParitySettings();
        const investmentUniverseItem: InvestmentUniversePortfolio = new InvestmentUniversePortfolio({
            enabled: false,
            type: InvestmentUniverseConstants.PORTFOLIO,
            label: 'PEP_Test',
            isFrozen: true
        });
        investmentUniverseItem.portfolio = 'PEP';
        riskParitysettings.investmentUniverseSettings.investmentUniverse.push(investmentUniverseItem);

        expect(service.writeRiskParity(riskParitysettings)).toEqual(true);

        const portfolioWithPositions: PortfolioWithPositions = WorkspaceStore.getCurrentPortfolio() as PortfolioWithPositions;
        expect(portfolioWithPositions.riskParitySettings.investmentUniverseSettings.investmentUniverse.length).toEqual(1);
    });
});
