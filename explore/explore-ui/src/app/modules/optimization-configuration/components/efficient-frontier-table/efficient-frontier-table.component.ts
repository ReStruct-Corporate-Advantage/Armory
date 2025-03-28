import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {LatestOptimizationRunDetails} from '@models/portfolio/optimization/latest-optimization-run-details';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {OptimizationRunService} from '../../../optimization/services/optimization-run.service';
import {NotificationService} from '@services/notification';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {WorkpadUtils} from '@utils/workpad.utils';
import {HoldingChangeFactory} from '../../../../factories/holding-change.factory';
import {OptimizationStatus} from '@interfaces/optimization-status.interface';
import {OptimizationStatusStore} from '../../../optimization/stores/optimization-status.store';
import {OptimizationDataService} from '../../../optimization/services/optimization-data.service';
import {concatMap, map, takeUntil} from 'rxjs/operators';
import {
    AlertConstants,
    ColumnFormat,
    ErrorTypeConstants,
    ExploreDialogParam,
    NumericColumnFormat,
    SubscribableComponent, UIErrorParameters
} from '@blk/explore-ui-core';
import {LoadingService} from '../../../loading/service/loading.service';
import {WorkspaceStore} from '@stores/workspace.store';
import {ReportGroup} from '@models/workspace/report-group.model';
import {forkJoin, of, throwError} from 'rxjs';
import {CompositionDataService} from '../../../main/composition-modelling/services/composition-data.service';
import {OptimizationConstants} from '@constants/optimization.constants';
import {cloneDeep, isEmpty, isNil} from 'lodash';
import {StressScenarioPortfolioObjective} from '@models/portfolio/objectives/stress-scenario-portfolio-objective.model';
import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';
import optoRunStatusJson from '@assets/optimization/opto-run-status.json';
import {CompositionUtils} from '@utils/composition.utils';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';

@Component({
    selector: 'app-efficient-frontier-table',
    templateUrl: './efficient-frontier-table.component.html',
    styleUrls: ['./efficient-frontier-table.component.scss']
})
export class EfficientFrontierTableComponent extends SubscribableComponent implements OnInit, OnChanges {

    static readonly STRESS_SCENARIO = 'Stress Scenario';
    static readonly ALPHA_SCORE = 'Alpha Score';
    static readonly SYSTEMATIC_RISK_ACTIVE = 'Systematic Risk (Active)';
    @Input() portfolio: PortfolioWithPositions;
    @Output() onCloseClicked: EventEmitter<void> = new EventEmitter();

    // to kep track of loading spinner
    efficientFrontierStatus: OptimizationStatus;

    optoRunStatus = cloneDeep(optoRunStatusJson['optoSolverStatus']);

    /**
     * constructor
     */
    constructor(private optimizationDataService: OptimizationDataService,
                private changeDetectorRef: ChangeDetectorRef,
                private optimizationRunService: OptimizationRunService,
                private compositionDataService: CompositionDataService,
                private notificationService: NotificationService,
                private loadingService: LoadingService) {
        super();
    }

    /**
     * change the loading spinner status when user switches to different portfolio in workpad
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.portfolio) {
            this.efficientFrontierStatus = OptimizationStatusStore.getEfficientFrontierStatus(this.portfolio);
            if (!this.efficientFrontierStatus) {
                this.efficientFrontierStatus = {
                    completionFlag: true,
                    spinnerFlag: false
                };
            }
            this.changeDetectorRef.markForCheck();
        }
    }

    /**
     * initialization
     */
    ngOnInit(): void {
        // update spinner flag to show/hide the efficient frontier spinner
        this.optimizationDataService.appStore.efficientFrontierOngoing$
            .asObservable()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((spinnerFlag: boolean) => {
                this.efficientFrontierStatus.spinnerFlag = spinnerFlag;
                this.changeDetectorRef.markForCheck();
            });

        // track the status of app spinner
        // if app spinner is up, we want to hide efficient frontier spinner
        // if app spinner is not up, we check if the efficient frontier has completed
        // if not completed, we bring up the efficient frontier spinner again
        this.loadingService.isLoading$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((isAppSpinnerLoading: boolean) => {
                const updatedSpinnerStatus = isAppSpinnerLoading ? false : !this.efficientFrontierStatus.completionFlag;
                this.optimizationDataService.appStore.efficientFrontierOngoing$.next(updatedSpinnerStatus);
            });
    }

