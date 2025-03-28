import {Injectable} from '@angular/core';
import {OptimizationSummaryDataTransformer} from '../optimization-summary-data-transformer.interface';
import {TYPE_TIERS} from '@optimization-settings/constants/optimization-types.constants';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {OptimizationSummaryData} from '@optimization-settings-configuration/models/optimization-summary-data.model';
import {TierDefinition} from '@models/portfolio/optimization/tier-definition.model';
import {Dictionary, isNil} from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class TierDefinitionsTransformerService implements OptimizationSummaryDataTransformer {
    type(): string {
        return TYPE_TIERS;
    }

    transform(portfolio: PortfolioWithPositions):  OptimizationSummaryData {
        const tierRiskParitySettings: TierDefinition = portfolio.riskParitySettings.tierDefinitions;
        if (isNil(tierRiskParitySettings)) {
            return {};
        }
        const data: Dictionary<any>[] = [{
                tierType: tierRiskParitySettings.tierType === 0 ? 'Name' : 'Percentile',
                tierOne: tierRiskParitySettings.tierOne,
                tierTwo: tierRiskParitySettings.tierTwo,
                riskBudgetTierRatio: tierRiskParitySettings.riskBudgetTierRatio,
                ...(!isNil(tierRiskParitySettings.riskBudgetFixedAssetRatio) ? {riskBudgetFixedAssetRatio: tierRiskParitySettings.riskBudgetFixedAssetRatio} : {})
        }];
        return isNil(tierRiskParitySettings.tierOne) && isNil(tierRiskParitySettings.tierTwo) ? {} : {data};
    }
}
