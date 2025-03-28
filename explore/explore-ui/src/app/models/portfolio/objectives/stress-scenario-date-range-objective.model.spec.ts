import {OptimizationConstants} from '../../../constants/optimization.constants';
import {StressScenarioDateRangeObjective} from '@models/portfolio/objectives/stress-scenario-date-range-objective.model';
import {DateScenario, DateValue} from '@blk/explore-ui-core';

/**
 * Test cases for StressScenarioDateRangeObjective.ts
 */
describe('Stress Scenario Date Range Portfolio Objective tests', () => {

    /**
     * Test case for method save
     */
    it('Test serialize/deserialize', () => {
        const object1 = new StressScenarioDateRangeObjective({
                key: OptimizationConstants.STRESS_SCENARIO_DATE_RANGE,
                weight: 0.5,
                dateRangeScenarios: [{data: {id: 'a', toDate: {date: '03/11/2020'}, fromDate: {date: '03/11/2021'}}}]
            });
        expect(new StressScenarioDateRangeObjective(object1.serialize())).toEqual(object1);
    });

    it('Test isValid', () => {
        const objective = new StressScenarioDateRangeObjective();
        expect(objective.isDateRangeValid()).toBeFalsy();
        objective.dateRangeScenarios = [];
        expect(objective.isDateRangeValid()).toBeFalsy();
        const scenario1 = new DateScenario();
        scenario1.toDate = DateValue.newDate('03/11/2020');
        objective.dateRangeScenarios = [scenario1];
        expect(objective.isDateRangeValid()).toBeFalsy();
        scenario1.fromDate = DateValue.newDate('03/11/2020');
        scenario1.toDate = null;
        expect(objective.isDateRangeValid()).toBeFalsy();
        scenario1.toDate = DateValue.newDate('03/11/2020');
        expect(objective.isDateRangeValid()).toBeTruthy();
    });
});
