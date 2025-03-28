import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {forkJoin, Observable, of, throwError} from 'rxjs';
import {catchError, concatMap, map, mergeMap} from 'rxjs/operators';
import {isEmpty, isNil, isNumber, isObject} from 'lodash';
import {Http2BmsService} from '@services/bms';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {PortfolioCacheKey} from '@models/portfolio/portfolio-cache-key.model';
import {MandateStore, PortfolioStore} from '../../../stores';
import {BenchmarkConstants, CommonConstants, CompositionConstants, StatusConstants} from '../../../constants';
import {MandateSettings} from '@models/mandate/mandate-settings.model';
import {HttpUtils} from '@utils/http.utils';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {BaseAdhocPortfolio, isAdhocPort} from '@interfaces/base-adhoc-portfolio.interface';
import {CompositionDataService} from '../../../modules/main/composition-modelling/services/composition-data.service';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {FavoriteService} from '@services/favorite';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {IndexSearchTreeItem} from '@models/portfolio/index-search-tree-item.model';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import {PublishStateService} from '@services/publishState/publish-state.service';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {NotificationService} from '@services/notification';
import {CalendarDateUtils, CoreDefinitionStore, DateFormatConstants, DateService, DateValue, ExploreDialogParam, AlertConstants} from '@blk/explore-ui-core';
import {PortfolioUtils} from '@utils/portfolio.utils';
import {AppStore} from '../../../app.store';

/**
 * Portfolio Service
 */
@Injectable({
    providedIn: 'root'
})
export class PortfolioService {

    /**
     * Return the appropriate portfolio object based on portData passed in
     */
    static getPortfolioObject(portfolioSearchItem: PortfolioSearchItem | IndexSearchTreeItem, dateObject?: DateValue, isIndexResearchPortfolio?: boolean): Portfolio {
        const dateObjectToUse: DateValue = dateObject ? dateObject : CalendarDateUtils.getDefaultDateObject();
        let newPort = null;
        if (portfolioSearchItem instanceof IndexSearchTreeItem) {
            newPort = new Portfolio(portfolioSearchItem.ticker, dateObjectToUse);
        } else {
            if (portfolioSearchItem.type === CompositionConstants.ADHOC_PORT) {
                newPort = new AdhocPortfolio(portfolioSearchItem.ticker, dateObjectToUse);
            } else if (portfolioSearchItem.type === CompositionConstants.ADHOC_PORT_GROUP) {
                newPort = new AdhocPortGroup(portfolioSearchItem.ticker, dateObjectToUse);
            } else {
                newPort = portfolioSearchItem.id
                    ? (portfolioSearchItem.type === CompositionConstants.PORT_WITH_RULES.TYPE
                        ? new RulesBasedPortfolio(portfolioSearchItem.ticker, null, dateObjectToUse)
                        : new PortfolioWithPositions(portfolioSearchItem.ticker, dateObjectToUse, [], null))
                    : new Portfolio(portfolioSearchItem.ticker, dateObjectToUse);
            }
            newPort.id = portfolioSearchItem.id as number;
            if (portfolioSearchItem.fullName && portfolioSearchItem.id) {
                newPort.title = portfolioSearchItem.fullName;
            }
        }
        newPort.isIndexResearchPortfolio = isIndexResearchPortfolio;
        newPort.fullName = portfolioSearchItem.fullName;
        return newPort;
    }

    constructor(private httpService: Http2BmsService, private compositionDataService: CompositionDataService, private favoriteService: FavoriteService,
                private dateservice: DateService, private publishStateService: PublishStateService, private notificationService: NotificationService, private appStore: AppStore) {
    }

