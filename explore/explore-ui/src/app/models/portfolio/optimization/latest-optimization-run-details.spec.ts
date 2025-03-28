import {LatestOptimizationRunDetails} from './latest-optimization-run-details';

/**
 * Test cases for LatestOptimizationRunDetails.ts
 */
describe('Latest Optimization Run Details tests', () => {

    const optoRunDetails = {
        'expectedSpecificVolatility': [0.0002406996, 20.0002406996],
        'constraintBoundValues': {'max_total_risk': 1},
        'expectedReturn': [7.482802e-7, 7.482802e-7],
        'expectedVolatility': [0.000624277, 0.000624277],
        'expectedFactorVolatility': [0.0005760082, 0.0005760082],
        'isSelected': false,
        'marketImapctTcostOfTrades': 0,
        'optoRunSuccessful' : undefined,
        'portfolioAssetCount' : undefined,
        'solverStatus' : undefined,
        'spreadTcostOfTrades' : 1.09435e-9,
        'tcostOfTrades' : 1.09435e-9,
        'turnover' : 1.09435e-9,
        'universeAssetCount' : undefined,
        'benchmarkAssetCount': undefined
    };

    it('tests Serialize/Deserialize', () => {
        const latestOptimizationRunDetails = new LatestOptimizationRunDetails(optoRunDetails);
        const serialize = latestOptimizationRunDetails.serialize();
        expect(optoRunDetails).toEqual(serialize);
    });

    it('test solver status', () => {
        const latestOptimizationRunDetails = new LatestOptimizationRunDetails();
        latestOptimizationRunDetails.solverStatus = LatestOptimizationRunDetails.SOLVER_STATUS_OPTIMAL;
        expect(latestOptimizationRunDetails.isSolverStatusGreen()).toBeTruthy();
        expect(latestOptimizationRunDetails.isSolverStatusYellow()).toBeFalsy();
        expect(latestOptimizationRunDetails.isSolverStatusRed()).toBeFalsy();

        latestOptimizationRunDetails.solverStatus = LatestOptimizationRunDetails.SOLVER_STATUS_FEASIBLE;
        expect(latestOptimizationRunDetails.isSolverStatusGreen()).toBeTruthy();
        expect(latestOptimizationRunDetails.isSolverStatusYellow()).toBeFalsy();
        expect(latestOptimizationRunDetails.isSolverStatusRed()).toBeFalsy();

        latestOptimizationRunDetails.solverStatus = LatestOptimizationRunDetails.SOLVER_STATUS_RELAXED;
        expect(latestOptimizationRunDetails.isSolverStatusGreen()).toBeFalsy();
        expect(latestOptimizationRunDetails.isSolverStatusYellow()).toBeTruthy();
        expect(latestOptimizationRunDetails.isSolverStatusRed()).toBeFalsy();

        latestOptimizationRunDetails.solverStatus = LatestOptimizationRunDetails.SOLVER_STATUS_SOLVER_ERROR;
        expect(latestOptimizationRunDetails.isSolverStatusGreen()).toBeFalsy();
        expect(latestOptimizationRunDetails.isSolverStatusYellow()).toBeTruthy();
        expect(latestOptimizationRunDetails.isSolverStatusRed()).toBeFalsy();

        latestOptimizationRunDetails.solverStatus = LatestOptimizationRunDetails.SOLVER_STATUS_INFEASIBLE;
        expect(latestOptimizationRunDetails.isSolverStatusGreen()).toBeFalsy();
        expect(latestOptimizationRunDetails.isSolverStatusYellow()).toBeFalsy();
        expect(latestOptimizationRunDetails.isSolverStatusRed()).toBeTruthy();

        latestOptimizationRunDetails.solverStatus = LatestOptimizationRunDetails.SOLVER_STATUS_INFEASIBLE_OR_UNBOUND;
        expect(latestOptimizationRunDetails.isSolverStatusGreen()).toBeFalsy();
        expect(latestOptimizationRunDetails.isSolverStatusYellow()).toBeFalsy();
        expect(latestOptimizationRunDetails.isSolverStatusRed()).toBeTruthy();
    });
})
