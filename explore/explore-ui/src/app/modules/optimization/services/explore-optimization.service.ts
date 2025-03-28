import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {OptimizationSummary} from '@optimization-settings-configuration/models/optimization-summary.model';
import {OptimizationSummaryData} from '@optimization-settings-configuration/models/optimization-summary-data.model';
import {OptimizationService} from '@optimization-configuration/services/optimization-service.interface';
import {
    OPTIMIZATION_SUMMARIES,
    RISK_PARITY_OPTIMIZATION_SUMMARIES,
    RISK_PARITY_OPTIMIZATION_SUMMARIES_TIER_DEFINITION
} from '@optimization-settings/constants/optimization-summaries.constants';
import {map} from 'rxjs/operators';
import {OptimizationDataService} from './optimization-data.service';
import {ObjectivesTransformerService} from './transformers/objectives-transformer.service';
import {InvestmentUniverseTransformerService} from './transformers/investment-universe-transformer.service';
import {OptimizationSummaryDataTransformer} from './optimization-summary-data-transformer.interface';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {PortfolioConstraintsTransformerService} from './transformers/portfolio-constraints-transformer.service';
import {SectorConstraintsTransformerService} from './transformers/sector-constraints-transformer.service';
import {SecurityConstraintsTransformerService} from './transformers/security-constraints-transformer.service';
import {AuxNotificationGroupConfig, AuxNotificationStyleEnum} from '@blk/aladdin-angular-components';
import {v4 as uuid} from 'uuid';
import {OPTIMIZATION_UPDATE_RUN_MESSAGE} from '@optimization-settings/constants/optimization-notification-messages.constants';
import {FactorConstraintsTransformerService} from './transformers/factor-constraints-transformer.service';
import {ScreeningFilterTransformerService} from './transformers/screening-filter-transformer.service';
import {TierDefinitionsTransformerService} from './transformers/tier-definitions-transformer.service';
import {RiskParityCase} from '@enums/risk-parity-case.enum';
import {OptimizationTypeEnum} from '@enums/optimization-type.enum';
import {SecurityConstraintRiskParityService} from './transformers/security-constraint-risk-parity.service';
import {TokenUtils, TokenConstants} from '@blk/explore-ui-core';

@Injectable({
    providedIn: 'root'
})
export class ExploreOptimizationService implements OptimizationService {
    private readonly TIER_DEFINITION_SUMMARY_INDEX = 3;
    private readonly FIXED_ASSET_RATIO_INDEX = 4;
    private transformers: Map<string, OptimizationSummaryDataTransformer>;
    private readonly isFixedAssetRatioEnabled = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_RISK_BUDGET_TIER_VISIBLE);

    constructor(
        private optimizationDataService: OptimizationDataService,
        private investmentUniverseTransformerService: InvestmentUniverseTransformerService,
        private objectivesTransformerService: ObjectivesTransformerService,
        private portfolioConstraintsTransformerService: PortfolioConstraintsTransformerService,
        private securityConstraintsTransformerService: SecurityConstraintsTransformerService,
        private sectorConstraintsTransformerService: SectorConstraintsTransformerService,
        private factorConstraintsTransformerService: FactorConstraintsTransformerService,
        private screeningFilterTransformerService: ScreeningFilterTransformerService,
        private tierDefinitionsTransformerService: TierDefinitionsTransformerService,
        private securityConstraintRiskParityService: SecurityConstraintRiskParityService
    ) {
        this.transformers = new Map(
            [
                this.investmentUniverseTransformerService,
                this.objectivesTransformerService,
                this.portfolioConstraintsTransformerService,
                this.securityConstraintsTransformerService,
                this.sectorConstraintsTransformerService,
                this.factorConstraintsTransformerService,
                this.screeningFilterTransformerService,
                this.tierDefinitionsTransformerService,
                this.securityConstraintRiskParityService
            ].map((transformer: OptimizationSummaryDataTransformer) => [
                this.getKey(transformer.type(), typeof transformer.subType === 'function' ? transformer.subType() : undefined),
                transformer
            ])
        );
    }

    getOptimizationSummaries$(): Observable<OptimizationSummary[]> {
        return of(OPTIMIZATION_SUMMARIES);
    }

    /**
     * returns risk parity optimization summaries
     */
    getRiskParityOptimizationSummaries$(riskParityCase: RiskParityCase): Observable<OptimizationSummary[]> {
        if (this.isFixedAssetRatioEnabled) {
            RISK_PARITY_OPTIMIZATION_SUMMARIES_TIER_DEFINITION[this.TIER_DEFINITION_SUMMARY_INDEX].columns[this.FIXED_ASSET_RATIO_INDEX] = {field: 'riskBudgetFixedAssetRatio', headerName: 'Tier 3 Risk Contribution Ratio'};
        }
        return of(riskParityCase === RiskParityCase.ACTIVE ? RISK_PARITY_OPTIMIZATION_SUMMARIES_TIER_DEFINITION : RISK_PARITY_OPTIMIZATION_SUMMARIES);
    }

    /**
     * calls the required transformer and returns the summary data
     */
    getOptimizationSummaryData$(optimizationId: string, type: string, subType?: string): Observable<OptimizationSummaryData> {
        return this.optimizationDataService.getPortfolioWithPositions$().pipe(
            map((portfolio: PortfolioWithPositions) => {
                    if (portfolio) {
                        const transformer: OptimizationSummaryDataTransformer = this.transformers.get(this.getKey(type, subType));
                        if (transformer) {
                            return transformer.transform(portfolio, portfolio.optimizationType === OptimizationTypeEnum.RISK_BUDGETING);
                        }
                    }
                    return {};
                }
            )
        );
    }

    getRunUpdateNotification(): AuxNotificationGroupConfig {
        return {
            message: OPTIMIZATION_UPDATE_RUN_MESSAGE,
            notificationStyle: AuxNotificationStyleEnum.MESSAGE,
            id: uuid()
        };
    }

    private getKey(type: string, subType?: string) {
        return subType ? `${type}-${subType}` : type;
    }
}