    /**
     * fetch portfolio information from server and load necessary fields
     */
    fetchPortfolioInformation$(portfolio: Portfolio, portInfoRequestParams: PortInfoRequestParams, disableLoading?: boolean, adhocPortParams?: AdhocPortParams, rules?: BaseRule[], skipFetchPublishState?: boolean): Observable<Portfolio> {
        // If there is no portName then just get out of here.
        if (!portfolio || isNil(portfolio.portName) || portfolio.portName.length === 0) {
            console.error('No portfolio specified');
            return of(portfolio);
        }

        // if it's a saved portfolio, fetch favorite data for the same.
        // else return portfolio as it is
        const portfolioObs = !isNumber(portfolio.id)
            ? of(portfolio)
            : this.favoriteService.getFavorite$(portfolio.id, CommonConstants.LOADING_WHAT_IF)
                .pipe(
                    concatMap((savedFavorite: Portfolio) => {
                        // for existing workspace favorites, we do not save configType property (Eg: "configType": "WHATIF_RULES")
                        // for benchmark, like we do for portfolio.
                        // This leads to bench port picking wrong type while loading favorite.
                        // Hence, for bench we are doing reverse; as the saved portfolio favorite has the config type information
                        // and picks the right what-if port type
                        if (portfolio.isBench) {
                            if (savedFavorite instanceof AdhocPortfolio && savedFavorite.adhocParams && savedFavorite.adhocParams.isPortGroup) {
                                portfolio = new AdhocPortGroup();
                                (portfolio as AdhocPortGroup).createRulesFromHoldingChanges(savedFavorite.holdingChanges);
                                portfolio.deserialize(savedFavorite.serialize());
                                savedFavorite = new AdhocPortGroup();
                                savedFavorite = portfolio;
                            }
                            // Here, we have to rely to savedFavorite for the correct what-if type
                            const portWithPosDate = savedFavorite instanceof PortfolioWithPositions ? savedFavorite.date : null;
                            if (isAdhocPort(savedFavorite)) {
                                (portfolio as AdhocPortfolio|AdhocPortGroup).adhocParams = savedFavorite.adhocParams;
                            }
                            savedFavorite.deserialize(portfolio.serialize());
                            if (portWithPosDate) {
                                savedFavorite.datePicker.date = portWithPosDate;
                            } else { // initialize with date of the portfolio loaded in current workpad for rule based portfolio
                                savedFavorite.datePicker = portfolio.datePicker;
                            }
                            savedFavorite.isBench = true;
                            portfolio = savedFavorite;
                        } else {
                            // Here, portfolio has the right type (in case it's a what-if)
                           const portTitle = portfolio.title;
                           const holdingChanges = (portfolio as WhatIfPortfolio).holdingChanges;
                           // convert AdhocPortfolio with isPortGroup true to AdhocPortGroup
                            if (savedFavorite instanceof AdhocPortfolio && portfolio instanceof AdhocPortfolio && savedFavorite.adhocParams && savedFavorite.adhocParams.isPortGroup) {
                                portfolio = new AdhocPortGroup();
                                (portfolio as AdhocPortGroup).createRulesFromHoldingChanges(savedFavorite.holdingChanges);
                                portfolio.datePicker = CalendarDateUtils.getDefaultDateObject();
                            }

                            portfolio.deserialize(savedFavorite.serialize());

                            // assign back original title and holding changes
                            if (!isNil(portTitle)) {
                                portfolio.title = portTitle;
                            }
                            if (!isNil(holdingChanges) && !isEmpty(holdingChanges)) {
                                (portfolio as WhatIfPortfolio).holdingChanges = holdingChanges;
                            }
                        }

                        // ensure favorite id and owner are copied from saved favorite to portfolio
                        portfolio.id = savedFavorite.id;
                        portfolio.owner = savedFavorite.owner;

                        return of(portfolio);
                    })
                );

        return portfolioObs.pipe(
            concatMap(() => {
                return isNil(portfolio.datePicker.date)
                    ? this.dateservice.parseDateString$(portfolio.datePicker.calCode, portfolio.datePicker.dateStringValue)
                        .pipe(map(jsDateObj => {
                            portfolio.datePicker.date = CalendarDateUtils.getDateInFormat(jsDateObj, DateFormatConstants.MMDDYYYY_SLASH);
                            return portfolio;
                        }))
                    : of(portfolio);
            }),
            concatMap(port =>
                this.fetchPortInfoAndCallForComposition$(port, portInfoRequestParams, disableLoading, adhocPortParams, rules, skipFetchPublishState)),
            catchError(error => throwError(error))
        );
    }

