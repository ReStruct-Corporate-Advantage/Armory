import {DateValue} from '../../date/models/date-value/date-value.model';
import {DateScenario} from './date-scenario.model';

describe('Date Scenario test cases', () => {
    it('serialize/deserialize', () => {
        const scenario = new DateScenario();
        scenario.fromDate = new DateValue({dateStringValue: 'T-5'});
        scenario.toDate = new DateValue({dateStringValue: 'T-1'});
        scenario.enabled = false;

        // Ensure that an id was generated.
        expect(scenario.id).toBeDefined();

        // Now serialise the item.
        const serializedData: any = scenario.serialize();

        // Deserialize into a new instance.
        const newScenario = new DateScenario(serializedData);

        // Validate.
        expect(newScenario.id).toBe(scenario.id);
        expect(newScenario.fromDate.dateStringValue).toBe(scenario.fromDate.dateStringValue);
        expect(newScenario.toDate.dateStringValue).toBe(scenario.toDate.dateStringValue);
        expect(newScenario.enabled).toBe(scenario.enabled);
    });

    it('Test scenario code', () => {
        const scenario = new DateScenario();
        scenario.fromDate = DateValue.newDate('10302020');
        scenario.toDate = DateValue.newDate('09302020');
        expect(scenario.code).toBe('HIST_20200930_20201030');
    });

    it('Test method setDateRangeStressScenarioParams called when scenario is fetched using stressScenarioService', () => {
        const scenario = new DateScenario();
        const data = {
            startDate: '2020-10-30',
            forDate: '2020-09-30',
            holdingPeriodOverride: 5,
            dxsShockUnit: 'std'
        };
        scenario.setDateRangeStressScenarioParams(data);
        expect(scenario.fromDate.date).toBe('10/30/2020');
        expect(scenario.toDate.date).toBe('09/30/2020');
        expect(scenario.holdingPeriodOverride).toBe(5);
        expect(scenario.dxsShockUnit).toBe('std');
    });
});
