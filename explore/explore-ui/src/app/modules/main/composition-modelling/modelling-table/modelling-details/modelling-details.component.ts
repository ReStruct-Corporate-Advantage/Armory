import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild} from '@angular/core';
import {CompositionConstants} from '@constants/composition.constants';
import {ModellingTableOption} from '@enums/modelling-table-option.enum';
import {TradeStats} from '@interfaces/trade-stats.interface';
import {PortfolioSecurityHoldingChange} from '@models/portfolio/composition/portfolio-security-holding-change.model';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {CompositionUtils} from '@utils/composition.utils';
import {cloneDeep, Dictionary, isEmpty, isNil} from 'lodash';
import {ModellingType} from '@enums/modelling-type.enum';
import {FavoriteConstants} from '@constants/favorite.constants';
import {FavoriteService} from '@services/favorite';
import {CompositionRule} from '@models/portfolio/composition/composition-rule.model';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {AppStore} from '../../../../../app.store';
import {FavoriteComponent} from '../../../../favorite/load/favorite/favorite.component';
import {takeUntil} from 'rxjs/operators';
import {ExportDownloadingStatus} from '@interfaces/export-downloading-status.interface';
import {ExportUtils} from '@utils/export/export.utils';
import {ExportLevel} from '@constants/export.constants';
import {ColDef} from 'ag-grid-community';
import compositionConfigJson from '@assets/composition-config/CompositionConfig.json';
import {SubscribableComponent, TelemetryActionConstants, TelemetryService} from '@blk/explore-ui-core';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {LatestOptimizationRunDetails} from '@models/portfolio/optimization/latest-optimization-run-details';
import {ExploreOptimizationService} from '../../../../optimization/services/explore-optimization.service';
import {OBJECTIVES_SUMMARY_COL_DEFS} from '@optimization-settings/constraints-settings/constants/constraint-col-defs.constants';
import {WorkspaceStore} from '@stores/workspace.store';
import {StressScenarioPortfolioObjective} from '@models/portfolio/objectives/stress-scenario-portfolio-objective.model';
import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {EfficientFrontierConstants, VizualizationColumnConfigEF} from '@blk/explore-efficient-frontier';
import {OptimizationConstants} from '@constants/optimization.constants';
import {HoldingChange} from "@models/portfolio/composition/holding-change.model";

/**
 * component class modelling details view
 */
@Component({
    selector: 'app-modelling-details',
    templateUrl: './modelling-details.component.html',
    styleUrls: ['./modelling-details.component.scss']
})
export class ModellingDetailsComponent extends SubscribableComponent implements OnChanges, OnInit {
    @ViewChild('compositionRuleTree', {static: false}) compositionRuleTree: FavoriteComponent;

    @Input() modellingTableOption: ModellingTableOption;
    @Input() portfolio: WhatIfPortfolio;
    @Input() navigateToFeasibilityReport: boolean;

    @Output() showCompositionTable = new EventEmitter();
    @Output() close: EventEmitter<void> = new EventEmitter();

    readonly RULES_VIEW = '0';
    readonly OPTIMIZATION_SUMMARY_VIEW = '1';
    readonly EFFICIENT_FRONTIER_VIEW = '2';
    readonly TRADES_VIEW = '3';
    readonly FEASIBILITY_REPORT_VIEW = '4';
    readonly ModellingType = ModellingType;
    readonly favType = FavoriteConstants.COMP_RULES;
    readonly favTreeType = FavoriteConstants.COMP_RULES_FOLDER;
    readonly favDisplayName = FavoriteConstants.COMP_RULES_DISPLAY;

    displayedCompositionRule: CompositionRule = new CompositionRule();
    showCompositionRule = false;
    tradeStats: TradeStats;
    tradePayload: WidgetPayload;
    defaultLevelExpanded: string[][];
    savableRules: BaseRule[];
    tradeRules: BaseRule[];
    selectedView: string;
    isMonitorOpen = false;
    tableData: any;
    exportingInProgress: boolean;
    showExportMenu: boolean;
    exportLevel: ExportLevel;
    latestOptoRunDetails: LatestOptimizationRunDetails;
    latestOptimizationRunDetails: LatestOptimizationRunDetails[];
    objectiveSummaryColDefs = OBJECTIVES_SUMMARY_COL_DEFS;
    objectiveSummaryData: Dictionary<any>[] = [];
    feasibilityReportData = [];
    feasibilityReportColumns = [];
    otherConstraintColumns = [];
    otherConstraintsData = [];
    relaxedConstraints: string[] = [];
    modellingDetailsTabData = [];