    /**
     * make sequential calls to first fetch port info from the server followed by
     * call to fetch holding/composition composition data and load it into passed-in portfolio
     */
    fetchPortInfoAndCallForComposition$(portfolio: Portfolio, portInfoRequestParams: PortInfoRequestParams, disableLoading?: boolean, adhocPortParams?: AdhocPortParams, rules?: BaseRule[], skipFetchPublishState?: boolean): Observable<Portfolio> {
        // Try and get the portfolio from the cache.
        const portInfoObject: any = PortfolioStore.getPortfolioInfoFromCache(
            new PortfolioCacheKey(portfolio.portName.toUpperCase(), portfolio.datePicker.date, portInfoRequestParams.isLightVersion, portInfoRequestParams.includeMandate)
        );

        const portInfoObjectObs: Observable<Portfolio> = !isObject(portInfoObject)
            ? this.fetchPortfolioInfoObject$(portfolio, portInfoRequestParams, disableLoading, adhocPortParams)
            : of(portInfoObject);

        return portInfoObjectObs.pipe(
            concatMap(portInfo => {
                this.addPortInfoAndInitializePortfolio(portInfo, portfolio);
                return this.fetchBenchmarkCompositionData$(portfolio);
            }),
            concatMap(portWithUpdatedBench => this.loadCompositionDataBasedOnPortType$(portWithUpdatedBench, rules)),
            concatMap(() => skipFetchPublishState || portfolio.isBench || (isObject(portInfoObject) && !portfolio.publishStateWrapperSubject$.getValue().isFirstLoad) ? of(portfolio) : this.publishStateService.fetchPublishedState$(portfolio, !disableLoading)),
            catchError(error => throwError(error))
        );
    }

    /**
     * fetch portfolio information from the server
     */
    fetchPortfolioInfoObject$(portfolio: Portfolio, portInfoRequestParams: PortInfoRequestParams, disableLoading?: boolean, adhocPortParams?: AdhocPortParams): Observable<any> {
        let params = new HttpParams();
        if (!disableLoading) {
            params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(params, StatusConstants.LOADING_DATA_FOR + portfolio.portName.toUpperCase());
        }

        // If the portfolio is adhoc portfolio but adhocPortParams is not passed in, then take it from portfolio.
        if (!adhocPortParams && isAdhocPort(portfolio)) {
            adhocPortParams = (portfolio as BaseAdhocPortfolio).adhocParams;
        }

        // Request the portfolio info from the server.
        return this.httpService
            .post$('portfolioInfo', {
                    portfolio: portfolio.portName,
                    forDate: portfolio.datePicker.date,
                    isIndexHistoryPort: portfolio.isIndexResearchPortfolio,
                    lightVersion: portInfoRequestParams.isLightVersion,
                    includeMandate: portInfoRequestParams.includeMandate,
                    adhocPortParams: adhocPortParams ? adhocPortParams.serialize() : undefined
                }, params
            )
            .pipe(
                mergeMap(portfolioInfo => {
                    if (!isObject(portfolioInfo.data)) {
                        portfolio.title = portfolio.portName = '';
                        throw portfolioInfo.message ? Error(portfolioInfo.message) : Error('Received exception from server');
                    }
                    let date$ = of(new Date(portfolio.datePicker.date));
                    if (portfolio.datePicker.dateStringValue) {
                        // Need to confirm if the default date matches the actual date by calling parseDateString$ before returning the result back.
                        // parseDateString$ need the calendar which comes from portfolioInfo response.
                        const calendarCode = portfolio.datePicker.calCode == null ? CalendarDateUtils.getCalendarByCode(CoreDefinitionStore.calendars, portfolioInfo.data.portfolioDefaults.calendar).calendarCode :
                            portfolio.datePicker.calCode;
                        date$ = this.dateservice.parseDateString$(calendarCode, portfolio.datePicker.dateStringValue);
                    }
                    return forkJoin(of(portfolioInfo), date$);
                }),
                mergeMap(([portfolioInfo, parsedDate]) => {
                    const fetchedDateString = CalendarDateUtils.getDateInFormat(parsedDate, DateFormatConstants.MMDDYYYY_SLASH);
                    if (portfolio.datePicker.date !== fetchedDateString) {
                        // If the dates do not match, fetch portfolio info again with the correct date.
                        portfolio.datePicker.date = fetchedDateString;
                        return this.fetchPortfolioInfoObject$(portfolio, portInfoRequestParams, disableLoading, adhocPortParams);
                    }
                    const portCacheKey: PortfolioCacheKey = new PortfolioCacheKey(portfolio.portName.toUpperCase(), portfolio.datePicker.date, portInfoRequestParams.isLightVersion, portInfoRequestParams.includeMandate);
                    PortfolioStore.addPortfolioInfoToCache(portCacheKey, portfolioInfo.data);
                    return of(portfolioInfo.data);
                }),
                catchError(error => throwError(error))
            );
    }

