import {Injectable} from '@angular/core';
import {OptimizationSummaryDataTransformer} from '../optimization-summary-data-transformer.interface';
import {SUB_TYPE_SECTOR_CONSTRAINTS, TYPE_CONSTRAINTS} from '@optimization-settings/constants/optimization-types.constants';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {OptimizationSummaryData} from '@optimization-settings-configuration/models/optimization-summary-data.model';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {Dictionary, isEmpty} from 'lodash';
import {SectorConstraintTransformerService} from '@optimization-settings/constraints-settings/services/transformers/sector-constraint-transformer.service';

/**
 * This service transforms Explore sector constraint models (Constraint[])
 * into the OptimizationSummaryData format required by the optimization-configuration module.
 */
@Injectable({
    providedIn: 'root'
})
export class SectorConstraintsTransformerService implements OptimizationSummaryDataTransformer {
    constructor(private sectorConstraintTransformerService: SectorConstraintTransformerService) {}

    type(): string {
        return TYPE_CONSTRAINTS;
    }

    subType(): string {
        return SUB_TYPE_SECTOR_CONSTRAINTS;
    }

    transform(portfolio: PortfolioWithPositions): OptimizationSummaryData {
        const sectorConstraints: Constraint[] = portfolio.optimizationSettings.sectorConstraints;
        if (isEmpty(sectorConstraints)) {
            return {};
        }
        const data: Array<Dictionary<any>> = sectorConstraints.filter(
            (constraint: Constraint) => constraint.enabled
        ).map(
            (constraint: Constraint) => this.sectorConstraintTransformerService.transform(constraint)
        );

        return isEmpty(data) ? {} : {data};
    }
}
