import {Injectable} from '@angular/core';
import {
    CustomAggregationColumnOption,
    CustomCalculationColumnOption, ScenarioColumnOption,
    TempAlignmentScenariosColumnOption,
    TransitionClimateScenariosColumnOption
} from '@blk/explore-ui-column-option';
import {
    AbstractFavoriteConfig,
    AlertConstants,
    CommonUtils,
    CoreCommonConstants,
    CoreFavoriteConstants,
    ErrorTypeConstants,
    ExploreSectorConstraintBoundType,
    ExploreSectorConstraintRelativeOperatorType,
    ExploreSectorsForConstraint,
    SerializeFavoriteType,
    TelemetryActionConstants,
    TelemetryConstraintsParameters,
    TelemetryInvestmentUniverseTypeParameters,
    TelemetryOptimizationRunParameters,
    TelemetryPortfolioConstraintDetailParameter,
    TelemetryRiskBudgetingParameters,
    TelemetrySectorConstraintBoundParameter,
    TelemetrySectorConstraintDetailParameter,
    TelemetrySecurityConstraintDetailParameter,
    TelemetryService,
    TelemetryTierDefinitionRiskBudgetingParameters,
    UIErrorParameters,
    ExploreRiskBudgetingCase,
    TypeInInvestmentUniverse,
    OptimizationScenarioDetailsParameters,
    TelemetryInvestmentUniverseParameters,
    TelemetryOptimizationScenarioLoadingTypeEnum,
    TelemetryOptimizationTypeEnum,
    TelemetryFactorConstraintDetailParameter,
    AbstractColumnOption,
    CoreColumnConstants,
    DateStore
} from '@blk/explore-ui-core';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {CommonConstants} from '@constants/common.constants';
import {InvestmentUniverseConstants} from '@constants/investment-universe.constants';
import {InvestmentUniverseRequest} from '@interfaces/investment-universe-request.interface';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {HoldingChange} from '@models/portfolio/composition/holding-change.model';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {InvestmentUniverseItemBase} from '@models/portfolio/investmentUniverse/investment-universe-item-base.model';
import {InvestmentUniversePortfolio} from '@models/portfolio/investmentUniverse/investment-universe-portfolio.model';
import {InvestmentUniverseSecurity} from '@models/portfolio/investmentUniverse/investment-universe-security.model';
import {AlphaScorePortfolioObjective} from '@models/portfolio/objectives/alpha-score-portfolio-objective.model';
import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';
import {StressScenarioPortfolioObjective} from '@models/portfolio/objectives/stress-scenario-portfolio-objective.model';
import {LatestOptimizationRunDetails} from '@models/portfolio/optimization/latest-optimization-run-details';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {
    DEFAULT_EFFICIENT_FRONTIER_ERROR_MESSAGE,
    DEFAULT_OPTIMIZATION_ERROR_MESSAGE,
    OPTIMIZATION_EFFICIENT_FRONTIER_PARTIAL_SUCCESS_MESSAGE,
    OPTIMIZATION_EFFICIENT_FRONTIER_SUCCESS_MESSAGE,
    OPTIMIZATION_ERROR_MESSAGE,
    OPTIMIZATION_NO_HOLDINGS_MESSAGE,
    OPTIMIZATION_SUCCESS_MESSAGE
} from '@optimization-settings/constants/optimization-notification-messages.constants';
import {
    ALL_TYPE,
    PORTFOLIO,
    RELATIVE
} from '@optimization-settings/constraints-settings/constants/sector-constraint.constants';
import {
    ConstraintOptionValueKey
} from '@optimization-settings/constraints-settings/enums/constraint-option-value-key.enum';
import {
    isNotDeprecatedActiveSectorConstraint,
    isValidDeprecatedActiveSectorConstraint,
    setUpperLowerBoundsForConstraint,
    setUpperLowerBoundsOperatorForConstraint
} from '@optimization-settings/constraints-settings/utils/constraint.utils';
import {Http2BmsService} from '@services/bms/http2bms.service';
import {NotificationService} from '@services/notification';
import {cloneDeep, has, isArray, isEmpty, isNil, join} from 'lodash';
import {Observable, of, Subject, throwError} from 'rxjs';
import {catchError, concatMap, map, switchMap, take, takeUntil} from 'rxjs/operators';
import {HoldingChangeFactory} from '../../../factories/holding-change.factory';
import {OptimizationDataService} from './optimization-data.service';
import {EfficientFrontierTradesResponse} from '@interfaces/efficient-frontier-trades-response.interface';
import {AppStore} from '../../../app.store';
import {RequestConstants} from '@constants/request.constants';
import {RiskSettings} from '@blk/explore-ui-risk';
import {
    StressScenarioDateRangeObjective
} from '@models/portfolio/objectives/stress-scenario-date-range-objective.model';
import {
    CollapsedLookthroughColumnOption
} from '@models/columns/column-options/collapsed-lookthrough-column-option.model';
import optoRunStatusJson from '@assets/optimization/opto-run-status.json';
import {RiskParitySettings} from '@models/portfolio/optimization/risk-parity-settings.model';
import {ColumnSectorRule, CustomFilter, GroupRule, SectorConstants, SectorRuleUtils} from '@blk/explore-ui-breakdown';
import {InvestmentUniverseSettings} from '@models/portfolio/investmentUniverse/investment-universe-settings.model';
import {Security} from '@interfaces/security.interface';
import {WorkspaceStore} from '@stores/workspace.store';
import {RiskParityCase} from '@enums/risk-parity-case.enum';
import {TierDefinitionType} from '@enums/tier-definition-type.enum';
import {
    SUB_TYPE_FACTOR_CONSTRAINTS,
    SUB_TYPE_PORTFOLIO_CONSTRAINTS,
    SUB_TYPE_SECTOR_CONSTRAINTS,
    SUB_TYPE_SECURITY_CONSTRAINTS
} from '@optimization-settings/constants/optimization-types.constants';
import {HttpParams} from '@angular/common/http';
import {ConstraintOptionSecurityListSubsectionEnum} from '@optimization-settings/constraints-settings/enums/constraint-option-security-list-subsection.enum';
import {
    ConstraintOptionTypeKey
} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';
import {OptimizationTypeEnum} from '@enums/optimization-type.enum';

@Injectable({
    providedIn: 'root'
})
export class OptimizationRunService {

    cancelOptimization$: Subject<void> = new Subject<void>();

    constructor(
        private optimizationDataService: OptimizationDataService,
        private http2BmsService: Http2BmsService,
        private notificationService: NotificationService,
        private appStore: AppStore
    ) {
    }

