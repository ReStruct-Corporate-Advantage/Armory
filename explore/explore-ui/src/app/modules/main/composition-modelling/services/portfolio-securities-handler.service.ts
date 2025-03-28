import {Injectable} from '@angular/core';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import {forkJoin, Observable, of} from 'rxjs';
import {ExploreResponseConfig} from '@interfaces/response.interface';
import {ColumnConstants, ErrorTypeConstants, ResponseData, UIErrorParameters} from '@blk/explore-ui-core';
import {flatMap, isEmpty} from 'lodash';
import {
    PortfolioSecuritiesHoldingChange
} from '@models/portfolio/composition/portfolio-securities-holding-change.model';
import {PortfolioSecuritiesRule} from '@models/portfolio/tradeRules/portfolio-securities-rule.model';
import {CompositionConstants} from '@constants/composition.constants';
import {HoldingChange} from '@models/portfolio/composition/holding-change.model';
import {HttpUtils} from '@utils/http.utils';
import {HttpParams} from '@angular/common/http';
import {StatusConstants} from '@constants/status.constants';
import {DataRequestConstants} from '@constants/data-request.constants';
import {catchError, map, tap} from 'rxjs/operators';
import {RuleUnit} from '@enums/rule-unit.enum';
import {Http2BmsService} from '@services/bms';
import {NotificationService} from '@services/notification';
import {ExploreCachingService} from '@services/widget-data/explore-caching.service';
import {ExploreDataRequest} from '@models/requests/explore-data-request.model';
import {PortfolioStore} from '@stores/portfolio.store';
import {PortfolioCacheKey} from '@models/portfolio/portfolio-cache-key.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {isAdhocPort} from '@interfaces/base-adhoc-portfolio.interface';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';

@Injectable({
    providedIn: 'root'
})
export class PortfolioSecuritiesHandlerService {

    /**
     * constructor
     * @param httpService http service instance
     * @param notificationService
     * @param cachingService
     */
    constructor(
        private httpService: Http2BmsService,
        private notificationService: NotificationService,
        private cachingService: ExploreCachingService
    ) {
    }

