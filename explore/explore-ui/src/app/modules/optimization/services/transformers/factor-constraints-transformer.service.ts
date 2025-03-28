import {Injectable} from '@angular/core';
import {OptimizationSummaryDataTransformer} from '../optimization-summary-data-transformer.interface';
import {SUB_TYPE_FACTOR_CONSTRAINTS, TYPE_CONSTRAINTS} from '@optimization-settings/constants/optimization-types.constants';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {OptimizationSummaryData} from '@optimization-settings-configuration/models/optimization-summary-data.model';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {Dictionary, isEmpty} from 'lodash';
import {FactorConstraintTransformerService} from '@optimization-settings/constraints-settings/services/transformers/factor-constraint-transformer.service';

/**
 * This service transforms Explore factor constraint models (Constraint[])
 * into the OptimizationSummaryData format required by the optimization-configuration module.
 */
@Injectable({
    providedIn: 'root'
})
export class FactorConstraintsTransformerService implements OptimizationSummaryDataTransformer {
    constructor(private factorConstraintTransformerService: FactorConstraintTransformerService) {}

    type(): string {
        return TYPE_CONSTRAINTS;
    }

    subType(): string {
        return SUB_TYPE_FACTOR_CONSTRAINTS;
    }

    transform(portfolio: PortfolioWithPositions): OptimizationSummaryData {
        const factorConstraints: Constraint[] = portfolio.optimizationSettings.factorConstraints;
        if (isEmpty(factorConstraints)) {
            return {};
        }
        const data: Array<Dictionary<any>> = factorConstraints.filter(
            (constraint: Constraint) => constraint.enabled
        ).map(
            (constraint: Constraint) => this.factorConstraintTransformerService.transform(constraint)
        );

        return isEmpty(data) ? {} : {data};
    }
}