    constructor(private changeDetectorRef: ChangeDetectorRef, private favoriteService: FavoriteService, private appStore: AppStore, private exploreOptimizationService: ExploreOptimizationService) {
        super();
    }

    ngOnInit() {
        // Check if downloading is in progress for Trade table or not
        this.appStore.exportDownloadingStatus$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((downloadStatus: ExportDownloadingStatus) => {
            this.exportingInProgress = !!(ExportUtils.isExportDownloadingStatusValid(downloadStatus) && downloadStatus.exportComposite.exportConfig.exportLevel === ExportLevel.GRID);
            this.changeDetectorRef.detectChanges();
        });
        this.createTabData();
        this.exploreOptimizationService.getOptimizationSummaryData$(undefined, 'objectives', undefined)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(objectives => {
                if (isNil(objectives.data)) {
                    return;
                }

                this.objectiveSummaryData = [];
                this.latestOptoRunDetails = !isEmpty((WorkspaceStore.getCurrentPortfolio() as PortfolioWithPositions).latestOptimizationRunDetails) ? (WorkspaceStore.getCurrentPortfolio() as PortfolioWithPositions).latestOptimizationRunDetails[0] : null;
                objectives.data.forEach((objective: Dictionary<any>) => {
                    let values: any;
                    if (!isNil(this.latestOptoRunDetails)) {
                        values = this.latestOptoRunDetails[CompositionConstants.OBJECTIVE_SUMMARY_KEYS[objective.objective]];
                    }
                    let data: any;
                    if (values instanceof Array) {
                        data = {objectiveName: objective.objective, initial: values[0], final: values[1]};
                    } else {
                        data = {objectiveName: objective.objective, initial: 0, final: values};
                    }
                    this.objectiveSummaryData.push(data);
                });
                this.createTabData();
        });

    }

    createTabData(): void {
        this.modellingDetailsTabData = [];
        if (this.portfolio.modellingType !== ModellingType.POSITION) {
            this.modellingDetailsTabData.push({label: 'Rules', uid: '0'});
        } else {
            if (this.latestOptoRunDetails?.optoRunSuccessful) {
                if (!this.isEfficientEnabled()) {
                    this.modellingDetailsTabData.push({label: 'Optimization Summary', uid: '1'});
                } else {
                    this.modellingDetailsTabData.push({label: 'Efficient Frontier', uid: '2'});
                }
            }
        }
        if (this.portfolio.modellingType !== ModellingType.PORTFOLIO && !this.isEfficientEnabled()) {
            this.modellingDetailsTabData.push({label: 'Trades', uid: '3'});
        }
        if (this.latestOptoRunDetails?.optoRunSuccessful) {
            this.modellingDetailsTabData.push({label: 'Feasibility Report', uid: '4'});
        }
    }

