import {Injectable} from '@angular/core';
import {ExploreResponseConfig} from '@interfaces/response.interface';
import {FavoriteUtils} from '@utils/favorite.utils';
import {concatMap, map} from 'rxjs/operators';
import {CompositionConstants} from '@constants/composition.constants';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {Observable, of, throwError} from 'rxjs';
import {HoldingChangesForRulesRequestPayload} from '@interfaces/holding-changes-for-rules-request-payload.interface';
import {Http2BmsService} from '@services/bms';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {BeforeAfterDataRequestPayload} from '@interfaces/before-after-data-request-payload.interface';
import {isEmpty, isNil, isObject} from 'lodash';
import {Breakdown, CustomFilter} from '@blk/explore-ui-breakdown';
import {CompositionUtils} from '@utils/composition.utils';
import {FavoriteService} from '@services/favorite';
import {HoldingChangeResponse} from '@models/portfolio/composition/holding-change-response.model';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import {StatusConstants} from '@constants/status.constants';
import {HttpUtils} from '@utils/http.utils';
import {HttpParams} from '@angular/common/http';
import {ModellingType} from '@enums/modelling-type.enum';
import {
    AbstractConfig,
    AlertConstants,
    ColumnConstants,
    CoreCommonConstants,
    CoreFavoriteUtils,
    ExploreDialogParam,
    FavoriteType,
    ResponseData
} from '@blk/explore-ui-core';
import {WorkspaceStore} from '@stores/workspace.store';
import {NotificationService} from '@services/notification';
import {PortfolioHoldingChange} from '@models/portfolio/composition/portfolio-holding-change.model';
import {
    PortfolioSecuritiesHoldingChange
} from '@models/portfolio/composition/portfolio-securities-holding-change.model';
import {PortfolioSecuritiesRule} from '@models/portfolio/tradeRules/portfolio-securities-rule.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {PortfolioSecuritiesHandlerService} from './portfolio-securities-handler.service';
import {isAdhocPort} from '@interfaces/base-adhoc-portfolio.interface';
import {NewSecurityHoldingChange} from '@models/portfolio/composition/new-security-holding-change.model';
import {
    PortfolioNavSecurityHoldingChange
} from '@models/portfolio/composition/portfolio-nav-securities-holding-change.model';
import {HoldingChange} from '@models/portfolio/composition/holding-change.model';
import {SecurityRule} from '@models/portfolio/tradeRules/security-rule.model';

/**
 * service class to fetch composition and holding changes data for new as well as saved what if portfolios
 */
@Injectable({
    providedIn: 'root'
})
export class CompositionDataService {

    /**
     * constructor
     * @param httpService http service instance
     * @param favoriteService favorite service instance
     * @param notificationService notification service instance
     * @param portSecuritiesHandlerService port securities handler service instance
     */
    constructor(
        private httpService: Http2BmsService,
        private favoriteService: FavoriteService,
        private notificationService: NotificationService,
        private portSecuritiesHandlerService: PortfolioSecuritiesHandlerService
    ) {}

    /**
     * fetch holding and composition and update the portfolio
     */
    fetchHoldingChangesFollowedByCompositionData$(
        portfolio: WhatIfPortfolio,
        rules?: BaseRule[],
        refreshCachedResponse = false
    ): Observable<ExploreResponseConfig & { data: ResponseData }> {
        // handle portfolio securities rules
        if (!isEmpty(rules) && rules.every(rule => rule instanceof PortfolioSecuritiesRule)) {
            return this.portSecuritiesHandlerService.fetchHoldingChangesForPortSecuritiesRules$(portfolio as PortfolioWithPositions, rules, refreshCachedResponse);
        }

        // For any other type of rule, fetch holding changes of it
        return this.fetchHoldingChangesForRules$(portfolio, rules)
            .pipe(
                concatMap(holdingChanges => {
                    this.addHoldingChangesToPort(holdingChanges, portfolio);
                    return this.fetchCompositionDataForColumns$(portfolio);
                })
            );
    }