    /**
     * Root method to handle logic to add/remove/update port securities rules/records
     * @param portfolio
     * @param rules
     * @param refreshCachedResponse
     */
    public fetchHoldingChangesForPortSecuritiesRules$(
        portfolio: PortfolioWithPositions,
        rules?: BaseRule[],
        refreshCachedResponse = false
    ): Observable<ExploreResponseConfig & { data: ResponseData }> {

        // return if we do not have any composition records
        if (!portfolio.composition || !portfolio.composition.data || isEmpty(portfolio.composition.data.children)) {
            this.notificationService.error('Position data was not found to add portfolio securities', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_FETCH_HOLDING_CHANGES_FOR_PORT_SECURITIES_RULES_ERROR, true);
            return of(portfolio.composition);
        }

        // find matching holding changes against port securities rules
        const existingChangesForGivenRules = portfolio.holdingChanges
            .filter(change => change instanceof PortfolioSecuritiesHoldingChange)
            .filter((change: PortfolioSecuritiesHoldingChange) =>
                rules.some((rule: PortfolioSecuritiesRule) => rule.getWithFavTitle(rule.lineItem) === change.getWithFavTitle(change.lineItem))
            );

        // remove matching holding changes from the list of portfolio holding changes
        portfolio.holdingChanges = portfolio.holdingChanges.filter(change => !existingChangesForGivenRules.includes(change));

        // get the total market value for the portfolio
        const beforeMarketValIdx: number = portfolio.composition.columns.indexOf(CompositionConstants.MARKET_VALUE_BEFORE);
        const portMarketVal: number = Number(portfolio.composition.data.data[beforeMarketValIdx]);

        // get the holding changes
        const portSecuritiesHoldingChanges: HoldingChange[] = rules
            .map((rule: PortfolioSecuritiesRule) => rule.convertToHoldingChange(portMarketVal));

        // if holding changes are being updated inline (in the composition table), then let's not make position data check call
        if (!isEmpty(existingChangesForGivenRules) && existingChangesForGivenRules.length === portSecuritiesHoldingChanges.length) {
            // add the records to composition table
            return of(this.addRecordsForPortfolioSecuritiesChanges(
                portfolio,
                undefined,
                portSecuritiesHoldingChanges
            ));
        }

        // get non-zero port securities holding changes
        const nonZeroPortSecuritiesChanges: HoldingChange[] = portSecuritiesHoldingChanges.filter(change => change.newWeight !== 0);
        // throw notification errors in case of all zero weights
        if (isEmpty(nonZeroPortSecuritiesChanges)) {
            this.notificationService.error('No valid portfolios found with non-zero weights', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_FETCH_HOLDING_CHANGES_FOR_PORT_SECURITIES_RULES_ERROR,true);
            return of(portfolio.composition);
        }

        // handle the composition data records for the port securities rules
        const params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(new HttpParams(), StatusConstants.ADD_PORT_SECURITIES_REC);

        return forkJoin([
            this.getPosDataList$(nonZeroPortSecuritiesChanges, portfolio, params, refreshCachedResponse),
            this.getPortDataList$(nonZeroPortSecuritiesChanges, portfolio, params, refreshCachedResponse)
        ]).pipe(
            map((posAndPortDataList: [string, any][][]) => {
                if (!posAndPortDataList?.length) {
                    return portfolio.composition;
                }

                // filter out the portfolio securities records that have underlying portfolio
                // already present in the composition
                const portDataList: { port: string, data: any, message: string }[] = posAndPortDataList[1]
                    .map((portData: [string, any]) => ({
                        port: portData[0],
                        data: portData[1]?.data,
                        message: portData[1]?.message
                    }));

                // filter out the list of portfolio securities whose underlying ports are overlapping with
                // the already added portfolio securities records
                const portSecuritiesChangesToConsider: HoldingChange[] = this.getFilteredListOfPortSecuritiesToAdd(
                    portfolio,
                    portDataList.map(portData => portData.data).filter(Boolean),
                    nonZeroPortSecuritiesChanges
                );

                // throw error notifications for cyclic dependencies
                this.notifyOnBadPortSecurities(
                    portSecuritiesChangesToConsider,
                    nonZeroPortSecuritiesChanges,
                    portSecuritiesHoldingChanges.filter(change => !change.newWeight),
                    new Map( // Error message data
                        portDataList
                            .filter(portData => !portData.data)
                            .map(portData => [portData.port, portData.message])
                    )
                );

                // add the records to composition table
                return this.addRecordsForPortfolioSecuritiesChanges(
                    portfolio,
                    undefined,
                    portSecuritiesChangesToConsider,
                    posAndPortDataList[0].map((posData: [string, any]) => ({
                        port: posData[0],
                        data: posData[1]?.data,
                        message: posData[1]?.message
                    }))
                );
            })
        );
    }

    /**
     * filter out the list of portfolio securities whose underlying ports are overlapping with
     * the already added portfolio securities records
     *
     * @param portfolio
     * @param portDataList
     * @param nonZeroPortSecuritiesChanges
     */
    getFilteredListOfPortSecuritiesToAdd(
        portfolio: PortfolioWithPositions,
        portDataList: any[],
        nonZeroPortSecuritiesChanges: HoldingChange[]
    ): HoldingChange[] {

        // update portfolio to underlying portfolios map for each portfolio whose securities we are adding
        this.updatePortNamesMapFromPortData(portDataList, portfolio.portToUnderLyingPortsMap);

        // find out port securities holding changes to still consider
        // ** NOTE: here we basically get all the underlying ports of each portfolio whose securities we want to add
        // ** and then we check if the underlying ports overlap with the portfolio added so far in the composition table
        return [...portfolio.portToUnderLyingPortsMap.entries()]
            .filter(([, underlyingPorts]) => ![...underlyingPorts].some(underlyingPort => underlyingPort === portfolio.portName))
            .map(([portName]) => nonZeroPortSecuritiesChanges.find(portSecuritiesChange => portName !== portfolio.portName && portSecuritiesChange.lineItem === portName))
            .filter(Boolean);
    }