    /**
     * run the efficient frontier to generate what-if and trades
     */
    onEfficientFrontierRun(): void {
        // update the list of selected iterations
        this.updateSelectedPortfolios();

        // if no portfolio selected promp user can return.
        if (isEmpty(this.portfolio.iterationIndexList)) {
            this.notificationService.openDialog(
                new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT,
                    AlertConstants.HEADER.GENERATE_WHAT_IF_AND_TRADES,
                    AlertConstants.BODY.NO_PORT_SELECTED_WHAT_IF_AND_TRADES,
                    AlertConstants.BTN.OK
                ));
            return;
        }


        // Do not show any warning if no running efficient frontier for first time
        // i.e. no efficient portfolio is added to current workpad
        if (!this.showPromptToRegenerateTrades()) {
            this.runEfficientFrontier(true);
            return;
        }

        // Open Warning Dialog
        this.notificationService.openDialog(
            new ExploreDialogParam(
                AlertConstants.TYPE.ALERT_WITH_OPTIONS,
                AlertConstants.HEADER.GENERATE_WHAT_IF_AND_TRADES,
                AlertConstants.BODY.REGENERATE_WHAT_IF_AND_TRADES,
                AlertConstants.BTN.YES,
                AlertConstants.BTN.NO,
                this.runEfficientFrontier,
                this.runEfficientFrontier,
                true
            )
        );
    }

    /**
     * updates the list of selected portfolios
     */
    updateSelectedPortfolios(): void {
        this.portfolio.iterationIndexList = [];
        for (const [index, value] of this.portfolio.latestOptimizationRunDetails.entries()) {
            if (value.isSelected) {
                // push to selected portfolio indexes array
                this.portfolio.iterationIndexList.push(index);
            }
        }
    }

    /**
     * check whether to show prompt to re-generate trades
     */
    showPromptToRegenerateTrades(): boolean {
        const existingPortfolios: string[] = this.getExistingEfficientPortfolios();
        const newPortfolios: string[] = this.getNewEfficientPortfolios();
        return newPortfolios.some(portfolio => existingPortfolios.includes(portfolio));
    }

    /**
     * return the names of existing efficient portfolios in current report group
     */
    getExistingEfficientPortfolios(): string[] {
        return WorkspaceStore.getCurrentWorkpad().getAllPortfolios().filter(port => port.title.includes(this.portfolio.title + '_')).map(portfolio => portfolio.title);
    }

    /**
     * return the names of new efficient portfolios to be added to current report group
     */
    getNewEfficientPortfolios(): string[] {
        return this.portfolio.iterationIndexList.map(index => this.portfolio.title + '_' + (index + 1));
    }

    /**
     * handler for efficient frontier trades generation
     */
    runEfficientFrontier = (generateNewTrades?: boolean) => {

        const existingPortfolios = this.getExistingEfficientPortfolios();
        const newPortfolios = this.getNewEfficientPortfolios();

        // case when user opted for not to re-generate trades for existing portfolios
        if (!generateNewTrades) {
            // no new portfolio is selected to be added to workpad
            // then no need to do anything just return
            if (newPortfolios.every(portfolio => existingPortfolios.includes(portfolio))) {
                return;
            } else { // when new portfolios selected to be added
                const portfoliosToUpdate = newPortfolios.filter(portfolio => !existingPortfolios.includes(portfolio));
                this.portfolio.iterationIndexList = portfoliosToUpdate.map(portName => {
                    const portNames = portName.split('_');
                    return Number(portNames[portNames.length - 1]) - 1;
                });
            }
        }

        this.updateStatusFlagsAndStore(this.portfolio, false, true);
        this.optimizationRunService.efficientFrontierRun$()
            .pipe(
                concatMap(response => {
                    // once we receive the trades we want to
                    // 1. generate the what-if portfolios and then,
                    // 2. make the call to fetch composition data for each generated portfolio
                    // for this we forkJoin all the composition data calls together
                    const compositionDataObs = forkJoin(response.efficientFrontierTradesData.map((trade, i) => {
                        const portGeneratedFromTrade = this.verifyWorkpadAndCreateWhatIfForTrades(trade, response.portfolio, response.portfolio.iterationIndexList[i] + 1, generateNewTrades);
                        return this.compositionDataService.fetchCompositionDataForColumns$(portGeneratedFromTrade)
                            .pipe(map(compositionData => {
                                return {portGeneratedFromTrade, compositionData};
                            }));
                    }));

                    return !!response.efficientFrontierTradesData
                        ? forkJoin([of(response.portfolio), compositionDataObs])
                        : throwError({portfolio: response.portfolio, error: response.error});
                })
            )
            .subscribe({
                next: ([port, data]) => {
                    data.forEach(({portGeneratedFromTrade, compositionData}, i) => {
                        // here we assign the respective composition data for it's intended "generated" portfolio
                        portGeneratedFromTrade.composition = compositionData;
                        if (i === data.length - 1) {
                            this.optimizationDataService.appStore.updateCompositionPayload$.next(portGeneratedFromTrade);
                        }
                    });
                    this.updateStatusFlagsAndStore(port as Portfolio, true, false);
                },
                error: errObj => {
                    this.notificationService.error(`ERROR: ${errObj.message || errObj.error.message}`, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_EFFICIENT_FRONTIER_RUN_ERROR, true);
                    // update the optimization state for the portfolio received with error object
                    this.updateStatusFlagsAndStore(errObj.portfolio || this.portfolio, true, false);
                }
            });
    };

    /**
     * update the flags and the status in store for current portfolio
     */
    updateStatusFlagsAndStore(port: Portfolio, completionFlag: boolean, spinnerFlag: boolean): void {
        // set the completion flag
        this.efficientFrontierStatus.completionFlag = completionFlag;
        // call for reset of spinnerFlag to hide frontier spinner flag
        this.optimizationDataService.appStore.efficientFrontierOngoing$.next(spinnerFlag);
        // also update the efficient frontier status in the status store
        // this is needed to restore the state, in case the component is already destroyed
        // (by the time finalize is called and the subscription ends)
        OptimizationStatusStore.setEfficientFrontierStatus(port, {
            completionFlag,
            spinnerFlag
        });
    }

    /**
     * generates or return the existing what if portfolio for the efficient frontier trade information provided
     */
    verifyWorkpadAndCreateWhatIfForTrades(trade: any, basePortfolio: PortfolioWithPositions, index: number, replaceExistingPortfolio: boolean): WhatIfPortfolio {
        // prepare the complete title
        const portTitle = basePortfolio.title + '_' + index;
        if (!replaceExistingPortfolio) {
            // create new portfolio
            return this.createWhatIfPortfoliosForTrades(trade, portTitle, basePortfolio);
        } else {
            // get list of portfolios for current report group
            const currentWorkpad: ReportGroup = WorkspaceStore.getCurrentWorkpad() as ReportGroup;
            const existingPortfolio: Portfolio = currentWorkpad.getAllPortfolios().find(portfolio => portfolio.title === portTitle);
            if (existingPortfolio) {
                // delete the existing portfolio
                currentWorkpad.removePortfolio(existingPortfolio);
            }
            // create new portfolio
            return this.createWhatIfPortfoliosForTrades(trade, portTitle, basePortfolio);
        }
    }


    /**
     * creates the what-if portfolio for given trades
     */
    createWhatIfPortfoliosForTrades(trade: any, portTitle: string, basePortfolio: PortfolioWithPositions): WhatIfPortfolio {

        // for zeroth index, we should consider current portfolio i.e base case what-if portfolio
        const port = WorkpadUtils.addWhatIfPortfolioAndShowComposition(portTitle) as PortfolioWithPositions;

        // update the latest optimization run detail
        port.latestOptimizationRunDetails = trade.additionalSuccessfulOptimizationDetails.map(detail => new LatestOptimizationRunDetails(detail));
        port.latestOptimizationRunDetails.forEach(detail => detail.optoRunSuccessful = true);
        // initialize the optimization settings to the settings of base portfolio
        port.optimizationSettings = new OptimizationSettings(basePortfolio.optimizationSettings.serialize());
        port.optimizationSettings.isEfficientFrontierEnabled = false;

        // update the bound constraint value as well
        Object.entries(trade.additionalSuccessfulOptimizationDetails[0].constraintBoundValues)
            .forEach(([constraintKey, constraintValue]) => {
                const targetConstraint = [
                    ...port.optimizationSettings.portfolioConstraints,
                    ...port.optimizationSettings.sectorConstraints,
                    ...port.optimizationSettings.factorConstraints
                ].find(constraint => constraint.constraintTag === constraintKey);
                if (targetConstraint && targetConstraint.optionValues) {
                    if (targetConstraint.optionValues.ConstraintValue) {  // target Constraint is portfolio constraint
                        targetConstraint.optionValues.ConstraintValue = constraintValue;
                    // target Constraint is sector constraint with Upper bound efficient enabled
                    } else if (CompositionUtils.checkIfBoundInEfficientFormat(targetConstraint.optionValues.ConstraintUpperBound)) {
                        constraintValue = this.scaleToDefault(constraintValue, targetConstraint.columnFormat);
                        targetConstraint.optionValues.ConstraintUpperBound = constraintValue;
                    // target Constraint is sector constraint with Lower bound efficient enabled
                    } else if (CompositionUtils.checkIfBoundInEfficientFormat(targetConstraint.optionValues.ConstraintLowerBound)) {
                        constraintValue = this.scaleToDefault(constraintValue, targetConstraint.columnFormat);
                        targetConstraint.optionValues.ConstraintLowerBound = constraintValue;
                    }
                }
            });

        // add the generated holding changes
        port.holdingChanges = trade.holdingChanges.map(change => HoldingChangeFactory.convertObjectToHoldingChange(change));

        // return reference to the port
        return port;
    }

    /*
      scale the constraint value back to initial input format
     */
    scaleToDefault(constraintValue: any, columnFormat: ColumnFormat): number {
        return parseFloat((constraintValue / (columnFormat instanceof NumericColumnFormat && columnFormat.scalingFactor
            ? columnFormat.scalingFactor : 1)).toFixed(2));
    }

    /**
     * toggle the optoRunDetails isSelected property
     */
    enableDisableIteration(optoRunDetails: LatestOptimizationRunDetails): void {
        optoRunDetails.isSelected = !optoRunDetails.isSelected;
    }

    /**
     * format the given value to bps
     */
    formatValueToBps(value: any): string {
        value = Array.isArray(value) ? value[1] : value;
        if (isNaN(value) || isNil(value)) {
            return isNil(value) ? undefined : value.toString();
        }
        return (value / 0.01).toFixed(4);
    }

    /**
     * select all or none checkbox handler
     */
    enableDisableAll(selected: boolean) {
        const latestOptimizationRunDetails = this.portfolio.latestOptimizationRunDetails;
        if (selected) {
            latestOptimizationRunDetails.forEach(runDetails => runDetails.isSelected = !runDetails.isSolverStatusRed());
        } else {
            latestOptimizationRunDetails.forEach(runDetails => runDetails.isSelected = false);
        }
    }

    /**
     * check if all the solutions are infeasible
     */
    isAllSolutionsInfeasible(): boolean {
        return this.portfolio.latestOptimizationRunDetails.every(details => details.isSolverStatusRed());
    }

    /**
     * returns the name of the column based on objective type
     */
    getColumnName(colName: string): string {
        if (this.portfolio.optimizationSettings.objectiveSettings.objectivesType !== OptimizationConstants.ACTIVE_OBJECTIVE_TYPE && colName !== EfficientFrontierTableComponent.SYSTEMATIC_RISK_ACTIVE) {
            colName = colName.replace('(Active)', '(Absolute)');
        }
        if (this.portfolio.optimizationSettings.objectiveSettings.portfolioObjectives.some((objective: PortfolioObjective) => objective instanceof StressScenarioPortfolioObjective)) {
            colName = colName.replace(EfficientFrontierTableComponent.ALPHA_SCORE, EfficientFrontierTableComponent.STRESS_SCENARIO);
        }
        return colName;
    }

    /**
     * on close clicked
     */
    onClose(): void {
        this.onCloseClicked.emit();
    }

    /**
     * empty function to maintain the original sort order for keyvalue pipe
     */
    maintainOriginalOrder(): void {}
}