    /**
     * fetch holding/composition data from the server and load it into passed-in portfolio
     */
    loadCompositionDataBasedOnPortType$(portfolioWithoutBreakdown: Portfolio, rules?: BaseRule[]): Observable<Portfolio> {
        const portWithBreakdownPromise: Observable<Portfolio> = portfolioWithoutBreakdown instanceof WhatIfPortfolio && !portfolioWithoutBreakdown.isBench
            ? this.compositionDataService.fetchDefaultCompositionBreakdown$(portfolioWithoutBreakdown)
                .pipe(map(breakdown => {
                    portfolioWithoutBreakdown.compositionSetting.breakdownTree = breakdown as Breakdown;
                    return portfolioWithoutBreakdown;
                }))
            : of(portfolioWithoutBreakdown);

        return portWithBreakdownPromise
            .pipe(
                concatMap(portfolio => {
                    if (!portfolio.isBench && portfolio instanceof WhatIfPortfolio) {
                        // If the portfolio is not a benchmark then, load the holding changes and the composition data
                        return this.compositionDataService.fetchHoldingChangesFollowedByCompositionData$(portfolio, rules)
                            .pipe(map(compositionData => {
                                portfolio.composition = compositionData;
                                return portfolio;
                            }));
                    } else if (portfolio instanceof RulesBasedPortfolio) {
                        // Just load the holding changes for the benchmark portfolio
                        return this.compositionDataService.fetchHoldingChangesForRules$(portfolio)
                            .pipe(map(holdingChanges => {
                                this.compositionDataService.addHoldingChangesToPort(holdingChanges, portfolio);
                                return portfolio;
                            }));
                    } else {
                        return of(portfolio);
                    }
                })
            );
    }

    /**
     * Add portfolio information from server to portfolio object
     */
    addPortInfoAndInitializePortfolio(portInfo: any, portfolio: Portfolio): void {
        const portName = portfolio.portName;
        // Save original port id
        const portId = portfolio.portId;
        // save the original favorite title
        const title: string = portfolio.title;
        portfolio.deserialize(portInfo);
        if (portInfo.portfolioDefaults && isNil(portfolio.datePicker.calCode)) {
            portfolio.datePicker.calCode = portInfo.portfolioDefaults.calendar;
        }
        // restore the title
        portfolio.title = title;
        // restore the portId
        portfolio.portId = portId;
        // restore the portName - For alias portfolios we need to maintain the ticker that appeared in the search.. the ticker returned in port info could be different.
        // For example for LEH_AGG alias portfolio the ticker returned in port info would be LEH_AGG_AP.. we still want to maintain LEH_AGG
        portfolio.portName = portName;
        // Set the asset type
        portfolio.assetType = portInfo.assetType;
        // Set mandateSettings with mandate and assetType from the payload
        portfolio.mandateSettings = MandateStore.getMandateSettings(portInfo.mandate, portfolio.assetType) || new MandateSettings();
        portfolio.loadPortfolioDefaultSettings();
    }

