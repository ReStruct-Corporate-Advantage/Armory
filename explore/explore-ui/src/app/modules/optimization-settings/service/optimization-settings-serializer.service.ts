import {Injectable} from '@angular/core';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {InvestmentUniverseItemBase} from '@models/portfolio/investmentUniverse/investment-universe-item-base.model';
import {WorkspaceStore} from '../../../stores';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {InvestmentUniversePortfolio} from '@models/portfolio/investmentUniverse/investment-universe-portfolio.model';
import {InvestmentUniverseConstants} from '@constants/investment-universe.constants';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import _ from 'lodash';
import {RiskParitySettings} from '@models/portfolio/optimization/risk-parity-settings.model';

/**
 * This service is responsible for reading and writing the OptimizationSettings data from/to WorkspaceStore.
 */
@Injectable({
    providedIn: 'root'
})
export class OptimizationSettingsSerializerService {
    read(): OptimizationSettings {
        const portfolio: PortfolioWithPositions = WorkspaceStore.getCurrentPortfolio() as PortfolioWithPositions;
        const optimizationSettings = _.cloneDeep(portfolio.optimizationSettings);
        this.populateDefaultSettings(optimizationSettings, portfolio);

        return optimizationSettings;
    }

    private populateDefaultSettings(optimizationSettings: OptimizationSettings, portfolio: Portfolio) {
        if (!optimizationSettings) {
            optimizationSettings = new OptimizationSettings();
        }

        this.addDefaultInvestmentUniverseItems(optimizationSettings, portfolio);
        return optimizationSettings;
    }

    private addDefaultInvestmentUniverseItems(optimizationSettings: OptimizationSettings, portfolio: Portfolio) {
        const investmentUniverseSettings: InvestmentUniverseItemBase[] = optimizationSettings.investmentUniverseSettings.investmentUniverse;
        if (!_.isEmpty(investmentUniverseSettings)) {
            return;
        }

        investmentUniverseSettings.unshift(this.getInvestmentUniverseBaseItem(portfolio.benchmark.name, true));
        investmentUniverseSettings.unshift(this.getInvestmentUniverseBaseItem(portfolio.portName, false));
    }

    private getInvestmentUniverseBaseItem(portfolioName: string, isBench: boolean): InvestmentUniversePortfolio {
        const typeOrLabel: string = isBench ? InvestmentUniverseConstants.BENCHMARK : InvestmentUniverseConstants.PORTFOLIO;
        return new InvestmentUniversePortfolio({
            enabled: true,
            type: typeOrLabel,
            label: typeOrLabel,
            portfolio: portfolioName,
            isBench,
            isFrozen: true
        });
    }

    write(optimizationSettings: OptimizationSettings): boolean {
        const portfolio: PortfolioWithPositions = WorkspaceStore.getCurrentPortfolio() as PortfolioWithPositions;
        const hasChanges = !portfolio.optimizationSettings.equals(optimizationSettings);
        if (hasChanges) {
            optimizationSettings.isFirstLoad = portfolio.optimizationSettings.isFirstLoad;
            portfolio.optimizationSettings = optimizationSettings;
            portfolio.optimizationSettings.isModified = hasChanges;
            WorkspaceStore.updateCurrentPortfolio(portfolio);
        }
        return hasChanges;
    }

    /**
     * writes risk parity settings
     */
    writeRiskParity(riskParitySettings: RiskParitySettings): boolean {
        const portfolio: PortfolioWithPositions = WorkspaceStore.getCurrentPortfolio() as PortfolioWithPositions;
        const hasChanges = !portfolio.riskParitySettings.equals(riskParitySettings);
        if (hasChanges) {
            portfolio.riskParitySettings = riskParitySettings;
            portfolio.riskParitySettings.isModified = hasChanges;
            WorkspaceStore.updateCurrentPortfolio(portfolio);
        }
        return hasChanges;
    }

}