    run$(hardRefresh?: boolean, debugCtxt?: boolean, riskParityCase?: boolean): Observable<Portfolio> {
        return this.optimizationDataService.getPortfolioWithPositions$().pipe(
            take(1),
            switchMap((portfolio: PortfolioWithPositions) => {
                if (!portfolio) {
                    throw new Error(DEFAULT_OPTIMIZATION_ERROR_MESSAGE);
                }
                const data = this.createOptoRequest(portfolio, hardRefresh, null, debugCtxt, riskParityCase);
                data.investmentUniverseTelemetryPayload = this.getInvestmentUniverseTelemetry(portfolio);
                data.optimizationRunTelemetryPayload = riskParityCase ? this.trackRiskBudgetingRunViaTelemetry(portfolio.riskParitySettings) : this.trackMeanVarianceRunViaTelemetry(portfolio.optimizationSettings, data);
                const params = new HttpParams({
                    fromObject: {
                        [TelemetryActionConstants.ADD_REQUEST_ID_TO_TELEMETRY_PAYLOAD]: true,
                        [TelemetryActionConstants.USER_BEHAVIOUR.INVESTMENT_UNIVERSE]: 'investmentUniverseTelemetryPayload',
                        [TelemetryActionConstants.USER_BEHAVIOUR.RUN_OPTIMIZATION]: 'optimizationRunTelemetryPayload'
                    }
                });
                return this.http2BmsService.post$(RequestConstants.GET_OPTIMIZATION_RESPONSE, data, params).pipe(
                    takeUntil(this.cancelOptimization$.pipe(take(1))),
                    map((response: any) => this.processOptimizationResults(response, portfolio)),
                    // adding catch error to have scope of portfolio under optimization
                    // reason - we want to distinguish b/w current portfolio and portfolio under optimization
                    // in case we have switched to another portfolio
                    catchError(error => throwError({error, portfolio}))
                );
            }));
    }

    /**
     * service call to fetch the efficient frontier trades
     */
    efficientFrontierRun$(): Observable<EfficientFrontierTradesResponse> {
        return this.optimizationDataService.getPortfolioWithPositions$().pipe(
            take(1),
            switchMap((portfolio: PortfolioWithPositions) => {
                if (!portfolio) {
                    throw {error: new Error(DEFAULT_EFFICIENT_FRONTIER_ERROR_MESSAGE)};
                }

                return this.http2BmsService.post$('getEfficientFrontierTrades', this.createEfficientFrontierOptoRequest(portfolio))
                    .pipe(
                        concatMap(efficientFrontierTrades => {
                            let msg: string;
                            if (!efficientFrontierTrades) {
                                msg = AlertConstants.EFFICIENT_FRONTIER_BAD_RESPONSE;
                            } else if (!isArray(efficientFrontierTrades.data) && efficientFrontierTrades.status === AlertConstants.FAILURE) {
                                msg = efficientFrontierTrades.message;
                            } else if (isEmpty(efficientFrontierTrades.data)) {
                                msg = AlertConstants.EFFICIENT_FRONTIER_BAD_RESPONSE;
                            }

                            return isEmpty(msg)
                                ? of({portfolio, efficientFrontierTradesData: efficientFrontierTrades.data})
                                : throwError({portfolio, error: new Error(msg)});
                        }),
                        // adding catch error to have scope of portfolio under optimization
                        // reason - we want to distinguish b/w current portfolio and portfolio under optimization
                        // in case we have switched to another portfolio
                        catchError(error => throwError(error))
                    );
            })
        );
    }

