import {InvestmentUniverseSettings} from '@models/portfolio/investmentUniverse/investment-universe-settings.model';
import {InvestmentUniversePortfolio} from '@models/portfolio/investmentUniverse/investment-universe-portfolio.model';
import {InvestmentUniverseConstants} from '../../../constants/investment-universe.constants';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {ObjectiveSettings} from '@models/portfolio/objectives/objective.settings.model';
import {InvestmentUniverseSecurity} from '@models/portfolio/investmentUniverse/investment-universe-security.model';
import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';
import {StressScenarioPortfolioObjective} from '@models/portfolio/objectives/stress-scenario-portfolio-objective.model';

export function getInvestmentUniverseSettingsData(): InvestmentUniverseSettings {
    const invesmentUniverseSettingFrozen = new InvestmentUniversePortfolio({
        enabled: false,
        type: InvestmentUniverseConstants.PORTFOLIO,
        label: 'PEP_Test',
        isFrozen: true
    });
    invesmentUniverseSettingFrozen.portfolio = 'PEP';
    const invesmentUniverseSettingBenchFrozen = new InvestmentUniversePortfolio({
        enabled: false,
        type: InvestmentUniverseConstants.BENCHMARK,
        label: 'Benchmark',
        isFrozen: true
    });
    invesmentUniverseSettingFrozen.portfolio = 'BENCH';
    invesmentUniverseSettingFrozen.isBench = true;

    const investmentUniverseSettings = new InvestmentUniverseSettings();
    investmentUniverseSettings.investmentUniverse.push(invesmentUniverseSettingFrozen);
    investmentUniverseSettings.investmentUniverse.push(invesmentUniverseSettingBenchFrozen);
    investmentUniverseSettings.investmentUniverse.push(getInvestmentUniverseSettingPortfolio());
    investmentUniverseSettings.investmentUniverse.push(getInvestmentUniverseSettingSecurity());
    return investmentUniverseSettings;
}

export function getInvestmentUniverseSettingPortfolio() {
    return new InvestmentUniversePortfolio({
        enabled: false,
        type: InvestmentUniverseConstants.PORTFOLIO,
        label: '',
        isFrozen: false
    });
}

export function getInvestmentUniverseSettingSecurity() {
    const investmentUniverseSettingSecurity = new InvestmentUniverseSecurity({
        enabled: false,
        type: InvestmentUniverseConstants.SECURITY,
        label: '',
        isFrozen: false
    });
    investmentUniverseSettingSecurity.securities = ['S1', 'S2'];

    return investmentUniverseSettingSecurity;
}

export function getOptimizationSettingsTestData() {
    const optimizationSettings: OptimizationSettings = new OptimizationSettings();

    optimizationSettings.investmentUniverseSettings = getInvestmentUniverseSettingsData();

    optimizationSettings.objectiveSettings = new ObjectiveSettings();

    optimizationSettings.portfolioConstraints = [];
    optimizationSettings.sectorConstraints = [];
    optimizationSettings.securityConstraints = [];

    return optimizationSettings;
}

export function getObjectiveSettingsTestData(): ObjectiveSettings {
    const objectiveSettings: ObjectiveSettings = new ObjectiveSettings();

    objectiveSettings.portfolioObjectives.push(getPortfolioObjectiveTestData());

    objectiveSettings.portfolioObjectives.push(
        new PortfolioObjective({
            enabled: false,
            weight: 1.0,
            key: 'Test2'
        })
    );

    objectiveSettings.portfolioObjectives.push(getStressPortfolioObjectiveTestData());

    return objectiveSettings;
}

export function getStressPortfolioObjectiveTestData(): PortfolioObjective {
    return new StressScenarioPortfolioObjective({
        enabled: false,
        weight: 1.0,
        key: 'Test2',
        stressScenario: 'TestStressScenario'
    });
}

export function getPortfolioObjectiveTestData(): PortfolioObjective {
    return new PortfolioObjective({
        enabled: true,
        weight: 0.5,
        key: 'TestKey'
    });
}
