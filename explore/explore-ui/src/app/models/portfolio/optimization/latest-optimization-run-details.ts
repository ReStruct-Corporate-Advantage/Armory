import {isNil, isObject} from 'lodash';
import {AbstractConfig} from '@blk/explore-ui-core';

/**
 * Model class for opto details if the run is successful
 */
export class LatestOptimizationRunDetails extends AbstractConfig {

    static readonly SOLVER_STATUS_OPTIMAL = 'OPTIMAL';
    static readonly SOLVER_STATUS_FEASIBLE = 'FEASIBLE ';
    static readonly SOLVER_STATUS_INFEASIBLE = 'INFEASIBLE';
    static readonly SOLVER_STATUS_INFEASIBLE_OR_UNBOUND = 'INFEASIBLE_OR_UNBOUND';
    static readonly SOLVER_STATUS_SOLVER_ERROR = 'SOLVER_ERROR';
    static readonly SOLVER_STATUS_RELAXED = 'RELAXED';
    static readonly SOLVER_STATUS_BOUNDED = 'BOUNDED';
    static readonly SOLVER_STATUS_UNKNOWN = 'UNKNOWN';

    static readonly SOLVER_STATUS_GREEN = [LatestOptimizationRunDetails.SOLVER_STATUS_OPTIMAL, LatestOptimizationRunDetails.SOLVER_STATUS_FEASIBLE];
    static readonly SOLVER_STATUS_YELLOW = [LatestOptimizationRunDetails.SOLVER_STATUS_RELAXED, LatestOptimizationRunDetails.SOLVER_STATUS_SOLVER_ERROR];
    static readonly SOLVER_STATUS_RED = [LatestOptimizationRunDetails.SOLVER_STATUS_INFEASIBLE, LatestOptimizationRunDetails.SOLVER_STATUS_INFEASIBLE_OR_UNBOUND];

    // Turnover (fraction of initial)
    turnover = 0;
    // Tcost of Trades (% of initial)
    tcostOfTrades = 0;
    // Market Impact Tcost of Trades (percent of initial)
    marketImapctTcostOfTrades = 0;
    // Spread Tcost of Trades (percent of initial)
    spreadTcostOfTrades = 0;
    // Portfolio Asset Count
    portfolioAssetCount: number;
    // Benchmark Asset Count
    benchmarkAssetCount: number;
    // Universe Asset Count
    universeAssetCount: number;
    // expected return
    expectedReturn: number[];
    // expected volatility
    expectedVolatility: number[];
    // expected specific volatility
    expectedSpecificVolatility: number[];
    // expected factor volatility
    expectedFactorVolatility: number[];
    // boolean to check if opto run is successful or not
    optoRunSuccessful: boolean;
    // constraint bound values
    constraintBoundValues: {};
    // boolean to check if given opto run details are selected or not
    isSelected = false;
    // status of opto run i.e. Infeasible/Feasible
    solverStatus: string;
    // violation reports of optimization run
    violationReports: any;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }
        if (!isNil(data.turnover)) {
            this.turnover = Number(data.turnover);
        }
        if (!isNil(data.tcostOfTrades)) {
            this.tcostOfTrades = Number(data.tcostOfTrades);
        }
        if (!isNil(data.marketImapctTcostOfTrades)) {
            this.marketImapctTcostOfTrades = Number(data.marketImapctTcostOfTrades);
        }
        if (!isNil(data.spreadTcostOfTrades)) {
            this.spreadTcostOfTrades = Number(data.spreadTcostOfTrades);
        }
        if (!isNil(data.portfolioAssetCount)) {
            this.portfolioAssetCount = Number(data.portfolioAssetCount);
        }
        if (!isNil(data.benchmarkAssetCount)) {
            this.benchmarkAssetCount = Number(data.benchmarkAssetCount);
        }
        if (!isNil(data.universeAssetCount)) {
            this.universeAssetCount = Number(data.universeAssetCount);
        }
        if (!isNil(data.optoRunSuccessful)) {
            this.optoRunSuccessful = Boolean(data.optoRunSuccessful);
        }
        if (!isNil(data.expectedReturn)) {
            this.expectedReturn = [Number(data.expectedReturn[0]), Number(data.expectedReturn[1])];
        }
        if (!isNil(data.expectedVolatility)) {
            this.expectedVolatility = [Number(data.expectedVolatility[0]), Number(data.expectedVolatility[1])];
        }
        if (!isNil(data.expectedSpecificVolatility)) {
            this.expectedSpecificVolatility = [Number(data.expectedSpecificVolatility[0]), Number(data.expectedSpecificVolatility[1])];
        }
        if (!isNil(data.expectedFactorVolatility)) {
            this.expectedFactorVolatility = [Number(data.expectedFactorVolatility[0]), Number(data.expectedFactorVolatility[1])];
        }
        if (!isNil(data.constraintBoundValues)) {
            this.constraintBoundValues = data.constraintBoundValues;
        }
        if (!isNil(data.isSelected)) {
            this.isSelected = Boolean(data.isSelected);
        }
        if (!isNil(data.solverStatus)) {
            this.solverStatus = data.solverStatus;
        }
        if (!isNil(data.violationReports)) {
            this.violationReports = data.violationReports;
        }
    }

    /**
     * Serialize
     */
    serialize(): any {
        return {
            turnover: this.turnover,
            tcostOfTrades: this.tcostOfTrades,
            marketImapctTcostOfTrades: this.marketImapctTcostOfTrades,
            spreadTcostOfTrades: this.spreadTcostOfTrades,
            portfolioAssetCount: this.portfolioAssetCount,
            benchmarkAssetCount: this.benchmarkAssetCount,
            universeAssetCount: this.universeAssetCount,
            optoRunSuccessful: this.optoRunSuccessful,
            expectedReturn: this.expectedReturn,
            expectedVolatility: this.expectedVolatility,
            expectedSpecificVolatility: this.expectedSpecificVolatility,
            expectedFactorVolatility: this.expectedFactorVolatility,
            constraintBoundValues: this.constraintBoundValues,
            isSelected: this.isSelected,
            solverStatus: this.solverStatus,
            violationReports: this.violationReports
        };
    }

    /**
     * @return a boolean to indicate whether the solver status is Infeasible or INFEASIBLE_OR_UNBOUND
     */
    isSolverStatusRed(): boolean {
        return LatestOptimizationRunDetails.SOLVER_STATUS_RED.includes(this.solverStatus);
    }

    /**
     * @return a boolean to indicate whether the solver status is RELAXED or SOLVER_ERROR.
     */
    isSolverStatusYellow(): boolean {
        return LatestOptimizationRunDetails.SOLVER_STATUS_YELLOW.includes(this.solverStatus);
    }

    /**
     * @return a boolean to indicate whether the solver status is OPTIMAL or FEASIBLE.
     */
    isSolverStatusGreen(): boolean {
        return LatestOptimizationRunDetails.SOLVER_STATUS_GREEN.includes(this.solverStatus);
    }
}
