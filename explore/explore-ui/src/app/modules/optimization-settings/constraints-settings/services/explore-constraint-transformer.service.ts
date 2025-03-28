import {Injectable} from '@angular/core';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {Dictionary} from 'lodash';
import {PortfolioConstraintTransformerService} from './transformers/portfolio-constraint-transformer.service';
import {SectorConstraintTransformerService} from './transformers/sector-constraint-transformer.service';
import {SecurityConstraintTransformerService} from './transformers/security-constraint-transformer.service';
import {ConstraintTransformer} from './constraint-transformer.interface';
import {ConstraintTransformerService} from '@optimization-settings-configuration/constraints-settings/interfaces/constraint-transformer-service.interface';
import {FactorConstraintTransformerService} from '@optimization-settings/constraints-settings/services/transformers/factor-constraint-transformer.service';
import {
    RelaxationConstraintTransformerService
} from '@optimization-settings/constraints-settings/services/transformers/relaxation-constraint-transformer.service';

/**
 * Transforms a Constraint object into a flat dictionary for display purposes, based on its type
 */
@Injectable({
    providedIn: 'root'
})
export class ExploreConstraintTransformerService implements ConstraintTransformerService<Constraint> {
    private transformers: Map<string, ConstraintTransformer>;

    constructor(
        private portfolioConstraintTransformerService: PortfolioConstraintTransformerService,
        private sectorConstraintTransformerService: SectorConstraintTransformerService,
        private securityConstraintTransformerService: SecurityConstraintTransformerService,
        private factorConstraintTransformerService: FactorConstraintTransformerService,
        private relaxationConstraintTransformerService: RelaxationConstraintTransformerService) {
        this.transformers = new Map([
            this.portfolioConstraintTransformerService,
            this.sectorConstraintTransformerService,
            this.securityConstraintTransformerService,
            this.factorConstraintTransformerService,
            this.relaxationConstraintTransformerService
        ].map(
            (transformer: ConstraintTransformer) => [transformer.type(), transformer]
        ));
    }

    transform(constraint: Constraint, type: string): Dictionary<any> {
        const transformer = this.transformers.get(type);
        return transformer ? transformer.transform(constraint) : {};
    }
}