    /**
     * onChanges hook
     */
    ngOnChanges() {
        this.latestOptimizationRunDetails = (this.portfolio as PortfolioWithPositions).latestOptimizationRunDetails;
        this.latestOptoRunDetails = !isEmpty((this.portfolio as PortfolioWithPositions).latestOptimizationRunDetails) ? (this.portfolio as PortfolioWithPositions).latestOptimizationRunDetails[0] : null;
        // If we have violation reports, construct the data to be rendered on the feasibility report panel
        if (!isNil(this.latestOptoRunDetails?.violationReports)) {
            this.relaxedConstraints = Object.keys(this.latestOptoRunDetails.violationReports);
            // Construct columns and data for the feasibility report
            this.relaxedConstraints.forEach((constraint: string) => {
                // For other constraints we get an array of constraints
                if (constraint === CompositionConstants.OTHER_CONSTRAINTS) {
                    // iterate over every constraint and construct the data and columns for the same
                    this.latestOptoRunDetails.violationReports[constraint].forEach((otherConstraint) => {
                        this.populateRelaxedConstraintsData(otherConstraint, this.otherConstraintsData);
                        this.populateRelaxedConstraintsColumns(otherConstraint, this.otherConstraintColumns);
                    });
                } else {
                    this.populateRelaxedConstraintsData(this.latestOptoRunDetails.violationReports[constraint][0], this.feasibilityReportData);
                    this.populateRelaxedConstraintsColumns(this.latestOptoRunDetails.violationReports[constraint][0], this.feasibilityReportColumns);
                }
            });
            this.relaxedConstraints = this.relaxedConstraints.filter(constraint => constraint !== CompositionConstants.OTHER_CONSTRAINTS);
        }
        this.exportLevel = ExportLevel.GRID;
        this.selectedView = this.RULES_VIEW;
        this.tradeRules = undefined;
        this.savableRules = undefined;
        this.tradePayload = undefined;
        this.tradeStats = {
            totalTrades: 0,
            totalBuy: 0,
            totalSell: 0,
            totalBuyAmount: 0,
            totalSellAmount: 0,
            turnover: this.assignValueIfPresent(this.latestOptoRunDetails?.turnover * 100),
            tcostOfTrades: this.assignValueIfPresent(this.latestOptoRunDetails?.tcostOfTrades),
            spreadTcostOfTrades: this.assignValueIfPresent(this.latestOptoRunDetails?.spreadTcostOfTrades),
            marketImpactTcostOfTrades: this.assignValueIfPresent(this.latestOptoRunDetails?.marketImapctTcostOfTrades)
        };

        if (this.portfolio instanceof RulesBasedPortfolio && this.portfolio.compositionRules.tradeRules.some(rule => !rule.addedDuringWhatIfInitialization)) {
            this.tradeRules = this.portfolio.compositionRules.tradeRules;
            this.savableRules = this.tradeRules.filter(rule => rule.savable);
        }

        const tradePayloadSource: HoldingChange[] = !isEmpty(this.portfolio?.[PortfolioWithPositions.OPTO_FINAL_HOLDINGS])
            ? this.portfolio[PortfolioWithPositions.OPTO_FINAL_HOLDINGS]
            : this.portfolio.holdingChanges;

        if (!isEmpty(tradePayloadSource)) {
            let rowId = 1;
            // get after-nav to account for any cash modeling changes
            // we use it to determine the % change in weight instead of using the trade size (used earlier)
            // in case of port/index modeling, the value will come as undefined as the column looked up is a security modeling column
            const notional_mv_after: number = this.portfolio.composition.data.data[this.portfolio.composition.columns.indexOf(CompositionConstants.NOTIONAL_MV_AFTER)];
                const tradeTableData: any[] = tradePayloadSource
                    .filter(tradeItem => !tradeItem.addedDuringWhatIfInitialization)
                    .filter(tradeItem => tradeItem instanceof PortfolioSecurityHoldingChange && tradeItem.hasTradeSize())
                    .filter(tradeItem => !CompositionUtils.isCashAssetIdOrDefaultCash(tradeItem, this.portfolio.currency))
                    .map((tradeItem: PortfolioSecurityHoldingChange) => {
                        // calculate the trade size instead of using the one in security holding change
                        const tradeSize: number = (tradeItem.changeInNotionalMarketValue * 100) / notional_mv_after;
                        this.tradeStats.totalTrades++;
                        this.tradeStats[tradeSize > 0 ? 'totalBuyAmount' : 'totalSellAmount'] += tradeSize;
                        this.tradeStats[tradeSize > 0 ? 'totalBuy' : 'totalSell']++;
                        return {
                            data: [
                                tradeItem.lineItem,
                                tradeItem.secDesc,
                                tradeSize > 0 ? CompositionConstants.TRADE_TYPE.BUY : CompositionConstants.TRADE_TYPE.SELL,
                                tradeSize,
                                tradeItem.changeInQuantity,
                                tradeItem.changeInNotionalMarketValue,
                                tradeItem.changeInMarketValue
                            ],
                            rowId: ++rowId
                        };
                    });

                if (!isEmpty(tradeTableData)) {
                    this.tradeStats.totalBuyAmount = Number(this.tradeStats.totalBuyAmount.toFixed(4));
                    this.tradeStats.totalSellAmount = Number(this.tradeStats.totalSellAmount.toFixed(4));
                    const defaultTradeTableColumnDefinitions: ColDef[] = cloneDeep(compositionConfigJson['defaultTradeTableColumnDefinitions']);
                    this.tradePayload = CompositionUtils.prepareCompositionPayload(
                        {data: [], children: tradeTableData, rowId: 1},
                        defaultTradeTableColumnDefinitions.map(colDef => colDef.field), this.portfolio, [],
                        CompositionUtils.createCompositionConfig(this.portfolio).tradeColumnDefinitions, null);

                    this.tableData = {data: [], children: tradeTableData};
                }
            }
        if (!isNil(this.tableData)) {
            this.showExportMenu = true;
        }
        if (this.portfolio.modellingType === ModellingType.POSITION) {
            // if eficient is enabled then show efficient frontier view
            if (this.isEfficientEnabled()) {
                this.selectedView = this.EFFICIENT_FRONTIER_VIEW;
            } else if (this.navigateToFeasibilityReport) {
                this.selectedView = this.FEASIBILITY_REPORT_VIEW;
            } else if (this.latestOptoRunDetails?.optoRunSuccessful) { // efficient is not enabled but opto run was successful
                this.selectedView = this.OPTIMIZATION_SUMMARY_VIEW;
            } else { // no optomization run
                this.selectedView = this.TRADES_VIEW;
            }
        } else {
            this.selectedView = this.RULES_VIEW;
        }
        this.changeDetectorRef.markForCheck();
    }