    /**
     * get the map of top level port to underlying portfolios for all the portfolio securities records
     * @param portDataList
     * @param portToUnderLyingPortsMap
     */
    updatePortNamesMapFromPortData(portDataList: any[], portToUnderLyingPortsMap: Map<string, Set<string>>): void {
        if (isEmpty(portDataList)) {
            return;
        }

        // this if block happens only if the portToUnderLyingPortsMap is empty
        // which would generally be when a port securities record is added for the first time
        if (!portToUnderLyingPortsMap.size) {
            // initialize the map with top level port, and it's underlying ports (if any)
            const underLyingPortNames: Set<string> = new Set();
            this.getPortNamesForPortData(portDataList[0]?.portfolios, underLyingPortNames);
            portToUnderLyingPortsMap.set(portDataList[0].ticker, underLyingPortNames);
            // once initialized, remove it from port data list
            // now, the list only has the port securities records to be added
            portDataList.shift();
        }

        // initialize the following 2 lists:
        // 1) portsSoFar - top level port & it's default underlying ports (if any) + any port securities records added further already
        // 2) underlyingPortsSoFar - all underlying ports for the already added port securities records
        let [portsSoFar, underlyingPortsSoFar]: string[][] = this.initPortsAndUnderlyingPorts(portToUnderLyingPortsMap);

        // loop over all the portfolio data and discard the ones not satisfying the conditions
        for (const portData of portDataList) {
            // Skip if the port securities record is same as the top level what-if portfolio
            if (portData.ticker === portsSoFar[0]) {
                continue;
            }

            // get underlying port names for current port securities record
            const underLyingPortNames: Set<string> = new Set();
            this.getPortNamesForPortData(portData.portfolios, underLyingPortNames);

            // add the record, if below check passes, and update the added and underlying port lists
            if (this.checkRecordsValidityToBeAdded(portsSoFar, underlyingPortsSoFar, portData, underLyingPortNames)) {
                portToUnderLyingPortsMap.set(portData.ticker, underLyingPortNames);
                // update the port lists again for next iteration
                [portsSoFar, underlyingPortsSoFar] = this.initPortsAndUnderlyingPorts(portToUnderLyingPortsMap);
            }
        }
    }

    /**
     * get the names of underlying ports at all levels for a given portfolio whose securities we want to add
     * @param underlyingPorts
     * @param underLyingPortNames
     */
    getPortNamesForPortData(underlyingPorts: any[], underLyingPortNames: Set<string>): void {
        underlyingPorts?.forEach(port => {
            underLyingPortNames.add(port.ticker);
            if (!isEmpty(port.portfolios)) {
                this.getPortNamesForPortData(port.portfolios, underLyingPortNames);
            }
        });
    }

    /**
     * get the names of only leaf level underlying ports at all levels for a given portfolio
     * @param underlyingPorts
     * @param underLyingPortNames
     */
    getLeafLevelPortNamesForPortData(underlyingPorts: any[], underLyingPortNames: Set<string>): void {
        underlyingPorts?.forEach(port => {
            if (!isEmpty(port.portfolios)) {
                this.getLeafLevelPortNamesForPortData(port.portfolios, underLyingPortNames);
            } else {
                underLyingPortNames.add(port.ticker);
            }
        });
    }