    /**
     * Update portfolio time period
     */
    updatePortfolioTimePeriod$(portfolio: Portfolio): Observable<void> {
        const params = new HttpParams({fromObject: {portfolioName: portfolio.portName, asOfDate: portfolio.datePicker.date, holidayCalendar: portfolio.datePicker.calCode}});

        return this.httpService.post$('timePeriods', params)
            .pipe(map(payload => portfolio.timePeriods = payload.data));
    }

    /**
     * This method will fetch the portfolio's cusip from the server.
     */
    public getPortfolioCusipData$(portfolioList: string[]): Observable<{ [portName: string]: string }> {
        const requestParams = {
            portfolios: portfolioList
        };
        return this.httpService.post$('getPortfolioCusipInfo', requestParams).pipe(
            map(
                (payload: any) => {
                    return payload && payload.data ? payload.data : {};
                }
            ),
            catchError(
                error => {
                    console.error('error loading the cusip info ' + portfolioList);
                    return throwError(error);
                }
            )
        );
    }

    /**
     * fetch composition related data for benchmark what-if's
     */
    fetchBenchmarkCompositionData$(portfolio: Portfolio): Observable<Portfolio> {
        if (!portfolio.benchmark || !portfolio.benchmark.portfolio || !portfolio.benchmark.portfolio.id) {
            return of(portfolio);
        }

        const portSearchItem: PortfolioSearchItem = new PortfolioSearchItem(portfolio.benchmark.name, null, null, null, null, portfolio.benchmark.portfolio.id);
        if (!this.isValidWhatIfBench(portfolio, portfolio.benchmark.portfolio, null, portSearchItem)) {
            return of(portfolio);
        }

        const benchPort: Portfolio = PortfolioService.getPortfolioObject(portSearchItem, new DateValue({date: portfolio.datePicker.date}));
        benchPort.isBench = true;
        return this.fetchPortfolioInformation$(benchPort, {isLightVersion: true, includeMandate: false})
            .pipe(
                map(benchmarkPort => {
                    // Set the benchmark and portfolio values after the portfolio loads
                    portfolio.benchmark = new Benchmark({
                        name: benchmarkPort.portName,
                        type: BenchmarkConstants.OTHER_BENCH
                    });
                    portfolio.benchmark.portfolio = benchmarkPort;

                    // if selected benchmark is portfolio with positions with a date different from that of portfolio
                    // then revert back to previous benchmark or set it to None.
                    this.isValidWhatIfBench(portfolio, benchmarkPort);

                    return portfolio;
                })
            );
    }

    /**
     * if ticker is same for port and the selected what-if benchmark
     * else
     * if selected benchmark is portfolio with positions with a date different from that of portfolio
     * then revert back to previous benchmark or set it to None.
     *
     * returns true indicating same date for port and bench (port with positions)
     * else, return false
     */
    isValidWhatIfBench(portfolio: Portfolio, benchmarkPort: Portfolio, previousBench?: Benchmark, portSearchItem?: PortfolioSearchItem): boolean {
        const notificationMessage: string = portSearchItem && !!portSearchItem.id && portSearchItem.ticker === portfolio.portName
            ? AlertConstants.BODY.INVALID_BENCHMARK_TICKER
            : benchmarkPort instanceof PortfolioWithPositions && benchmarkPort.date !== portfolio.datePicker.date
                ? AlertConstants.BODY.INVALID_BENCHMARK.replace('BENCH_PORT_DATE', benchmarkPort.date)
                : undefined;

        if (!!notificationMessage) {
            this.notificationService.openDialog(new ExploreDialogParam(
                AlertConstants.TYPE.ALERT,
                AlertConstants.HEADER.INVALID_BENCHMARK,
                notificationMessage,
                AlertConstants.BTN.OK,
                null,
                null,
                () => {
                    PortfolioUtils.revertBenchmark(portfolio, previousBench);
                    this.appStore.updateBenchmarkOption$.next(portfolio);
                }
            ));
            return false;
        }

        return true;
    }
}

export interface PortInfoRequestParams {
    isLightVersion: boolean;
    includeMandate: boolean;
}
