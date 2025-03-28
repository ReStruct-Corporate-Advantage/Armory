import {Injectable} from '@angular/core';
import {OptimizationSummaryDataTransformer} from '../optimization-summary-data-transformer.interface';
import {TYPE_OBJECTIVES} from '@optimization-settings/constants/optimization-types.constants';
import {OptimizationSummaryData} from '@optimization-settings-configuration/models/optimization-summary-data.model';
import {Dictionary, isEmpty, isNil} from 'lodash';
import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';
import {DefinitionsStore} from '../../../../stores';
import {Objectives} from '@models/definitions/optimization/objectives.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {ObjectiveSettings} from '@models/portfolio/objectives/objective.settings.model';
import {CompositionConstants} from '@constants/composition.constants';

/**
 * This service transforms Explore objectives models (ObjectiveSettings)
 * into the OptimizationSummaryData format required by the optimization-configuration module.
 */
@Injectable({
    providedIn: 'root'
})
export class ObjectivesTransformerService implements OptimizationSummaryDataTransformer {
    type(): string {
        return TYPE_OBJECTIVES;
    }

    transform(portfolio: PortfolioWithPositions, isRiskParitySettings?: boolean): OptimizationSummaryData {
        const objectiveSettings: ObjectiveSettings = isRiskParitySettings ? portfolio.riskParitySettings.objectiveSettings : portfolio.optimizationSettings.objectiveSettings;
        if (isEmpty(objectiveSettings.portfolioObjectives)) {
            return {};
        }
        const data: Array<Dictionary<any>> = objectiveSettings.portfolioObjectives.filter(
            (portfolioObjective: PortfolioObjective) => portfolioObjective.enabled
        ).map(
            (portfolioObjective: PortfolioObjective) => ({
                objective: this.convertKey(portfolioObjective.key, objectiveSettings),
                weight: portfolioObjective.weight
            })
        );

        return isEmpty(data) ? {} : {
            data,
            additionalData: {
                optionsValue: objectiveSettings.objectivesType
            }
        };
    }

    private convertKey(key: string, objectiveSettings: ObjectiveSettings): string {
        const objectives: Objectives = DefinitionsStore.optimizationObjective.find(
            (objectivesFromStore: Objectives) => key === objectivesFromStore.objectiveKey
        );

        if (isNil(objectives)) {
            return key;
        }
        return objectiveSettings.riskParityEnabled ? CompositionConstants.RISK_PARITY_OBJECTIVES.get(objectives.objectiveKey) : objectives.objectiveDisplayValue;
    }
}