    /**
     * handles the logic to add/update composition records for the added portfolio securities rules
     * @param portfolio
     * @param compositionData
     * @param portSecuritiesHoldingChanges
     * @param posDataList
     */
    addRecordsForPortfolioSecuritiesChanges(
        portfolio: WhatIfPortfolio,
        compositionData: ExploreResponseConfig & { data: ResponseData },
        portSecuritiesHoldingChanges: HoldingChange[],
        posDataList?: { port: string, data: ExploreResponseConfig & { data: ResponseData }, message: string }[]
    ): ExploreResponseConfig & { data: ResponseData } {

        // return if we do not have any composition records or port securities rule
        // ** NOTE: this is a guard rail we need to populate the default composition table properly.
        // ** we have similar checks outside, from where the call for this method happens, simply to avoid unnecessary processing
        const composition: ExploreResponseConfig & { data: ResponseData } = compositionData || portfolio.composition;
        if (!composition || !composition.data || isEmpty(composition.data.children) || isEmpty(portSecuritiesHoldingChanges)) {
            return composition;
        }

        // declare few needed local variables
        const portHoldingChanges: HoldingChange[] = portfolio.holdingChanges;
        const portToUnderLyingPortsMap: Map<string, Set<string>> = (portfolio as PortfolioWithPositions).portToUnderLyingPortsMap;

        // mark the ones for existing ports
        if (!!portToUnderLyingPortsMap.size) {
            this.markExistingPortSecurities(portSecuritiesHoldingChanges, portToUnderLyingPortsMap, portfolio.portName);
        }

        // get the indices from the columns list in the composition response
        const colToIndexMap: Map<string, number> = new Map();
        composition.columns.forEach((col, i) => colToIndexMap.set(col, i));

        // if we do not have pos data list (coming from add securities flow) OR
        // if we have pos data list and none has valid position data
        // then add the line-break records
        if (!posDataList || (!!posDataList && posDataList.some(posData => posData.data?.data?.data?.[0]))) {
            // if we are here, then create the line break records before we start adding port securities records
            // ** there are 3 line break records
            const lineBreakRecData: ResponseData = composition.data.children.find(child => child.rowId === CompositionConstants.PORT_SECURITIES_CONSTRAINTS.LINE_BREAK as any);
            const indexOfLineBreakRecData = composition.data.children.indexOf(lineBreakRecData);
            if (indexOfLineBreakRecData === -1) {
                this.addLineBreakRecords(composition);
            }
        }

        const errorMessageData: Map<string, string> = new Map(
            posDataList
                ?.filter(posData => !posData.data || (!!posData && !posData.data?.data?.data?.[0]))
                .map(posData => [posData.port, posData.message || (posData.port + ' does not have position data for the given date')])
        );

        // now let's create the port securities records for the given port securities rules
        portSecuritiesHoldingChanges.forEach((portfolioSecuritiesChange: PortfolioSecuritiesHoldingChange, index: number) => {
            if (errorMessageData.has(portfolioSecuritiesChange.lineItem)) {
                this.notificationService.error(errorMessageData.get(portfolioSecuritiesChange.lineItem), ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_ADD_RECORDS_FOR_PORTFOLIO_SECURITIES_ERROR, true);
                // remove the entry from the map as well.
                portToUnderLyingPortsMap.delete(portfolioSecuritiesChange.lineItem);
                return;
            }

            // do not add to the portfolio holding changes if the new weight is zero
            if (portfolioSecuritiesChange.newWeight !== 0 && !portHoldingChanges.find(change => change === portfolioSecuritiesChange)) {
                portHoldingChanges.push(portfolioSecuritiesChange);
            }

            this.handleRecordForPortSecuritiesChange(composition, portfolioSecuritiesChange, index, colToIndexMap, portToUnderLyingPortsMap);
        });

        // return the modified composition
        return composition;
    }

