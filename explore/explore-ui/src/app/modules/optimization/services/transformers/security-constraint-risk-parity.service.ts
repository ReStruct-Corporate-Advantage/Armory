import {Injectable} from '@angular/core';
import {OptimizationSummaryDataTransformer} from '../optimization-summary-data-transformer.interface';
import {OptimizationSummaryData} from '@optimization-settings-configuration/models/optimization-summary-data.model';
import {Dictionary, isEmpty} from 'lodash';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {OptimizationConstants} from '@constants/optimization.constants';

/**
 * This service transforms Explore constraint in risk parity absolute settings
 * into the OptimizationSummaryData format required by the optimization-configuration module.
 */
@Injectable({
    providedIn: 'root'
})
export class SecurityConstraintRiskParityService implements OptimizationSummaryDataTransformer {
    /**
     * returns type
     */
    type(): string {
        return OptimizationConstants.SECURITY_CONSTRAINT_RISK_BUDGETING;
    }

    /**
     * transforms screening data in optimization summary data format
     */
    transform(portfolio: PortfolioWithPositions): OptimizationSummaryData {
        const securityConstraints = portfolio.riskParitySettings.securityConstraints;
        if (securityConstraints.size === 0) {
            return {};
        }
        const data: Dictionary<any>[] = [{security_constraints: 'Custom Security List'}];
        return isEmpty(data) ? {} : {data};
    }
}
