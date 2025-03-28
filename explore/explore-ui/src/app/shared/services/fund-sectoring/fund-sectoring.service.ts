import {Injectable} from '@angular/core';
import {PortfolioService} from '@services/portfolio';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {FundSectoringTableRecord} from '@blk/explore-ui-breakdown';
import {cloneDeep} from 'lodash';
import FundSectoringConfig from '../../../../assets/fund-sectoring-config/fund-sectoring-config.json';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ExploreDataRequest} from '@models/requests/explore-data-request.model';
import {DataRequestConstants} from '@constants/data-request.constants';
import {CalendarDateUtils, DateFormatConstants} from '@blk/explore-ui-core';

/**
 * Service to return data for Fund sectoring table
 */
@Injectable({
    providedIn: 'root'
})
export class FundSectoringService {

    constructor(private portfolioService: PortfolioService, private exploreDataRequestService: ExploreDataRequestService) {
    }

    /**
     * returns FundSectoring table records of index portfolios of benchmark set in passed portfolio
     * @param currentPortfolio
     */
    getIndexSectorTableRecords$(currentPortfolio: Portfolio): Observable<Array<FundSectoringTableRecord>> {
        const benchmarkPortfolio = new Portfolio();
        benchmarkPortfolio.portName = currentPortfolio.benchmark.name;
        benchmarkPortfolio.datePicker = currentPortfolio.datePicker;

        return this.portfolioService.fetchPortfolioInformation$(benchmarkPortfolio, { isLightVersion: false, includeMandate: false }, true).pipe(
            map(
                (portfolio: Portfolio) => {
                    const tableRecords: FundSectoringTableRecord[] = [];
                    const indexData = portfolio.indexWeights;
                    if (indexData) {
                        for (const item of indexData) {
                            const tableRecord: FundSectoringTableRecord = {nodeName: item.portfolioPortName, cusip: item.portfolioCusip, description: item.portfolioFullName, nodePath: [item.portfolioPortName]};
                            tableRecords.push(tableRecord);
                        }
                    }
                    return tableRecords;
                }
            ));
    }

    /**
     * returns FundSectoring table records for portfolio and child portfolios of port group
     * @param currentPortfolio
     */
    getPortfolioSectorTableRecords$(currentPortfolio: Portfolio): Observable<FundSectoringTableRecord[]> {
        return this.portfolioService.fetchPortfolioInformation$(currentPortfolio, { isLightVersion: false, includeMandate: false }, true).pipe(
            map((portfolio: Portfolio) => {
                return this.convertPortfolioToTableRecord(portfolio);
            })
        );
    }

    /**
     * returns FundSectoring table records of all the assets of fund type in portfolio
     * @param currentPortfolio
     */
    getFundSectorTableRecords$(currentPortfolio: Portfolio): Observable<FundSectoringTableRecord[]> {
        const fundsRequestConfig = cloneDeep(FundSectoringConfig.fundsRequestParams);
        const requestParams = {
            columns: fundsRequestConfig.columns,
            filter: JSON.stringify(fundsRequestConfig.filter),
            todayDate: CalendarDateUtils.getDateInFormat(CalendarDateUtils.checkOverrideAndGetToday(), DateFormatConstants.MMDDYYYY_SLASH)
        };
        currentPortfolio.addRequestParams(requestParams);
        return this.exploreDataRequestService.getData$(new ExploreDataRequest([requestParams]), false, DataRequestConstants.DATA_REQUEST_URL.BASE).pipe(
            map(
                (response: any) => {
                    if (response && response.data && response.data.children) {
                        return response.data.children.map(
                            (fund: any) => {
                                return {nodeName: fund.cusip_0, description: fund.sec_desc, nodePath: [fund.cusip_0]};
                            }
                        );
                    }
                    return [];
                }
            ));
    }

    /**
     * Convert portfolio object to array of Fund Sectoring table records
     * @param portfolio
     * @param parentRowRecord
     */
    private convertPortfolioToTableRecord(portfolio: Portfolio, parentRowRecord?: FundSectoringTableRecord): FundSectoringTableRecord[] {
        const portfolioRecord: FundSectoringTableRecord = {nodeName: portfolio.portName, cusip: portfolio.cusip, description: portfolio.fullName, nodePath: parentRowRecord ? parentRowRecord.nodePath.concat(portfolio.portName) : [portfolio.portName]};
        if (parentRowRecord) {
            parentRowRecord.childRecords = parentRowRecord.childRecords ? parentRowRecord.childRecords.concat(portfolioRecord) : [portfolioRecord];
        }
        let nestedRecords = [portfolioRecord];
        if (portfolio.isPortfolioGroup && portfolio.portfolios.length > 0) {
            portfolio.portfolios.forEach((childPortfolio: Portfolio) => {
                nestedRecords = nestedRecords.concat(this.convertPortfolioToTableRecord(childPortfolio, portfolioRecord));
            });
        }
        return nestedRecords;
    }

}