    /**
     * handles the port securities record for the given port securities rule
     * @param composition
     * @param portfolioSecuritiesChange
     * @param index
     * @param colToIndexMap
     * @param portToUnderLyingPortsMap
     * @private
     */
    private handleRecordForPortSecuritiesChange(
        composition: ExploreResponseConfig & { data: ResponseData },
        portfolioSecuritiesChange: PortfolioSecuritiesHoldingChange,
        index: number,
        colToIndexMap: Map<string, number>,
        portToUnderLyingPortsMap?: Map<string, Set<string>>
    ): void {
        // get the name of portfolio
        const portName: string = !!portfolioSecuritiesChange?.id
            ? portfolioSecuritiesChange.getWithFavTitle(portfolioSecuritiesChange.lineItem)
            : portfolioSecuritiesChange.lineItem;
        // prepare the new composition record
        const newRec: any[] = new Array(composition.columns.length).fill(null);
        newRec[0] = portName;

        // Handle record values based on the modeling column selected
        // % cols
        CompositionConstants.PCT_MODELING_COLS
            .map(col => colToIndexMap.get(col))
            .forEach(i => newRec[i] = portfolioSecuritiesChange.newWeight / 100);
        // non % cols
        CompositionConstants.NON_PCT_MODELING_COLS
            .map(col => colToIndexMap.get(col))
            .forEach(i => newRec[i] = portfolioSecuritiesChange.ruleToUse.ruleUnit === RuleUnit.NOTIONAL_MV
                ? portfolioSecuritiesChange.ruleToUse.newWeight
                : (portfolioSecuritiesChange.ruleToUse.newWeight * composition.data.data[colToIndexMap.get(CompositionConstants.MARKET_VALUE_BEFORE)]) / 100
            );

        // check if there is an existing record for the same item
        const existingRecData = composition.data.children.find(child => child.rowId === newRec[0]);
        const indexOfExistingRecData = composition.data.children.indexOf(existingRecData);
        if (indexOfExistingRecData !== -1) {
            if (portfolioSecuritiesChange.newWeight === 0) {
                // if the modified weight is zero for the existing records, simply remove the record
                composition.data.children.splice(indexOfExistingRecData, 1);
                const existingLineBreakData = composition.data.children.find(child => child.rowId === CompositionConstants.PORT_SECURITIES_CONSTRAINTS.LINE_BREAK as any);
                const indexOfExistingLineBreakData = composition.data.children.indexOf(existingLineBreakData);
                // After removing the record, if we do not have any more port securities records
                // then remove the line break records and the cash offset record
                if (indexOfExistingLineBreakData === composition.data.children.length - 4) {
                    composition.data.children.splice(indexOfExistingLineBreakData, 4);
                } else {
                    // if we still have port securities records left
                    // then modify the cash offset record
                    this.updateCashOffsetForPortSecurities(composition, newRec, colToIndexMap, existingRecData.data, true);
                    // remove the entry from the map as well.
                    portToUnderLyingPortsMap.delete(portfolioSecuritiesChange.lineItem);
                }
            } else {
                // if the weight of the record has been changes and is non-zero
                // then replace the existing record with new record
                composition.data.children.splice(indexOfExistingRecData, 1, ...[{data: newRec, rowId: newRec[0]}]);
                // and update the cash offset record accordingly
                this.updateCashOffsetForPortSecurities(composition, newRec, colToIndexMap, existingRecData.data, true);
            }
        } else {
            // if we are there then it is a new record
            if (portfolioSecuritiesChange.newWeight !== 0) {
                composition.data.children.push({data: newRec, rowId: newRec[0]});
                this.updateCashOffsetForPortSecurities(composition, newRec, colToIndexMap);
            }
        }
    }

