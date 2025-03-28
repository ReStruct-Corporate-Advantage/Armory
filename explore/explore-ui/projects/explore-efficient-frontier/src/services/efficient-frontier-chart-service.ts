import {Injectable} from '@angular/core';
import {EfficientFrontierConstants} from '../efficient-frontier.constants';
import {LatestOptimizationRunDetails} from '../models/latest-optimization-run-details';
import {EfficientFrontierResponse, VizualizationColumnConfigEF} from '../interfaces/common.interface';
import {ResponseData} from '../interfaces/common.interface';
import {cloneDeep} from 'lodash';
import axisColumnsJson from '../config/axisColumns.json';
import {RequestConfig} from '../interfaces/common.interface';

/**
 * service class to transform optimization data
 */
@Injectable({
    providedIn: 'root'
})
export class EfficientFrontierChartService {

    /**
     * transform the optimization run details data into exploreResponse format
     */
    transformDataToFrontierResponse(latestOptimizationRunDetails: LatestOptimizationRunDetails[], yMeasure: string, xMeasure: string): EfficientFrontierResponse {
        return {
            data: {
                columns: [yMeasure],
                data: {
                    rowId: 1,
                    data: [null],
                    children: this.getChildrenData(latestOptimizationRunDetails, yMeasure, xMeasure)
                }
            }
        };
    }

    /**
     * prepare data for children's
     */
    private getChildrenData(latestOptimizationRunDetails: LatestOptimizationRunDetails[], yMeasure: string, xMeasure: string): ResponseData[] {
        return latestOptimizationRunDetails.map((details, i) => {
            return {
                title: details.constraintBoundValues[xMeasure],
                rowId: i + 2,
                data: Array.isArray(details[yMeasure]) ? [details[yMeasure][1]] : [details[yMeasure]]
            };
        });
    }

    /**
     * prepare the request Config object based on given portfolio and selected measure
     */
    getRequestConfig(basePortfolioName: string, yMeasure: string, objectiveType?: string): RequestConfig {
        const requestAdapterConfig: RequestConfig = {columns: [], portfolio: ''};
        let requestCols: VizualizationColumnConfigEF[] = cloneDeep(axisColumnsJson['yAxisColConfig']);
        requestCols = requestCols.filter(col => col.columnKey === yMeasure);
        if (objectiveType && objectiveType !== EfficientFrontierConstants.ACTIVE_OBJECTIVE_TYPE) {
            requestCols.forEach(col => col.columnTitle = col.columnTitle.replace(' (Active)', ''));
        }
        requestAdapterConfig.portfolio = basePortfolioName;
        requestAdapterConfig.columns = requestCols;
        return requestAdapterConfig;
    }
}