    /**
     * Track mean variance run parameters via telemetry
     */
    trackMeanVarianceRunViaTelemetry(settings: OptimizationSettings, data: any): TelemetryOptimizationRunParameters {
        const constraints = [...settings.portfolioConstraints.map(constraint => constraint.title), ...settings.sectorConstraints.map(constraint => constraint.title),
            ...settings.securityConstraints.map(constraint => constraint.title), ...settings.factorConstraints.map(constraint => constraint.title)];
        const columnsAsAlpha = [];
        settings.objectiveSettings.portfolioObjectives.forEach((objective: PortfolioObjective) => {
            if (objective instanceof AlphaScorePortfolioObjective && (objective as AlphaScorePortfolioObjective)?.alphaScoreMeasure?.columnTitle) {
                columnsAsAlpha.push((objective as AlphaScorePortfolioObjective).alphaScoreMeasure.columnTitle);
            }
        });
        const loadedOptimizationScenarioParameters = new OptimizationScenarioDetailsParameters(settings.title, settings.owner === CoreFavoriteConstants.GLOBAL_USER ? TelemetryOptimizationScenarioLoadingTypeEnum.LOADING_TYPE_PRE_CANNED : TelemetryOptimizationScenarioLoadingTypeEnum.LOADING_TYPE_USER_DEFINED);
        const optimizationRunParameters = new TelemetryOptimizationRunParameters({
            objectives: settings.objectiveSettings.portfolioObjectives.map(objective => objective.key + CommonConstants.COLON + objective.weight),
            constraints,
            columnsAsAlpha,
            isEfficientFrontierRun: settings.isEfficientFrontierEnabled,
            iterationsCount: settings.iterations,
            workspaceId: WorkspaceStore.getWorkspace().id,
            loadedOptimizationScenario: loadedOptimizationScenarioParameters,
            isOptimizationScenarioChanged: settings.isModified,
            optimizationType: TelemetryOptimizationTypeEnum.MEAN_VARIANCE
        });
        const constraintParams = new TelemetryConstraintsParameters({
            sectorConstraints: data.optimizationSettings?.sectorConstraints?.map(sectorConstraint => new TelemetrySectorConstraintDetailParameter({
                constraintAttribute: sectorConstraint.optimizationSectorConstraint,
                sectorsForConstraint: !isNil(sectorConstraint.breakdownTree) ? ExploreSectorsForConstraint.EXPLORE_SECTORS_FOR_CONSTRAINT_ALL_SECTORS : ExploreSectorsForConstraint.EXPLORE_SECTORS_FOR_CONSTRAINT_ONE_SECTOR,
                isFilterApplied: !isNil(sectorConstraint.filterCriteria),
                sectorConstraintType: new TelemetrySectorConstraintBoundParameter({
                    constraintType: sectorConstraint.boundType === RELATIVE ? ExploreSectorConstraintBoundType.EXPLORE_SECTOR_CONSTRAINT_TYPE_RELATIVE : ExploreSectorConstraintBoundType.EXPLORE_SECTOR_CONSTRAINT_TYPE_ABSOLUTE,
                    constraintLowerBoundOperator: ExploreSectorConstraintRelativeOperatorType[sectorConstraint.lowerBoundOperator],
                    constraintUpperBoundOperator: ExploreSectorConstraintRelativeOperatorType[sectorConstraint.upperBoundOperator]
                })
            })),
            portfolioConstraints: data.optimizationSettings?.portfolioConstraints?.map(portfolioConstraint => new TelemetryPortfolioConstraintDetailParameter({
                constraintAttribute: portfolioConstraint.optimizationPortfolioConstraint,
                portfolioConstraintValue: JSON.stringify(portfolioConstraint, function (key, value) {
                    if (key === 'optimizationPortfolioConstraint') {
                        return undefined;
                    }
                    return value;
                })
            })),
            securityConstraints: settings.securityConstraints?.map(securityConstraint => new TelemetrySecurityConstraintDetailParameter({
                constraintAttribute: securityConstraint.constraintTag,
                wayToApplySecurityConstraint:  securityConstraint.getSecurityConstraintAssociatedSecurityList()
            })),
            factorConstraints: data.optimizationSettings?.factorConstraints?.map(factorConstraint => new TelemetryFactorConstraintDetailParameter({
                constraintAttribute: factorConstraint.optimizationFactorConstraint,
                factorConstraintName: isEmpty(factorConstraint.factors) ? factorConstraint.quickFactorBlock : factorConstraint.factors[0]
            }))
        });
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.RUN_OPTIMIZATION_CONSTRAINTS, constraintParams);
        return optimizationRunParameters;
    }

    /**
     * Track risk Budgeting run parameters via telemetry
     */
    trackRiskBudgetingRunViaTelemetry(settings: RiskParitySettings): TelemetryOptimizationRunParameters {
        const loadedOptimizationScenarioParameters = new OptimizationScenarioDetailsParameters(settings.title, settings.owner === CoreFavoriteConstants.GLOBAL_USER ? TelemetryOptimizationScenarioLoadingTypeEnum.LOADING_TYPE_PRE_CANNED : TelemetryOptimizationScenarioLoadingTypeEnum.LOADING_TYPE_USER_DEFINED);
        const optimizationRunParameters = new TelemetryOptimizationRunParameters({
            workspaceId: WorkspaceStore.getWorkspace().id,
            loadedOptimizationScenario: loadedOptimizationScenarioParameters,
            isOptimizationScenarioChanged: settings.isModified,
            optimizationType: TelemetryOptimizationTypeEnum.RISK_BUDGETING
        });
        // Track risk budgeting information related to optimization run
        const tierDefinitionInfo = new TelemetryTierDefinitionRiskBudgetingParameters({definitionType: TierDefinitionType[settings.tierDefinitions?.tierType],
            tierOne: settings.tierDefinitions?.tierOne,
            tierTwo: settings.tierDefinitions?.tierTwo,
            tierTwoRatio: !isEmpty(settings.tierDefinitions?.riskBudgetTierRatio) ? Number(settings.tierDefinitions?.riskBudgetTierRatio) : 0,
            tierThreeRatio: !isEmpty(settings.tierDefinitions?.riskBudgetFixedAssetRatio) ? Number(settings.tierDefinitions?.riskBudgetFixedAssetRatio) : 0});
        const riskBudgetingParams = new TelemetryRiskBudgetingParameters({
            riskBudgetingCase: settings.riskParityCase === RiskParityCase.ABSOLUTE ? ExploreRiskBudgetingCase.EXPLORE_RISK_BUDGETING_CASE_ABSOLUTE : ExploreRiskBudgetingCase.EXPLORE_RISK_BUDGETING_CASE_ACTIVE,
            tierDefinitionInfo,
            isSecurityConstraintApplied: settings.securityConstraints?.size > 0,
            isScreeningEnabled: !settings.filter?.isFilterEmpty()
        });
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.RISK_BUDGETING_DETAILS, riskBudgetingParams);
        return optimizationRunParameters;
    }

    /**
     * Track investment universe parameters via telemetry
     */
    getInvestmentUniverseTelemetry(portfolio: PortfolioWithPositions): TelemetryInvestmentUniverseParameters {
        const investmentUniverse = portfolio.optimizationSettings.investmentUniverseSettings.investmentUniverse;
        const investmentUniverseParameters = new TelemetryInvestmentUniverseParameters();
        investmentUniverseParameters.workspaceId = WorkspaceStore.getWorkspace().id;
        if (!isEmpty(investmentUniverse)) {
            investmentUniverseParameters.investmentUniverseTypeAndNamesList = investmentUniverse.map(element => new TelemetryInvestmentUniverseTypeParameters({
                ...(element instanceof InvestmentUniversePortfolio ? {name: element.portfolio} : {}),
                investmentUniverseType: this.typeInInvestmentUniverse(element.type)
            }));
        }
        // For tracking the default portfolio and benchmark
        if (isEmpty(investmentUniverseParameters.investmentUniverseTypeAndNamesList)) {
            investmentUniverseParameters.investmentUniverseTypeAndNamesList = investmentUniverse.map(element => new TelemetryInvestmentUniverseTypeParameters({
                ...(element instanceof InvestmentUniversePortfolio ? {name: portfolio.portName} : {}),
                investmentUniverseType: TypeInInvestmentUniverse.PORTFOLIO
            }));
            investmentUniverseParameters.investmentUniverseTypeAndNamesList = investmentUniverse.map(element => new TelemetryInvestmentUniverseTypeParameters({
                ...(element instanceof InvestmentUniversePortfolio ? {name: portfolio.benchmark.name} : {}),
                investmentUniverseType: TypeInInvestmentUniverse.BENCHMARK
            }));
        }
        return investmentUniverseParameters;
    }

    /**
     * This methods returns the type of Investment Universe
     * @param type Type in Investment Universe
     * @returns
     */
    typeInInvestmentUniverse(type: string): TypeInInvestmentUniverse {
        switch (type) {
            case InvestmentUniverseConstants.PORTFOLIO:
                return TypeInInvestmentUniverse.PORTFOLIO;
            case InvestmentUniverseConstants.BENCHMARK:
                return TypeInInvestmentUniverse.BENCHMARK;
            case InvestmentUniverseConstants.SECURITY:
                return TypeInInvestmentUniverse.SECURITY;
            default:
                return TypeInInvestmentUniverse.UNSPECIFIED_TYPE_IN_INVESTMENT_UNIVERSE;
        }

    }

    processOptimizationResults(response: { status: string, data: any, message: string }, portfolio: PortfolioWithPositions): Portfolio {
        let runStatus: string;
        const optimizationRunStatus: {} = cloneDeep(optoRunStatusJson['optoSolverStatus']);
        if (response?.data?.compressedResponse) {
            // Decompress the opto response returned from the server
            response = CommonUtils.decompressResponse(response.data.compressedResponse);
        }
        if (!isNil(response.data) && !isNil(response.data.optoRunStatus) && !isEmpty(response.data.optoRunStatus)) {
            runStatus = response.data.optoRunStatus.split('\n')[1].split(',')[0];
        }
        // set default values
        if (!isNil(portfolio)) {
            portfolio.latestOptimizationRunDetails.push(new LatestOptimizationRunDetails({optoRunSuccessful: false}));
        }
        if (response.status === CommonConstants.RESPONSE_STATUS_FAILURE || !response.data || !response.data.holdingChanges) {
            throw new Error(this.getErrorMessage(response.message, runStatus, optimizationRunStatus));
        }
        // Get all holding changes and convert them into holding changes objects to be stored in portfolio
        const holdingChanges: HoldingChange[] = response.data.holdingChanges.map(
            (holdingChange: any) => this.convertObjectToHoldingChange(holdingChange)
        ).filter(
            (holdingChange: HoldingChange) => !!holdingChange
        );

        // Get all holding changes and convert them into holding changes objects to be stored in portfolio
        const optoFinalHoldings: HoldingChange[] = response.data.optoFinalHoldings
            ?.map(holdingChange => this.convertObjectToHoldingChange(holdingChange))
            .filter((holdingChange: HoldingChange) => !!holdingChange);

        const additionalSuccessfulOptimizationDetails: [] = response?.data?.additionalSuccessfulOptimizationDetails;

        // If no holding changes and is not an efficient frontier run then set the error to be true
        if (holdingChanges.length === 0 && !portfolio?.optimizationSettings?.isEfficientFrontierEnabled) {
            if (!isNil(portfolio)) {
                portfolio.latestOptimizationRunDetails.push(new LatestOptimizationRunDetails({optoRunSuccessful: false}));
            }
            this.notificationService.warning(OPTIMIZATION_NO_HOLDINGS_MESSAGE, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_PROCESS_OPTIMIZATION_RESULTS_WARNING);
            throw new Error(this.getErrorMessage(response.message, runStatus, optimizationRunStatus));
        }

        // show Efficient Frontier panel if enabled or show the proper notification based on runStatus
        this.showEfficientFrontierPanelIfEnabled(portfolio, holdingChanges, runStatus, optimizationRunStatus, additionalSuccessfulOptimizationDetails);

        if (additionalSuccessfulOptimizationDetails.length !== 0 && !isNil(portfolio)) {
            portfolio.latestOptimizationRunDetails = [];
            additionalSuccessfulOptimizationDetails.forEach((value) => {
                const latestOptimizationRunDetail = new LatestOptimizationRunDetails(value);
                latestOptimizationRunDetail.optoRunSuccessful = true;
                portfolio.latestOptimizationRunDetails.push(latestOptimizationRunDetail);
            });
        }

        if (holdingChanges.length !== 0) {
            // Keep Cash items
            portfolio.addHoldingChanges(holdingChanges);
        }

        if (!!optoFinalHoldings?.length) {
            portfolio.addOptoFinalHoldings(optoFinalHoldings);
        }

        if (!isEmpty(response.data.cacheKey)) {
            portfolio.efficientFrontierCacheKey = response.data.cacheKey;
        }

        if (!isEmpty(response.data.warningMessage)) {
            this.notificationService.warning(response.data.warningMessage, ErrorTypeConstants.UI_VALIDATION_WARNING, null, true);
        }

        return portfolio;
    }

    /*
      Show Efficient Frontier panel if enabled or show the proper notification based on runStatus
     */
    private showEfficientFrontierPanelIfEnabled(portfolio: PortfolioWithPositions, holdingChanges: HoldingChange[], runStatus: string, optimizationRunStatus: {}, additionalSuccessfulOptimizationDetails: []): void {
        let notification;
        if (portfolio.optimizationSettings.isEfficientFrontierEnabled && holdingChanges.length === 0 && additionalSuccessfulOptimizationDetails.length !== 0) {
            this.appStore.showEfficientFrontierPanel.next(true);
            this.showEfficeintFrontierNotification(additionalSuccessfulOptimizationDetails);
        } else {
            notification = !isNil(runStatus) ? OPTIMIZATION_SUCCESS_MESSAGE + CommonConstants.SINGLE_SPACE + 'Optimization run status: ' + runStatus +
                CommonConstants.DOT + '\n' + optimizationRunStatus[runStatus] + CommonConstants.DOT : OPTIMIZATION_SUCCESS_MESSAGE;
            this.appStore.showEfficientFrontierPanel.next(false);
            // If Optmization run successfully but the optoRun Status is 'RELAXED' or 'INFEASIBLE' then we show the message in yellow and if OPTIMIAL we show it in green
            if (!isNil(runStatus) && (runStatus === LatestOptimizationRunDetails.SOLVER_STATUS_INFEASIBLE || runStatus === LatestOptimizationRunDetails.SOLVER_STATUS_RELAXED)) {
                this.notificationService.warning(notification, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SHOW_EFFICIENT_FRONTIER_WARNING);
            } else {
                this.notificationService.success(notification);
            }
        }
    }

    getOptimizationConstraintSettings(optimizationSettings: OptimizationSettings): any {
        return {
            portfolioConstraints: this.getEffectiveConstraintsByType(optimizationSettings.portfolioConstraints),
            securityConstraints: this.getEffectiveConstraintsByType(optimizationSettings.securityConstraints),
            sectorConstraints: this.getEffectiveConstraintsByType(optimizationSettings.sectorConstraints),
            factorConstraints: this.getEffectiveConstraintsByType(optimizationSettings.factorConstraints)
        };
    }

    private getEffectiveConstraintsByType(constraints: Constraint[]): any {
        return constraints
            .filter(constraint => this.isConstraintEnabled(constraint))
            .map(constraint => this.createConstraintByType(constraint));
    }

    private isConstraintEnabled(constraint: Constraint): boolean {
        if (constraint.constraintType === SUB_TYPE_SECTOR_CONSTRAINTS) {
            return this.isEffectivelyEnabled(constraint) && constraint.optionValues && constraint.optionValues.sectorConstraintType;
        } else {
            return this.isEffectivelyEnabled(constraint);
        }
    }

    private createConstraintByType(constraint: Constraint): any {
        switch (constraint.constraintType) {
            case SUB_TYPE_PORTFOLIO_CONSTRAINTS:
                return this.createPortfolioConstraint(constraint);
            case SUB_TYPE_SECURITY_CONSTRAINTS:
                return this.createSecurityConstraint(constraint);
            case SUB_TYPE_SECTOR_CONSTRAINTS:
                return this.createSectorConstraint(constraint);
            case SUB_TYPE_FACTOR_CONSTRAINTS:
                return this.createFactorConstraint(constraint);
        }
    }

    getOptimizationInvestmentUniverseSettings(optimizationSettings: OptimizationSettings | RiskParitySettings, portfolio: PortfolioWithPositions): any {
        const investmentUniverseItems: InvestmentUniverseItemBase[] = optimizationSettings.investmentUniverseSettings.investmentUniverse;
        const mainPortfolioItem: InvestmentUniversePortfolio = investmentUniverseItems.find(item => item.label === InvestmentUniverseConstants.PORTFOLIO && item.isFrozen && item.enabled) as InvestmentUniversePortfolio;
        const benchmarkItem: InvestmentUniversePortfolio = investmentUniverseItems.find(item => item.label === InvestmentUniverseConstants.BENCHMARK && item.isFrozen && item.enabled) as InvestmentUniversePortfolio;

        const investmentUniverseSettings: InvestmentUniverseRequest = {
            mainPortfolio: {
                sendPortfolio: !!mainPortfolioItem,
                name: portfolio.portName
            },
            benchmark: {
                sendPortfolio: !!benchmarkItem,
                name: optimizationSettings instanceof RiskParitySettings && optimizationSettings.riskParityCase === 0 ? BenchmarkConstants.NoneBenchName : this.getBenchName(portfolio),
                adhocParams: portfolio.benchmark?.portfolio?.['adhocParams']?.serialize(),
                holdingChanges: portfolio.benchmark?.portfolio?.['holdingChanges']?.map(holdingChange => holdingChange.serialize())
            }
        };

        if (benchmarkItem && !benchmarkItem.isFilterEmpty()) {
            investmentUniverseSettings.benchmark.filter = JSON.stringify(benchmarkItem.filter.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE));
        }

        if (mainPortfolioItem && !mainPortfolioItem.isFilterEmpty()) {
            investmentUniverseSettings.mainPortfolio.filter = JSON.stringify(mainPortfolioItem.filter.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE));
        }

        const nonFrozenItems: InvestmentUniverseItemBase[] = investmentUniverseItems.filter(investmentUniverse => investmentUniverse.enabled && !investmentUniverse.isFrozen);
        if (isEmpty(nonFrozenItems)) {
            return investmentUniverseSettings;
        }

        investmentUniverseSettings.portfolios = {};
        investmentUniverseSettings.securities = {};

        nonFrozenItems
            .filter(investmentUniverse => investmentUniverse instanceof InvestmentUniversePortfolio)
            .forEach((investmentUniverse: InvestmentUniversePortfolio) => investmentUniverseSettings.portfolios[investmentUniverse.label] = {
                name: investmentUniverse.portfolio,
                ...(!investmentUniverse.isFilterEmpty() ? {filter: JSON.stringify(investmentUniverse.filter.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE))} : {})
            });

        nonFrozenItems
            .filter(investmentUniverse => investmentUniverse instanceof InvestmentUniverseSecurity)
            .forEach((investmentUniverse: InvestmentUniverseSecurity) => investmentUniverseSettings.securities[investmentUniverse.label] = investmentUniverse.securities);

        return investmentUniverseSettings;
    }

    getOptimizationObjectiveSettings(optimizationSettings: OptimizationSettings | RiskParitySettings): any {
        const objectiveSettings: any = {
            portfolioObjectives: [],
            stressScenarioPortfolioObjectives: []
        };
        optimizationSettings.objectiveSettings.portfolioObjectives.filter(
            (portfolioObjective: PortfolioObjective) => portfolioObjective.enabled
        ).forEach(
            (portfolioObjective: PortfolioObjective) => {
                // Add stress scenario and normal portfolio objectives separately
                if (portfolioObjective instanceof StressScenarioPortfolioObjective || portfolioObjective instanceof StressScenarioDateRangeObjective) {
                    const scenarioObjective: any = {
                        portfolioObjectiveType: portfolioObjective.key,
                        weight: portfolioObjective.weight,
                    };
                    if (portfolioObjective instanceof StressScenarioDateRangeObjective) {
                        scenarioObjective.stressScenario = portfolioObjective.dateRangeScenarios[0].code;
                        scenarioObjective.calCode = DateStore.getCurrentDate()?.calCode;
                    } else {
                        scenarioObjective.stressScenario = portfolioObjective.stressScenario;
                    }
                    objectiveSettings.stressScenarioPortfolioObjectives.push(scenarioObjective);
                } else if (portfolioObjective instanceof AlphaScorePortfolioObjective) {
                    const isValidUploadAlpha = portfolioObjective.isUploadAlpha && !isEmpty(portfolioObjective.uploadedAlpha);
                    if (isValidUploadAlpha || !!portfolioObjective.alphaScoreMeasure) {
                        objectiveSettings.alphaScorePortfolioObjectives = {
                            portfolioObjectiveType: portfolioObjective.key,
                            weight: portfolioObjective.weight,
                            isUploadAlpha: portfolioObjective.isUploadAlpha,
                            ...(!isValidUploadAlpha && {rawAlphaScoreMeasure: portfolioObjective.alphaScoreMeasure.createRequestColumn()}),
                            ...(isValidUploadAlpha && {uploadedAlpha: portfolioObjective.getUploadedRequestObject()})
                        };
                    } else {
                        this.notificationService.warning('Invalid alpha score objective. Ignoring the objective for the current optimization run', null, null, true);
                    }
                } else {
                    objectiveSettings.portfolioObjectives.push({
                        portfolioObjectiveType: portfolioObjective.key,
                        weight: portfolioObjective.weight
                    });
                }
            });
        // Also send the objetive type
        objectiveSettings.objectivesType = optimizationSettings.objectiveSettings.objectivesType;
        return objectiveSettings;
    }

    createPortfolioConstraint(portfolioConstraint: Constraint): any {
        const portConstraint = {
            optimizationPortfolioConstraint: portfolioConstraint.constraintTag,
            constraintValue: null,
            unitType: null
        };
        if (portfolioConstraint.optionValues) {
            if (portfolioConstraint.optionValues.ConstraintUnit) {
                portConstraint.unitType = portfolioConstraint.optionValues.ConstraintUnit;
            }
            if (has(portfolioConstraint.optionValues, ConstraintOptionValueKey.VALUE)) {
                let constraintOptionValue = portfolioConstraint.optionValues[ConstraintOptionValueKey.VALUE];
                if (isArray(constraintOptionValue)) { // Check if efficient is defined in specific point format i.e. 1,5,7 | -.5,2,4.5.
                    constraintOptionValue = join(constraintOptionValue, ',');
                }
                portConstraint.constraintValue = constraintOptionValue;
            }

            const constraintOptionValueKeys = [
                ConstraintOptionValueKey.LONG_POSITION_LOWER_BOUND,
                ConstraintOptionValueKey.LONG_POSITION_UPPER_BOUND,
                ConstraintOptionValueKey.SHORT_POSITION_LOWER_BOUND,
                ConstraintOptionValueKey.SHORT_POSITION_UPPER_BOUND,
                ConstraintOptionValueKey.LOWER_BOUND,
                ConstraintOptionValueKey.UPPER_BOUND
            ];

            if (!!portfolioConstraint.optionValues.isMixedIntegerEnabled) {
                constraintOptionValueKeys.push(ConstraintOptionValueKey.MIN_TRADE_SIZE, ConstraintOptionValueKey.TRADE_INCREMENT);
            }

            constraintOptionValueKeys.filter(
                (constraintKey: string) => has(portfolioConstraint.optionValues, constraintKey)
            ).forEach(
                (constraintKey: string) => portConstraint[constraintKey] = portfolioConstraint.optionValues[constraintKey]
            );
        }

        this.setRelaxation(portConstraint, portfolioConstraint);

        return portConstraint;
    }

    createSecurityConstraint(securityConstraint: Constraint) {
        const secConstraint = {
            associatedListName: securityConstraint.optionValues.securityList,
            optimizationSecurityConstraint: securityConstraint.constraintTag,
            constraintValue: null,
            unitType: null,
            ...(securityConstraint.optionValues.securityConstraintSubsection === ConstraintOptionSecurityListSubsectionEnum.CREATE_FROM_SCRATCH && !isEmpty(securityConstraint.optionValues.selectedSecurities)
                ? {securities: Array.from(securityConstraint.optionValues.selectedSecurities?.keys())}
                : {}),
            ...(securityConstraint.optionValues.securityConstraintSubsection === ConstraintOptionSecurityListSubsectionEnum.FILTER
                ? this.getFilterObject(securityConstraint.optionValues.securityConstraintFilter)
                : {})
        };
        if (securityConstraint.optionValues.ConstraintUnit) {
            secConstraint.unitType = securityConstraint.optionValues.ConstraintUnit;
        }
        if (has(securityConstraint.optionValues, ConstraintOptionValueKey.VALUE)) {
            secConstraint.constraintValue = securityConstraint.optionValues[ConstraintOptionValueKey.VALUE];
        }

        setUpperLowerBoundsForConstraint(securityConstraint, secConstraint, ConstraintOptionValueKey.LOWER_BOUND, ConstraintOptionValueKey.UPPER_BOUND);

        this.setRelaxation(secConstraint, securityConstraint);
        return secConstraint;
    }

    private getFilterObject(securityConstraintFilter: any) {
        if (!(securityConstraintFilter instanceof CustomFilter)) {
            const filter = new CustomFilter();
            filter.deserialize(securityConstraintFilter);
            return {filter: JSON.stringify(filter.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE))};
        }
        return {filter: JSON.stringify(securityConstraintFilter.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE))};
    }

    createSectorConstraint(sectorConstraint: Constraint): any {

        const sectorConstraintModel = {
            boundType: null,
            boundRelativeTo: null,
            upperBoundOperator: null,
            lowerBoundOperator: null,
            upperBound: null,
            lowerBound: null,
            breakdownTree: null,
            filterCriteria: null,
            optimizationSectorConstraint: null,
            positionColumnType: null,
            isFilter: true,
            isBreakdown: sectorConstraint.optionValues.sectorConstraintType === ALL_TYPE || sectorConstraint.optionValues.sectorConstraintType === PORTFOLIO,
            missingDataHandling: null,
            optionValues: null
        };
        if (sectorConstraint.constraintTag) {
            sectorConstraintModel.optimizationSectorConstraint = sectorConstraint.constraintTag;
        }

        if (sectorConstraint.positionType) {
            sectorConstraintModel.positionColumnType = sectorConstraint.positionType;
        }

        if (sectorConstraint.optionValues.customCalculation) {
            (sectorConstraint.optionValues.customCalculation as CustomCalculationColumnOption).addRequestParams(sectorConstraintModel);
        }

        if (sectorConstraint.optionValues.customAggregation) {
            (sectorConstraint.optionValues.customAggregation as CustomAggregationColumnOption).addRequestParams(sectorConstraintModel);
        }

        if (sectorConstraint.optionValues.taClimateScenarioSettings) {
            (sectorConstraint.optionValues.taClimateScenarioSettings as TempAlignmentScenariosColumnOption).addRequestParams(sectorConstraintModel);
        }

        if (sectorConstraint.optionValues.tClimateScenarioSettings) {
            (sectorConstraint.optionValues.tClimateScenarioSettings as TransitionClimateScenariosColumnOption).addRequestParams(sectorConstraintModel);
        }

        if (sectorConstraint.optionValues.collapsedLookthroughColumnOption) {
            (sectorConstraint.optionValues.collapsedLookthroughColumnOption as CollapsedLookthroughColumnOption).addRequestParams(sectorConstraintModel);
        }

        if (sectorConstraint.optionValues.RelativeAbsolute) {
            sectorConstraintModel.boundType = sectorConstraint.optionValues.RelativeAbsolute;

            // set the Relative to Portfolio or benchmark and lower/upper bound operators if bound type is Relative
            if (sectorConstraint.optionValues.RelativeAbsolute === RELATIVE) {
                sectorConstraintModel.boundRelativeTo = sectorConstraint.optionValues.PortBench;
                setUpperLowerBoundsOperatorForConstraint(sectorConstraint, sectorConstraintModel, ConstraintOptionValueKey.LOWER_BOUND_OPERATOR_MODEL, ConstraintOptionValueKey.UPPER_BOUND_OPERATOR_MODEL);
            }
        }

        if (sectorConstraint.optionValues.ConstraintMissingData) {
            sectorConstraintModel.missingDataHandling = sectorConstraint.optionValues.ConstraintMissingData;
        }

        setUpperLowerBoundsForConstraint(sectorConstraint, sectorConstraintModel, ConstraintOptionValueKey.LOWER_BOUND_CONSTRAINT_MODEL, ConstraintOptionValueKey.UPPER_BOUND_CONSTRAINT_MODEL);

        // since filtering section will be available for both ONE and ALL scenarios, therefore always add filtering info to breakdownTree info
        const filter: AbstractFavoriteConfig = sectorConstraint.optionValues.filter;
        if (filter) {
            sectorConstraintModel.filterCriteria = JSON.stringify(filter.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE));
        }

        // since breakdown section will be available for only ALL scenario, therefore add breakdown only if ALL Sectors is selected
        if (sectorConstraintModel.isBreakdown) {
            const breakdown: AbstractFavoriteConfig = sectorConstraint.optionValues.breakdownTree;
            sectorConstraintModel.breakdownTree = JSON.stringify(breakdown.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE));
        }

        if (sectorConstraint.optionValues[ConstraintOptionTypeKey.STRESS_PNL_SCENARIO]) {
            (new ScenarioColumnOption({
                nameScenarios: [{scenCode: sectorConstraint.optionValues?.[ConstraintOptionTypeKey.STRESS_PNL_SCENARIO]}]
            }) as AbstractColumnOption).addRequestParams(sectorConstraintModel);
        }

        this.createReqColumnFromColConfig(sectorConstraint, sectorConstraintModel);
        this.setRelaxation(sectorConstraintModel, sectorConstraint);
        this.updateActiveSectorConstraints(sectorConstraint, sectorConstraintModel);
        return sectorConstraintModel;
    }

    createFactorConstraint(factorConstraint: Constraint): any {
        const factorConstraintModel = {
            upperBound: null,
            lowerBound: null,
            quickFactorBlock: null,
            factors: null,
            positionColumnType: null,
            optimizationFactorConstraint: null
        };
        if (factorConstraint.constraintTag) {
            factorConstraintModel.optimizationFactorConstraint = factorConstraint.constraintTag;
        }

        factorConstraintModel.positionColumnType = factorConstraint?.positionType;

        setUpperLowerBoundsForConstraint(factorConstraint, factorConstraintModel, ConstraintOptionValueKey.LOWER_BOUND_CONSTRAINT_MODEL, ConstraintOptionValueKey.UPPER_BOUND_CONSTRAINT_MODEL);

        if (!isEmpty(factorConstraint.optionValues.quickFactorBlock)) {
            factorConstraintModel.quickFactorBlock = factorConstraint.optionValues.quickFactorBlock;
        }
        if (!isEmpty(factorConstraint.optionValues.factorTagList)) {
            factorConstraintModel.factors = [factorConstraint.optionValues.factorTagList.trim()];
        }
        this.setRelaxation(factorConstraintModel, factorConstraint);
        return factorConstraintModel;
    }

    getBenchName(portfolio: PortfolioWithPositions): string {
        let benchName = portfolio.benchmark.name;

        // RIGHT NOW WE SEND BACK NONE TO OPTO - THIS WORKS IN BLK SINCE THERE IS A PORTFOLIO CALLED NONE IN BLK.
        // TODO: Correct approach is to send benchSelection, benchOrder similar to other requests and let the server decide what the actual benchmark is.
        // for now for the release ( 4/19/2018) We are passing in NoneBenchName.
        if (benchName === BenchmarkConstants.NONE_BENCH) {
            benchName = BenchmarkConstants.NoneBenchName;
        } else if (benchName === BenchmarkConstants.GROUP_AGGREGATE || benchName === BenchmarkConstants.BENCH_PRIMARY) {
            // in case Benchmark type is bench aggregate we have to send different flags.
            benchName = BenchmarkConstants.BENCH_AGGREGATE;
        } else if (benchName === BenchmarkConstants.GROUP_AGGREGATE_SEC || benchName === BenchmarkConstants.BENCH_SECONDARY) {
            benchName = BenchmarkConstants.BENCH_AGGREGATE_SEC;
        }
        return benchName;
    }

    private convertObjectToHoldingChange(holdingChange: any): HoldingChange {
        return HoldingChangeFactory.convertObjectToHoldingChange(holdingChange);
    }

    private isEffectivelyEnabled(constraint: Constraint) {
        return constraint.enabled && !constraint.isFrozen;
    }

    private setRelaxation(constraint: any, sourceConstraint: Constraint): void {
        constraint.isRelaxable = sourceConstraint.isRelaxable;
        if (sourceConstraint.isRelaxable) {
            constraint.relaxationValue = sourceConstraint.relaxationValue;
        }
    }

    private getErrorMessage(message: string, runStatus: string, optimizationRunStatus: any) {
        let errorMessage = CoreCommonConstants.EMPTY_STRING;
        if (!isNil(runStatus) && !isEmpty(runStatus)) {
            // If optoRunStatus is BOUNDED or UNKNOWN , we will show SOLVER_ERROR and its corressponding text
            const status = runStatus === LatestOptimizationRunDetails.SOLVER_STATUS_BOUNDED || runStatus === LatestOptimizationRunDetails.SOLVER_STATUS_UNKNOWN ? LatestOptimizationRunDetails.SOLVER_STATUS_SOLVER_ERROR : runStatus;
            errorMessage = 'Optimization run status: ' + status + CommonConstants.DOT + CommonConstants.SINGLE_SPACE + optimizationRunStatus[status] + CommonConstants.DOT;
        }
        // if optoStatus is  null, then we simply show Error Running Optimization. Please try again otherwise we
        // append the run status and its corresponding text to the message
        const defaultErrorMessage = errorMessage ? OPTIMIZATION_ERROR_MESSAGE + CommonConstants.SINGLE_SPACE + errorMessage : DEFAULT_OPTIMIZATION_ERROR_MESSAGE;
        return message ? message + CommonConstants.SINGLE_SPACE + errorMessage : defaultErrorMessage;
    }

    /**
     * return optimization request object
     * @param portfolio in consideration
     * @param hardRefresh for skipping cache
     * @param downloadROSrequest
     */
    createOptoRequest(portfolio: PortfolioWithPositions, hardRefresh?: boolean, downloadROSrequest?: boolean, debugCtx?: boolean, riskParityCase?: boolean): any {
        const settings = riskParityCase ? cloneDeep(portfolio.riskParitySettings) : portfolio.optimizationSettings;
        let constraintSettings: any;
        const riskSetting: RiskSettings = cloneDeep(portfolio.portfolioRiskSettings);
        if (settings instanceof OptimizationSettings) {
            constraintSettings = this.getOptimizationConstraintSettings(settings);
            riskSetting.advancedRiskSettings = settings.optimizationAdvancedRiskSettings;
        }
        if (settings instanceof RiskParitySettings && !settings.filter?.isFilterEmpty()) {
            settings.investmentUniverseSettings = this.addScreeningFilter(settings.filter, settings.investmentUniverseSettings);
        }
        const portRiskSettings: any = riskSetting.getRequestParams(true);
        portRiskSettings.ccy = portfolio.currency;
        if (!isEmpty(riskSetting.advancedRiskSettings)) {
            portRiskSettings.riskMatrix = riskSetting.advancedRiskSettings.riskMatrix;
        }

        let optimizationSettings: any;
        let riskParitySettings: any;
        if (settings instanceof OptimizationSettings) {
            optimizationSettings = {
                investmentUniverseSettings: this.getOptimizationInvestmentUniverseSettings(settings, portfolio),
                objectiveSettings: this.getOptimizationObjectiveSettings(settings),
                portfolioConstraints: constraintSettings.portfolioConstraints,
                securityConstraints: constraintSettings.securityConstraints,
                sectorConstraints: constraintSettings.sectorConstraints,
                factorConstraints: constraintSettings.factorConstraints,
                portfolioRiskSettings: portRiskSettings,
                mipTimeLimit: settings.mipTimeLimit,
                ...(settings.isEfficientFrontierEnabled ? {efficientFrontier: {iterations: settings.iterations}} : {})
            };
            if (portfolio.optimizationType === OptimizationTypeEnum.MEAN_VARIANCE_SECTOR) {
                optimizationSettings.isCompositeAsset = true;
                settings.breakdownTree.addRequestParams(optimizationSettings);
            }
        } else {
            const tierDefinitions = settings.tierDefinitions;
            const securityConstraints = {};
            if (isEmpty(tierDefinitions.riskBudgetTierRatio)) {
                delete (tierDefinitions.riskBudgetTierRatio);
            }
            if (isEmpty(tierDefinitions.riskBudgetFixedAssetRatio)) {
                delete (tierDefinitions.riskBudgetFixedAssetRatio);
            }
            if (!isEmpty(settings.securityConstraints)) {
                settings.securityConstraints.forEach((value: Security, key: string) => {
                    securityConstraints[key] = value.riskContributionPercentage * 0.01;
                });
            }
            riskParitySettings = {
                investmentUniverseSettings: this.getOptimizationInvestmentUniverseSettings(settings, portfolio),
                objectiveSettings: this.getOptimizationObjectiveSettings(settings),
                portfolioRiskSettings: portRiskSettings,
                riskParityCase: settings.riskParityCase,
                securityConstraints,
                ...(!isNil(tierDefinitions) ? tierDefinitions : {})
            };
        }
        return this.createOptoRequestObject(portfolio, hardRefresh, downloadROSrequest, debugCtx, riskParityCase, optimizationSettings, riskParitySettings);
    }

    /*
     This method is called from createOptoRequest method , the return logic is kept in this method to reduce the cognitive complexity
     */
    private createOptoRequestObject(portfolio: PortfolioWithPositions, hardRefresh?: boolean, downloadROSrequest?: boolean, debugCtx?: boolean, riskParityCase?: boolean, optimizationSettings?: OptimizationSettings, riskParitySettings?: RiskParitySettings): any {
        return {
            ...(riskParityCase ? {riskParitySettings} : {optimizationSettings}),
            date: portfolio.datePicker.date,
            adhocParams: portfolio instanceof AdhocPortfolio && portfolio.adhocParams ? portfolio.adhocParams.serialize() : undefined,
            holdingChanges: portfolio.holdingChanges ? portfolio.holdingChanges.map(holdingChange => holdingChange.serialize()) : [],
            rules: null,
            downloadROSrequest,
            ...(!!hardRefresh ? {refreshCacheResponse: hardRefresh} : {}),
            ...(!!debugCtx ? {debugContext: debugCtx} : {}),
            ...(!portfolio.filter?.isFilterEmpty() ? {filter: portfolio.filter.returnSerializedFilter()} : {}),
            ...(!portfolio.compositionSetting?.compositionFilter?.isFilterEmpty() ? {compositionFilter: portfolio.compositionSetting.compositionFilter.returnSerializedFilter()} : {}),
            ...(!portfolio.filter?.isFilterEmpty() || !portfolio.compositionSetting?.compositionFilter?.isFilterEmpty() ? {filterTargetType: portfolio.applyFilterTo || 'BOTH'} : {})
        };
    }

    /**
     * adds screening filter to investment universe
     */
    addScreeningFilter(screeningFilter: CustomFilter, investmentUniverseSettings: InvestmentUniverseSettings): InvestmentUniverseSettings {
        investmentUniverseSettings.investmentUniverse.forEach((item: InvestmentUniversePortfolio) => {
            if (item.isFilterEmpty()) {
                item.filter = cloneDeep(screeningFilter);
                if (item.filter.customSector.rule instanceof GroupRule) {
                    item.filter.customSector.rule.subRules.forEach(filterRule => (filterRule as ColumnSectorRule).comparisonType = SectorConstants.COMPARISON_TYPE_NEGATIONS_MAP.get((filterRule as ColumnSectorRule).comparisonType));
                } else {
                    (item.filter.customSector.rule as ColumnSectorRule).comparisonType = SectorConstants.COMPARISON_TYPE_NEGATIONS_MAP.get((item.filter.customSector.rule as ColumnSectorRule).comparisonType);
                }
            } else {
                let groupRule: GroupRule;
                let currentRule;
                currentRule = item.filter.customSector.rule;
                // In case of a rule(nestedFundSectorRule) with customSectorType equals Portfolio or index, the rule is already a groupRule and we want to we handle it differently i.e like a columnSectorRule
                if (currentRule instanceof GroupRule && !SectorRuleUtils.isNestedFundSectorRule(currentRule)) {
                    groupRule = currentRule;
                } else if (currentRule) {
                    // Create a new group and put the original item in it.
                    groupRule = new GroupRule();
                    groupRule.groupType = SectorConstants.GROUP_RULE_CONDITION.AND;
                    groupRule.addSubRule(currentRule);
                }
                const screeningFilterRule = cloneDeep(screeningFilter.customSector.rule);
                (screeningFilterRule as ColumnSectorRule).comparisonType = SectorConstants.COMPARISON_TYPE_NEGATIONS_MAP.get((screeningFilterRule as ColumnSectorRule).comparisonType);
                groupRule.addSubRule(screeningFilterRule);
                item.filter.customSector.rule = groupRule;
            }
        });
        return investmentUniverseSettings;
    }

    /**
     * return efficient frontier trades request object
     * @param portfolio in consideration
     */
    createEfficientFrontierOptoRequest(portfolio: PortfolioWithPositions): any {
        const optoRequest = this.createOptoRequest(portfolio);
        if (!optoRequest || !optoRequest.optimizationSettings || !optoRequest.optimizationSettings.efficientFrontier) {
            return null;
        }

        optoRequest.optimizationSettings.efficientFrontier = {
            ...optoRequest.optimizationSettings.efficientFrontier,
            iterationIndexList: portfolio.iterationIndexList,
            cacheKey: portfolio.efficientFrontierCacheKey
        };

        return optoRequest;
    }

    /**
     * display success or wanring notification based on solver status of each iteration
     * @param additionalSuccessfulOptimizationDetails
     * @private
     */
    private showEfficeintFrontierNotification(additionalSuccessfulOptimizationDetails: []) {
        // show success only if all the iterations are either Optimal or feasible
        if (additionalSuccessfulOptimizationDetails.every(runDetails => runDetails['solverStatus'] === LatestOptimizationRunDetails.SOLVER_STATUS_OPTIMAL
            || runDetails['solverStatus'] === LatestOptimizationRunDetails.SOLVER_STATUS_FEASIBLE)) {
            this.notificationService.success(OPTIMIZATION_EFFICIENT_FRONTIER_SUCCESS_MESSAGE);
        } else { // show warning otherwise
            this.notificationService.warning(OPTIMIZATION_EFFICIENT_FRONTIER_PARTIAL_SUCCESS_MESSAGE, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SHOW_EFFICIENT_FRONTIER_WARNING);
        }
    }

    /**
     * Updates deprecated active sector constraint to new format for optimization request
     * @param sectorConstraint
     * @param sectorConstraintModel
     * @private
     */
    private updateActiveSectorConstraints(sectorConstraint: Constraint, sectorConstraintModel: any) {
        if (!isNotDeprecatedActiveSectorConstraint(sectorConstraint.positionType, sectorConstraint.constraintTag) && isValidDeprecatedActiveSectorConstraint(sectorConstraint)) {
            sectorConstraintModel.boundType = RELATIVE;
            sectorConstraintModel.boundRelativeTo = CommonConstants.BENCHMARK;
            sectorConstraintModel.positionColumnType = CoreColumnConstants.USE_TYPES.PORT;
            sectorConstraintModel.lowerBoundOperator = 'ADDITION';
            sectorConstraintModel.upperBoundOperator = 'ADDITION';
        }
    }

    /**
     * Creates request column from column config
     * @param constraint
     * @param constraintModel
     * @param key
     * @private
     */
    private createReqColumnFromColConfig(constraint: Constraint, constraintModel: any) {
        if (!isNil(constraint.columnConfig)) {
            constraintModel.optionValues = constraint.columnConfig.createRequestColumn();
        }
    }
}