    /**
     * takes care of the cash offset record for portfolio securities
     * @param composition
     * @param newRecord
     * @param colToIndexMap
     * @param existingRecord
     * @param isUpdate
     * @private
     */
    private updateCashOffsetForPortSecurities(
        composition: ExploreResponseConfig & { data: ResponseData },
        newRecord: any[],
        colToIndexMap: Map<string, number>,
        existingRecord?: any[],
        isUpdate = false
    ): void {
        // update the cash offset record
        let cashOffsetRecData: ResponseData = composition.data.children
            .find(child => child.rowId === CompositionConstants.PORT_SECURITIES_CONSTRAINTS.CASH_OFFSET as any);

        const pctMktValAfterIndex: number = colToIndexMap.get(CompositionConstants.PCT_MARKET_VALUE_AFTER);
        const pctNotionalMktValAfterIndex: number = colToIndexMap.get(CompositionConstants.NOTIONAL_MV_AFTER);

        // insert a cash offset record if we do not already have one
        if (!cashOffsetRecData) {
            cashOffsetRecData = {
                data: new Array(composition.columns.length).fill(null),
                rowId: CompositionConstants.PORT_SECURITIES_CONSTRAINTS.CASH_OFFSET as any
            };
            cashOffsetRecData.data[colToIndexMap.get(ColumnConstants.CUSIP)] = CompositionConstants.PORT_SECURITIES_CONSTRAINTS.CASH_OFFSET;
            cashOffsetRecData.data[pctMktValAfterIndex] = 0;
        }

        // update the cash offset record cells with new value

        // % cols
        let pctCashOffset: number = cashOffsetRecData.data[pctMktValAfterIndex] - newRecord[pctMktValAfterIndex];
        if (isUpdate) {
            pctCashOffset += existingRecord[pctMktValAfterIndex];
        }
        CompositionConstants.PCT_MODELING_COLS
            .map(col => composition.columns.indexOf(col))
            .forEach(i => cashOffsetRecData.data[i] = pctCashOffset);

        // non % cols
        let nonPctCashOffset: number = cashOffsetRecData.data[pctNotionalMktValAfterIndex] - newRecord[pctNotionalMktValAfterIndex];
        if (isUpdate) {
            nonPctCashOffset += existingRecord[pctNotionalMktValAfterIndex];
        }
        CompositionConstants.NON_PCT_MODELING_COLS
            .map(col => composition.columns.indexOf(col))
            .forEach(i => cashOffsetRecData.data[i] = nonPctCashOffset);

        // if it's not new addition, then no need to modify cash offset location
        if (isUpdate) {
            return;
        }

        // move cash offset to the bottom
        const indexOfExistingRec = composition.data.children.indexOf(cashOffsetRecData);
        if (indexOfExistingRec !== -1) {
            composition.data.children.splice(indexOfExistingRec, 1);
        }
        composition.data.children.push(cashOffsetRecData);
    }

    /**
     * get the observable for the list of position data
     *
     * @param nonZeroPortSecuritiesChanges
     * @param portfolio
     * @param params
     * @param refreshCachedResponse
     */
    getPosDataList$(
        nonZeroPortSecuritiesChanges: HoldingChange[],
        portfolio: PortfolioWithPositions,
        params,
        refreshCachedResponse = false
    ) {
        return forkJoin([
            ...nonZeroPortSecuritiesChanges.map(
                change => {
                    const payload = this.createPositionDataPayload(change.lineItem, portfolio.datePicker.date);
                    const cacheablePayload = new ExploreDataRequest([payload]);
                    const posDataCall$ = () => this.httpService.post$(DataRequestConstants.DATA_REQUEST_URL.BASE, {...payload, refreshCachedResponse}, params)
                        .pipe(tap(response => this.cachingService.addDataToCache(cacheablePayload, response)));

                    return forkJoin([
                        of(change.lineItem),
                        refreshCachedResponse
                            ? posDataCall$()
                            : this.cachingService.getDataFromCache$(cacheablePayload)
                                .pipe(
                                    map(response => response.data),
                                    // caching service throws an error if data is not found in cache
                                    // in such case, we make the http call to get the data from server
                                    catchError(posDataCall$)
                                )
                    ]);
                }
            )
        ]);
    }

    /**
     * get the Observable for complete portfolio data list
     * @param nonZeroPortSecuritiesChanges
     * @param portfolio
     * @param params
     * @param refreshCachedResponse
     */
    getPortDataList$(
        nonZeroPortSecuritiesChanges: HoldingChange[],
        portfolio: PortfolioWithPositions,
        params,
        refreshCachedResponse = false
    ) {
        const mainPortCacheKey: PortfolioCacheKey = new PortfolioCacheKey(portfolio.portName.toUpperCase(), portfolio.datePicker.date, false, true);
        const mainPortInfoObject: any = PortfolioStore.getPortfolioInfoFromCache(mainPortCacheKey);

        return forkJoin([
            ...(
                !portfolio.portToUnderLyingPortsMap.size
                    ? [this.getPortData$(
                        mainPortInfoObject,
                        mainPortCacheKey,
                        portfolio.portName,
                        portfolio.datePicker.date,
                        isAdhocPort(portfolio) ? portfolio.adhocParams : null,
                        params,
                        refreshCachedResponse
                    )]
                    : []
            ),
            ...nonZeroPortSecuritiesChanges.map(
                change => {
                    const portCacheKey: PortfolioCacheKey = new PortfolioCacheKey(change.lineItem.toUpperCase(), portfolio.datePicker.date, false, true);
                    return this.getPortData$(
                        PortfolioStore.getPortfolioInfoFromCache(portCacheKey),
                        portCacheKey,
                        change.lineItem,
                        portfolio.datePicker.date,
                        null,
                        params,
                        refreshCachedResponse
                    );
                }
            )
        ]);
    }

