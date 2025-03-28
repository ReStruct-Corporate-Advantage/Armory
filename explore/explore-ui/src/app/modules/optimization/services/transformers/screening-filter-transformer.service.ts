import {Injectable} from '@angular/core';
import {OptimizationSummaryDataTransformer} from '../optimization-summary-data-transformer.interface';
import {OptimizationSummaryData} from '@optimization-settings-configuration/models/optimization-summary-data.model';
import {Dictionary, isEmpty} from 'lodash';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {CustomFilter} from '@blk/explore-ui-breakdown';
import {TAB_NAME_SCREENING} from '@optimization-settings/constants/settings-tab-metadata.constants';

/**
 * This service transforms Explore screening risk parity settings
 * into the OptimizationSummaryData format required by the optimization-configuration module.
 */
@Injectable({
    providedIn: 'root'
})
export class ScreeningFilterTransformerService implements OptimizationSummaryDataTransformer {
    /**
     * returns type
     */
    type(): string {
        return TAB_NAME_SCREENING.toLowerCase();
    }

    /**
     * transforms screening data in optimization summary data format
     */
    transform(portfolio: PortfolioWithPositions): OptimizationSummaryData {
        const screeningRiskParitySettings: CustomFilter = portfolio.riskParitySettings.filter;
        if (screeningRiskParitySettings.isFilterEmpty()) {
            return {};
        }
        const data: Dictionary<any>[] = [{screening: screeningRiskParitySettings.title}];
        return isEmpty(data) ? {} : {data};
    }
}