    /**
     * populates columns for relaxed constraints
     */
    populateRelaxedConstraintsColumns(constraint: any, columnsArray: {field: string, headerName: string}[][]): void {
        const columns = constraint.columns.map(column => ({field: column, headerName: column}));
        columnsArray.push(columns);
    }

    /**
     * populates data for relaxed constraints
     */
    populateRelaxedConstraintsData(constraint: any, constraintsData: any[]): void {
        const data = [];
        for (let dataIndex = 0; dataIndex < constraint.data.length; dataIndex++) {
            const object = {};
            for (let colIndex = 0; colIndex < constraint.columns.length; colIndex++) {
                object[constraint.columns[colIndex]] = constraint.data[dataIndex][colIndex];
            }
            data.push(object);
        }
        constraintsData.push(data);
    }

    /**
     * assign value to trade stat if present, else default it to 0
     */
    assignValueIfPresent(tradeStat: any): any {
        return !isNaN(tradeStat) ? tradeStat.toFixed(4) : '';
    }

    /**
     * function callback to be passed on to favorite component
     */
    loadSelectedRule = (favId: number) => {
        this.showCompositionRule = false;
        this.favoriteService.getFavorite$(favId)
            .subscribe(compRule => {
                this.displayedCompositionRule.deserialize(compRule);
                this.showCompositionRule = true;
                this.changeDetectorRef.markForCheck();
            });
    }

    /**
     * load and apply the rule
     */
    applySelectedRule(): void {
        // Apply the rules with filter to the portfolio
        (this.portfolio as RulesBasedPortfolio).compositionRules.addTradeRules(this.displayedCompositionRule);
        this.showCompositionTable.emit();
    }

    /**
     * open save composition modal
     */
    openSaveCompositionRuleModal(): void {
        this.appStore.saveFavoriteAction$.next(
            new SaveFavoriteAction(
                (this.portfolio as RulesBasedPortfolio).compositionRules,
                FavoriteConstants.COMP_RULES_DISPLAY,
                FavoriteConstants.COMP_RULES,
                FavoriteConstants.COMP_RULES_FOLDER,
                this.compositionRuleTree.refreshMyFavoriteTree
            ));
    }

    /**
     * function callback on tab change
     */
    onTabSelected(event: CustomEvent): void {
        this.selectedView = event.detail.uid;
        if (this.selectedView === this.OPTIMIZATION_SUMMARY_VIEW) {
            this.trackClickOnOptimizationSummaryViaTelemetry();
        }
    }