    /**
     * get portName data for the main port (with hierarchy)
     *
     * @param portInfoObject
     * @param portCacheKey
     * @param portName
     * @param date
     * @param adhocPortParams
     * @param params
     * @param refreshCachedResponse
     */
    getPortData$(
        portInfoObject: any,
        portCacheKey: PortfolioCacheKey,
        portName: string,
        date: string,
        adhocPortParams: AdhocPortParams,
        params,
        refreshCachedResponse = false
    ) {
        return forkJoin([
            of(portName),
            !!portInfoObject && !refreshCachedResponse
                ? of(portInfoObject)
                : this.httpService.post$('portfolioInfo', this.createPortHierarchyPayload(portName, date, adhocPortParams), params)
                    .pipe(tap(response => PortfolioStore.addPortfolioInfoToCache(portCacheKey, response)))
        ]);
    }

    /**
     * request payload to get the NAV for the "to be added" portfolio securities record
     * @param portfolio
     * @param date
     */
    createPositionDataPayload(portfolio: string, date: string): any {
        return {
            portfolio,
            forDate: date,
            dataFormat: 'COMPACT_JSON',
            isSectorView: 'Y',
            columns: [
                {
                    columnTag: 'market_val',
                    positionColumnType: 'PORT'
                }
            ]
        };
    }

    /**
     * returns portfolio info request payload for non-light version
     * @param portfolio
     * @param forDate
     * @param adhocPortParams
     */
    createPortHierarchyPayload(portfolio: string, forDate: string, adhocPortParams: AdhocPortParams): any {
        return {
            lightVersion: false,
            portfolio,
            forDate,
            includeMandate: true,
            ...(!!adhocPortParams ? {adhocPortParams} : {}),
        };
    }

    /***
     * evaluates cyclic dependency situation.
     * returns true if the portfolio securities record is good to be added
     * @param portsSoFar
     * @param underlyingPortsSoFar
     * @param portData
     * @param underLyingPortNames
     */
    checkRecordsValidityToBeAdded(portsSoFar: string[], underlyingPortsSoFar: string[], portData: any, underLyingPortNames: Set<string>): boolean {
        // * condition 1: ticker is one of added ports
        //
        // core-hq --- [ ffh-fit, galic-106 ]
        //        |--> * ffh-fit
        //
        const inAddedPorts: boolean = portsSoFar.some(port => portData.ticker === port);
        // * condition 2: ticker's underlying ports are amongst the added ports
        //
        // ffh-fit --- [  ]
        //        |--> * core-hq --- [ ffh-fit, galic-106 ]
        //
        const addedPortsInUnderlyingPorts: boolean = portsSoFar.some(port => underLyingPortNames.has(port));
        // * condition 3: ticker is amongst the underlying ports of added ports
        //
        // pep ------- [  ]
        //        |--> * core-hq --- [ ffh-fit, galic-106 ]
        //        |--> * ffh-fit
        //
        const inUnderlyingPortsOfAddedPorts: boolean = underlyingPortsSoFar.some(underLyingPort => portData.ticker === underLyingPort);
        // * condition 4: there is overlap between underlying ports of the ticker, as well as added ports
        //
        // pep ------- [  ]
        //        |--> * core-hq --- [ ffh-fit, galic-106 ]
        //        |--> * aegon ----- [ ffh-fit ]
        //
        const overlapInUnderlyingPorts: boolean = underlyingPortsSoFar.some(underLyingPort => underLyingPortNames.has(underLyingPort));

        return inAddedPorts || !(addedPortsInUnderlyingPorts || inUnderlyingPortsOfAddedPorts || overlapInUnderlyingPorts);
    }

