import {Injectable} from '@angular/core';
import {InvestmentUniverseItemBase} from '@models/portfolio/investmentUniverse/investment-universe-item-base.model';
import {Dictionary, isEmpty} from 'lodash';
import {InvestmentUniverseConstants} from '@constants/investment-universe.constants';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {InvestmentUniversePortfolio} from '@models/portfolio/investmentUniverse/investment-universe-portfolio.model';
import {InvestmentUniverseSecurity} from '@models/portfolio/investmentUniverse/investment-universe-security.model';
import {OptimizationSummaryDataTransformer} from '../optimization-summary-data-transformer.interface';
import {TYPE_INVESTMENT_UNIVERSE} from '@optimization-settings/constants/optimization-types.constants';
import {OptimizationSummaryData} from '@optimization-settings-configuration/models/optimization-summary-data.model';
import {
    SECURITY_LIST_TYPE,
    SECURITY_LIST_VALUE,
    SECURITY_NAME_SUFFIX
} from '../../constants/investment-universe.constants';
import {RiskParityCase} from '@enums/risk-parity-case.enum';

/**
 * This service transforms Explore investment universe models (InvestmentUniverseSettings)
 * into the OptimizationSummaryData format required by the optimization-configuration module.
 */
@Injectable({
    providedIn: 'root'
})
export class InvestmentUniverseTransformerService implements OptimizationSummaryDataTransformer {
    type(): string {
        return TYPE_INVESTMENT_UNIVERSE;
    }

    transform(portfolio: PortfolioWithPositions, isRiskParitySettings?: boolean): OptimizationSummaryData {
        const settings = isRiskParitySettings ? portfolio.riskParitySettings.investmentUniverseSettings : portfolio.optimizationSettings.investmentUniverseSettings;
        const data: Array<Dictionary<any>> = settings.investmentUniverse.filter(
            (investmentUniverseItem: InvestmentUniverseItemBase) => investmentUniverseItem.enabled
        ).map(
            (investmentUniverseItem: InvestmentUniverseItemBase) => ({
                type: this.getType(investmentUniverseItem.type),
                name: this.getName(investmentUniverseItem),
                ...(investmentUniverseItem instanceof InvestmentUniversePortfolio && !investmentUniverseItem.isFilterEmpty() ? {filter: true} : {}),
                label: investmentUniverseItem.label
            })
        );

        return {
            data: [...(isEmpty(data) ? this.createDefaultDataRows(portfolio.portName, portfolio.benchmark.name, portfolio, isRiskParitySettings) : []), ...data]
        };
    }

    private getType(type: string): string {
        return type === SECURITY_LIST_TYPE ? SECURITY_LIST_VALUE : type;
    }

    private getName(universe: InvestmentUniverseItemBase): string {
        if (universe.type === InvestmentUniverseConstants.PORTFOLIO || universe.type === InvestmentUniverseConstants.BENCHMARK) {
            return (universe as InvestmentUniversePortfolio).portfolio;
        } else if (universe.type === InvestmentUniverseConstants.SECURITY) {
            return `${(universe as InvestmentUniverseSecurity).securities.length} ${SECURITY_NAME_SUFFIX}`;
        }
        return undefined;
    }

    private createDefaultDataRows(portfolio: string, benchmark: string, port: PortfolioWithPositions, isRiskParitySettings?: boolean): Array<Dictionary<any>> {
        let investmentUniverseItems = [{
            type: InvestmentUniverseConstants.PORTFOLIO,
            name: portfolio,
            label: InvestmentUniverseConstants.PORTFOLIO
        }, {
            type: InvestmentUniverseConstants.BENCHMARK,
            name: benchmark,
            label: InvestmentUniverseConstants.BENCHMARK
        }];

        if (isRiskParitySettings && port.riskParitySettings.riskParityCase === RiskParityCase.ABSOLUTE) {
            investmentUniverseItems = investmentUniverseItems.slice(0, 1);
        }
        return investmentUniverseItems;
    }
}
