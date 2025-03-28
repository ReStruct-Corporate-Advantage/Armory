import {Injectable} from '@angular/core';
import {OptimizationSummaryDataTransformer} from '../optimization-summary-data-transformer.interface';
import {SUB_TYPE_SECURITY_CONSTRAINTS, TYPE_CONSTRAINTS} from '@optimization-settings/constants/optimization-types.constants';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {OptimizationSummaryData} from '@optimization-settings-configuration/models/optimization-summary-data.model';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {Dictionary, isEmpty} from 'lodash';
import {SecurityConstraintTransformerService} from '@optimization-settings/constraints-settings/services/transformers/security-constraint-transformer.service';

/**
 * This service transforms Explore security constraint models (Constraint[])
 * into the OptimizationSummaryData format required by the optimization-configuration module.
 */
@Injectable({
    providedIn: 'root'
})
export class SecurityConstraintsTransformerService implements OptimizationSummaryDataTransformer {
    constructor(private securityConstraintTransformerService: SecurityConstraintTransformerService) {}

    type(): string {
        return TYPE_CONSTRAINTS;
    }

    subType(): string {
        return SUB_TYPE_SECURITY_CONSTRAINTS;
    }

    transform(portfolio: PortfolioWithPositions): OptimizationSummaryData {
        const securityConstraints: Constraint[] = portfolio.optimizationSettings.securityConstraints;
        if (isEmpty(securityConstraints)) {
            return {};
        }
        const data: Array<Dictionary<any>> = securityConstraints.filter(
            (constraint: Constraint) => constraint.enabled
        ).map(
            (constraint: Constraint) => this.securityConstraintTransformerService.transform(constraint)
        );

        return isEmpty(data) ? {} : {data};
    }
}