    /**
     * returns the lists of ports (root, level-1) and underlying ports (level-2 and below)
     * @param portToUnderLyingPortsMap
     */
    initPortsAndUnderlyingPorts(portToUnderLyingPortsMap: Map<string, Set<string>>): string[][] {
        return [
            [
                ...portToUnderLyingPortsMap.keys(),
                ...[...portToUnderLyingPortsMap.values()][0]
            ],
            [...flatMap(
                [...portToUnderLyingPortsMap.values()]
                    .filter((_val, i) => i > 0), underlyingPortNames => [...underlyingPortNames.values()]
            )]
        ];
    }

    /**
     * throws error notifications for ports with cyclic dependencies and invalid portfolio data
     * @param portSecuritiesChangesToConsider
     * @param nonZeroPortSecuritiesChanges
     * @param zeroWeightPortSecuritiesChanges
     * @param errorMessageData
     */
    notifyOnBadPortSecurities(
        portSecuritiesChangesToConsider: HoldingChange[],
        nonZeroPortSecuritiesChanges: HoldingChange[],
        zeroWeightPortSecuritiesChanges: HoldingChange[],
        errorMessageData: Map<string, string>
    ) {
        // send error notification for portfolio securities with zero weights
        if (!isEmpty(zeroWeightPortSecuritiesChanges)) {
            this.notificationService.error('zero weights found for portfolios: ' + zeroWeightPortSecuritiesChanges.map(change => change.lineItem), ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_NOTIFY_ON_BAD_PORT_SECURITIES_ERROR,true);
        }

        // send error notification for discarded portfolios
        const discardedPortNames: string[] = nonZeroPortSecuritiesChanges
            .filter(nonZeroChange => portSecuritiesChangesToConsider.indexOf(nonZeroChange) === -1 && !errorMessageData.has(nonZeroChange.lineItem))
            .map(discardedChange => discardedChange.lineItem);

        if (!isEmpty(discardedPortNames)) {
            this.notificationService.error('Cyclic dependencies found in: ' + discardedPortNames, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_NOTIFY_ON_BAD_PORT_SECURITIES_ERROR,true);
        }

        // send error notification for the portfolio securities with invalid portfolio data
        errorMessageData.forEach((port, message) => this.notificationService.error(port + ': ' + message, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_NOTIFY_ON_BAD_PORT_SECURITIES_ERROR, true));
    }

    /**
     * marks port securities having existing ports
     * @param portSecuritiesChangesToConsider
     * @param portToUnderLyingPortsMap
     * @param portName
     */
    markExistingPortSecurities(
        portSecuritiesChangesToConsider: HoldingChange[],
        portToUnderLyingPortsMap: Map<string, Set<string>>,
        portName: string
    ) {
        portSecuritiesChangesToConsider
            .filter(change => portToUnderLyingPortsMap.get(portName).has(change.lineItem))
            .forEach(change => (change as PortfolioSecuritiesHoldingChange).existingPort = true);
    }

    /**
     * insert line breaks for port securities section
     * @private
     */
    addLineBreakRecords(composition: ExploreResponseConfig & { data: ResponseData }): void {
        const blankRow = new Array(composition.columns.length).fill(null);

        composition.data.children.push({
            data: [...blankRow],
            rowId: CompositionConstants.PORT_SECURITIES_CONSTRAINTS.LINE_BREAK as any
        });
        composition.data.children.push({
            data: [...blankRow],
            rowId: CompositionConstants.PORT_SECURITIES_CONSTRAINTS.LINE_BREAK_1 as any
        });
        composition.data.children.push({
            data: blankRow,
            rowId: CompositionConstants.PORT_SECURITIES_CONSTRAINTS.LINE_BREAK_2 as any
        });

        composition.data.children[composition.data.children.length - 1].data[0] = 'PORTFOLIO SECURITIES';
    }
}
