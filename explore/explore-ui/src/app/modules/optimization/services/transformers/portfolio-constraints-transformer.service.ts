import {Dictionary, isEmpty, isNil} from 'lodash';
import {Injectable} from '@angular/core';
import {OptimizationSummaryDataTransformer} from '../optimization-summary-data-transformer.interface';
import {SUB_TYPE_PORTFOLIO_CONSTRAINTS, TYPE_CONSTRAINTS} from '@optimization-settings/constants/optimization-types.constants';
import {OptimizationSummaryData} from '@optimization-settings-configuration/models/optimization-summary-data.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {PortfolioConstraintTransformerService} from '@optimization-settings/constraints-settings/services/transformers/portfolio-constraint-transformer.service';
import {OptimizationConstants} from '@constants/optimization.constants';
import {DefinitionsStore} from '../../../../stores';
import {OptimizationConstraint} from '@models/definitions/optimization/optimization-constraint.model';
import {ExploreConstraintsSettingsService} from '@optimization-settings/constraints-settings/services/explore-constraints-settings.service';

/**
 * This service transforms Explore portfolio constraint models (Constraint[])
 * into the OptimizationSummaryData format required by the optimization-configuration module.
 */
@Injectable({
    providedIn: 'root'
})
export class PortfolioConstraintsTransformerService implements OptimizationSummaryDataTransformer {
    constructor(private portfolioConstraintTransformerService: PortfolioConstraintTransformerService, private exploreConstraintsSettingsService: ExploreConstraintsSettingsService) {}

    type(): string {
        return TYPE_CONSTRAINTS;
    }

    subType(): string {
        return SUB_TYPE_PORTFOLIO_CONSTRAINTS;
    }

    transform(portfolio: PortfolioWithPositions): OptimizationSummaryData {
        const portfolioConstraints: Constraint[] = portfolio.optimizationSettings.portfolioConstraints;
        if (!portfolioConstraints.some(el => el.constraintTag === OptimizationConstants.ALLOW_SHORT_POSITION_COL_TAG)) {
            // Add allow short position with default value no if it's already not present
            const allowShortPositionConstraint = DefinitionsStore.optimizationConstraint.find((optimizationConstraint: OptimizationConstraint) => optimizationConstraint.columnTag === OptimizationConstants.ALLOW_SHORT_POSITION_COL_TAG);
            if (!isNil(allowShortPositionConstraint)) {
                const constraint = this.exploreConstraintsSettingsService.createConstraint(allowShortPositionConstraint, undefined);
                // Adding default value as false
                constraint.optionValues = {ConstraintValue: 'false'};
                // Add the constraint as the first portfolio constraint
                portfolio.optimizationSettings.portfolioConstraints.splice(0, 0, constraint);
            }
        }
        const data: Array<Dictionary<any>> = portfolioConstraints.filter(
            (constraint: Constraint) => constraint.enabled
        ).map(
            (constraint: Constraint) => this.portfolioConstraintTransformerService.transform(constraint)
        );

        return isEmpty(data) ? {} : {data};
    }
}