    /**
     * Track via telemetry if user clicks on optimization summary
     */
    trackClickOnOptimizationSummaryViaTelemetry(): void {
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_OPTIMIZATION_SUMMARY, undefined);
    }

    /**
     * check if given portfolio is position based and efficient frontier is enabled
     */
    isEfficientEnabled(): boolean {
        if (this.portfolio instanceof PortfolioWithPositions) {
            return this.portfolio.optimizationSettings.isEfficientFrontierEnabled;
        }
        return false;
    }

    /**
     * returns the objective type selected for Opto settings
     */
    getObjectiveType(): string {
        return this.portfolio instanceof PortfolioWithPositions ? this.portfolio.optimizationSettings.objectiveSettings.objectivesType : undefined;
    }

    /**
     * returns the portfoio objective type - Stress Scenario/Alpha Score
     */
    isStressScenarioPortfolioObjective(): boolean {
        return this.portfolio instanceof PortfolioWithPositions ? this.portfolio.optimizationSettings.objectiveSettings.portfolioObjectives.some((objective: PortfolioObjective) => objective instanceof StressScenarioPortfolioObjective) : false;
    }

    /**
     * On close clicked in efficient frontier
     */
    onCloseClicked(): void {
        this.close.emit();
    }

    getXAxisColumn(): VizualizationColumnConfigEF[] {
        if (this.portfolio instanceof PortfolioWithPositions && !isEmpty(this.portfolio.optimizationSettings.efficientEnabledConstraints)) {
            const constraint: Constraint = [...this.portfolio.optimizationSettings.efficientEnabledConstraints][0];
            return [{
                columnKey: constraint.constraintTag,
                columnTitle: constraint.title,
                dataType: constraint.dataType,
                isSubtotalable: true,
                formatter: {
                    'scalingFactor': 0.01,
                    'decimalPlaces': 4
                }
            }];
        }
        return [];
    }

    // update the YAxis value in the portfolio
    onSelectedYAxisValueChange(event: any): void {
        if (this.portfolio instanceof PortfolioWithPositions) {
            this.portfolio.optimizationSettings.selectedYAxis = event;
        }
    }

    /*
     If YAxis already exists return that value  else select the default YAxis based on Objective Settings
    */
    getYAxisColumn(): string {
        return this.portfolio instanceof PortfolioWithPositions && this.portfolio.optimizationSettings.selectedYAxis ?
                             this.portfolio.optimizationSettings.selectedYAxis : this.getDefaultYAxis();
    }

    /**
     * returns the default YAxis to be selected.
     * We can effectively define the following hierarchy for this: alpha, stress scenario, minimize risk, minimize systematic risk, minimize t-cost.
     * The overall logic should be whichever is the highest defined objective function from the above hierarchy,
     * that should be the default.
     */
    getDefaultYAxis(): string {
        if ((this.portfolio as PortfolioWithPositions).optimizationSettings.objectiveSettings.portfolioObjectives) {
            const objectiveKeySet = new Set((this.portfolio as PortfolioWithPositions).optimizationSettings.objectiveSettings.portfolioObjectives.map(objective => objective.key));
            if (objectiveKeySet.has(OptimizationConstants.MAXIMIZE_ALPHA_SCORE) || objectiveKeySet.has(OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO)) {
                return EfficientFrontierConstants.EXPECTED_RETURN;
            }
            if (objectiveKeySet.has(OptimizationConstants.MINIMIZE_RISK)) {
                return EfficientFrontierConstants.EXPECTED_VOLATILITY;
            }
            if (objectiveKeySet.has(OptimizationConstants.MINIMIZE_SYSTEMATIC_RISK)) {
                return EfficientFrontierConstants.EXPECTED_FACTOR_VOLATILITY;
            }
            if (objectiveKeySet.has(OptimizationConstants.MINIMIZE_TCOST)) {
                return EfficientFrontierConstants.TCOST_OF_TRADES;
            }
        }
        // if no objective setting is present set default YAxis to Risk(Active)
        return EfficientFrontierConstants.EXPECTED_VOLATILITY;
    }
}