    /**
     * It checks if composition rules are applied on portfolio. User can not apply filter on such portfolio. Either we need to remove the existing composition rule or we need to deny the filter.
     */
    applyInputAfterCompositionRuleValidation(portfolio: WhatIfPortfolio, oldFilter: CustomFilter, callbackFn: any): void {
        if (portfolio.isModified() && portfolio.getSerializedHoldingChanges().length > 0 && !oldFilter.equals(portfolio.filter)) {
            this.notificationService.openDialog(
                new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT_WITH_OPTIONS,
                    AlertConstants.HEADER.CONFIRM_COMPOSITION_CHANGE,
                    AlertConstants.BODY.CONFIRM_COMPOSITION_CHANGE,
                    AlertConstants.BTN.CONTINUE,
                    AlertConstants.BTN.CANCEL,
                    callbackFn,
                    () => {
                        WorkspaceStore.getCurrentPortfolio().filter = oldFilter;
                    },
                    oldFilter
                )
            );
        } else {
            callbackFn(oldFilter);
        }
    }

    /**
     *  fetch holding changes for the provided rules.
     */
    fetchHoldingChangesForRules$(portfolio: WhatIfPortfolio, rules?: BaseRule[], includePortfolioPositions?: boolean): Observable<HoldingChangeResponse> {
        let tradeRules: BaseRule[] = rules;
        if (isEmpty(tradeRules) && portfolio instanceof RulesBasedPortfolio) {
            tradeRules = portfolio.compositionRules.tradeRules;
        }
        // If there are no rules, then return.
        if (isEmpty(tradeRules)) {
            return of(new HoldingChangeResponse());
        }

        const params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(new HttpParams(), StatusConstants.LOADING_COMPOSITION_DATA_FOR + portfolio.portName.toUpperCase());

        return this.httpService
            .post$('getHoldingChangesForRules', this.getHoldingChangesForRulesRequestPayload(portfolio, tradeRules, includePortfolioPositions), params)
            .pipe(
                concatMap(response => {
                    if (response && response.status?.toUpperCase() === AlertConstants.FAILURE && !isEmpty(response.message)) {
                        return this.handleErrorResponse(response.message, rules, portfolio);
                    } else if (response && response.data && !(isEmpty(response.data.holdingChanges) && isEmpty(response.data.skippedRules))) {
                        return of(new HoldingChangeResponse({
                            holdingChanges: response.data.holdingChanges,
                            skippedRules: response.data.skippedRules
                        }));
                    } else {
                        return of(new HoldingChangeResponse());
                    }
                })
            );
    }

    /**
     *  handles error response for getHoldingChangesForRules
     */
    private handleErrorResponse(message: string, rules: BaseRule[], portfolio: WhatIfPortfolio): Observable<HoldingChangeResponse> {
        let parsedResponse: any;
        try {
            parsedResponse = JSON.parse(message);
            if (!isNil(parsedResponse['SECURITIES_WITH_ASSET_VALIDATION_ERRORS']) && isAdhocPort(portfolio) && portfolio.holdingChanges.length === 0) {
                const skippedRules = Array.from(parsedResponse['SECURITIES_WITH_ASSET_VALIDATION_ERRORS']).map((cusip: string) => {
                    const securityRule = rules.find(rule => rule.lineItem === cusip);
                    (securityRule as SecurityRule).hasAssetValidationError = true;
                    return securityRule;
                });
                return of(new HoldingChangeResponse({
                    skippedRules
                }));
            } else {
                message = !isNil(parsedResponse['ERROR_MSG']) ? parsedResponse['ERROR_MSG'] : message;
                return throwError(message);
            }
        } catch (e) {
            return throwError(message); // error in the above string (in this case, yes)!
        }
    }

    /**
     * fetch composition data for columns
     */
    fetchCompositionDataForColumns$(portfolio: WhatIfPortfolio): Observable<ExploreResponseConfig & {data: ResponseData}> {
        // add loading params for this http request
        const params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(new HttpParams(), StatusConstants.LOADING_COMPOSITION_DATA_FOR + portfolio.portName.toUpperCase());

        return this.httpService
            .post$('getBeforeAfterData', this.getBeforeAfterDataRequestPayload(portfolio), params)
            .pipe(
                map(beforeAfterData => beforeAfterData && isObject(beforeAfterData.data) ? beforeAfterData.data : {}),
                map(compositionData => this.portSecuritiesHandlerService.addRecordsForPortfolioSecuritiesChanges(
                    portfolio,
                    compositionData,
                    portfolio.holdingChanges.filter(change => change instanceof PortfolioSecuritiesHoldingChange)
                )),
                map(compositionData => this.transformCompositionDataForComposite(portfolio, compositionData))
            );
    }

    /**
     * prepare composition data for composite index portfolio
     */
    transformCompositionDataForComposite(portfolio: WhatIfPortfolio, compositionData: any): ExploreResponseConfig & {data: ResponseData} {
        // if type is not portfolio modelling and portfolio is not composite index, return composition data as it is
        if (!(portfolio.isCompositePortfolio && portfolio.modellingType === ModellingType.PORTFOLIO)) {
            return compositionData;
        }

        // Get the original NAV for composite from composition data
        const originalNAVColumnIndex = compositionData.columns.indexOf(CompositionConstants.NAV_GROUP_BEFORE);
        const newNAVColumnIndex = compositionData.columns.indexOf(CompositionConstants.NAV_GROUP_AFTER);
        const totalNAV = originalNAVColumnIndex !== -1 ? compositionData.data.data[originalNAVColumnIndex] : 0;
        const newTotalNAV = newNAVColumnIndex !== -1 ? compositionData.data.data[newNAVColumnIndex] : 0;

        const holdingChangeMap = {};
        if (!isEmpty(portfolio.holdingChanges)) {
            portfolio.holdingChanges.forEach((holdingChange: PortfolioHoldingChange | NewSecurityHoldingChange) => {
                const lineItemWithTitle: string = holdingChange instanceof PortfolioHoldingChange ? holdingChange.getWithFavTitle(holdingChange.lineItem) : holdingChange.lineItem;
                holdingChangeMap[lineItemWithTitle] = holdingChange.newWeight / 100.0;
            });
        }

        this.sortHoldingChanges(portfolio.holdingChanges);
        // Calculate newWeight for indices as NAV has changed
        portfolio.indexWeights.forEach(indexWeights => {
            if (isNil(indexWeights.newWeight)) {
                indexWeights.newWeight = (indexWeights.weight * totalNAV) / newTotalNAV;
            }
        });

        this.calculateIndexWeights(portfolio, newTotalNAV, totalNAV);

        // prepare data for constituents of composite
        compositionData.data.children = portfolio.indexWeights.map((indexWeight, i) => {
            return {
                rowId: i + 2,
                data: [
                    indexWeight.portfolioPortName,
                    indexWeight.portfolioPortName,
                    indexWeight.portfolioFullName,
                    indexWeight.portfolioCode ? indexWeight.weight * totalNAV : 0.0,
                    indexWeight.newWeight * newTotalNAV,
                    0,
                    indexWeight.portfolioCode ? indexWeight.weight : 0.0,
                    indexWeight.newWeight,
                    0
                ]
            };
        });
        return compositionData;
    }

    /**
     * fetch default breakdown for composition
     */
    fetchDefaultCompositionBreakdown$(port: WhatIfPortfolio): Observable<AbstractConfig> {
        // If breakdown tree is already defined for e.g saved in workspace no need to initialize with default breakdown
        if (port instanceof WhatIfPortfolio && port.isCompositionBreakdownSpecified()) {
            return of(port.compositionSetting.breakdownTree);
        }

        // If there is a mandated sector breakdown apply that breakdown to the composition panel.
        // If not, go with the default breakdown.
        const breakdown: any = port.mandateSettings.settings.get(FavoriteType.BREAKDOWN);
        if (breakdown) {
            const flagId = FavoriteUtils.splitFlagIdForFavorite(breakdown);
            return this.favoriteService.getFavorite$(flagId.id, null, CoreFavoriteUtils.isGlobalFavorite(flagId.owner));
        }

        // Just set the default breakdown and get out of here.
        return of(Breakdown.getDefaultBreakdown());
    }

    /**
     * add holding changes to portfolio
     */
    addHoldingChangesToPort(holdingChanges: HoldingChangeResponse, portfolio: WhatIfPortfolio): void {
        // Setting skipped rules.
        portfolio.skippedRulesForEachDate = holdingChanges.skippedRules;
        // Calculating and setting passed rules.
        if (portfolio instanceof RulesBasedPortfolio) {
            portfolio.setPassedRulesForEachDate(
                CompositionUtils.calculatePassedRules(portfolio.compositionRules.tradeRules, holdingChanges.skippedRules)
            );
        }
        // Adding holding changes to portfolio
        portfolio.addHoldingChanges(holdingChanges.holdingChanges);
        // If the portfolio is a composite, we should also add any new portfolios to the index weights
        if (portfolio.isCompositePortfolio) {
            portfolio.addNewPortfolioWeightsToCompositeIndexWeights(holdingChanges.holdingChanges);
        }
    }

    /**
     * prepare holding changes payload for request
     */
    getHoldingChangesForRulesRequestPayload(portfolio: WhatIfPortfolio, rules: BaseRule[], includePortfolioPositions?: boolean): HoldingChangesForRulesRequestPayload {
        return {
            portfolioName: portfolio.portName,
            includeAliasPortfolios: !!portfolio.isIndexResearchPortfolio,
            benchName: portfolio.benchmark ? portfolio.benchmark.name : undefined,
            date: portfolio.datePicker.date,
            rules: rules ? JSON.stringify(rules.map(rule => rule.serialize())) : null,
            benchmarkHoldingChanges: portfolio.benchmark ? portfolio.benchmark.getSerializedBenchmarkHoldingChanges() : [],
            portfolioHoldingChanges: portfolio.holdingChanges
                .filter(holdingChange => !holdingChange.isChildChange)
                .map(holdingChange => holdingChange.serialize()),
            compositionFilter: null,
            portfolioPositionsInHoldingChanges: !!includePortfolioPositions,
            ...CompositionUtils.getAdhocParams('adhocPortParams', portfolio),
            ...(!isEmpty( CompositionUtils.getAdhocParams('adhocPortParams', portfolio?.benchmark?.portfolio)) ? { benchmarkAdhocPortParams: CompositionUtils.getAdhocParams('adhocPortParams', portfolio.benchmark.portfolio).adhocPortParams} : {})
        };
    }

    /**
     * prepare payload for before after request data
     */
    getBeforeAfterDataRequestPayload(portfolio: WhatIfPortfolio): BeforeAfterDataRequestPayload {
        // ModellingType.PORTFOLIO = 2. During portfolio modelling, we do not allow to put breakdown on the portfolio
        let breakdownTree;
        if (portfolio.modellingType === 2) {
            breakdownTree = undefined;
        } else if ((!portfolio.compositionSetting.breakdownTree || portfolio.compositionSetting.breakdownTree.isEmpty()) && portfolio.modellingType === ModellingType.SECTOR) {
            breakdownTree = Breakdown.getDefaultBreakdown().serializeFullContent();
        } else {
            breakdownTree = portfolio.compositionSetting.breakdownTree.serializeFullContent();
        }
        let filterTargetTypeRequest;
        // For compositionFilter
        if (portfolio.filter && !portfolio.filter.isFilterEmpty()) {
            filterTargetTypeRequest = portfolio.applyFilterTo ? portfolio.applyFilterTo : 'BOTH';
        }
        if (portfolio instanceof RulesBasedPortfolio && portfolio.modellingType === ModellingType.PORTFOLIO && !isEmpty(portfolio.cashOffsetHoldingChanges)) {
            portfolio.holdingChanges.push(...portfolio.cashOffsetHoldingChanges);
        }

        // setting composition related parameters.
        return {
            type: 'composition',
            portfolio: portfolio.portName,
            benchmark: portfolio.benchmark.name,
            benchSelection: portfolio.benchmark.type,
            benchOrder: portfolio.benchmark.order,
            forDate: portfolio.datePicker.date,
            currency: portfolio.currency,
            columns: CompositionUtils.createCompositionConfig(portfolio).requestColumns.map(requestCol => {
                const reqCol: any = requestCol.createRequestColumn();
                if (reqCol.columnKey === 'cusip' || reqCol.columnKey === 'portfolio_name') {
                    reqCol.identifierColumn = true;
                }
                if (reqCol.columnKey === ColumnConstants.SEC_DESC) {
                    reqCol.optionValues = {secDescDisplay: portfolio.compositionSetting.secDescType};
                }
                return reqCol;
            }),
            breakdownTree: JSON.stringify(breakdownTree),
            ...(!portfolio.filter?.isFilterEmpty() ? {compositionFilter: portfolio.filter.returnSerializedFilter()} : {}),
            ...(!portfolio.compositionSetting?.compositionFilter?.isFilterEmpty() ? {filter: portfolio.compositionSetting.compositionFilter.returnSerializedFilter()} : {}),
            filterTargetType: filterTargetTypeRequest ? filterTargetTypeRequest : undefined,
            holidayCalendar: portfolio.datePicker.calCode,
            isSectorView: 'N',
            isRiskFactorRequest: 'N',
            isPortGroupSummaryRequest: (portfolio.isPortfolioGroup || portfolio.isCompositePortfolio) && portfolio.modellingType === 2 ? 'Y' : 'N',
            // we don't need to set isFullySpecifiedPortfolio to Y for any use case, specially for position based portfolios as we save date while saving favourites;
            // we can remove this from the contract itself, but keeping it here as a reminder in case something comes in.
            isFullySpecifiedPortfolio: 'N',
            includeAliasPortfolios: !!portfolio.isIndexResearchPortfolio,
            holdingChanges: portfolio.holdingChanges
                .filter(change => !(change instanceof PortfolioSecuritiesHoldingChange))
                .map(holdingChange => holdingChange.serialize()),
            benchmarkHoldingChanges: portfolio.benchmark ? portfolio.benchmark.getSerializedBenchmarkHoldingChanges() : [],
            ...CompositionUtils.getAdhocParams('adhocParams', portfolio),
            ...(portfolio?.benchmark?.portfolio && isAdhocPort(portfolio.benchmark.portfolio)
                ? {benchmarkAdhocParams: portfolio.benchmark.getBenchAdhocParams()}
                : {}),
            dataFormat: 'COMPACT_JSON',
            // Do not use splitPositionTypes for modelling flow
            splitPositionTypes: CoreCommonConstants.EMPTY_STRING,
            createOptimizationCashBucket: portfolio.compositionSetting.isOptimizationCashSettingChecked ? true : undefined,
            ...(!portfolio.compositionSetting?.compositionFilter?.isFilterEmpty() && portfolio.compositionSetting.isNormalized?.data ? {normalizedWidgetFilter: true} : {}),
        };
    }

    /**
     * Sort holding changes on the basis of order/replacementCount whichever is applicable
     * @param holdingChanges
     * @private
     */
    private sortHoldingChanges(holdingChanges: HoldingChange[]): void {
        holdingChanges.sort((change1, change2) => {
            let order1 = null;
            let order2 = null;
            if (change1 instanceof PortfolioNavSecurityHoldingChange) {
                order1 = change1.order;
            } else if (change1 instanceof PortfolioHoldingChange) {
                order1 = change1.replacementCount;
            }
            if (change2 instanceof PortfolioNavSecurityHoldingChange) {
                order2 = change2.order;
            } else if (change2 instanceof PortfolioHoldingChange) {
                order2 = change2.replacementCount;
            }
            return order1 > order2 ? 1 : -1;
        });
    }

    /**
     * Calculate the NAV when a portfolio holding change is made.
     * We get all the non nav neutral holding changes occurring before a portfolio holding change
     * and add it to the original NAV
     * @param holdingChanges
     * @param change
     * @param totalNAV
     * @private
     */
    private calculateNAVAtTimeOfChange(holdingChanges: HoldingChange[], change: PortfolioHoldingChange, totalNAV: number): number {
        const navChangingChanges = holdingChanges.filter(sortedChange => sortedChange instanceof PortfolioNavSecurityHoldingChange && sortedChange.order < change.replacementCount)
            .map((holdingChange: PortfolioNavSecurityHoldingChange) => holdingChange.changeInMarketValue);

        const navChange = isNil(navChangingChanges) || isEmpty(navChangingChanges) ? 0.0 : navChangingChanges.reduce((change1, change2) => change1 + change2);

        return totalNAV + navChange;
    }

    /**
     * Calculate weights of individual constituent indices based on holdingChanges
     * @param portfolio
     * @param newTotalNAV
     * @param totalNAV
     * @private
     */
    private calculateIndexWeights(portfolio: WhatIfPortfolio, newTotalNAV: number, totalNAV: number) {
        for (const change of portfolio.holdingChanges) {
            if (change instanceof PortfolioHoldingChange) {
                const nameWithTitle: string = change.getWithFavTitle(change.lineItem);
                const indexWeight = portfolio.indexWeights.find(index => index.portfolioPortName === nameWithTitle);
                const navAtTimeOfChange = this.calculateNAVAtTimeOfChange(portfolio.holdingChanges, change, totalNAV);
                // get the newWeight as per the NAV that would have been at this time
                indexWeight.newWeight = newTotalNAV * indexWeight.newWeight / navAtTimeOfChange;
                // calculate changeInWeight with respect to the latest newWeight
                if (change.replacementCount !== 0) {
                    change.changeInWeight = change.newWeight - indexWeight.newWeight * 100;
                }
                indexWeight.newWeight = change.newWeight / 100;
            } else if (change instanceof PortfolioNavSecurityHoldingChange) {
                portfolio.indexWeights.forEach(indexWeight => {
                    const lastHoldingChange = portfolio.holdingChanges.filter(sortedChange => sortedChange instanceof PortfolioHoldingChange)
                        .reverse()
                        .find((holdingChange: PortfolioHoldingChange) => holdingChange.replacementCount < change.order && indexWeight.portfolioPortName === holdingChange.lineItem);

                    if (!isNil(lastHoldingChange)) {
                        // If an index already has a holdingChange, then apply the changes as per that holding change and then get weight based on new NAV
                        const navAtTimeOfChange = this.calculateNAVAtTimeOfChange(portfolio.holdingChanges, lastHoldingChange as PortfolioHoldingChange, totalNAV);
                        indexWeight.newWeight = (lastHoldingChange.newWeight * navAtTimeOfChange / 100) / newTotalNAV;
                    } else {
                        // For non NAV neutral changes, change index weight as per new NAV
                        indexWeight.newWeight = (indexWeight.weight * totalNAV) / newTotalNAV;
                    }
                });
            }
        }
    }
}
